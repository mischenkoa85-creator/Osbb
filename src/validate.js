import { HttpError } from './http.js';
import { toKop } from './money.js';

const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Перевіряє та нормалізує вхідні дані за простою схемою.
 * Правило: { type, required, nullable, default, min, max, values, ... }.
 * partial: true — для PATCH (відсутні поля пропускаються).
 */
export function validate(input, schema, { partial = false } = {}) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new HttpError(400, 'validation_error', 'Очікується JSON-об’єкт');
  }
  const out = {};
  const errors = {};
  for (const [key, rule] of Object.entries(schema)) {
    const value = input[key];
    if (value === undefined) {
      if (partial) continue;
      if (rule.default !== undefined) {
        out[key] = typeof rule.default === 'function' ? rule.default() : rule.default;
      } else if (rule.required) {
        errors[key] = 'обов’язкове поле';
      }
      continue;
    }
    if (value === null) {
      if (rule.nullable) out[key] = null;
      else errors[key] = 'не може бути null';
      continue;
    }
    const result = coerce(value, rule);
    if (result.error) errors[key] = result.error;
    else out[key] = result.value;
  }
  if (Object.keys(errors).length) {
    throw new HttpError(400, 'validation_error', 'Помилка валідації', errors);
  }
  return out;
}

function checkRange(n, rule) {
  if (rule.min !== undefined && n < rule.min) return `має бути не менше ${rule.min}`;
  if (rule.max !== undefined && n > rule.max) return `має бути не більше ${rule.max}`;
  if (rule.gt !== undefined && !(n > rule.gt)) return `має бути більше ${rule.gt}`;
  return null;
}

function coerce(v, rule) {
  switch (rule.type) {
    case 'string': {
      if (typeof v !== 'string') return { error: 'має бути рядком' };
      const s = v.trim();
      if (s === '') return rule.required ? { error: 'не може бути порожнім' } : { value: null };
      const max = rule.max ?? 5000;
      if (s.length > max) return { error: `не довше ${max} символів` };
      if (rule.min && s.length < rule.min) return { error: `не коротше ${rule.min} символів` };
      return { value: s };
    }
    case 'password': {
      if (typeof v !== 'string') return { error: 'має бути рядком' };
      if (v.length < 8) return { error: 'не коротше 8 символів' };
      if (v.length > 200) return { error: 'задовгий пароль' };
      return { value: v };
    }
    case 'email': {
      if (typeof v !== 'string' || !EMAIL_RE.test(v.trim())) return { error: 'некоректний email' };
      return { value: v.trim().toLowerCase() };
    }
    case 'integer': {
      if (!Number.isInteger(v)) return { error: 'має бути цілим числом' };
      const err = checkRange(v, rule);
      return err ? { error: err } : { value: v };
    }
    case 'number': {
      if (typeof v !== 'number' || !Number.isFinite(v)) return { error: 'має бути числом' };
      const err = checkRange(v, rule);
      return err ? { error: err } : { value: v };
    }
    case 'money': {
      if (typeof v !== 'number' || !Number.isFinite(v)) return { error: 'має бути числом' };
      const kop = toKop(v);
      if (Math.abs(kop - v * 100) > 1e-6) return { error: 'не більше 2 знаків після коми' };
      if (rule.positive && kop <= 0) return { error: 'має бути більше 0' };
      if (rule.nonzero && kop === 0) return { error: 'не може дорівнювати 0' };
      if (rule.nonnegative && kop < 0) return { error: 'не може бути від’ємним' };
      if (Math.abs(kop) > 1e12) return { error: 'завелика сума' };
      return { value: kop };
    }
    case 'boolean': {
      if (typeof v !== 'boolean') return { error: 'має бути true або false' };
      return { value: v };
    }
    case 'enum': {
      if (!rule.values.includes(v)) return { error: `допустимі значення: ${rule.values.join(', ')}` };
      return { value: v };
    }
    case 'period': {
      if (typeof v !== 'string' || !PERIOD_RE.test(v)) return { error: 'формат YYYY-MM' };
      return { value: v };
    }
    case 'date': {
      if (typeof v !== 'string' || !DATE_RE.test(v) || Number.isNaN(Date.parse(v))) {
        return { error: 'формат YYYY-MM-DD' };
      }
      return { value: v };
    }
    case 'datetime': {
      if (typeof v !== 'string' || Number.isNaN(Date.parse(v))) return { error: 'некоректна дата/час (ISO 8601)' };
      return { value: new Date(v).toISOString() };
    }
    case 'stringArray': {
      if (!Array.isArray(v)) return { error: 'має бути масивом' };
      const items = [];
      for (const item of v) {
        if (typeof item !== 'string' || !item.trim()) return { error: 'елементи мають бути непорожніми рядками' };
        items.push(item.trim());
      }
      if (rule.minItems && items.length < rule.minItems) return { error: `мінімум ${rule.minItems} елементи` };
      if (rule.maxItems && items.length > rule.maxItems) return { error: `максимум ${rule.maxItems} елементів` };
      if (new Set(items).size !== items.length) return { error: 'елементи не повинні повторюватись' };
      return { value: items };
    }
    case 'idArray': {
      if (!Array.isArray(v) || !v.every((x) => Number.isInteger(x) && x > 0)) {
        return { error: 'має бути масивом додатних цілих чисел' };
      }
      if (rule.minItems && v.length < rule.minItems) return { error: `мінімум ${rule.minItems} елемент(и)` };
      return { value: [...new Set(v)] };
    }
    default:
      throw new Error(`Unknown rule type: ${rule.type}`);
  }
}

/** Парсить цілий id з параметра шляху або query. */
export function parseId(value, name = 'id') {
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new HttpError(400, 'validation_error', `Некоректний ${name}`);
  }
  return n;
}

export function optionalQueryId(query, name) {
  return query[name] === undefined || query[name] === '' ? undefined : parseId(query[name], name);
}

export function queryPeriod(query, name) {
  const v = query[name];
  if (v === undefined || v === '') return undefined;
  if (!PERIOD_RE.test(v)) throw new HttpError(400, 'validation_error', `${name}: формат YYYY-MM`);
  return v;
}
