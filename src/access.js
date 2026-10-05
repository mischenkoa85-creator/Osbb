import { forbidden, notFound } from './http.js';

export const STAFF = ['admin', 'manager'];
export const ADMIN = ['admin'];

export const isStaff = (user) => STAFF.includes(user.role);

export function getApartment(db, id) {
  const apt = db.prepare('SELECT * FROM apartments WHERE id = ?').get(id);
  if (!apt) throw notFound('Квартиру не знайдено');
  return apt;
}

export function isMember(db, userId, apartmentId) {
  return !!db
    .prepare('SELECT 1 FROM apartment_members WHERE apartment_id = ? AND user_id = ?')
    .get(apartmentId, userId);
}

export function isOwner(db, userId, apartmentId) {
  return !!db
    .prepare("SELECT 1 FROM apartment_members WHERE apartment_id = ? AND user_id = ? AND relation = 'owner'")
    .get(apartmentId, userId);
}

/** Повертає квартиру, якщо користувач має до неї доступ (персонал — до всіх, мешканець — до своїх). */
export function assertApartmentAccess(db, user, apartmentId) {
  const apt = getApartment(db, apartmentId);
  if (!isStaff(user) && !isMember(db, user.id, apartmentId)) {
    throw forbidden('Немає доступу до цієї квартири');
  }
  return apt;
}
