import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { startServer, bootstrap } from './helpers.js';

let ctx;
let s;
before(async () => {
  ctx = await startServer();
  s = await bootstrap(ctx.api);
});
after(() => ctx.close());

test('оголошення: персонал публікує, усі читають, закріплені першими', async () => {
  const { api } = ctx;
  assert.equal((await api.post('/api/announcements', { title: 'X', body: 'Y' }, { token: s.alice.token })).status, 403);
  await api.post('/api/announcements', { title: 'Відключення води', body: 'У четвер з 10:00 до 14:00' }, { token: s.manager.token });
  const pinned = await api.post('/api/announcements', { title: 'Загальні збори', body: '12 жовтня', is_pinned: true }, { token: s.admin });
  assert.equal(pinned.status, 201);
  await api.post('/api/announcements', { title: 'Прибирання', body: 'Суботник' }, { token: s.admin });

  const list = await api.get('/api/announcements?limit=2', { token: s.bob.token });
  assert.equal(list.body.total, 3);
  assert.equal(list.body.items.length, 2);
  assert.equal(list.body.items[0].title, 'Загальні збори');
  assert.equal(list.body.items[0].author_name, 'Адмін');

  const upd = await api.patch(`/api/announcements/${pinned.body.id}`, { is_pinned: false }, { token: s.manager.token });
  assert.equal(upd.body.is_pinned, false);
  assert.equal((await api.delete(`/api/announcements/${pinned.body.id}`, { token: s.admin })).status, 204);
  assert.equal((await api.get(`/api/announcements/${pinned.body.id}`, { token: s.admin })).status, 404);
});

test('заявки: життєвий цикл і права доступу', async () => {
  const { api } = ctx;
  const req = await api.post('/api/requests', {
    title: 'Тече кран у підвалі', description: 'Біля лічильника', category: 'plumbing', apartment_id: s.apt1.id,
  }, { token: s.alice.token });
  assert.equal(req.status, 201);
  assert.equal(req.body.status, 'open');
  const id = req.body.id;

  // Чужа квартира — заборонено.
  assert.equal((await api.post('/api/requests', { title: 'a', description: 'b', apartment_id: s.apt1.id }, { token: s.bob.token })).status, 403);
  // Боб не бачить заявку Аліси.
  assert.equal((await api.get(`/api/requests/${id}`, { token: s.bob.token })).status, 404);
  assert.equal((await api.get('/api/requests', { token: s.bob.token })).body.total, 0);

  // Мешканець не може змінити статус, але може редагувати текст відкритої заявки.
  assert.equal((await api.patch(`/api/requests/${id}`, { status: 'resolved' }, { token: s.alice.token })).status, 403);
  assert.equal((await api.patch(`/api/requests/${id}`, { description: 'Біля лічильника, під трубою' }, { token: s.alice.token })).status, 200);

  // Виконавцем може бути лише персонал.
  assert.equal((await api.patch(`/api/requests/${id}`, { assignee_id: s.bob.id }, { token: s.manager.token })).status, 400);
  const taken = await api.patch(`/api/requests/${id}`, { status: 'in_progress', assignee_id: s.manager.id }, { token: s.manager.token });
  assert.equal(taken.body.status, 'in_progress');
  assert.equal(taken.body.assignee_name, 'Менеджер');

  assert.equal((await api.patch(`/api/requests/${id}`, { title: 'Нове' }, { token: s.alice.token })).status, 400);

  await api.post(`/api/requests/${id}/comments`, { body: 'Сантехнік прийде завтра' }, { token: s.manager.token });
  await api.post(`/api/requests/${id}/comments`, { body: 'Дякую!' }, { token: s.alice.token });
  const detail = await api.get(`/api/requests/${id}`, { token: s.alice.token });
  assert.equal(detail.body.comments.length, 2);
  assert.equal(detail.body.comments_count, 2);
  assert.equal(detail.body.comments[0].author_role, 'manager');

  const filtered = await api.get('/api/requests?status=open,in_progress', { token: s.admin });
  assert.equal(filtered.body.total, 1);
  assert.equal((await api.get('/api/requests?status=bogus', { token: s.admin })).status, 400);
});

test('голосування: вага за площею, лише власники, один голос від квартири', async () => {
  const { api } = ctx;
  // Додамо третю квартиру з власником Борисом.
  const apt3 = (await api.post('/api/apartments', { number: '3', area: 100 }, { token: s.admin })).body;
  await api.put(`/api/apartments/${apt3.id}/members/${s.bob.id}`, { relation: 'owner' }, { token: s.admin });
  // Загальна площа: 60 + 40 + 100 = 200.

  const ends = new Date(Date.now() + 86400000).toISOString();
  assert.equal((await api.post('/api/polls', { title: 'X', options: ['a'], ends_at: ends }, { token: s.admin })).status, 400);
  assert.equal((await api.post('/api/polls', { title: 'X', options: ['a', 'b'], ends_at: ends }, { token: s.alice.token })).status, 403);

  const poll = await api.post('/api/polls', {
    title: 'Встановлення домофона', options: ['За', 'Проти', 'Утримуюсь'], ends_at: ends, threshold: 'majority',
  }, { token: s.manager.token });
  assert.equal(poll.status, 201);
  assert.equal(poll.body.status, 'active');
  const [yes, no] = poll.body.results.options;

  // Борис — орендар кв.2, не власник.
  assert.equal((await api.post(`/api/polls/${poll.body.id}/vote`, { apartment_id: s.apt2.id, option_id: yes.id }, { token: s.bob.token })).status, 403);

  const v1 = await api.post(`/api/polls/${poll.body.id}/vote`, { apartment_id: s.apt1.id, option_id: yes.id }, { token: s.alice.token });
  assert.equal(v1.status, 201);
  assert.equal(v1.body.results.options[0].area, 60);
  assert.equal(v1.body.results.decision, null); // 30% < 50%
  assert.equal((await api.post(`/api/polls/${poll.body.id}/vote`, { apartment_id: s.apt1.id, option_id: no.id }, { token: s.alice.token })).status, 409);

  // Паперовий бюлетень від кв.2 вносить менеджер.
  await api.post(`/api/polls/${poll.body.id}/vote`, { apartment_id: s.apt2.id, option_id: yes.id }, { token: s.manager.token });
  const detail = await api.get(`/api/polls/${poll.body.id}`, { token: s.alice.token });
  assert.equal(detail.body.results.options[0].percent_of_total_area, 50);
  assert.equal(detail.body.results.decision, null); // рівно 50% — недостатньо для «більше половини»
  assert.deepEqual(detail.body.my_apartments, [{ apartment_id: s.apt1.id, number: '1', option_id: yes.id }]);

  const v3 = await api.post(`/api/polls/${poll.body.id}/vote`, { apartment_id: apt3.id, option_id: yes.id }, { token: s.bob.token });
  assert.equal(v3.body.results.decision.text, 'За');
  assert.equal(v3.body.results.turnout_percent, 100);

  // Варіант з іншого опитування.
  const other = await api.post('/api/polls', { title: 'Інше', options: ['Так', 'Ні'], ends_at: ends, threshold: 'two_thirds' }, { token: s.admin });
  assert.equal((await api.post(`/api/polls/${other.body.id}/vote`, { apartment_id: s.apt1.id, option_id: yes.id }, { token: s.alice.token })).status, 400);

  const closed = await api.post(`/api/polls/${poll.body.id}/close`, {}, { token: s.admin });
  assert.equal(closed.body.status, 'closed');
  assert.equal((await api.post(`/api/polls/${poll.body.id}/vote`, { apartment_id: s.apt1.id, option_id: yes.id }, { token: s.alice.token })).status, 400);

  assert.equal((await api.get('/api/polls?status=active', { token: s.bob.token })).body.total, 1);
  assert.equal((await api.get('/api/polls?status=closed', { token: s.bob.token })).body.total, 1);
});

test('лічильники: подання, оновлення, монотонність, споживання', async () => {
  const { api } = ctx;
  const url = `/api/apartments/${s.apt1.id}/meters`;
  const first = await api.post(url, { meter_type: 'water_cold', period: '2026-08', value: 100.5 }, { token: s.alice.token });
  assert.equal(first.status, 201);
  assert.equal(first.body.consumption, null);
  const second = await api.post(url, { meter_type: 'water_cold', period: '2026-09', value: 104 }, { token: s.alice.token });
  assert.equal(second.body.consumption, 3.5);

  assert.equal((await api.post(url, { meter_type: 'water_cold', period: '2026-10', value: 90 }, { token: s.alice.token })).status, 400);
  assert.equal((await api.post(url, { meter_type: 'water_cold', period: '2026-08', value: 110 }, { token: s.alice.token })).status, 400);
  const fix = await api.post(url, { meter_type: 'water_cold', period: '2026-09', value: 105 }, { token: s.alice.token });
  assert.equal(fix.status, 200);
  assert.equal(fix.body.value, 105);

  assert.equal((await api.post(url, { meter_type: 'water_cold', period: '2026-09', value: 1 }, { token: s.bob.token })).status, 403);
  const list = await api.get(`${url}?type=water_cold`, { token: s.alice.token });
  assert.deepEqual(list.body.items.map((m) => [m.period, m.consumption]), [['2026-09', 4.5], ['2026-08', null]]);

  assert.equal((await api.delete(`/api/meters/${fix.body.id}`, { token: s.alice.token })).status, 403);
  assert.equal((await api.delete(`/api/meters/${fix.body.id}`, { token: s.manager.token })).status, 204);
});
