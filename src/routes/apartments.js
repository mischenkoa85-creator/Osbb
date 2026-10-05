import { validate, parseId, queryPeriod } from '../validate.js';
import { paginate } from '../db.js';
import { STAFF, ADMIN, isStaff, assertApartmentAccess, getApartment } from '../access.js';
import { notFound } from '../http.js';
import { fromKop } from '../money.js';
import { serializeApartment, serializeUser } from './serializers.js';

export const BALANCE_SQL = `
  (SELECT COALESCE(SUM(amount_kop), 0) FROM payments p WHERE p.apartment_id = a.id)
  - (SELECT COALESCE(SUM(amount_kop), 0) FROM charges c WHERE c.apartment_id = a.id)`;

const APARTMENT_SCHEMA = {
  number: { type: 'string', required: true, max: 20 },
  entrance: { type: 'integer', min: 1, max: 100, nullable: true },
  floor: { type: 'integer', min: -5, max: 200, nullable: true },
  area: { type: 'number', required: true, gt: 0, max: 10000 },
  rooms: { type: 'integer', min: 0, max: 50, nullable: true },
  account_number: { type: 'string', max: 50, nullable: true },
};

function loadApartmentWithBalance(db, id) {
  return db.prepare(`SELECT a.*, ${BALANCE_SQL} AS balance_kop FROM apartments a WHERE a.id = ?`).get(id);
}

function listMembers(db, apartmentId) {
  return db.prepare(`
    SELECT u.*, m.relation, m.share
    FROM apartment_members m JOIN users u ON u.id = m.user_id
    WHERE m.apartment_id = ? ORDER BY m.relation, u.full_name
  `).all(apartmentId).map((row) => ({ ...serializeUser(row), relation: row.relation, share: row.share }));
}

export default function apartmentRoutes(r, { db }) {
  r.get('/api/apartments', (ctx) => {
    const where = [];
    const params = [];
    if (!isStaff(ctx.user)) {
      where.push('a.id IN (SELECT apartment_id FROM apartment_members WHERE user_id = ?)');
      params.push(ctx.user.id);
    }
    if (ctx.query.entrance) {
      where.push('a.entrance = ?');
      params.push(Number(ctx.query.entrance));
    }
    if (ctx.query.q) {
      where.push('(a.number LIKE ? OR a.account_number LIKE ?)');
      params.push(`%${ctx.query.q}%`, `%${ctx.query.q}%`);
    }
    return paginate(db, {
      select: `a.*, ${BALANCE_SQL} AS balance_kop`,
      from: 'apartments a',
      where,
      params,
      orderBy: 'CAST(a.number AS INTEGER), a.number',
      map: serializeApartment,
    }, { limit: 200, ...ctx.query });
  });

  r.post('/api/apartments', (ctx) => {
    const data = validate(ctx.body, APARTMENT_SCHEMA);
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO apartments (number, entrance, floor, area, rooms, account_number)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(data.number, data.entrance ?? null, data.floor ?? null, data.area, data.rooms ?? null, data.account_number ?? null);
    ctx.status = 201;
    return serializeApartment(loadApartmentWithBalance(db, lastInsertRowid));
  }, { roles: STAFF });

  r.get('/api/apartments/:id', (ctx) => {
    const id = parseId(ctx.params.id);
    assertApartmentAccess(db, ctx.user, id);
    return { ...serializeApartment(loadApartmentWithBalance(db, id)), members: listMembers(db, id) };
  });

  r.patch('/api/apartments/:id', (ctx) => {
    const id = parseId(ctx.params.id);
    getApartment(db, id);
    const data = validate(ctx.body, APARTMENT_SCHEMA, { partial: true });
    const fields = Object.keys(data);
    if (fields.length) {
      db.prepare(`UPDATE apartments SET ${fields.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`)
        .run(...fields.map((f) => data[f]), id);
    }
    return serializeApartment(loadApartmentWithBalance(db, id));
  }, { roles: STAFF });

  // Видалення можливе лише для квартири без фінансової історії (інакше 409).
  r.delete('/api/apartments/:id', (ctx) => {
    const id = parseId(ctx.params.id);
    getApartment(db, id);
    db.prepare('DELETE FROM apartments WHERE id = ?').run(id);
    return undefined;
  }, { roles: ADMIN });

  r.get('/api/apartments/:id/members', (ctx) => {
    const id = parseId(ctx.params.id);
    assertApartmentAccess(db, ctx.user, id);
    return { items: listMembers(db, id) };
  });

  // Додає або оновлює зв'язок користувача з квартирою.
  r.put('/api/apartments/:id/members/:userId', (ctx) => {
    const id = parseId(ctx.params.id);
    const userId = parseId(ctx.params.userId, 'userId');
    getApartment(db, id);
    if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(userId)) throw notFound('Користувача не знайдено');
    const data = validate(ctx.body, {
      relation: { type: 'enum', values: ['owner', 'tenant', 'family'], default: 'owner' },
      share: { type: 'number', gt: 0, max: 1, default: 1 },
    });
    db.prepare(`
      INSERT INTO apartment_members (apartment_id, user_id, relation, share) VALUES (?, ?, ?, ?)
      ON CONFLICT (apartment_id, user_id) DO UPDATE SET relation = excluded.relation, share = excluded.share
    `).run(id, userId, data.relation, data.share);
    return { items: listMembers(db, id) };
  }, { roles: STAFF });

  r.delete('/api/apartments/:id/members/:userId', (ctx) => {
    const id = parseId(ctx.params.id);
    const userId = parseId(ctx.params.userId, 'userId');
    const { changes } = db.prepare('DELETE FROM apartment_members WHERE apartment_id = ? AND user_id = ?').run(id, userId);
    if (!changes) throw notFound('Зв’язок не знайдено');
    return undefined;
  }, { roles: STAFF });

  // Особовий рахунок: нарахування та оплати в хронологічному порядку з наростаючим сальдо.
  r.get('/api/apartments/:id/ledger', (ctx) => {
    const id = parseId(ctx.params.id);
    const apt = assertApartmentAccess(db, ctx.user, id);
    const from = queryPeriod(ctx.query, 'from');
    const to = queryPeriod(ctx.query, 'to');

    const entries = db.prepare(`
      SELECT 'charge' AS type, id, period, period || '-01' AS date, description, -amount_kop AS delta_kop, created_at
      FROM charges WHERE apartment_id = ?
      UNION ALL
      SELECT 'payment' AS type, id, substr(paid_at, 1, 7) AS period, paid_at AS date,
             COALESCE(note, 'Оплата') AS description, amount_kop AS delta_kop, created_at
      FROM payments WHERE apartment_id = ?
      ORDER BY date, type, created_at, id
    `).all(id, id);

    let running = 0;
    let opening = 0;
    const items = [];
    for (const e of entries) {
      running += e.delta_kop;
      if (from && e.period < from) {
        opening = running;
        continue;
      }
      if (to && e.period > to) continue;
      items.push({
        type: e.type,
        id: e.id,
        period: e.period,
        date: e.date,
        description: e.description,
        amount: fromKop(e.delta_kop),
        balance: fromKop(running),
      });
    }
    const closing = items.length ? items[items.length - 1].balance : fromKop(opening);
    return {
      apartment: serializeApartment(apt),
      opening_balance: fromKop(opening),
      closing_balance: closing,
      items,
    };
  });
}
