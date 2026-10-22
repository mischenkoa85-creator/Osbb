// Builds 3d-elecnova/index.html from the Bluesun catalog page (same engine) with Elecnova product data.
const fs = require('fs');
const path = require('path');
const [, , srcHtml, outHtml] = process.argv;
const { P, products, catalog, ORDER } = require('./products.cjs');

const html = fs.readFileSync(srcHtml, 'utf8');
const SCRIPT_OPEN = '<script>(()=>{var Tc=';
const a = html.indexOf(SCRIPT_OPEN);
const b = html.indexOf('</script>', a);
let js = html.slice(a + '<script>'.length, b);

// locate the site config (d0) and product configs (hh) literals
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

// engine text that named Bluesun, and two small hooks the Elecnova data needs
const patches = [
  ['m.label.replace(/^Bluesun /,"")', 'm.label.replace(/^(Bluesun|Elecnova) /,"")'],
  ['Сумісні батареї Bluesun — нижче.', 'Сумісні батареї — нижче.'],
  ['ATS мережа ↔ ДГУ (не Bluesun)', 'ATS мережа ↔ ДГУ (стороннє обладнання)'],
  ['На схемах стандартних пропозицій Bluesun стоїть між мережею й генератором, у переліках обладнання його немає. ', 'Ставиться між мережею й генератором; у постачання Elecnova не входить. '],
  ['{id:"res_ess",name:i.model,text:{', '{id:"res_ess",name:Ut.essName||i.model,text:Ut.essText||{'],
  ['G=A(512,128,(h,b,M)=>{if(k.type==="golen"){', 'G=A(512,128,(h,b,M)=>{if(k.type==="plain"){h.fillStyle=k.color||"#1C3D5A",h.font="700 72px Manrope, Arial, sans-serif",h.textBaseline="middle",h.fillText(k.text,10,66);return}if(k.type==="golen"){'],
  ['map:Z(b.label||"BLUESUN","#1C3D5A")', 'map:Z(b.label||"ELECNOVA","#1C3D5A")'],
];
for (const [from, to] of patches) {
  const n = js.split(from).length - 1;
  if (n !== 1) throw new Error(`patch "${from.slice(0, 50)}" matched ${n} times`);
  js = js.replace(from, () => to);
}
// res_ess text map is indexed by backup type; keep that call valid when essText overrides it
js = js.replace(/text:Ut\.essText\|\|\{(builtin:"Батарея і гібридний перетворювач[^}]*)\}\[h\]/, (m0, inner) => `text:Ut.essText||{${inner}}[h]`);

let out = html.slice(0, a + '<script>'.length) + js + html.slice(b);
out = out.replace(/<title>[^<]*<\/title>/, '<title>3D-моделі Elecnova</title>');
fs.mkdirSync(path.dirname(outHtml), { recursive: true });
fs.writeFileSync(outHtml, out);
console.log('written', outHtml, (out.length / 1024).toFixed(0) + ' KB', products.length, 'products');
