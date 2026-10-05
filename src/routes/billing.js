import { validate, parseId, optionalQueryId, queryPeriod } from '../validate.js';
import { paginate, transaction } from '../db.js';
import { STAFF, isStaff, assertApartmentAccess, getApartment } from '../access.js';
import { notFound, badRequest } from '../http.js';
import { fromKop } from '../money.js';
import { serializeCharge, serializePayment } from './serializers.js';

const today = () => new Date().toISOString().slice(0, 10);

/** Спільні фільтри для списків нарахувань/оплат з урахуванням прав доступу. */
function scopedFilters(ctx, alias) {
  const where = [];
  const params = [];
  const apartmentId = optionalQueryId(ctx.query, 'apartment_id');
  if (apartmentId) {
    assertApartmentAccess(ctx.db, ctx.user, apartmentId);
    where.push(`${alias}.apartment_id = ?`);
    params.push(apartmentId);
  } else if (!isStaff(ctx.user)) {
    where.push(`${alias}.apartment_id IN (SELECT apartment_id FROM apartment_members WHERE user_id = ?)`);
    params.push(ctx.user.id);
  }
  return { where, params };
}

export default function billingRoutes(r, { db }) {
  // ---- Нарахування ----

  r.get('/api/charges', (ctx) => {
    const { where, params } = scopedFilters(ctx, 'c');
    const period = queryPeriod(ctx.query, 'period');
    if (period) {
      where.push('c.period = ?');
      params.push(period);
    }
    return paginate(db, {
      select: 'c.*, a.number AS apartment_number',
      from: 'charges c JOIN apartments a ON a.id = c.apartment_id',
      where,
      params,
      orderBy: 'c.period DESC, CAST(a.number AS INTEGER), c.id',
      map: serializeCharge,
    }, ctx.query);
  });

  // Ручне нарахування (разовий внесок, перерахунок; сума може бути від'ємною).
  r.post('/api/charges', (ctx) => {
    const d = validate(ctx.body, {
      apartment_id: { type: 'integer', required: true, min: 1 },
      period: { type: 'period', required: true },
      description: { type: 'string', required: true, max: 500 },
      amount: { type: 'money', required: true, nonzero: true },
    });
    getApartment(db, d.apartment_id);
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO charges (apartment_id, period, description, amount_kop, created_by) VALUES (?, ?, ?, ?, ?)
    `).run(d.apartment_id, d.period, d.description, d.amount, ctx.user.id);
    ctx.status = 201;
    return serializeCharge(db.prepare(`
      SELECT c.*, a.number AS apartment_number FROM charges c JOIN apartments a ON a.id = c.apartment_id WHERE c.id = ?
    `).get(lastInsertRowid));
  }, { roles: STAFF });

  // Масове нарахування за активними тарифами для всіх квартир. Повторний запуск не дублює записи.
  r.post('/api/charges/generate', (ctx) => {
    const d = validate(ctx.body, {
      period: { type: 'period', required: true },
      tariff_ids: { type: 'idArray', minItems: 1 },
    });
    let tariffs = db.prepare('SELECT * FROM tariffs WHERE is_active = 1').all();
    if (d.tariff_ids) {
      const ids = new Set(d.tariff_ids);
      tariffs = db.prepare('SELECT * FROM tariffs').all().filter((t) => ids.has(t.id));
      if (tariffs.length !== ids.size) throw badRequest('Деякі тарифи не знайдено');
    }
    if (!tariffs.length) throw badRequest('Немає активних тарифів для нарахування');
    const apartments = db.prepare('SELECT * FROM apartments').all();

    const insert = db.prepare(`
      INSERT INTO charges (apartment_id, period, tariff_id, description, amount_kop, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT (apartment_id, period, tariff_id) DO NOTHING
    `);
    const result = transaction(db, () => {
      let created = 0;
      let skipped = 0;
      let totalKop = 0;
      for (const apt of apartments) {
        for (const t of tariffs) {
          const amount = t.calc_type === 'per_m2' ? Math.round(apt.area * t.rate_kop) : t.rate_kop;
          if (amount === 0) continue;
          const description = t.calc_type === 'per_m2'
            ? `${t.name} (${apt.area} м² × ${fromKop(t.rate_kop)} грн)`
            : t.name;
          const { changes } = insert.run(apt.id, d.period, t.id, description, amount, ctx.user.id);
          if (changes) {
            created += 1;
            totalKop += amount;
          } else {
            skipped += 1;
          }
        }
      }
      return { period: d.period, created, skipped, total_amount: fromKop(totalKop) };
    });
    ctx.status = 201;
    return result;
  }, { roles: STAFF });

  r.delete('/api/charges/:id', (ctx) => {
    const { changes } = db.prepare('DELETE FROM charges WHERE id = ?').run(parseId(ctx.params.id));
    if (!changes) throw notFound('Нарахування не знайдено');
    return undefined;
  }, { roles: STAFF });

  // ---- Оплати ----

  r.get('/api/payments', (ctx) => {
    const { where, params } = scopedFilters(ctx, 'p');
    const period = queryPeriod(ctx.query, 'period');
    if (period) {
      where.push('substr(p.paid_at, 1, 7) = ?');
      params.push(period);
    }
    return paginate(db, {
      select: 'p.*, a.number AS apartment_number',
      from: 'payments p JOIN apartments a ON a.id = p.apartment_id',
      where,
      params,
      orderBy: 'p.paid_at DESC, p.id DESC',
      map: serializePayment,
    }, ctx.query);
  });

  r.post('/api/payments', (ctx) => {
    const d = validate(ctx.body, {
      apartment_id: { type: 'integer', required: true, min: 1 },
      amount: { type: 'money', required: true, positive: true },
      paid_at: { type: 'date', default: today },
      method: { type: 'enum', values: ['cash', 'bank', 'card', 'other'], default: 'bank' },
      reference: { type: 'string', max: 200 },
      note: { type: 'string', max: 500 },
    });
    getApartment(db, d.apartment_id);
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO payments (apartment_id, amount_kop, paid_at, method, reference, note, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(d.apartment_id, d.amount, d.paid_at, d.method, d.reference ?? null, d.note ?? null, ctx.user.id);
    ctx.status = 201;
    return serializePayment(db.prepare(`
      SELECT p.*, a.number AS apartment_number FROM payments p JOIN apartments a ON a.id = p.apartment_id WHERE p.id = ?
    `).get(lastInsertRowid));
  }, { roles: STAFF });

  r.delete('/api/payments/:id', (ctx) => {
    const { changes } = db.prepare('DELETE FROM payments WHERE id = ?').run(parseId(ctx.params.id));
    if (!changes) throw notFound('Оплату не знайдено');
    return undefined;
  }, { roles: STAFF });
}
