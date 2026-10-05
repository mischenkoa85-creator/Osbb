import { validate, parseId, queryPeriod } from '../validate.js';
import { nowIso } from '../db.js';
import { assertApartmentAccess, STAFF } from '../access.js';
import { badRequest, notFound } from '../http.js';

const METER_TYPES = ['water_cold', 'water_hot', 'electricity', 'gas', 'heat'];

const serialize = (m) => ({
  id: m.id,
  apartment_id: m.apartment_id,
  meter_type: m.meter_type,
  period: m.period,
  value: m.value,
  consumption: m.consumption == null ? null : Math.round(m.consumption * 1000) / 1000,
  submitted_by: m.submitted_by,
  created_at: m.created_at,
  updated_at: m.updated_at,
});

export default function meterRoutes(r, { db }) {
  // Показники зі споживанням відносно попереднього періоду.
  r.get('/api/apartments/:id/meters', (ctx) => {
    const id = parseId(ctx.params.id);
    assertApartmentAccess(db, ctx.user, id);
    const where = ['m.apartment_id = ?'];
    const params = [id];
    if (ctx.query.type) {
      if (!METER_TYPES.includes(ctx.query.type)) throw badRequest(`type: допустимі значення ${METER_TYPES.join(', ')}`);
      where.push('m.meter_type = ?');
      params.push(ctx.query.type);
    }
    const from = queryPeriod(ctx.query, 'from');
    if (from) {
      where.push('m.period >= ?');
      params.push(from);
    }
    const rows = db.prepare(`
      SELECT m.*, m.value - (
        SELECT p.value FROM meter_readings p
        WHERE p.apartment_id = m.apartment_id AND p.meter_type = m.meter_type AND p.period < m.period
        ORDER BY p.period DESC LIMIT 1
      ) AS consumption
      FROM meter_readings m WHERE ${where.join(' AND ')}
      ORDER BY m.period DESC, m.meter_type
    `).all(...params);
    return { items: rows.map(serialize) };
  });

  // Подання показника. Повторне подання за той самий період оновлює значення.
  r.post('/api/apartments/:id/meters', (ctx) => {
    const id = parseId(ctx.params.id);
    assertApartmentAccess(db, ctx.user, id);
    const d = validate(ctx.body, {
      meter_type: { type: 'enum', values: METER_TYPES, required: true },
      period: { type: 'period', required: true },
      value: { type: 'number', required: true, min: 0, max: 1e9 },
    });
    const prev = db.prepare(`
      SELECT value, period FROM meter_readings
      WHERE apartment_id = ? AND meter_type = ? AND period < ? ORDER BY period DESC LIMIT 1
    `).get(id, d.meter_type, d.period);
    if (prev && d.value < prev.value) {
      throw badRequest(`Показник не може бути меншим за попередній (${prev.value} за ${prev.period})`);
    }
    const next = db.prepare(`
      SELECT value, period FROM meter_readings
      WHERE apartment_id = ? AND meter_type = ? AND period > ? ORDER BY period ASC LIMIT 1
    `).get(id, d.meter_type, d.period);
    if (next && d.value > next.value) {
      throw badRequest(`Показник не може бути більшим за наступний (${next.value} за ${next.period})`);
    }
    const existed = db.prepare('SELECT 1 FROM meter_readings WHERE apartment_id = ? AND meter_type = ? AND period = ?')
      .get(id, d.meter_type, d.period);
    db.prepare(`
      INSERT INTO meter_readings (apartment_id, meter_type, period, value, submitted_by) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT (apartment_id, meter_type, period)
      DO UPDATE SET value = excluded.value, submitted_by = excluded.submitted_by, updated_at = ?
    `).run(id, d.meter_type, d.period, d.value, ctx.user.id, nowIso());
    const row = db.prepare('SELECT * FROM meter_readings WHERE apartment_id = ? AND meter_type = ? AND period = ?')
      .get(id, d.meter_type, d.period);
    ctx.status = existed ? 200 : 201;
    return serialize({ ...row, consumption: prev ? row.value - prev.value : null });
  });

  r.delete('/api/meters/:id', (ctx) => {
    const { changes } = db.prepare('DELETE FROM meter_readings WHERE id = ?').run(parseId(ctx.params.id));
    if (!changes) throw notFound('Показник не знайдено');
    return undefined;
  }, { roles: STAFF });
}
