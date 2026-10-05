import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const NOW = `(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`;

// Міграції застосовуються послідовно; нові додавати лише в кінець масиву.
const MIGRATIONS = [
  `
  CREATE TABLE users (
    id            INTEGER PRIMARY KEY,
    email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT    NOT NULL,
    full_name     TEXT    NOT NULL,
    phone         TEXT,
    role          TEXT    NOT NULL CHECK (role IN ('admin', 'manager', 'resident')),
    is_active     INTEGER NOT NULL DEFAULT 1,
    token_version INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE apartments (
    id             INTEGER PRIMARY KEY,
    number         TEXT    NOT NULL UNIQUE,
    entrance       INTEGER,
    floor          INTEGER,
    area           REAL    NOT NULL CHECK (area > 0),
    rooms          INTEGER,
    account_number TEXT UNIQUE,
    created_at     TEXT    NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE apartment_members (
    apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relation     TEXT    NOT NULL CHECK (relation IN ('owner', 'tenant', 'family')),
    share        REAL    NOT NULL DEFAULT 1 CHECK (share > 0 AND share <= 1),
    created_at   TEXT    NOT NULL DEFAULT ${NOW},
    PRIMARY KEY (apartment_id, user_id)
  );
  CREATE INDEX idx_members_user ON apartment_members(user_id);

  CREATE TABLE tariffs (
    id         INTEGER PRIMARY KEY,
    name       TEXT    NOT NULL,
    calc_type  TEXT    NOT NULL CHECK (calc_type IN ('per_m2', 'per_apartment')),
    rate_kop   INTEGER NOT NULL CHECK (rate_kop >= 0),
    is_active  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT    NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE charges (
    id           INTEGER PRIMARY KEY,
    apartment_id INTEGER NOT NULL REFERENCES apartments(id),
    period       TEXT    NOT NULL,
    tariff_id    INTEGER REFERENCES tariffs(id) ON DELETE SET NULL,
    description  TEXT    NOT NULL,
    amount_kop   INTEGER NOT NULL,
    created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at   TEXT    NOT NULL DEFAULT ${NOW},
    UNIQUE (apartment_id, period, tariff_id)
  );
  CREATE INDEX idx_charges_period ON charges(period);

  CREATE TABLE payments (
    id           INTEGER PRIMARY KEY,
    apartment_id INTEGER NOT NULL REFERENCES apartments(id),
    amount_kop   INTEGER NOT NULL CHECK (amount_kop > 0),
    paid_at      TEXT    NOT NULL,
    method       TEXT    NOT NULL CHECK (method IN ('cash', 'bank', 'card', 'other')),
    reference    TEXT,
    note         TEXT,
    created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at   TEXT    NOT NULL DEFAULT ${NOW}
  );
  CREATE INDEX idx_payments_apartment ON payments(apartment_id);
  CREATE INDEX idx_payments_paid_at ON payments(paid_at);

  CREATE TABLE announcements (
    id         INTEGER PRIMARY KEY,
    title      TEXT    NOT NULL,
    body       TEXT    NOT NULL,
    is_pinned  INTEGER NOT NULL DEFAULT 0,
    author_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT    NOT NULL DEFAULT ${NOW},
    updated_at TEXT    NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE service_requests (
    id           INTEGER PRIMARY KEY,
    apartment_id INTEGER REFERENCES apartments(id) ON DELETE SET NULL,
    author_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assignee_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    title        TEXT    NOT NULL,
    description  TEXT    NOT NULL,
    category     TEXT    NOT NULL DEFAULT 'other'
                 CHECK (category IN ('plumbing', 'electrical', 'elevator', 'heating', 'cleaning', 'security', 'other')),
    status       TEXT    NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'in_progress', 'resolved', 'rejected')),
    created_at   TEXT    NOT NULL DEFAULT ${NOW},
    updated_at   TEXT    NOT NULL DEFAULT ${NOW}
  );
  CREATE INDEX idx_requests_status ON service_requests(status);

  CREATE TABLE request_comments (
    id         INTEGER PRIMARY KEY,
    request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    author_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    body       TEXT    NOT NULL,
    created_at TEXT    NOT NULL DEFAULT ${NOW}
  );

  CREATE TABLE polls (
    id          INTEGER PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    threshold   TEXT NOT NULL DEFAULT 'majority' CHECK (threshold IN ('majority', 'two_thirds')),
    starts_at   TEXT NOT NULL,
    ends_at     TEXT NOT NULL,
    closed_at   TEXT,
    created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at  TEXT NOT NULL DEFAULT ${NOW},
    CHECK (ends_at > starts_at)
  );

  CREATE TABLE poll_options (
    id       INTEGER PRIMARY KEY,
    poll_id  INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    text     TEXT    NOT NULL,
    position INTEGER NOT NULL
  );

  CREATE TABLE poll_votes (
    poll_id      INTEGER NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    option_id    INTEGER NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    voted_by     INTEGER REFERENCES users(id) ON DELETE SET NULL,
    voted_at     TEXT    NOT NULL DEFAULT ${NOW},
    PRIMARY KEY (poll_id, apartment_id)
  );

  CREATE TABLE meter_readings (
    id           INTEGER PRIMARY KEY,
    apartment_id INTEGER NOT NULL REFERENCES apartments(id) ON DELETE CASCADE,
    meter_type   TEXT    NOT NULL CHECK (meter_type IN ('water_cold', 'water_hot', 'electricity', 'gas', 'heat')),
    period       TEXT    NOT NULL,
    value        REAL    NOT NULL CHECK (value >= 0),
    submitted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at   TEXT    NOT NULL DEFAULT ${NOW},
    updated_at   TEXT    NOT NULL DEFAULT ${NOW},
    UNIQUE (apartment_id, meter_type, period)
  );
  `,
];

export function openDatabase(file = ':memory:') {
  if (file !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec('PRAGMA busy_timeout = 5000');
  if (file !== ':memory:') db.exec('PRAGMA journal_mode = WAL');
  migrate(db);
  return db;
}

function migrate(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT ${NOW}
  )`);
  const current = db.prepare('SELECT COALESCE(MAX(version), 0) AS v FROM schema_migrations').get().v;
  for (let i = current; i < MIGRATIONS.length; i++) {
    transaction(db, () => {
      db.exec(MIGRATIONS[i]);
      db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(i + 1);
    });
  }
}

export function transaction(db, fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

/** Пагінований SELECT. Повертає { items, total, limit, offset }. */
export function paginate(db, { select, from, where = [], params = [], orderBy, map }, query = {}) {
  const limit = clampInt(query.limit, 50, 1, 200);
  const offset = clampInt(query.offset, 0, 0, Number.MAX_SAFE_INTEGER);
  const whereSql = where.length ? ` WHERE ${where.join(' AND ')}` : '';
  const total = db.prepare(`SELECT COUNT(*) AS n FROM ${from}${whereSql}`).get(...params).n;
  const rows = db
    .prepare(`SELECT ${select} FROM ${from}${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`)
    .all(...params, limit, offset);
  return { items: map ? rows.map(map) : rows, total, limit, offset };
}

function clampInt(value, fallback, min, max) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
}

export const nowIso = () => new Date().toISOString();
