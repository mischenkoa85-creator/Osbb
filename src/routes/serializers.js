import { fromKop } from '../money.js';

export function serializeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    phone: u.phone ?? null,
    role: u.role,
    is_active: !!u.is_active,
    created_at: u.created_at,
  };
}

export function serializeApartment(a) {
  const out = {
    id: a.id,
    number: a.number,
    entrance: a.entrance ?? null,
    floor: a.floor ?? null,
    area: a.area,
    rooms: a.rooms ?? null,
    account_number: a.account_number ?? null,
    created_at: a.created_at,
  };
  if (a.balance_kop !== undefined) out.balance = fromKop(a.balance_kop);
  return out;
}

export function serializeCharge(c) {
  return {
    id: c.id,
    apartment_id: c.apartment_id,
    apartment_number: c.apartment_number,
    period: c.period,
    tariff_id: c.tariff_id ?? null,
    description: c.description,
    amount: fromKop(c.amount_kop),
    created_at: c.created_at,
  };
}

export function serializePayment(p) {
  return {
    id: p.id,
    apartment_id: p.apartment_id,
    apartment_number: p.apartment_number,
    amount: fromKop(p.amount_kop),
    paid_at: p.paid_at,
    method: p.method,
    reference: p.reference ?? null,
    note: p.note ?? null,
    created_at: p.created_at,
  };
}
