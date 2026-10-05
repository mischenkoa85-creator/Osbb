import crypto from 'node:crypto';

export function loadConfig(env = process.env) {
  const production = env.NODE_ENV === 'production';
  let jwtSecret = env.JWT_SECRET;
  if (!jwtSecret) {
    if (production) throw new Error('JWT_SECRET is required in production');
    jwtSecret = crypto.randomBytes(32).toString('hex');
    console.warn('[osbb] JWT_SECRET не задано — згенеровано тимчасовий (токени скинуться після перезапуску)');
  }
  return {
    port: Number(env.PORT) || 3000,
    host: env.HOST || '0.0.0.0',
    databasePath: env.DATABASE_PATH || './data/osbb.db',
    jwtSecret,
    tokenTtlHours: Number(env.TOKEN_TTL_HOURS) || 12,
    corsOrigin: env.CORS_ORIGIN || '*',
    logRequests: env.LOG_REQUESTS !== 'false',
    loginLimit: { maxAttempts: 10, windowMs: 15 * 60 * 1000 },
    admin: env.ADMIN_EMAIL && env.ADMIN_PASSWORD
      ? { email: env.ADMIN_EMAIL.trim().toLowerCase(), password: env.ADMIN_PASSWORD, full_name: env.ADMIN_NAME || 'Адміністратор' }
      : null,
  };
}
