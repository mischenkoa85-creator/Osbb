import http from 'node:http';
import { openDatabase } from '../src/db.js';
import { createApp } from '../src/app.js';

export async function startServer() {
  const db = openDatabase(':memory:');
  const config = {
    jwtSecret: 'test-secret',
    tokenTtlHours: 1,
    corsOrigin: '*',
    logRequests: false,
    loginLimit: { maxAttempts: 3, windowMs: 60_000 },
  };
  const app = createApp({ db, config });
  const server = http.createServer(app.handle);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  async function request(method, path, { token, body } = {}) {
    const headers = {};
    if (token) headers.authorization = `Bearer ${token}`;
    if (body !== undefined) headers['content-type'] = 'application/json';
    const res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await res.text();
    return { status: res.status, body: text ? JSON.parse(text) : null };
  }

  const api = {
    get: (path, opts) => request('GET', path, opts),
    post: (path, body, opts) => request('POST', path, { ...opts, body }),
    put: (path, body, opts) => request('PUT', path, { ...opts, body }),
    patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
    delete: (path, opts) => request('DELETE', path, opts),
  };

  async function close() {
    await new Promise((resolve) => server.close(resolve));
    db.close();
  }

  return { api, db, close, base };
}

/** Створює адміністратора, менеджера, двох мешканців і дві квартири. */
export async function bootstrap(api) {
  const setup = await api.post('/api/setup', { email: 'admin@osbb.ua', password: 'admin-pass-1', full_name: 'Адмін' });
  const admin = setup.body.token;

  const mkUser = async (email, role, full_name) => {
    const res = await api.post('/api/users', { email, password: 'password-123', full_name, role }, { token: admin });
    const login = await api.post('/api/auth/login', { email, password: 'password-123' });
    return { id: res.body.id, token: login.body.token };
  };
  const manager = await mkUser('manager@osbb.ua', 'manager', 'Менеджер');
  const alice = await mkUser('alice@osbb.ua', 'resident', 'Аліса');
  const bob = await mkUser('bob@osbb.ua', 'resident', 'Борис');

  const apt1 = (await api.post('/api/apartments', { number: '1', area: 60, entrance: 1, floor: 1 }, { token: admin })).body;
  const apt2 = (await api.post('/api/apartments', { number: '2', area: 40, entrance: 1, floor: 1 }, { token: admin })).body;
  await api.put(`/api/apartments/${apt1.id}/members/${alice.id}`, { relation: 'owner' }, { token: admin });
  await api.put(`/api/apartments/${apt2.id}/members/${bob.id}`, { relation: 'tenant' }, { token: admin });

  return { admin, manager, alice, bob, apt1, apt2 };
}
