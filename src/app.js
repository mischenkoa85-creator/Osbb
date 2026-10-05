import { Router } from './router.js';
import { HttpError, readJsonBody, sendJson, sendError, unauthorized, forbidden } from './http.js';
import { verifyToken } from './auth.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import apartmentRoutes from './routes/apartments.js';
import tariffRoutes from './routes/tariffs.js';
import billingRoutes from './routes/billing.js';
import reportRoutes from './routes/reports.js';
import announcementRoutes from './routes/announcements.js';
import requestRoutes from './routes/requests.js';
import pollRoutes from './routes/polls.js';
import meterRoutes from './routes/meters.js';

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH']);

export function createApp({ db, config }) {
  const router = new Router();

  router.get('/health', () => ({ status: 'ok', time: new Date().toISOString() }), { public: true });
  router.get('/api', () => ({ name: 'osbb-server', version: '1.0.0', routes: router.list() }), { public: true });

  for (const register of [
    authRoutes, userRoutes, apartmentRoutes, tariffRoutes, billingRoutes,
    reportRoutes, announcementRoutes, requestRoutes, pollRoutes, meterRoutes,
  ]) {
    register(router, { db, config });
  }

  function authenticate(req) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) return null;
    const payload = verifyToken(token, config.jwtSecret);
    if (!payload) return null;
    const user = db
      .prepare('SELECT id, email, full_name, phone, role, is_active, token_version FROM users WHERE id = ?')
      .get(payload.sub);
    if (!user || !user.is_active || user.token_version !== payload.tv) return null;
    return user;
  }

  async function handle(req, res) {
    const started = process.hrtime.bigint();
    const url = new URL(req.url, 'http://localhost');

    res.setHeader('Access-Control-Allow-Origin', config.corsOrigin);
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    try {
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      const match = router.match(req.method, url.pathname);
      if (!match) throw new HttpError(404, 'not_found', 'Маршрут не знайдено');
      if (match.allowed) {
        res.setHeader('Allow', match.allowed.join(', '));
        throw new HttpError(405, 'method_not_allowed', 'Метод не підтримується');
      }

      const { route, params } = match;
      const user = authenticate(req);
      if (!route.options.public) {
        if (!user) throw unauthorized();
        if (route.options.roles && !route.options.roles.includes(user.role)) throw forbidden();
      }

      const ctx = {
        req,
        res,
        db,
        config,
        params,
        query: Object.fromEntries(url.searchParams),
        user,
        status: 200,
        ip: req.socket.remoteAddress,
        body: BODY_METHODS.has(req.method) ? await readJsonBody(req) : {},
      };

      const result = await route.handler(ctx);
      sendJson(res, result === undefined ? 204 : ctx.status, result);
    } catch (err) {
      sendError(res, normalizeError(err));
    } finally {
      if (config.logRequests) {
        const ms = Number(process.hrtime.bigint() - started) / 1e6;
        console.log(`${req.method} ${url.pathname} ${res.statusCode} ${ms.toFixed(1)}ms`);
      }
    }
  }

  return { handle, router };
}

function normalizeError(err) {
  if (err instanceof HttpError) return err;
  const msg = String(err?.message || '');
  if (msg.includes('UNIQUE constraint failed')) {
    return new HttpError(409, 'conflict', 'Запис з такими даними вже існує');
  }
  if (msg.includes('FOREIGN KEY constraint failed')) {
    return new HttpError(409, 'conflict', 'Операція порушує зв’язки між даними (є пов’язані записи або посилання на неіснуючий запис)');
  }
  if (msg.includes('CHECK constraint failed')) {
    return new HttpError(400, 'validation_error', 'Дані не пройшли перевірку');
  }
  console.error(err);
  return new HttpError(500, 'internal_error', 'Внутрішня помилка сервера');
}
