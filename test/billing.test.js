import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, bootstrap } from './helpers.js';

let ctx;
let s;
before(async () => {
  ctx = await startServer();
  s = await bootstrap(ctx.api);
});
after(() => ctx.close());

test('тарифи та масове нарахування без дублів', async () => {
  const { api } = ctx;
  const t1 = await api.post('/api/tariffs', { name: 'Утримання будинку', calc_type: 'per_m2', rate: 7.35 }, { token: s.manager.token });
  assert.equal(t1.status, 201);
  assert.equal(t1.body.rate, 7.35);
  const t2 = await api.post('/api/tariffs', { name: 'Вивіз сміття', calc_type: 'per_apartment', rate: 120 }, { token: s.manager.token });
  assert.equal(t2.status, 201);
  assert.equal((await api.post('/api/tariffs', { name: 'X', calc_type: 'per_m2', rate: 1.234 }, { token: s.admin })).status, 400);
  assert.equal((await api.post('/api/tariffs', { name: 'X', calc_type: 'per_m2', rate: 1 }, { token: s.alice.token })).status, 403);

  const gen = await api.post('/api/charges/generate', { period: '2026-09' }, { token: s.manager.token });
  assert.equal(gen.status, 201);
  assert.equal(gen.body.created, 4);
  // 60*7.35 + 40*7.35 + 2*120 = 441 + 294 + 240
  assert.equal(gen.body.total_amount, 975);

  const again = await api.post('/api/charges/generate', { period: '2026-09' }, { token: s.manager.token });
  assert.equal(again.body.created, 0);
  assert.equal(again.body.skipped, 4);

  assert.equal((await api.post('/api/charges/generate', { period: '2026-13' }, { token: s.admin })).status, 400);
  assert.equal((await api.post('/api/charges/generate', { period: '2026-10', tariff_ids: [999] }, { token: s.admin })).status, 400);
  const only = await api.post('/api/charges/generate', { period: '2026-10', tariff_ids: [t2.body.id] }, { token: s.admin });
  assert.equal(only.body.created, 2);
});

test('оплати, баланс і особовий рахунок', async () => {
  const { api } = ctx;
  const pay = await api.post('/api/payments', { apartment_id: s.apt1.id, amount: 500, paid_at: '2026-09-15', method: 'bank', reference: 'PB-1' }, { token: s.manager.token });
  assert.equal(pay.status, 201);
  assert.equal(pay.body.amount, 500);
  assert.equal((await api.post('/api/payments', { apartment_id: s.apt1.id, amount: 0 }, { token: s.admin })).status, 400);
  assert.equal((await api.post('/api/payments', { apartment_id: 999, amount: 10 }, { token: s.admin })).status, 404);

  const apt = await api.get(`/api/apartments/${s.apt1.id}`, { token: s.alice.token });
  // нараховано 441 + 120 (09) + 120 (10) = 681, сплачено 500
  assert.equal(apt.body.balance, -181);

  const ledger = await api.get(`/api/apartments/${s.apt1.id}/ledger`, { token: s.alice.token });
  assert.equal(ledger.status, 200);
  assert.equal(ledger.body.closing_balance, -181);
  assert.equal(ledger.body.items.length, 4);

  const oct = await api.get(`/api/apartments/${s.apt1.id}/ledger?from=2026-10`, { token: s.alice.token });
  assert.equal(oct.body.opening_balance, -61);
  assert.equal(oct.body.items.length, 1);
  assert.equal(oct.body.closing_balance, -181);
});

test('мешканець бачить лише свої нарахування та оплати', async () => {
  const { api } = ctx;
  const charges = await api.get('/api/charges', { token: s.alice.token });
  assert.ok(charges.body.items.every((c) => c.apartment_id === s.apt1.id));
  assert.equal(charges.body.total, 3);
  assert.equal((await api.get(`/api/charges?apartment_id=${s.apt2.id}`, { token: s.alice.token })).status, 403);
  const payments = await api.get('/api/payments', { token: s.bob.token });
  assert.equal(payments.body.total, 0);
  assert.equal((await api.post('/api/payments', { apartment_id: s.apt1.id, amount: 10 }, { token: s.alice.token })).status, 403);
});

test('ручне нарахування (перерахунок) та звіти', async () => {
  const { api } = ctx;
  const corr = await api.post('/api/charges', { apartment_id: s.apt2.id, period: '2026-10', description: 'Перерахунок', amount: -14 }, { token: s.admin });
  assert.equal(corr.status, 201);
  assert.equal(corr.body.amount, -14);

  const debtors = await api.get('/api/reports/debtors', { token: s.manager.token });
  assert.equal(debtors.status, 200);
  // кв.2: 294 + 120 + 120 - 14 = 520; кв.1: 181
  assert.deepEqual(debtors.body.items.map((d) => [d.number, d.debt]), [['2', 520], ['1', 181]]);
  assert.equal(debtors.body.items[1].owners, 'Аліса');
  assert.equal(debtors.body.total_debt, 701);
  assert.equal((await api.get('/api/reports/debtors?min_debt=200', { token: s.admin })).body.total, 1);

  const summary = await api.get('/api/reports/summary?period=2026-09', { token: s.admin });
  assert.equal(summary.body.apartments, 2);
  assert.equal(summary.body.total_area, 100);
  assert.equal(summary.body.total_debt, 701);
  assert.equal(summary.body.period.charged, 975);
  assert.equal(summary.body.period.paid, 500);
  assert.equal(summary.body.period.collection_rate, 51.3);

  assert.equal((await api.get('/api/reports/summary', { token: s.alice.token })).status, 403);
});

test('квартиру з фінансовою історією не можна видалити', async () => {
  const { api } = ctx;
  assert.equal((await api.delete(`/api/apartments/${s.apt1.id}`, { token: s.admin })).status, 409);
  const empty = await api.post('/api/apartments', { number: '77', area: 30 }, { token: s.admin });
  assert.equal((await api.delete(`/api/apartments/${empty.body.id}`, { token: s.admin })).status, 204);
});
