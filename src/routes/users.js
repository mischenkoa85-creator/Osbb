import { validate, parseId } from '../validate.js';
import { paginate } from '../db.js';
import { hashPassword } from '../auth.js';
import { STAFF, ADMIN, isStaff } from '../access.js';
import { forbidden, notFound, badRequest } from '../http.js';
import { createUser } from './auth.js';
import { serializeUser } from './serializers.js';

const ROLES = ['admin', 'manager', 'resident'];

function loadUser(db, id) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  if (!user) throw notFound('Користувача не знайдено');
  return user;
}

// Менеджер може керувати лише мешканцями; адміністратор — усіма.
function assertCanManage(actor, target, newRole) {
  if (actor.role === 'admin') return;
  if (target && target.role !== 'resident') throw forbidden('Менеджер може керувати лише мешканцями');
  if (newRole && newRole !== 'resident') throw forbidden('Лише адміністратор може призначати цю роль');
}

export default function userRoutes(r, { db }) {
  r.get('/api/users', (ctx) => {
    const where = [];
    const params = [];
    if (ctx.query.role) {
      where.push('role = ?');
      params.push(ctx.query.role);
    }
    if (ctx.query.active !== undefined) {
      where.push('is_active = ?');
      params.push(ctx.query.active === 'false' || ctx.query.active === '0' ? 0 : 1);
    }
    if (ctx.query.q) {
      where.push('(full_name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      const q = `%${ctx.query.q}%`;
      params.push(q, q, q);
    }
    return paginate(db, { select: '*', from: 'users', where, params, orderBy: 'full_name, id', map: serializeUser }, ctx.query);
  }, { roles: STAFF });

  r.post('/api/users', async (ctx) => {
    const data = validate(ctx.body, {
      email: { type: 'email', required: true },
      password: { type: 'password', required: true },
      full_name: { type: 'string', required: true, max: 200 },
      phone: { type: 'string', max: 50 },
      role: { type: 'enum', values: ROLES, default: 'resident' },
    });
    assertCanManage(ctx.user, null, data.role);
    const user = await createUser(db, data);
    ctx.status = 201;
    return serializeUser(user);
  }, { roles: STAFF });

  r.get('/api/users/:id', (ctx) => {
    const id = parseId(ctx.params.id);
    if (!isStaff(ctx.user) && ctx.user.id !== id) throw forbidden();
    const user = loadUser(db, id);
    const apartments = db.prepare(`
      SELECT a.id, a.number, a.area, m.relation, m.share
      FROM apartment_members m JOIN apartments a ON a.id = m.apartment_id
      WHERE m.user_id = ? ORDER BY a.id
    `).all(id);
    return { ...serializeUser(user), apartments };
  });

  r.patch('/api/users/:id', async (ctx) => {
    const target = loadUser(db, parseId(ctx.params.id));
    const data = validate(ctx.body, {
      email: { type: 'email', required: true },
      full_name: { type: 'string', required: true, max: 200 },
      phone: { type: 'string', max: 50, nullable: true },
      role: { type: 'enum', values: ROLES },
      is_active: { type: 'boolean' },
      password: { type: 'password' },
    }, { partial: true });
    assertCanManage(ctx.user, target, data.role);
    if (target.id === ctx.user.id && (data.role && data.role !== target.role || data.is_active === false)) {
      throw badRequest('Не можна змінити власну роль або деактивувати себе');
    }

    const sets = [];
    const params = [];
    for (const field of ['email', 'full_name', 'phone', 'role']) {
      if (field in data) {
        sets.push(`${field} = ?`);
        params.push(data[field]);
      }
    }
    if ('is_active' in data) {
      sets.push('is_active = ?');
      params.push(data.is_active ? 1 : 0);
    }
    if (data.password) {
      sets.push('password_hash = ?');
      params.push(await hashPassword(data.password));
    }
    // Зміна ролі, пароля або деактивація — відкликаємо видані токени.
    if (data.password || 'role' in data || data.is_active === false) sets.push('token_version = token_version + 1');
    if (sets.length) db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params, target.id);
    return serializeUser(loadUser(db, target.id));
  }, { roles: STAFF });

  // Користувачів не видаляємо фізично (на них посилаються платежі, заявки тощо) — лише деактивуємо.
  r.delete('/api/users/:id', (ctx) => {
    const target = loadUser(db, parseId(ctx.params.id));
    if (target.id === ctx.user.id) throw badRequest('Не можна деактивувати себе');
    db.prepare('UPDATE users SET is_active = 0, token_version = token_version + 1 WHERE id = ?').run(target.id);
    return undefined;
  }, { roles: ADMIN });
}
