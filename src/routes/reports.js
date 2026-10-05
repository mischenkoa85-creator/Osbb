import { STAFF } from '../access.js';
import { queryPeriod } from '../validate.js';
import { badRequest } from '../http.js';
import { fromKop, toKop } from '../money.js';
import { BALANCE_SQL } from './apartments.js';

export default function reportRoutes(r, { db }) {
  // Боржники: квартири з від'ємним сальдо, від найбільшого боргу.
  r.get('/api/reports/debtors', (ctx) => {
    const minDebt = ctx.query.min_debt === undefined ? 0 : Number(ctx.query.min_debt);
    if (!Number.isFinite(minDebt) || minDebt < 0) throw badRequest('min_debt має бути невід’ємним числом');
    const rows = db.prepare(`
      SELECT * FROM (
        SELECT a.id, a.number, a.area, a.account_number, ${BALANCE_SQL} AS balance_kop,
          (SELECT MAX(paid_at) FROM payments p WHERE p.apartment_id = a.id) AS last_payment_at,
          (SELECT group_concat(u.full_name, ', ') FROM apartment_members m JOIN users u ON u.id = m.user_id
            WHERE m.apartment_id = a.id AND m.relation = 'owner') AS owners
        FROM apartments a
      ) WHERE balance_kop < 0 AND -balance_kop >= ?
      ORDER BY balance_kop ASC
    `).all(toKop(minDebt));
    const items = rows.map((row) => ({
      apartment_id: row.id,
      number: row.number,
      area: row.area,
      account_number: row.account_number,
      owners: row.owners,
      debt: fromKop(-row.balance_kop),
      last_payment_at: row.last_payment_at,
    }));
    return { items, total: items.length, total_debt: fromKop(rows.reduce((s, x) => s - x.balance_kop, 0)) };
  }, { roles: STAFF });

  // Зведення по будинку (і за період, якщо вказано).
  r.get('/api/reports/summary', (ctx) => {
    const period = queryPeriod(ctx.query, 'period');
    const building = db.prepare('SELECT COUNT(*) AS apartments, COALESCE(SUM(area), 0) AS total_area FROM apartments').get();
    const totals = db.prepare(`
      SELECT
        (SELECT COALESCE(SUM(amount_kop), 0) FROM charges) AS charged,
        (SELECT COALESCE(SUM(amount_kop), 0) FROM payments) AS paid
    `).get();
    const debt = db.prepare(`
      SELECT COALESCE(SUM(-b), 0) AS debt, COUNT(*) AS debtors
      FROM (SELECT ${BALANCE_SQL} AS b FROM apartments a) WHERE b < 0
    `).get();
    const requests = Object.fromEntries(
      db.prepare('SELECT status, COUNT(*) AS n FROM service_requests GROUP BY status').all().map((x) => [x.status, x.n]),
    );

    const result = {
      apartments: building.apartments,
      total_area: Math.round(building.total_area * 100) / 100,
      total_charged: fromKop(totals.charged),
      total_paid: fromKop(totals.paid),
      total_debt: fromKop(debt.debt),
      debtors: debt.debtors,
      requests,
    };
    if (period) {
      const charged = db.prepare('SELECT COALESCE(SUM(amount_kop), 0) AS s FROM charges WHERE period = ?').get(period).s;
      const paid = db.prepare('SELECT COALESCE(SUM(amount_kop), 0) AS s FROM payments WHERE substr(paid_at, 1, 7) = ?').get(period).s;
      result.period = {
        period,
        charged: fromKop(charged),
        paid: fromKop(paid),
        collection_rate: charged > 0 ? Math.round((paid / charged) * 1000) / 10 : null,
      };
    }
    return result;
  }, { roles: STAFF });
}
