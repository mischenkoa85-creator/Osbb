// Golen catalog: collects the product configs and builds the list for the models panel.
const { BRAND, fmt } = require('./lib.cjs');
const P = { ...require('./cabinets.cjs'), ...require('./h20.cjs'), ...require('./containers.cjs'), ...require('./pcs.cjs') };
const LINKS = require('./links.cjs');

const ORDER = Object.keys(P).sort((a, b) => (P[a].order ?? 99) - (P[b].order ?? 99));
const card = (id, c, m, href) => ({
  id, label: `Golen ${c.model}${c.kw || c.kwh ? ' · ' + [c.kw ? fmt(c.kw) + ' кВт' : '', c.kwh ? fmt(c.kwh) + ' кВт·год' : ''].filter(Boolean).join(' / ') : ''}`,
  href, category: m.category, market: 'EU', backup: m.backup, ms: m.ms || null, stsOpt: m.sts === 'option' ? 'option' : (m.backup === 'sts' ? 'third' : null), kw: c.kw, kwh: c.kwh, brand: BRAND,
});
const products = [
  ...ORDER.map(id => card(id, P[id], P[id].meta || {}, '#' + id)),
  ...LINKS.map(l => card(l.id, l, l.meta, l.href)),
].sort((a, b) => order(a.id) - order(b.id));
function order(id) { return (P[id] || LINKS.find(l => l.id === id) || {}).order ?? 99; }
// the engine opens products[0] when the URL has no hash, so the first card must be a 3D config
if (!P[products[0].id]) throw new Error('first product must be a 3D config');

const catalog = {
  categories: { cabinet: 'Шафи «все в одному»', hybrid: 'Шафи з СЕС-входом (PS)', kit: 'Комплекти з STS', ev: 'Сонце + накопичувач + зарядка', container: 'Контейнери', battery: 'Батарейні контейнери без PCS', pcs: 'Перетворювачі PCS', mv: 'Станції PCS + трансформатор' },
  backup: { builtin: 'Вбудований перехід', sts: 'PCS + STS', dc: 'Потрібен PCS', grid: 'Мережевий PCS' },
  ats: 'ATS з мотор-приводом: типово від десятих секунди до кількох секунд (не дані Golen)',
};
module.exports = { P, products, catalog, ORDER };
