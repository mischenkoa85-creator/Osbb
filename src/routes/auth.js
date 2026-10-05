import { hashPassword, verifyPassword, dummyVerify, signToken, LoginLimiter } from '../auth.js';
import { validate } from '../validate.js';
import { HttpError, unauthorized, conflict } from '../http.js';
import { serializeUser } from './serializers.js';

export function issueToken(user, config) {
  const ttl = config.tokenTtlHours * 3600;
  return {
    token: signToken({ sub: user.id, role: user.role, tv: user.token_version }, config.jwtSecret, ttl),
    token_type: 'Bearer',
    expires_in: ttl,
  };
}

export async function createUser(db, { email, password, full_name, phone = null, role }) {
  const hash = await hashPassword(password);
  const { lastInsertRowid } = db
    .prepare('INSERT INTO users (email, password_hash, full_name, phone, role) VALUES (?, ?, ?, ?, ?)')
    .run(email, hash, full_name, phone, role);
  return db.prepare('SELECT * FROM users WHERE id = ?').get(lastInsertRowid);
}

export default function authRoutes(r, { db, config }) {
  const limiter = new LoginLimiter(config.loginLimit);

  // Первинне налаштування: створення першого адміністратора, доки в системі немає користувачів.
  r.post('/api/setup', async (ctx) => {
    const data = validate(ctx.body, {
      email: { type: 'email', required: true },
      password: { type: 'password', required: true },
      full_name: { type: 'string', required: true, max: 200 },
      phone: { type: 'string', max: 50 },
    });
    if (db.prepare('SELECT COUNT(*) AS n FROM users').get().n > 0) {
      throw conflict('Систему вже налаштовано');
    }
    const user = await createUser(db, { ...data, role: 'admin' });
    ctx.status = 201;
    return { user: serializeUser(user), ...issueToken(user, config) };
  }, { public: true });

  r.post('/api/auth/login', async (ctx) => {
    const { email, password } = validate(ctx.body, {
      email: { type: 'email', required: true },
      password: { type: 'string', required: true, max: 200 },
    });
    const key = `${ctx.ip}|${email}`;
    if (limiter.isBlocked(key)) {
      throw new HttpError(429, 'too_many_requests', 'Забагато невдалих спроб. Спробуйте пізніше');
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    const ok = user ? await verifyPassword(password, user.password_hash) : await dummyVerify(password);
    if (!ok || !user.is_active) {
      limiter.fail(key);
      throw unauthorized('Невірний email або пароль');
    }
    limiter.reset(key);
    return { user: serializeUser(user), ...issueToken(user, config) };
  }, { public: true });

  r.get('/api/auth/me', (ctx) => {
    const apartments = db.prepare(`
      SELECT a.id, a.number, a.area, m.relation, m.share
      FROM apartment_members m JOIN apartments a ON a.id = m.apartment_id
      WHERE m.user_id = ? ORDER BY a.id
    `).all(ctx.user.id);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(ctx.user.id);
    return { ...serializeUser(user), apartments };
  });

  r.patch('/api/auth/me', (ctx) => {
    const data = validate(ctx.body, {
      full_name: { type: 'string', required: true, max: 200 },
      phone: { type: 'string', max: 50, nullable: true },
    }, { partial: true });
    if ('full_name' in data) db.prepare('UPDATE users SET full_name = ? WHERE id = ?').run(data.full_name, ctx.user.id);
    if ('phone' in data) db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(data.phone, ctx.user.id);
    return serializeUser(db.prepare('SELECT * FROM users WHERE id = ?').get(ctx.user.id));
  });

  // Зміна пароля інвалідує всі попередні токени користувача.
  r.post('/api/auth/change-password', async (ctx) => {
    const { current_password, new_password } = validate(ctx.body, {
      current_password: { type: 'string', required: true, max: 200 },
      new_password: { type: 'password', required: true },
    });
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(ctx.user.id);
    if (!(await verifyPassword(current_password, user.password_hash))) {
      throw new HttpError(400, 'invalid_password', 'Поточний пароль невірний');
    }
    const hash = await hashPassword(new_password);
    db.prepare('UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?').run(hash, user.id);
    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    return issueToken(updated, config);
  });
}
