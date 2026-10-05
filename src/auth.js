import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(crypto.scrypt);
const KEYLEN = 64;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt.toString('base64url')}$${hash.toString('base64url')}`;
}

export async function verifyPassword(password, stored) {
  const [alg, saltB64, hashB64] = String(stored).split('$');
  if (alg !== 'scrypt' || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, 'base64url');
  const actual = await scrypt(password, Buffer.from(saltB64, 'base64url'), expected.length);
  return crypto.timingSafeEqual(actual, expected);
}

// Хеш-заглушка, щоб час відповіді не видавав, чи існує email.
let dummyHash;
export async function dummyVerify(password) {
  dummyHash ??= await hashPassword('dummy-password-for-timing');
  await verifyPassword(password, dummyHash);
  return false;
}

const b64json = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');

/** Мінімальна реалізація JWT (HS256). */
export function signToken(payload, secret, ttlSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64json({ alg: 'HS256', typ: 'JWT' });
  const body = b64json({ ...payload, iat: now, exp: now + ttlSeconds });
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyToken(token, secret) {
  const parts = String(token).split('.');
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest();
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const head = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    if (head.alg !== 'HS256') return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Простий лічильник невдалих спроб входу (у пам'яті). */
export class LoginLimiter {
  constructor({ maxAttempts = 10, windowMs = 15 * 60 * 1000 } = {}) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.entries = new Map();
  }

  isBlocked(key) {
    const e = this.entries.get(key);
    if (!e) return false;
    if (e.resetAt < Date.now()) {
      this.entries.delete(key);
      return false;
    }
    return e.count >= this.maxAttempts;
  }

  fail(key) {
    const now = Date.now();
    const e = this.entries.get(key);
    if (!e || e.resetAt < now) this.entries.set(key, { count: 1, resetAt: now + this.windowMs });
    else e.count += 1;
    if (this.entries.size > 10000) {
      for (const [k, v] of this.entries) if (v.resetAt < now) this.entries.delete(k);
    }
  }

  reset(key) {
    this.entries.delete(key);
  }
}
