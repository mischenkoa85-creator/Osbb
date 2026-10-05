import http from 'node:http';
import { loadConfig } from './config.js';
import { openDatabase } from './db.js';
import { createApp } from './app.js';
import { createUser } from './routes/auth.js';

const config = loadConfig();
const db = openDatabase(config.databasePath);

if (config.admin && db.prepare('SELECT COUNT(*) AS n FROM users').get().n === 0) {
  await createUser(db, { ...config.admin, role: 'admin' });
  console.log(`[osbb] Створено адміністратора ${config.admin.email}`);
}

const app = createApp({ db, config });
const server = http.createServer(app.handle);

server.listen(config.port, config.host, () => {
  console.log(`[osbb] Сервер запущено на http://${config.host}:${config.port}`);
});

function shutdown(signal) {
  console.log(`[osbb] ${signal}: зупинка...`);
  server.close(() => {
    db.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
