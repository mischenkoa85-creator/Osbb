// Builds 3d-golen/index.html from the Bluesun catalog page (same E-Systems "ess-cabinet" engine) with Golen product data.
// Usage: node src/build.cjs <bluesun index.html> <out index.html>
const fs = require('fs');
const path = require('path');
const [, , srcHtml, outHtml] = process.argv;
const { P, products, catalog, ORDER } = require('./products.cjs');

const html = fs.readFileSync(srcHtml, 'utf8');
const SCRIPT_OPEN = '<script>(()=>{var Tc=';
const a = html.indexOf(SCRIPT_OPEN);
if (a < 0) throw new Error('engine script not found');
const b = html.indexOf('</script>', a);
let js = html.slice(a + '<script>'.length, b);

function matchEnd(s, st) {
  let d = 0, str = null, esc = false;
  for (let k = st; k < s.length; k++) {
    const c = s[k];
    if (str) { if (esc) esc = false; else if (c === '\\') esc = true; else if (c === str) str = null; continue; }
    if (c === '"' || c === "'" || c === '`') { str = c; continue; }
    if (c === '{' || c === '[') d++; else if (c === '}' || c === ']') { d--; if (d === 0) return k; }
  }
}
const d0At = js.indexOf('d0={id:"esystems"') + 3;
const d0End = matchEnd(js, d0At);
const d0 = eval('(' + js.slice(d0At, d0End + 1) + ')');
const hhAt = js.indexOf('hh={', d0End) + 3;
const hhEnd = matchEnd(js, hhAt);

const site = { ...d0, products, catalog };
const configs = Object.fromEntries(ORDER.map(id => [id, P[id]]));
js = js.slice(0, d0At) + JSON.stringify(site) + js.slice(d0End + 1, hhAt) + JSON.stringify(configs) + js.slice(hhEnd + 1);

// engine texts that named Bluesun + small hooks used by the Golen data (each must match exactly once)
const patches = [
  ['m.label.replace(/^Bluesun /,"")', 'm.label.replace(/^(Bluesun|Elecnova|Golen) /,"")'],
  ['Сумісні батареї Bluesun — нижче.', 'Сумісні батареї — нижче.'],
  ['ATS мережа ↔ ДГУ (не Bluesun)', 'ATS мережа ↔ ДГУ (стороннє обладнання)'],
  ['На схемах стандартних пропозицій Bluesun стоїть між мережею й генератором, у переліках обладнання його немає. ', 'Ставиться між мережею й генератором; у постачання Golen не входить. '],
  ['{id:"res_ess",name:i.model,text:{', '{id:"res_ess",name:Ut.essName||i.model,text:Ut.essText||{'],
  ['map:Z(b.label||"BLUESUN","#1C3D5A")', 'map:Z(b.label||"GOLEN","#13808F")'],
  // rack columns may start higher (s = skipped positions), e.g. a cluster whose bottom slot is the HV switch box
  ['({x:h.x,lvl:E,col:b})', '({x:h.x,lvl:E+(h.s||0),col:b})'],
  ['Bs=Math.max(0,...Mt.map(h=>h.n??he.count))', 'Bs=Math.max(0,...Mt.map(h=>(h.n??he.count)+(h.s||0)))'],
  // meta.noRes hides the "Резерв" tab for products whose off-grid ability Golen does not state
  ["${i.meta?'<button id=\"tabRes\"", "${i.meta&&!i.meta.noRes?'<button id=\"tabRes\""],
  ['if(Ut){let h=Ut.backup,b=.03', 'if(Ut&&!Ut.noRes){let h=Ut.backup,b=.03'],
];
for (const [from, to] of patches) {
  const n = js.split(from).length - 1;
  if (n !== 1) throw new Error(`patch "${from.slice(0, 50)}" matched ${n} times`);
  js = js.replace(from, () => to);
}
js = js.replace(/text:Ut\.essText\|\|\{(builtin:"Батарея і гібридний перетворювач[^}]*)\}\[h\]/, (m0, inner) => `text:Ut.essText||{${inner}}[h]`);

let out = html.slice(0, a + '<script>'.length) + js + html.slice(b);

// Numbers stay on the equipment; a label appears only for the selected item or under the pointer
// (no floating captions over the model — requirement from the STS page review).
const PIN_CSS = '<style id="golen-pins">.pin:not(.active):not(:hover) .t{opacity:0!important}.pin .t{pointer-events:none}</style>';
out = out.replace('</head>', PIN_CSS + '</head>');
out = out.replace(/<title>[^<]*<\/title>/, '<title>3D-моделі Golen</title>');
// the error banner must not fire on the browser's benign "ResizeObserver loop …" notice
const GUARD_AT = "window.addEventListener('error',function(e){show(";
if (out.split(GUARD_AT).length !== 2) throw new Error('error-banner hook not found');
out = out.replace(GUARD_AT, "window.addEventListener('error',function(e){if(/ResizeObserver loop/.test(e.message||''))return;show(");
if (/Bluesun/.test(js.replace(/\(Bluesun\|Elecnova\|Golen\)/, ''))) {
  const left = [...js.matchAll(/.{40}Bluesun.{40}/g)].map(m => m[0]);
  console.warn('WARNING: Bluesun still in engine text:', left.slice(0, 5));
}
fs.mkdirSync(path.dirname(outHtml), { recursive: true });
fs.writeFileSync(outHtml, out);

// detailed pages linked from the catalog (-PS kit with STS, PV + storage + EV charging): copy with a link back to the catalog
const PAGES = [['pages/sts.src.html', 'sts.html'], ['pages/psc.src.html', 'psc.html']];
const BACK_CSS = '<style id="golen-back">.cat-link{margin-left:auto;margin-right:10px;font-weight:700;font-size:14px;color:#fff;background:#13808F;padding:8px 14px;border-radius:9px;text-decoration:none;white-space:nowrap}.cat-link:hover{background:#0f6b78}@media (max-width:600px){.cat-link{font-size:13px;padding:7px 11px;margin-right:0}}</style>';
for (const [src, dst] of PAGES) {
  let page = fs.readFileSync(path.join(__dirname, src), 'utf8');
  const n = page.split('<nav class="nav"').length - 1;
  if (n !== 1) throw new Error(`${src}: nav matched ${n} times`);
  page = page.replace('<nav class="nav"', '<a class="cat-link" href="index.html">← Усі моделі Golen</a><nav class="nav"').replace('</head>', BACK_CSS + '</head>');
  // the source pages are artifact fragments (no doctype/head): served as plain files they need their own skeleton
  if (!/^\s*<!doctype/i.test(page)) page = '<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' + BACK_CSS + page;
  fs.writeFileSync(path.join(path.dirname(outHtml), dst), page);
  console.log('written', dst, (page.length / 1024).toFixed(0) + ' KB');
}
console.log('written', outHtml, (out.length / 1024).toFixed(0) + ' KB', products.length, 'products');
