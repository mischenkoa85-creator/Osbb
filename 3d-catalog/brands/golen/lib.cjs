// Golen product configs for the E-Systems "ess-cabinet" 3D catalog engine (same schema as the Bluesun and Elecnova catalogs).
// Sources: Golen datasheets and catalogs from golen-power.com / golenpower.com ("Intelligent Energy Storage Series Products
// 2026 V1.4", "Microgrid System 2026 V1.3"), site spec tables, LES-H20 user manual and drawings, LEI-500K-TT manual.
// No prices on purpose: the catalog is for customers, Golen purchase prices stay internal.
// Layout inside cabinets: Golen cutaways where published (LES-112, LES-H20), otherwise schematic and labelled so.

const BRAND = 'Golen';
const COLORS = {
  shell: '#F1F3F4', roof: '#E7EAEC', plinth: '#2E3439', door: '#F5F6F7', doorIn: '#E2E6E9', frame: '#D1D7DB',
  accent: '#13808F', accent2: '#E39B2D', module: '#D6DBDF', modFace: '#C8CED3', hv: '#9AA4AB', pcs: '#B9C1C7', chiller: '#C3CACF',
  dist: '#D9DEE2', inv: '#F2F4F5', cab: '#E3E7EA', coil: '#3F5566', duct: '#CBD2D6',
};
const base = (extra = {}) => ({
  template: 'ess-cabinet', brand: BRAND, theme: { brand: '#13808F' },
  logo: { type: 'golen' }, colors: { ...COLORS, ...(extra.colors || {}) },
});
const eyes = (w, d) => [-1, 1].flatMap(sx => [-1, 1].map(sz => ({ type: 'eye', x: sx * (w / 2 - 0.1), z: sz * (d / 2 - 0.1) })));
const fmt = n => String(n).replace('.', ',');
const mm = (w, d, h) => `${Math.round(w * 1000)} × ${Math.round(d * 1000)} × ${Math.round(h * 1000)} мм`;
const LEDS = ['#2EE07A', '#F2C230', '#E8392B'];
const VIDEO = 'GOLEN · E-SYSTEMS';

// ---------- source names (short, as shown under the specs) ----------
const S = {
  v14: 'Каталог Golen «Intelligent Energy Storage Series Products 2026 V1.4»',
  v13: 'Каталог Golen «Microgrid System 2026 V1.3»',
  site: m => `Таблиця товару ${m} на golen-power.com`,
  ds: m => `Паспорт ${m} (golen-power.com)`,
  dsCN: m => `Паспорт ${m}, китайська версія (golenpower.com)`,
};

// ---------- common texts ----------
const CELL314 = (series, v) => ({ name: 'Комірка LFP 314 А·год', text: `Призматична комірка LFP. ${series} комірок послідовно дають ${v} В.`, kv: [['Ємність', '314 А·год'], ['Номінальна напруга', '3,2 В']] });
const CELL280 = (series, v) => ({ name: 'Комірка LFP 280 А·год', text: `Призматична комірка LFP. ${series} комірок послідовно дають ${v} В.`, kv: [['Ємність', '280 А·год'], ['Номінальна напруга', '3,2 В']] });
const EMS_INFO = { name: 'EMS', short: 'EMS', text: 'Контролер шафи збирає дані BMS, PCS, охолодження й пожежної системи і керує режимами: peak shaving, тарифи, власне споживання СЕС, резерв. Кількома шафами, STS і генератором на об\'єкті керує EMS E-Systems.', kv: [['Зв\'язок', 'RS485, Ethernet; Modbus']] };
const estopInfo = { name: 'Аварійна кнопка', text: 'Аварійне відключення шафи; поруч індикатори роботи.', kv: [] };

function fireCab(w, d, h, { water = false, extra = [] } = {}) {
  return {
    items: [
      { type: 'aerosol', pos: [-w * 0.18, h - 0.22, 0.1], r: 0.05, len: 0.3, label: 'Аерозольний генератор', left: true, pin: [0, 0.08, 0] },
      { type: 'smoke', pos: [w * 0.22, h - 0.12, d * 0.2], label: 'Датчик диму', pin: [0, -0.08, 0] },
      { type: 'heat', pos: [w * 0.05, h - 0.12, -d * 0.2], label: 'Датчик температури', pin: [0, -0.07, 0] },
      ...(water ? [{ type: 'pipe', pos: [w * 0.3, h - 0.3, -d * 0.3], label: 'Вхід води пожежогасіння', pin: [0, 0.08, 0] }] : []),
      ...extra,
      { type: 'led', index: 2, label: 'Індикатор аварії на дверях', pin: [0.05, 0.03, 0.02] },
      { type: 'estop', label: 'Аварійна кнопка', pin: [0, -0.06, 0.02] },
    ], alarmLeds: [2],
  };
}
const FIRE_INFO = (agent, extra = '') => ({ name: 'Пожежна безпека', short: 'Пожежогасіння', text: `Пожежогасіння: ${agent}${extra}. Які саме датчики стоять у шафі, Golen не вказує — датчики й генератори на моделі показані схематично. Запустіть тест, щоб побачити спрацювання.`, kv: [['Гасіння', agent]] });

// application (apply) helper for all-in-one cabinets
const usesCabinet = (kw, kwh, stsText) => {
  const h = (kwh * 0.9 / kw).toFixed(1).replace('.', ',');
  return [
    ['Peak shaving і тарифи', 'Заряд у нічний тариф або від СЕС, розряд у пікові години; EMS тримає імпорт з мережі під заданою межею.', 'e'],
    ['Резерв', stsText, 'b'],
    ['Тривалість резерву', `≈ ${h} год при ${fmt(kw)} кВт (90 % ємності, без урахування ККД).`, 'e'],
    ['Масштабування', 'Шафи з\'єднуються паралельно на стороні змінного струму; системою керує EMS.', 'b'],
  ];
};

// demo power values for the PV system scheme (labels on the scheme are illustrative)
const pvPower = kw => {
  const r = v => `${Math.round(v)} кВт`;
  return {
    day: { scab: `заряд ${r(kw * 0.2)}`, spv: `+${r(kw * 0.62)}`, sload: r(kw * 0.42), sgrid: '0 кВт', sgen: 'вимкнено' },
    eve: { scab: `розряд ${r(kw * 0.52)}`, spv: '0 кВт', sload: r(kw * 0.6), sgrid: r(kw * 0.08), sgen: 'вимкнено' },
    out: { scab: `розряд ${r(kw * 0.14)}`, spv: `+${r(kw * 0.28)}`, sload: r(kw * 0.42), sgrid: 'немає', sgen: 'вимкнено' },
    gen: { scab: `заряд ${r(kw * 0.18)}`, spv: `+${r(kw * 0.28)}`, sload: r(kw * 0.42), sgrid: 'немає', sgen: `+${r(kw * 0.32)}` },
  };
};

module.exports = { BRAND, COLORS, base, eyes, fmt, mm, LEDS, VIDEO, S, CELL314, CELL280, EMS_INFO, estopInfo, fireCab, FIRE_INFO, usesCabinet, pvPower };
