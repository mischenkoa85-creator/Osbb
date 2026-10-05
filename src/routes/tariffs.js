import { validate, parseId } from '../validate.js';
import { STAFF } from '../access.js';
import { notFound } from '../http.js';
import { fromKop } from '../money.js';

const serialize = (t) => ({
  id: t.id,
  name: t.name,
  calc_type: t.calc_type,
  rate: fromKop(t.rate_kop),
  is_active: !!t.is_active,
  created_at: t.created_at,
});

const SCHEMA = {
  name: { type: 'string', required: true, max: 200 },
  calc_type: { type: 'enum', values: ['per_m2', 'per_apartment'], required: true },
  rate: { type: 'money', required: true, nonnegative: true },
  is_active: { type: 'boolean', default: true },
};

function load(db, id) {
  const t = db.prepare('SELECT * FROM tariffs WHERE id = ?').get(id);
  if (!t) throw notFound('Тариф не знайдено');
  return t;
}

export default function tariffRoutes(r, { db }) {
  r.get('/api/tariffs', (ctx) => {
    const onlyActive = ctx.query.active === 'true' || ctx.query.active === '1';
    const rows = db.prepare(`SELECT * FROM tariffs ${onlyActive ? 'WHERE is_active = 1' : ''} ORDER BY id`).all();
    return { items: rows.map(serialize) };
  });

  r.post('/api/tariffs', (ctx) => {
    const d = validate(ctx.body, SCHEMA);
    const { lastInsertRowid } = db
      .prepare('INSERT INTO tariffs (name, calc_type, rate_kop, is_active) VALUES (?, ?, ?, ?)')
      .run(d.name, d.calc_type, d.rate, d.is_active ? 1 : 0);
    ctx.status = 201;
    return serialize(load(db, lastInsertRowid));
  }, { roles: STAFF });

  r.patch('/api/tariffs/:id', (ctx) => {
    const id = parseId(ctx.params.id);
    load(db, id);
    const d = validate(ctx.body, SCHEMA, { partial: true });
    const columns = { name: 'name', calc_type: 'calc_type', rate: 'rate_kop', is_active: 'is_active' };
    const fields = Object.keys(d);
    if (fields.length) {
      db.prepare(`UPDATE tariffs SET ${fields.map((f) => `${columns[f]} = ?`).join(', ')} WHERE id = ?`)
        .run(...fields.map((f) => (typeof d[f] === 'boolean' ? Number(d[f]) : d[f])), id);
    }
    return serialize(load(db, id));
  }, { roles: STAFF });

  r.delete('/api/tariffs/:id', (ctx) => {
    const id = parseId(ctx.params.id);
    load(db, id);
    db.prepare('DELETE FROM tariffs WHERE id = ?').run(id);
    return undefined;
  }, { roles: STAFF });
}
