export class HttpError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, details) => new HttpError(400, 'bad_request', message, details);
export const unauthorized = (message = 'Потрібна авторизація') => new HttpError(401, 'unauthorized', message);
export const forbidden = (message = 'Недостатньо прав') => new HttpError(403, 'forbidden', message);
export const notFound = (message = 'Не знайдено') => new HttpError(404, 'not_found', message);
export const conflict = (message) => new HttpError(409, 'conflict', message);

const MAX_BODY_BYTES = 1024 * 1024;

export async function readJsonBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'payload_too_large', 'Завеликий запит');
    chunks.push(chunk);
  }
  if (size === 0) return {};
  const type = req.headers['content-type'] || '';
  if (!type.includes('application/json')) {
    throw new HttpError(415, 'unsupported_media_type', 'Очікується Content-Type: application/json');
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw badRequest('Некоректний JSON');
  }
}

export function sendJson(res, status, data) {
  if (status === 204 || data === undefined) {
    res.writeHead(status === 200 ? 204 : status);
    res.end();
    return;
  }
  const body = JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

export function sendError(res, err) {
  const payload = { error: { code: err.code, message: err.message } };
  if (err.details) payload.error.details = err.details;
  sendJson(res, err.status, payload);
}
