import { validate, parseId } from '../validate.js';
import { paginate, nowIso } from '../db.js';
import { STAFF } from '../access.js';
import { notFound } from '../http.js';

const SELECT = 'n.*, u.full_name AS author_name';
const FROM = 'announcements n LEFT JOIN users u ON u.id = n.author_id';

const serialize = (n) => ({
  id: n.id,
  title: n.title,
  body: n.body,
  is_pinned: !!n.is_pinned,
  author_id: n.author_id,
  author_name: n.author_name ?? null,
  created_at: n.created_at,
  updated_at: n.updated_at,
});

const SCHEMA = {
  title: { type: 'string', required: true, max: 300 },
  body: { type: 'string', required: true, max: 20000 },
  is_pinned: { type: 'boolean', default: false },
};

function load(db, id) {
  const n = db.prepare(`SELECT ${SELECT} FROM ${FROM} WHERE n.id = ?`).get(id);
  if (!n) throw notFound('Оголошення не знайдено');
  return n;
}

export default function announcementRoutes(r, { db }) {
  r.get('/api/announcements', (ctx) => paginate(db, {
    select: SELECT,
    from: FROM,
    orderBy: 'n.is_pinned DESC, n.created_at DESC, n.id DESC',
    map: serialize,
  }, ctx.query));

  r.get('/api/announcements/:id', (ctx) => serialize(load(db, parseId(ctx.params.id))));

  r.post('/api/announcements', (ctx) => {
    const d = validate(ctx.body, SCHEMA);
    const { lastInsertRowid } = db
      .prepare('INSERT INTO announcements (title, body, is_pinned, author_id) VALUES (?, ?, ?, ?)')
      .run(d.title, d.body, d.is_pinned ? 1 : 0, ctx.user.id);
    ctx.status = 201;
    return serialize(load(db, lastInsertRowid));
  }, { roles: STAFF });

  r.patch('/api/announcements/:id', (ctx) => {
    const id = parseId(ctx.params.id);
    load(db, id);
    const d = validate(ctx.body, SCHEMA, { partial: true });
    const fields = Object.keys(d);
    if (fields.length) {
      db.prepare(`UPDATE announcements SET ${fields.map((f) => `${f} = ?`).join(', ')}, updated_at = ? WHERE id = ?`)
        .run(...fields.map((f) => (typeof d[f] === 'boolean' ? Number(d[f]) : d[f])), nowIso(), id);
    }
    return serialize(load(db, id));
  }, { roles: STAFF });

  r.delete('/api/announcements/:id', (ctx) => {
    const { changes } = db.prepare('DELETE FROM announcements WHERE id = ?').run(parseId(ctx.params.id));
    if (!changes) throw notFound('Оголошення не знайдено');
    return undefined;
  }, { roles: STAFF });
}
