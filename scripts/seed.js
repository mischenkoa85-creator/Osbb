// Демо-дані: node scripts/seed.js (використовує DATABASE_PATH або ./data/osbb.db)
import { openDatabase, transaction } from '../src/db.js';
import { createUser } from '../src/routes/auth.js';

const db = openDatabase(process.env.DATABASE_PATH || './data/osbb.db');
if (db.prepare('SELECT COUNT(*) AS n FROM users').get().n > 0) {
  console.log('База вже містить дані — пропускаю.');
  process.exit(0);
}

const PASSWORD = 'password123';
const admin = await createUser(db, { email: 'admin@osbb.local', password: PASSWORD, full_name: 'Голова правління', role: 'admin' });
const manager = await createUser(db, { email: 'manager@osbb.local', password: PASSWORD, full_name: 'Бухгалтер ОСББ', role: 'manager' });
const names = ['Іван Петренко', 'Олена Коваль', 'Микола Шевчук', 'Марія Бондар', 'Андрій Мельник', 'Ірина Ткаченко'];
const residents = [];
for (const [i, name] of names.entries()) {
  residents.push(await createUser(db, { email: `resident${i + 1}@osbb.local`, password: PASSWORD, full_name: name, role: 'resident' }));
}

transaction(db, () => {
  const insertApt = db.prepare('INSERT INTO apartments (number, entrance, floor, area, rooms, account_number) VALUES (?, ?, ?, ?, ?, ?)');
  const areas = [45.2, 62.8, 78.1, 45.2, 62.8, 78.1, 45.2, 62.8, 78.1, 95.4, 95.4, 120];
  areas.forEach((area, i) => {
    const n = i + 1;
    insertApt.run(String(n), n <= 6 ? 1 : 2, Math.ceil((((n - 1) % 6) + 1) / 3), area, area > 90 ? 4 : area > 70 ? 3 : area > 50 ? 2 : 1, `OS-${String(n).padStart(4, '0')}`);
  });
  const member = db.prepare('INSERT INTO apartment_members (apartment_id, user_id, relation) VALUES (?, ?, ?)');
  residents.forEach((u, i) => member.run(i + 1, u.id, 'owner'));

  db.prepare("INSERT INTO tariffs (name, calc_type, rate_kop) VALUES ('Утримання будинку та прибудинкової території', 'per_m2', 735)").run();
  db.prepare("INSERT INTO tariffs (name, calc_type, rate_kop) VALUES ('Ремонтний фонд', 'per_m2', 150)").run();
  db.prepare("INSERT INTO tariffs (name, calc_type, rate_kop) VALUES ('Обслуговування ліфта', 'per_apartment', 9000)").run();

  const tariffs = db.prepare('SELECT * FROM tariffs').all();
  const apts = db.prepare('SELECT * FROM apartments').all();
  const charge = db.prepare('INSERT INTO charges (apartment_id, period, tariff_id, description, amount_kop, created_by) VALUES (?, ?, ?, ?, ?, ?)');
  const pay = db.prepare("INSERT INTO payments (apartment_id, amount_kop, paid_at, method, created_by) VALUES (?, ?, ?, 'bank', ?)");
  for (const period of ['2026-07', '2026-08', '2026-09']) {
    for (const a of apts) {
      let sum = 0;
      for (const t of tariffs) {
        const amount = t.calc_type === 'per_m2' ? Math.round(a.area * t.rate_kop) : t.rate_kop;
        sum += amount;
        charge.run(a.id, period, t.id, t.name, amount, manager.id);
      }
      if (a.id % 4 !== 0) pay.run(a.id, sum, `${period}-20`, manager.id);
    }
  }

  db.prepare('INSERT INTO announcements (title, body, is_pinned, author_id) VALUES (?, ?, 1, ?)')
    .run('Загальні збори співвласників', 'Запрошуємо всіх співвласників на загальні збори 18 жовтня о 18:00 у дворі будинку.', admin.id);
  db.prepare('INSERT INTO announcements (title, body, author_id) VALUES (?, ?, ?)')
    .run('Планове відключення гарячої води', 'У вівторок з 9:00 до 17:00 — роботи на тепловому пункті.', manager.id);

  db.prepare("INSERT INTO service_requests (title, description, category, apartment_id, author_id) VALUES (?, ?, 'elevator', 1, ?)")
    .run('Не працює ліфт у 1 під’їзді', 'Зупиняється між 2 і 3 поверхами', residents[0].id);

  const ends = new Date(Date.now() + 14 * 86400000).toISOString();
  const { lastInsertRowid: pollId } = db.prepare("INSERT INTO polls (title, description, threshold, starts_at, ends_at, created_by) VALUES (?, ?, 'majority', ?, ?, ?)")
    .run('Встановлення камер відеоспостереження', 'Вартість — 1500 грн з квартири одноразово', new Date().toISOString(), ends, admin.id);
  ['За', 'Проти', 'Утримуюсь'].forEach((text, i) => db.prepare('INSERT INTO poll_options (poll_id, text, position) VALUES (?, ?, ?)').run(pollId, text, i + 1));
});

console.log(`Демо-дані створено. Пароль для всіх користувачів: ${PASSWORD}`);
console.log('  admin@osbb.local (адмін), manager@osbb.local (менеджер), resident1..6@osbb.local (мешканці)');
