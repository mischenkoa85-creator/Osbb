// E-Systems 3D catalog: one menu for the four brands (Bluesun, Elecnova, ZOE, Golen).
// Brand data stays as it is in brands/*; this file only merges it: common categories and backup labels, a few
// re-groupings, and removal of purchase prices (the catalog is for customers).
const fs = require('fs');
const path = require('path');

// ---------- brands ----------
function bluesun() {
  // 24 configs + their catalog metadata, identical to the Bluesun catalog (ess3d-source-20261022 / branch ccr-d9838865-7deqb2)
  const d = JSON.parse(fs.readFileSync(path.join(__dirname, 'brands/bluesun/configs.json'), 'utf8'));
  return { P: d.configs, products: d.products, ORDER: Object.keys(d.configs) };
}
const BRANDS = [
  ['Bluesun', bluesun()],
  ['Elecnova', require('./brands/elecnova/products.cjs')],
  ['ZOE', require('./brands/zoe/products.cjs')],
  ['Golen', require('./brands/golen/products.cjs')],
];

// ---------- menu ----------
const categories = {
  cabinet: 'Шафи «все в одному»',
  hybrid: 'Шафи з гібридним інвертором / входом СЕС',
  rack: 'Інвертор + стійка',
  ev: 'Сонце + накопичувач + зарядка',
  sts: 'STS, EPS, мікромережа, комплекти з STS',
  container: 'Контейнери з PCS',
  battery: 'Батареї DC без PCS (шафи, кластери)',
  dccontainer: 'Батарейні контейнери DC',
  pcs: 'PCS і гібридні інвертори',
  mv: 'Станції PCS + трансформатор СН',
  system: 'Готові системи 1–2 МВт',
};
const backup = {
  builtin: 'Вбудований перехід', sts: 'PCS + STS', bypass: 'Bypass у контейнері', eps: 'Перемикач EPS (≤ 20 с)',
  dc: 'Потрібен PCS', grid: 'Мережевий PCS',
};
const brands = Object.fromEntries(BRANDS.map(([b]) => [b, b]));
const ats = 'ATS з мотор-приводом: типово від десятих секунди до кількох секунд (не дані виробника)';

// models that sit in another group than in their brand catalog, so that one type is in one place for all brands
const CATEGORY = {
  'zoe-ev': 'ev',                                   // ZOE: was in «cabinets»
  'golen-les-261l130-ps': 'sts',                     // Golen: was «kits with STS»
  'elecnova-b20ft5015lp-2': 'dccontainer', 'zoe-p5000-2h': 'dccontainer', 'zoe-p6200-2h': 'dccontainer', 'zoe-p3400-2h': 'dccontainer',
  'golen-lbs-2508': 'dccontainer', 'golen-lbs-5016': 'dccontainer',
};
// Elecnova EPS cabinets use the engine's Bypass scheme; in the menu they get their own label
const EPS_TYPE = 'Тип: перемикач EPS (≤ 20 с).';

// ---------- prices: removed everywhere ----------
// Elecnova pages carried its price list (EUR/kWh EXW Rotterdam), ZOE one quotation price; Golen and Bluesun had none.
// Exact rewrites keep the non-price facts of those sentences; anything else with a price is dropped below.
const REWRITE = [
  ['Є в прайсі Elecnova зі складу в Роттердамі.', 'Є на складі Elecnova в Роттердамі.'],
  ['Є в прайсі зі складу в Роттердамі.', 'Є на складі Elecnova в Роттердамі.'],
  ['Дані зі сторінки товару elecnova-ess.com і прайсу Elecnova.', 'Дані зі сторінки товару elecnova-ess.com.'],
  ['Дані зі сторінки товару і прайсу Elecnova (у прайсі: 215 кВт / 418 кВт·год).', 'Дані зі сторінки товару і комерційних даних Elecnova (там: 215 кВт / 418 кВт·год).'],
  ['Дані зі сторінки товару і прайсу Elecnova.', 'Дані зі сторінки товару і комерційних даних Elecnova.'],
  ['Потужність у прайсі', 'Потужність у комерційних даних'],
  ['; є на складі в ЄС (EXW Роттердам).', '; є на складі в ЄС (Роттердам).'],
  ['У прайсі Elecnova гібридні версії', 'У комерційних даних Elecnova гібридні версії'],
];
const PRICE_TXT = /€|EXW|FOB|прайс/i;
const isPriceRow = x => Array.isArray(x) && typeof x[0] === 'string' && /^ціна$/i.test(x[0].trim());
const hasPrice = x => PRICE_TXT.test(JSON.stringify(x));
const rewrite = t => REWRITE.reduce((acc, [f, r]) => acc.split(f).join(r), t)
  .replace(/\b\d+\.\d{6,}\b/g, m => String(Math.round(parseFloat(m) * 1000) / 1000)); // float artefacts, e.g. 2029.9999999999998 мм
function stripPrices(v) {
  if (Array.isArray(v)) {
    return v.flatMap(x => {
      if (isPriceRow(x)) { const w = String(x[1]).match(/гарантія\s+(\d+)\s+років/); return w ? [['Гарантія', `${w[1]} років`]] : []; }
      if (Array.isArray(x) && x.every(e => typeof e !== 'object' || e === null)) {
        // a table row, a key–value pair or a use case: rewritten as a whole, dropped as a whole if a price is left in it
        const y = x.map(e => typeof e === 'string' ? rewrite(e) : e);
        return y.some(e => typeof e === 'string' && PRICE_TXT.test(e)) ? [] : [y];
      }
      if (typeof x === 'string') { const y = rewrite(x); return PRICE_TXT.test(y) ? [] : [y]; } // e.g. a chip with a price
      return [stripPrices(x)];
    });
  }
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, stripPrices(x)]));
  if (typeof v === 'string') {
    const t = rewrite(v);
    return PRICE_TXT.test(t) ? t.split(/(?<=[.!?])\s+/).filter(x => !PRICE_TXT.test(x)).join(' ') : t; // sentences with a price go
  }
  return v;
}

// ---------- merge ----------
const P = {}, cards = [];
BRANDS.forEach(([brand, mod], bi) => {
  for (const [id, cfg0] of Object.entries(mod.P)) {
    if (P[id]) throw new Error('duplicate id ' + id);
    const cfg = stripPrices(JSON.parse(JSON.stringify(cfg0)));
    if (cfg.meta && CATEGORY[id]) cfg.meta.category = CATEGORY[id];
    if (brand === 'Elecnova' && cfg.meta && cfg.meta.backup === 'bypass') cfg.meta.typeText = EPS_TYPE;
    if (brand === 'ZOE' && cfg.logo && cfg.logo.type === 'plain') Object.assign(cfg.logo, { size: 112, weight: 800, align: 'center', y: 68 });
    if (brand === 'Golen') cfg.labelColor = '#13808F';
    if (cfg.meta) cfg.meta.brand = brand;
    P[id] = cfg;
  }
  mod.products.forEach((c, i) => {
    const card = { ...c, brand };
    if (CATEGORY[c.id]) card.category = CATEGORY[c.id];
    if (brand === 'Elecnova' && c.backup === 'bypass') card.backup = 'eps';
    if (!categories[card.category]) throw new Error(`${c.id}: category "${card.category}" is not in the common menu`);
    if (card.backup && !backup[card.backup]) throw new Error(`${c.id}: backup "${card.backup}" has no label`);
    cards.push({ card, k: [Object.keys(categories).indexOf(card.category), bi, i] });
  });
});
const products = cards.sort((a, b) => a.k[0] - b.k[0] || a.k[1] - b.k[1] || a.k[2] - b.k[2]).map(x => x.card);
if (!P[products[0].id]) throw new Error('first product must be a 3D config (the page opens it when the URL has no #id)');

// anything price-like left over is reported by the build
const leftovers = [];
(function walk(v, where) {
  if (typeof v === 'string') { if (PRICE_TXT.test(v) || /"?Ціна"?$/.test(v) || /\d\.\d{6,}/.test(v)) leftovers.push(where + ': ' + v.slice(0, 120)); }
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, where + '.' + k);
})(P, 'P');

module.exports = { P, products, catalog: { categories, backup, brands, ats }, leftovers, BRANDS: BRANDS.map(([b, m]) => [b, Object.keys(m.P).length]) };
