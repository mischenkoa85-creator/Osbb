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

test('ролі: менеджер створює лише мешканців, мешканець не керує користувачами', async () => {
  const { api } = ctx;
  const asManager = await api.post('/api/users', { email: 'm2@osbb.ua', password: 'password-123', full_name: 'M2', role: 'manager' }, { token: s.manager.token });
  assert.equal(asManager.status, 403);
  const resident = await api.post('/api/users', { email: 'r2@osbb.ua', password: 'password-123', full_name: 'R2' }, { token: s.manager.token });
  assert.equal(resident.status, 201);
  assert.equal(resident.body.role, 'resident');

  assert.equal((await api.get('/api/users', { token: s.alice.token })).status, 403);
  const dup = await api.post('/api/users', { email: 'ALICE@osbb.ua', password: 'password-123', full_name: 'Dup' }, { token: s.admin });
  assert.equal(dup.status, 409);

  const list = await api.get('/api/users?role=resident&q=Аліс', { token: s.manager.token });
  assert.equal(list.body.total, 1);
  assert.equal(list.body.items[0].email, 'alice@osbb.ua');
});

test('мешканець бачить лише свої дані користувача', async () => {
  const { api } = ctx;
  assert.equal((await api.get(`/api/users/${s.alice.id}`, { token: s.alice.token })).status, 200);
  assert.equal((await api.get(`/api/users/${s.bob.id}`, { token: s.alice.token })).status, 403);
});

test('деактивація користувача блокує його токени', async () => {
  const { api } = ctx;
  const u = await api.post('/api/users', { email: 'temp@osbb.ua', password: 'password-123', full_name: 'Temp' }, { token: s.admin });
  const { body: { token } } = await api.post('/api/auth/login', { email: 'temp@osbb.ua', password: 'password-123' });
  assert.equal((await api.get('/api/auth/me', { token })).status, 200);
  assert.equal((await api.delete(`/api/users/${u.body.id}`, { token: s.manager.token })).status, 403);
  assert.equal((await api.delete(`/api/users/${u.body.id}`, { token: s.admin })).status, 204);
  assert.equal((await api.get('/api/auth/me', { token })).status, 401);
  assert.equal((await api.post('/api/auth/login', { email: 'temp@osbb.ua', password: 'password-123' })).status, 401);
});

test('квартири: доступ мешканця обмежено своїми', async () => {
  const { api } = ctx;
  const all = await api.get('/api/apartments', { token: s.manager.token });
  assert.equal(all.body.total, 2);
  const own = await api.get('/api/apartments', { token: s.alice.token });
  assert.deepEqual(own.body.items.map((a) => a.number), ['1']);
  assert.equal((await api.get(`/api/apartments/${s.apt2.id}`, { token: s.alice.token })).status, 403);

  const detail = await api.get(`/api/apartments/${s.apt1.id}`, { token: s.alice.token });
  assert.equal(detail.status, 200);
  assert.equal(detail.body.balance, 0);
  assert.equal(detail.body.members[0].relation, 'owner');

  assert.equal((await api.post('/api/apartments', { number: '9', area: 10 }, { token: s.alice.token })).status, 403);
});

test('квартири: валідація, унікальність, оновлення', async () => {
  const { api } = ctx;
  const bad = await api.post('/api/apartments', { number: '', area: -1 }, { token: s.admin });
  assert.equal(bad.status, 400);
  assert.equal((await api.post('/api/apartments', { number: '1', area: 50 }, { token: s.admin })).status, 409);
  const upd = await api.patch(`/api/apartments/${s.apt2.id}`, { rooms: 2, account_number: 'A-002' }, { token: s.manager.token });
  assert.equal(upd.status, 200);
  assert.equal(upd.body.rooms, 2);
  assert.equal(upd.body.area, 40);
});

test('члени квартири: додавання, оновлення, видалення', async () => {
  const { api } = ctx;
  const res = await api.put(`/api/apartments/${s.apt2.id}/members/${s.alice.id}`, { relation: 'owner', share: 0.5 }, { token: s.admin });
  assert.equal(res.status, 200);
  assert.equal(res.body.items.length, 2);
  assert.equal((await api.get(`/api/apartments/${s.apt2.id}`, { token: s.alice.token })).status, 200);
  assert.equal((await api.delete(`/api/apartments/${s.apt2.id}/members/${s.alice.id}`, { token: s.admin })).status, 204);
  assert.equal((await api.get(`/api/apartments/${s.apt2.id}`, { token: s.alice.token })).status, 403);
  assert.equal((await api.delete(`/api/apartments/${s.apt2.id}/members/${s.alice.id}`, { token: s.admin })).status, 404);
});
