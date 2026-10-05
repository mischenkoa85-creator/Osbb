# ОСББ — серверна частина

REST API для управління об'єднанням співвласників багатоквартирного будинку:
квартири й мешканці, тарифи, нарахування та оплати, боржники, заявки на ремонт,
оголошення, голосування співвласників (з вагою голосу за площею) та показники лічильників.

**Без залежностей**: Node.js ≥ 22.13 (`node:http`, вбудований `node:sqlite`, `node:test`). `npm install` не потрібен.

## Швидкий старт

```bash
npm run seed      # (необов'язково) демо-дані, пароль усіх користувачів: password123
npm start         # http://localhost:3000
npm test          # тести
```

Перший адміністратор створюється одним із способів:
- змінні `ADMIN_EMAIL` / `ADMIN_PASSWORD` при старті (якщо користувачів ще немає);
- `POST /api/setup` з `{ "email", "password", "full_name" }` (працює лише на порожній базі);
- `npm run seed`.

### Docker

```bash
docker build -t osbb-server .
docker run -p 3000:3000 -v osbb-data:/data -e JWT_SECRET=$(openssl rand -hex 32) \
  -e ADMIN_EMAIL=admin@example.com -e ADMIN_PASSWORD=change-me-now osbb-server
```

## Налаштування (змінні середовища)

| Змінна | За замовчуванням | Опис |
|---|---|---|
| `PORT` / `HOST` | `3000` / `0.0.0.0` | Адреса сервера |
| `DATABASE_PATH` | `./data/osbb.db` | Файл SQLite |
| `JWT_SECRET` | випадковий (dev) | **Обов'язковий** при `NODE_ENV=production` |
| `TOKEN_TTL_HOURS` | `12` | Термін дії токена |
| `CORS_ORIGIN` | `*` | Дозволене джерело для фронтенду |
| `LOG_REQUESTS` | `true` | Лог запитів у stdout |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` | — | Створення першого адміна |

## Ролі

| Роль | Можливості |
|---|---|
| `admin` | Усе, включно з призначенням ролей, деактивацією користувачів, видаленням квартир і опитувань |
| `manager` | Квартири, мешканці (лише роль `resident`), тарифи, нарахування, оплати, звіти, оголошення, заявки, опитування |
| `resident` | Свої квартири, баланс і особовий рахунок, оголошення, власні заявки, голосування (якщо власник), подання показників |

## API

Авторизація: `Authorization: Bearer <token>` (токен з `POST /api/auth/login`).
Суми — у гривнях (до 2 знаків після коми; всередині зберігаються в копійках).
Баланс: від'ємний = борг. Списки повертають `{ items, total, limit, offset }` (`?limit=&offset=`).
Помилки: `{ "error": { "code", "message", "details?" } }`.
Повний перелік маршрутів: `GET /api`.

**Авторизація**
- `POST /api/setup` — перший адміністратор
- `POST /api/auth/login` — `{ email, password }` → `{ user, token }`
- `GET|PATCH /api/auth/me` — профіль (+ мої квартири)
- `POST /api/auth/change-password` — `{ current_password, new_password }` (відкликає старі токени)

**Користувачі** (персонал)
- `GET /api/users?role=&q=&active=` · `POST /api/users` · `GET|PATCH /api/users/:id` · `DELETE /api/users/:id` (деактивація)

**Квартири**
- `GET /api/apartments?q=&entrance=` · `POST` · `GET|PATCH|DELETE /api/apartments/:id`
- `GET /api/apartments/:id/members` · `PUT|DELETE /api/apartments/:id/members/:userId` — `{ relation: owner|tenant|family, share }`
- `GET /api/apartments/:id/ledger?from=YYYY-MM&to=YYYY-MM` — особовий рахунок з наростаючим сальдо

**Фінанси**
- `GET|POST /api/tariffs`, `PATCH|DELETE /api/tariffs/:id` — `{ name, calc_type: per_m2|per_apartment, rate }`
- `GET /api/charges?apartment_id=&period=` · `POST /api/charges` (ручне/перерахунок) · `DELETE /api/charges/:id`
- `POST /api/charges/generate` — `{ period, tariff_ids? }` масове нарахування; повторний запуск не дублює
- `GET /api/payments?apartment_id=&period=` · `POST /api/payments` — `{ apartment_id, amount, paid_at, method, reference, note }` · `DELETE /api/payments/:id`
- `GET /api/reports/debtors?min_debt=` · `GET /api/reports/summary?period=`

**Спільнота**
- `GET|POST /api/announcements`, `GET|PATCH|DELETE /api/announcements/:id`
- `GET /api/requests?status=open,in_progress&category=&apartment_id=&assignee_id=` · `POST /api/requests`
- `GET|PATCH /api/requests/:id` · `POST /api/requests/:id/comments`
- `GET /api/polls?status=active|closed|upcoming` · `POST /api/polls` — `{ title, options[], ends_at, starts_at?, threshold: majority|two_thirds }`
- `GET /api/polls/:id` (результати + мої квартири) · `POST /api/polls/:id/vote` — `{ apartment_id, option_id }` · `POST /api/polls/:id/close` · `DELETE /api/polls/:id`

  Голос подається від квартири (один на квартиру) її власником; менеджер може внести паперовий бюлетень.
  Вага голосу — площа квартири. Рішення: `majority` — більше 50% загальної площі будинку, `two_thirds` — не менше 2/3.

**Лічильники**
- `GET /api/apartments/:id/meters?type=&from=` — показники зі споживанням
- `POST /api/apartments/:id/meters` — `{ meter_type: water_cold|water_hot|electricity|gas|heat, period, value }` (повторне подання оновлює; перевіряється монотонність)
- `DELETE /api/meters/:id` (персонал)

### Приклад

```bash
TOKEN=$(curl -s localhost:3000/api/auth/login -H 'content-type: application/json' \
  -d '{"email":"manager@osbb.local","password":"password123"}' | jq -r .token)
curl -s -X POST localhost:3000/api/charges/generate -H "authorization: Bearer $TOKEN" \
  -H 'content-type: application/json' -d '{"period":"2026-10"}'
curl -s localhost:3000/api/reports/debtors -H "authorization: Bearer $TOKEN"
```

## Структура

```
src/
  server.js       точка входу (HTTP-сервер, graceful shutdown)
  app.js          маршрутизація, авторизація, обробка помилок
  db.js           SQLite, міграції, пагінація
  auth.js         scrypt-хешування паролів, JWT (HS256), ліміт спроб входу
  validate.js     валідація вхідних даних
  routes/         обробники за доменами
scripts/seed.js   демо-дані
test/             інтеграційні тести (node:test)
```
