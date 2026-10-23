// Builds the E-Systems 3D catalog: one offline HTML page with all models of Bluesun, Elecnova, ZOE and Golen
// (three.js, the engine and every config inlined), plus the two detailed Golen pages it links to.
// usage: node build.cjs [outDir] [--art]   (default outDir: this folder)   — needs `npm install` (esbuild, three)
// --art also writes <outDir>/art/: the same page as a claude.ai Artifact fragment (no doctype/head) with sts.html / psc.html.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { P, products, catalog, leftovers, BRANDS } = require('./catalog.cjs');

const args = process.argv.slice(2), ART = args.includes('--art');
const outDir = path.resolve(args.find(a => !a.startsWith('--')) || __dirname);
fs.mkdirSync(path.join(outDir, ART ? 'art' : ''), { recursive: true });
const site = { ...JSON.parse(fs.readFileSync(path.join(__dirname, 'site.json'), 'utf8')), products, catalog };

// ---------- bundle: engine + data ----------
const entry = path.join(__dirname, 'engine', '_entry.js');
fs.writeFileSync(entry,
  "import { start } from './ess-cabinet.js';\n" +
  `const SITE = ${JSON.stringify(site)};\n` +
  `const PRODUCTS = ${JSON.stringify(P)};\n` +
  "const id = PRODUCTS[location.hash.slice(1)] ? location.hash.slice(1) : SITE.products[0].id;\n" +
  "start(PRODUCTS[id], SITE);\n" +
  "window.addEventListener('hashchange', () => { if (PRODUCTS[location.hash.slice(1)]) location.reload(); });\n");
let js;
try {
  js = execFileSync(path.join(__dirname, 'node_modules', '.bin', 'esbuild'),
    [entry, '--bundle', '--minify', '--format=iife', '--charset=utf8', '--legal-comments=none'], { cwd: __dirname, maxBuffer: 256 << 20 }).toString();
} finally { fs.unlinkSync(entry); }

// readable message instead of an endless "loading" when WebGL or a script fails; the browser's benign
// "ResizeObserver loop …" notice is not an error
const GUARD = `(function(){function show(t){var d=document.getElementById('essErr');if(!d){d=document.createElement('div');d.id='essErr';d.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:99;background:#7a1f1a;color:#fff;font:14px/1.4 sans-serif;padding:12px 14px;border-radius:10px';document.body.appendChild(d);}d.textContent=t;}
window.addEventListener('error',function(e){if(/ResizeObserver loop/.test(e.message||''))return;show('Помилка 3D: '+(e.message||e)+'. Відкрийте файл у Chrome, Safari або Edge.');});
var c=document.createElement('canvas');if(!(c.getContext('webgl2')||c.getContext('webgl'))){document.addEventListener('DOMContentLoaded',function(){show('Цей перегляд не підтримує WebGL, тому 3D не показується. Відкрийте файл у браузері Chrome, Safari або Edge.');});}})();`;
const css = fs.readFileSync(path.join(__dirname, 'engine', 'page.css'), 'utf8');
const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap">';
const TITLE = '3D-моделі E-Systems';
const headInner = `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><title>${TITLE}</title>${FONTS}<style>${css}</style>`;
const bodyTail = '<noscript><p style="font:16px sans-serif;padding:24px">Цей перегляд не запускає JavaScript. Відкрийте файл у браузері (Chrome, Safari, Edge).</p></noscript>\n' +
  `<script>${GUARD}</script>\n<script>${js.replace(/<\/script/gi, '<\\/script')}</script>\n`;
const page = `<!doctype html>\n<html lang="uk"><head>${headInner}</head>\n<body></body>\n${bodyTail}</html>\n`;
fs.writeFileSync(path.join(outDir, 'index.html'), page);

// Artifact copy: the service wraps the fragment into <body>, and the engine replaces document.body.innerHTML on start —
// so styles, font links and the title are moved into <head> first. The viewer cannot save .glb / .usdz: export buttons hidden.
const HOIST = "<script>document.querySelectorAll('body > style, body > link, body > title, body > meta').forEach(function(n){document.head.appendChild(n)});</script>";
const art = headInner + '<style id="art-noexport">#btnGlb,#btnUsdz{display:none!important}</style>\n' + HOIST + '\n' + bodyTail;
if (ART) fs.writeFileSync(path.join(outDir, 'art', 'index.html'), art);

// ---------- detailed Golen pages (linked from the catalog cards) ----------
const BACK_CSS = '<style id="cat-back">.cat-link{margin-left:auto;margin-right:10px;font-weight:700;font-size:14px;color:#fff;background:#13808F;padding:8px 14px;border-radius:9px;text-decoration:none;white-space:nowrap}.cat-link:hover{background:#0f6b78}@media (max-width:600px){.cat-link{font-size:13px;padding:7px 11px;margin-right:0}}</style>';
for (const [src, dst] of [['sts.src.html', 'sts.html'], ['psc.src.html', 'psc.html']]) {
  let pg = fs.readFileSync(path.join(__dirname, 'brands', 'golen', 'pages', src), 'utf8');
  const n = pg.split('<nav class="nav"').length - 1;
  if (n !== 1) throw new Error(`${src}: nav matched ${n} times`);
  pg = pg.replace('<nav class="nav"', '<a class="cat-link" href="index.html">← Усі моделі</a><nav class="nav"').replace('</head>', BACK_CSS + '</head>');
  // the source pages are fragments: served as plain files they need their own skeleton
  if (!/^\s*<!doctype/i.test(pg)) pg = '<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">' + BACK_CSS + pg;
  fs.writeFileSync(path.join(outDir, dst), pg);
  if (ART) fs.writeFileSync(path.join(outDir, 'art', dst), pg);
}

if (leftovers.length) { console.warn('PRICE-LIKE TEXT LEFT:'); leftovers.forEach(l => console.warn('  ' + l)); }
console.log('written', path.join(outDir, 'index.html'), (Buffer.byteLength(page) / 1e6).toFixed(2), 'MB;', products.length, 'cards,', Object.keys(P).length, 'models:',
  BRANDS.map(([b, n]) => `${b} ${n}`).join(', '));
