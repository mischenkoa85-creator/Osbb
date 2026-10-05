import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer } from './helpers.js';

let ctx;
before(async () => { ctx = await startServer(); });
after(() => ctx.close());

test('health і індекс маршрутів доступні без авторизації', async () => {
  assert.equal((await ctx.api.get('/health')).status, 200);
  const index = await ctx.api.get('/api');
  assert.equal(index.status, 200);
  assert.ok(index.body.routes.some((r) => r.path === '/api/auth/login'));
});

test('setup створює першого адміна лише один раз', async () => {
  const bad = await ctx.api.post('/api/setup', { email: 'nope', password: '1', full_name: '' });
  assert.equal(bad.status, 400);
  assert.ok(bad.body.error.details.email && bad.body.error.details.password && bad.body.error.details.full_name);

  const ok = await ctx.api.post('/api/setup', { email: 'Root@OSBB.ua', password: 'secret-pass', full_name: 'Root' });
  assert.equal(ok.status, 201);
  assert.equal(ok.body.user.role, 'admin');
  assert.equal(ok.body.user.email, 'root@osbb.ua');
  assert.ok(ok.body.token);

  const again = await ctx.api.post('/api/setup', { email: 'x@osbb.ua', password: 'secret-pass', full_name: 'X' });
  assert.equal(again.status, 409);
});

test('логін, /me, захищені маршрути', async () => {
  assert.equal((await ctx.api.get('/api/auth/me')).status, 401);
  assert.equal((await ctx.api.get('/api/auth/me', { token: 'garbage' })).status, 401);

  const login = await ctx.api.post('/api/auth/login', { email: 'root@osbb.ua', password: 'secret-pass' });
  assert.equal(login.status, 200);
  const me = await ctx.api.get('/api/auth/me', { token: login.body.token });
  assert.equal(me.status, 200);
  assert.equal(me.body.email, 'root@osbb.ua');
  assert.equal(me.body.password_hash, undefined);
  assert.deepEqual(me.body.apartments, []);
});

test('зміна пароля відкликає старі токени', async () => {
  const { body: { token } } = await ctx.api.post('/api/auth/login', { email: 'root@osbb.ua', password: 'secret-pass' });
  const wrong = await ctx.api.post('/api/auth/change-password', { current_password: 'nope', new_password: 'new-secret-1' }, { token });
  assert.equal(wrong.status, 400);
  const changed = await ctx.api.post('/api/auth/change-password', { current_password: 'secret-pass', new_password: 'new-secret-1' }, { token });
  assert.equal(changed.status, 200);
  assert.equal((await ctx.api.get('/api/auth/me', { token })).status, 401);
  assert.equal((await ctx.api.get('/api/auth/me', { token: changed.body.token })).status, 200);
  assert.equal((await ctx.api.post('/api/auth/login', { email: 'root@osbb.ua', password: 'new-secret-1' })).status, 200);
});

test('обмеження невдалих спроб входу', async () => {
  for (let i = 0; i < 3; i++) {
    assert.equal((await ctx.api.post('/api/auth/login', { email: 'victim@osbb.ua', password: 'bad-pass' })).status, 401);
  }
  assert.equal((await ctx.api.post('/api/auth/login', { email: 'victim@osbb.ua', password: 'bad-pass' })).status, 429);
});

test('невідомий маршрут, метод і некоректний JSON', async () => {
  assert.equal((await ctx.api.get('/api/nothing')).status, 404);
  assert.equal((await ctx.api.delete('/api/auth/login')).status, 405);
  const badJson = await fetch(`${ctx.base}/api/auth/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{oops',
  });
  assert.equal(badJson.status, 400);
  const notJson = await fetch(`${ctx.base}/api/auth/login`, { method: 'POST', body: 'email=x' });
  assert.equal(notJson.status, 415);
});
