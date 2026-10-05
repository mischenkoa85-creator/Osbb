import { validate, parseId } from '../validate.js';
import { paginate, transaction, nowIso } from '../db.js';
import { STAFF, ADMIN, isStaff, isOwner, getApartment } from '../access.js';
import { notFound, forbidden, badRequest, conflict } from '../http.js';

// Пороги згідно з практикою ЗУ «Про ОСББ»: більшість (> 1/2) або не менше 2/3 загальної площі.
const THRESHOLDS = {
  majority: { share: 0.5, strict: true, label: 'більше половини загальної площі' },
  two_thirds: { share: 2 / 3, strict: false, label: 'не менше двох третин загальної площі' },
};

function statusOf(poll, now = nowIso()) {
  if (poll.closed_at || poll.ends_at <= now) return 'closed';
  if (poll.starts_at > now) return 'upcoming';
  return 'active';
}

const round = (x, digits = 2) => Math.round(x * 10 ** digits) / 10 ** digits;

const serialize = (p) => ({
  id: p.id,
  title: p.title,
  description: p.description ?? null,
  threshold: p.threshold,
  starts_at: p.starts_at,
  ends_at: p.ends_at,
  closed_at: p.closed_at ?? null,
  status: statusOf(p),
  created_at: p.created_at,
});

function load(db, id) {
  const poll = db.prepare('SELECT * FROM polls WHERE id = ?').get(id);
  if (!poll) throw notFound('Опитування не знайдено');
  return poll;
}

/** Результати з вагою голосу, пропорційною площі квартири. */
function results(db, poll) {
  const totalArea = db.prepare('SELECT COALESCE(SUM(area), 0) AS s FROM apartments').get().s;
  const totalApartments = db.prepare('SELECT COUNT(*) AS n FROM apartments').get().n;
  const options = db.prepare(`
    SELECT o.id, o.text, COUNT(v.apartment_id) AS votes, COALESCE(SUM(a.area), 0) AS area
    FROM poll_options o
    LEFT JOIN poll_votes v ON v.option_id = o.id
    LEFT JOIN apartments a ON a.id = v.apartment_id
    WHERE o.poll_id = ? GROUP BY o.id ORDER BY o.position
  `).all(poll.id);
  const rule = THRESHOLDS[poll.threshold];
  const passes = (area) => {
    if (!totalArea) return false;
    const share = area / totalArea;
    return rule.strict ? share > rule.share : share >= rule.share - 1e-9;
  };
  const votedArea = options.reduce((s, o) => s + o.area, 0);
  const votedApartments = options.reduce((s, o) => s + o.votes, 0);
  const winner = options.find((o) => passes(o.area));
  return {
    total_area: round(totalArea),
    total_apartments: totalApartments,
    voted_area: round(votedArea),
    voted_apartments: votedApartments,
    turnout_percent: totalArea ? round((votedArea / totalArea) * 100, 1) : 0,
    threshold_rule: rule.label,
    options: options.map((o) => ({
      id: o.id,
      text: o.text,
      votes: o.votes,
      area: round(o.area),
      percent_of_total_area: totalArea ? round((o.area / totalArea) * 100, 2) : 0,
      reaches_threshold: passes(o.area),
    })),
    decision: winner ? { option_id: winner.id, text: winner.text } : null,
  };
}

export default function pollRoutes(r, { db }) {
  r.get('/api/polls', (ctx) => {
    const now = nowIso();
    const where = [];
    const params = [];
    if (ctx.query.status === 'active') {
      where.push('closed_at IS NULL AND starts_at <= ? AND ends_at > ?');
      params.push(now, now);
    } else if (ctx.query.status === 'closed') {
      where.push('(closed_at IS NOT NULL OR ends_at <= ?)');
      params.push(now);
    } else if (ctx.query.status === 'upcoming') {
      where.push('closed_at IS NULL AND starts_at > ?');
      params.push(now);
    }
    return paginate(db, { select: '*', from: 'polls', where, params, orderBy: 'starts_at DESC, id DESC', map: serialize }, ctx.query);
  });

  r.post('/api/polls', (ctx) => {
    const d = validate(ctx.body, {
      title: { type: 'string', required: true, max: 300 },
      description: { type: 'string', max: 20000 },
      threshold: { type: 'enum', values: Object.keys(THRESHOLDS), default: 'majority' },
      options: { type: 'stringArray', required: true, minItems: 2, maxItems: 20 },
      starts_at: { type: 'datetime', default: nowIso },
      ends_at: { type: 'datetime', required: true },
    });
    if (d.ends_at <= d.starts_at) throw badRequest('ends_at має бути пізніше за starts_at');
    const id = transaction(db, () => {
      const { lastInsertRowid } = db.prepare(`
        INSERT INTO polls (title, description, threshold, starts_at, ends_at, created_by) VALUES (?, ?, ?, ?, ?, ?)
      `).run(d.title, d.description ?? null, d.threshold, d.starts_at, d.ends_at, ctx.user.id);
      const insert = db.prepare('INSERT INTO poll_options (poll_id, text, position) VALUES (?, ?, ?)');
      d.options.forEach((text, i) => insert.run(lastInsertRowid, text, i + 1));
      return lastInsertRowid;
    });
    ctx.status = 201;
    const poll = load(db, id);
    return { ...serialize(poll), results: results(db, poll) };
  }, { roles: STAFF });

  r.get('/api/polls/:id', (ctx) => {
    const poll = load(db, parseId(ctx.params.id));
    // Квартири користувача, від яких він може голосувати (власник), та їхні голоси.
    const my = db.prepare(`
      SELECT a.id AS apartment_id, a.number, v.option_id
      FROM apartment_members m
      JOIN apartments a ON a.id = m.apartment_id
      LEFT JOIN poll_votes v ON v.apartment_id = a.id AND v.poll_id = ?
      WHERE m.user_id = ? AND m.relation = 'owner' ORDER BY a.id
    `).all(poll.id, ctx.user.id);
    return { ...serialize(poll), results: results(db, poll), my_apartments: my };
  });

  // Голос від квартири. Власник голосує сам; персонал може внести паперовий бюлетень.
  r.post('/api/polls/:id/vote', (ctx) => {
    const poll = load(db, parseId(ctx.params.id));
    const d = validate(ctx.body, {
      apartment_id: { type: 'integer', required: true, min: 1 },
      option_id: { type: 'integer', required: true, min: 1 },
    });
    const status = statusOf(poll);
    if (status !== 'active') throw badRequest(status === 'upcoming' ? 'Голосування ще не розпочалося' : 'Голосування завершено');
    getApartment(db, d.apartment_id);
    if (!isStaff(ctx.user) && !isOwner(db, ctx.user.id, d.apartment_id)) {
      throw forbidden('Голосувати може лише власник квартири');
    }
    if (!db.prepare('SELECT 1 FROM poll_options WHERE id = ? AND poll_id = ?').get(d.option_id, poll.id)) {
      throw badRequest('Варіант не належить цьому опитуванню');
    }
    if (db.prepare('SELECT 1 FROM poll_votes WHERE poll_id = ? AND apartment_id = ?').get(poll.id, d.apartment_id)) {
      throw conflict('Від цієї квартири вже проголосовано');
    }
    db.prepare('INSERT INTO poll_votes (poll_id, apartment_id, option_id, voted_by) VALUES (?, ?, ?, ?)')
      .run(poll.id, d.apartment_id, d.option_id, ctx.user.id);
    ctx.status = 201;
    return { ...serialize(poll), results: results(db, poll) };
  });

  r.post('/api/polls/:id/close', (ctx) => {
    const poll = load(db, parseId(ctx.params.id));
    if (statusOf(poll) === 'closed') throw badRequest('Опитування вже завершено');
    db.prepare('UPDATE polls SET closed_at = ? WHERE id = ?').run(nowIso(), poll.id);
    const updated = load(db, poll.id);
    return { ...serialize(updated), results: results(db, updated) };
  }, { roles: STAFF });

  r.delete('/api/polls/:id', (ctx) => {
    const { changes } = db.prepare('DELETE FROM polls WHERE id = ?').run(parseId(ctx.params.id));
    if (!changes) throw notFound('Опитування не знайдено');
    return undefined;
  }, { roles: ADMIN });
}
