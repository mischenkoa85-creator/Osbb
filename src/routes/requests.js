import { validate, parseId, optionalQueryId } from '../validate.js';
import { paginate, nowIso } from '../db.js';
import { isStaff, assertApartmentAccess, isMember, STAFF } from '../access.js';
import { notFound, forbidden, badRequest } from '../http.js';

const CATEGORIES = ['plumbing', 'electrical', 'elevator', 'heating', 'cleaning', 'security', 'other'];
const STATUSES = ['open', 'in_progress', 'resolved', 'rejected'];

const SELECT = `r.*, a.number AS apartment_number, au.full_name AS author_name, asg.full_name AS assignee_name,
  (SELECT COUNT(*) FROM request_comments rc WHERE rc.request_id = r.id) AS comments_count`;
const FROM = `service_requests r
  LEFT JOIN apartments a ON a.id = r.apartment_id
  LEFT JOIN users au ON au.id = r.author_id
  LEFT JOIN users asg ON asg.id = r.assignee_id`;

const serialize = (r) => ({
  id: r.id,
  title: r.title,
  description: r.description,
  category: r.category,
  status: r.status,
  apartment_id: r.apartment_id,
  apartment_number: r.apartment_number ?? null,
  author_id: r.author_id,
  author_name: r.author_name ?? null,
  assignee_id: r.assignee_id,
  assignee_name: r.assignee_name ?? null,
  comments_count: r.comments_count,
  created_at: r.created_at,
  updated_at: r.updated_at,
});

function load(db, id) {
  const row = db.prepare(`SELECT ${SELECT} FROM ${FROM} WHERE r.id = ?`).get(id);
  if (!row) throw notFound('Заявку не знайдено');
  return row;
}

function canView(db, user, request) {
  if (isStaff(user) || request.author_id === user.id) return true;
  return request.apartment_id != null && isMember(db, user.id, request.apartment_id);
}

function loadVisible(db, user, id) {
  const request = load(db, id);
  if (!canView(db, user, request)) throw notFound('Заявку не знайдено');
  return request;
}

export default function requestRoutes(r, { db }) {
  r.get('/api/requests', (ctx) => {
    const where = [];
    const params = [];
    if (!isStaff(ctx.user)) {
      where.push('(r.author_id = ? OR r.apartment_id IN (SELECT apartment_id FROM apartment_members WHERE user_id = ?))');
      params.push(ctx.user.id, ctx.user.id);
    }
    if (ctx.query.status) {
      const statuses = ctx.query.status.split(',').filter((s) => STATUSES.includes(s));
      if (!statuses.length) throw badRequest(`status: допустимі значення ${STATUSES.join(', ')}`);
      where.push(`r.status IN (${statuses.map(() => '?').join(', ')})`);
      params.push(...statuses);
    }
    if (ctx.query.category) {
      where.push('r.category = ?');
      params.push(ctx.query.category);
    }
    for (const field of ['apartment_id', 'assignee_id']) {
      const id = optionalQueryId(ctx.query, field);
      if (id) {
        where.push(`r.${field} = ?`);
        params.push(id);
      }
    }
    return paginate(db, { select: SELECT, from: FROM, where, params, orderBy: 'r.created_at DESC, r.id DESC', map: serialize }, ctx.query);
  });

  r.post('/api/requests', (ctx) => {
    const d = validate(ctx.body, {
      title: { type: 'string', required: true, max: 300 },
      description: { type: 'string', required: true, max: 10000 },
      category: { type: 'enum', values: CATEGORIES, default: 'other' },
      apartment_id: { type: 'integer', min: 1, nullable: true },
    });
    if (d.apartment_id) assertApartmentAccess(db, ctx.user, d.apartment_id);
    const { lastInsertRowid } = db.prepare(`
      INSERT INTO service_requests (title, description, category, apartment_id, author_id) VALUES (?, ?, ?, ?, ?)
    `).run(d.title, d.description, d.category, d.apartment_id ?? null, ctx.user.id);
    ctx.status = 201;
    return serialize(load(db, lastInsertRowid));
  });

  r.get('/api/requests/:id', (ctx) => {
    const request = loadVisible(db, ctx.user, parseId(ctx.params.id));
    const comments = db.prepare(`
      SELECT c.id, c.body, c.author_id, u.full_name AS author_name, u.role AS author_role, c.created_at
      FROM request_comments c LEFT JOIN users u ON u.id = c.author_id
      WHERE c.request_id = ? ORDER BY c.created_at, c.id
    `).all(request.id);
    return { ...serialize(request), comments };
  });

  // Персонал змінює статус/виконавця; автор може редагувати текст, доки заявка відкрита.
  r.patch('/api/requests/:id', (ctx) => {
    const request = loadVisible(db, ctx.user, parseId(ctx.params.id));
    const staff = isStaff(ctx.user);
    const d = validate(ctx.body, {
      title: { type: 'string', required: true, max: 300 },
      description: { type: 'string', required: true, max: 10000 },
      category: { type: 'enum', values: CATEGORIES },
      status: { type: 'enum', values: STATUSES },
      assignee_id: { type: 'integer', min: 1, nullable: true },
    }, { partial: true });

    if (!staff) {
      if (request.author_id !== ctx.user.id) throw forbidden('Редагувати може лише автор заявки');
      if ('status' in d || 'assignee_id' in d) throw forbidden('Статус і виконавця змінює правління');
      if (request.status !== 'open') throw badRequest('Заявку вже взято в роботу — редагування недоступне');
    }
    if (d.assignee_id) {
      const assignee = db.prepare('SELECT role, is_active FROM users WHERE id = ?').get(d.assignee_id);
      if (!assignee || !assignee.is_active || !STAFF.includes(assignee.role)) {
        throw badRequest('Виконавцем може бути лише активний адміністратор або менеджер');
      }
    }
    const fields = Object.keys(d);
    if (fields.length) {
      db.prepare(`UPDATE service_requests SET ${fields.map((f) => `${f} = ?`).join(', ')}, updated_at = ? WHERE id = ?`)
        .run(...fields.map((f) => d[f]), nowIso(), request.id);
    }
    return serialize(load(db, request.id));
  });

  r.post('/api/requests/:id/comments', (ctx) => {
    const request = loadVisible(db, ctx.user, parseId(ctx.params.id));
    const { body } = validate(ctx.body, { body: { type: 'string', required: true, max: 5000 } });
    const { lastInsertRowid } = db
      .prepare('INSERT INTO request_comments (request_id, author_id, body) VALUES (?, ?, ?)')
      .run(request.id, ctx.user.id, body);
    db.prepare('UPDATE service_requests SET updated_at = ? WHERE id = ?').run(nowIso(), request.id);
    ctx.status = 201;
    return db.prepare(`
      SELECT c.id, c.body, c.author_id, u.full_name AS author_name, u.role AS author_role, c.created_at
      FROM request_comments c LEFT JOIN users u ON u.id = c.author_id WHERE c.id = ?
    `).get(lastInsertRowid);
  });
}
