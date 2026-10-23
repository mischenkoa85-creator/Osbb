/* ESS cabinet engine: one interactive 3D product page per JSON config.
   Generalised from the Golen LES-261L130 page; geometry, layout, texts and the
   system scene all come from the product config (products/*.json) and the site
   config (site/*.json). Units are metres; x to the right, y up, z to the front. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { USDZExporter } from 'three/addons/exporters/USDZExporter.js';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
const kvHtml = kv => kv && kv.length ? `<dl class="kv">${kv.map(([k,v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>` : '';

/* ================= page skeleton ================= */
function renderPage(C, SITE){
  const P = C.page, sys = C.system, pv = sys && sys.type === 'pv';
  const ems = SITE.ems && (pv && SITE.ems.pv ? { ...SITE.ems, ...SITE.ems.pv } : SITE.ems);
  const ep = C.emsPanel || { soc:76, rows:[['Потужність', `−${Math.round(C.kw * 0.65)} кВт`], ['Режим', 'peak shaving'], ['Комірки', '24–27 °C'], ['Аварії', 'немає']] };
  const others = (SITE.products || []).filter(p => p.id !== C.id);
  document.title = P.title;
  document.body.innerHTML = `
<header class="top"><div class="wrap top-in">
  <div class="wm">${SITE.wordmark}</div>
  <nav class="nav" aria-label="Розділи"><a href="#viewer">3D-модель</a>${C.meta?.apply ? '<a href="#apply">Застосування</a>' : ''}<a href="#specs">Характеристики</a>${ems && sys ? '<a href="#ems">EMS</a>' : ''}${others.length ? `<button type="button" class="mbtn" id="btnModels" aria-haspopup="dialog">Моделі <b>${(SITE.products || []).length}</b></button>` : ''}</nav>
</div></header>
<main>
<section class="hero wrap" id="viewer">
  <div class="intro">
    <div class="eyebrow">${esc(P.eyebrow)}</div>
    <h1>${esc(P.h1)}</h1>
    <p class="lead">${esc(P.lead)}</p>
    <ul class="chips">${P.chips.map(c => `<li>${c}</li>`).join('')}</ul>
  </div>
  <div class="viewer">
    <div class="stage-col">
      <div class="stage" id="stage">
        <canvas id="c" aria-label="3D-модель ${esc(C.brand)} ${esc(C.model)}"></canvas>
        <div class="pins" id="pins"></div>
        <div class="seg" role="tablist" aria-label="Вигляд">
          <button id="tabCab" class="on" role="tab" aria-selected="true">${esc(C.ui?.tab || 'Шафа')}</button>
          ${sys ? `<button id="tabSys" role="tab" aria-selected="false">${esc(sys.tab)}</button>` : ''}
          ${C.meta && !C.meta.noRes ? '<button id="tabRes" role="tab" aria-selected="false">Резерв</button>' : ''}
        </div>
        <div class="crumb" id="crumb"><b>${esc(C.model)}</b></div>
        <div class="status" id="status" hidden><span class="dot" id="sdot"></span><span id="stext"></span></div>
        <div class="emsPanel" id="emsPanel" hidden>
          <div class="h"><span>EMS шафи</span><span class="tag">демо</span></div>
          <div style="display:flex;justify-content:space-between"><span>Рівень заряду</span><b style="font-family:var(--f-mono)">${ep.soc} %</b></div>
          <div class="soc"><i style="width:${ep.soc}%"></i></div>
          <dl>${ep.rows.map(([k,v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
          ${ems ? `<a href="#ems">${esc(ems.link)}</a>` : ''}
        </div>
        <div class="hint" id="hint">Натисніть на двері або вузол · потягніть, щоб обертати</div>
        <div class="loading" id="loading">Завантаження 3D-моделі…</div>
        <div class="vlogo"><div class="wm">${SITE.wordmark}</div></div>
        <div class="vtitle"><div class="e">${esc(P.videoEyebrow || P.eyebrow)}</div><div class="h" id="vth">${esc(C.model)}</div><div class="s" id="vts"></div></div>
      </div>
      <div class="bar" id="barCab">
        <button class="btn primary" id="btnDoor"${C.cabinet.open ? ' hidden' : ''}>Відкрити двері</button>
        ${(C.units || []).filter(u => u.button).map(u => `<button class="btn" id="btnU_${esc(u.id)}" aria-pressed="false">${esc(u.button)}</button>`).join('')}
        <button class="btn" id="btnExplode" aria-pressed="false">Розібрати все</button>
        <button class="btn firebtn" id="btnFire" aria-pressed="false">Пожежна безпека</button>
        <button class="btn" id="btnSpin" aria-pressed="true">Обертання</button>
        <button class="btn" id="btnReset">Скинути</button>
        ${C.meta?.apply ? '<a class="btn" id="btnApply" href="#apply">Застосування</a>' : ''}
        <button class="btn" id="btnGlb" title="Модель шафи у поточному стані, вузли й матеріали з назвами">GLB</button>
        <button class="btn" id="btnUsdz" title="Для перегляду в доповненій реальності на iPhone / iPad">USDZ</button>
      </div>
      <div class="bar" id="barSys" hidden>
        ${pv ? `<button class="btn" id="mDay" aria-pressed="true">День</button><button class="btn" id="mEve" aria-pressed="false">Вечір</button><button class="btn" id="mOut" aria-pressed="false">Відключення мережі</button>${sys.gen ? '<button class="btn" id="mGen" aria-pressed="false">ДГУ</button>' : ''}`
             : '<button class="btn primary" id="btnOutage">Імітувати відключення мережі</button>'}
        <button class="btn" id="btnSpin2" aria-pressed="false">Обертання</button>
        <button class="btn" id="btnReset2">Скинути вигляд</button>
      </div>
      <div class="bar" id="barRes" hidden>
        <button class="btn" id="rGrid" aria-pressed="true">Мережа</button><button class="btn" id="rOut" aria-pressed="false">Відключення мережі</button>${C.meta?.gen ? '<button class="btn" id="rGen" aria-pressed="false">ДГУ</button>' : ''}
        <button class="btn" id="btnReset3">Скинути вигляд</button>
      </div>
      <div class="cap"><span class="acc acc-${esc(C.accuracy.level)}">${esc(C.accuracy.label)}</span> <span id="cap"></span></div>
    </div>
    <aside class="rail" aria-live="polite">
      <div class="rail-h" id="railH">Склад шафи</div>
      <ol class="parts" id="parts"></ol>
      <div class="detail" id="detail"></div>
    </aside>
  </div>
</section>

${applyHtml(C.meta?.apply, C.brand)}
<section class="block wrap" id="specs">
  <div class="sec-h"><h2>${esc(P.specsTitle)}</h2><p>${esc(P.specsNote)}</p></div>
  <div class="specs">${P.specs.map(g => `<div class="spec"><h3>${esc(g.h)}</h3><table>${g.rows.map(([k,v,flag]) => `<tr${flag ? ' class="flag"' : ''}><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table></div>`).join('')}</div>
  ${P.cert ? `<div class="cert">${esc(P.cert)}</div>` : ''}
  ${P.sources ? `<div class="srcs"><b>Джерела.</b> ${P.sources.map(esc).join(' · ')}</div>` : ''}
</section>

${ems && sys ? `<section class="block wrap" id="ems">
  <div class="sec-h"><h2>${esc(ems.title)}</h2><p>${esc(ems.lead)}</p></div>
  <div class="ems">
    <ul class="feat">${ems.features.map(([b,s]) => `<li><b>${esc(b)}</b><span>${esc(s)}</span></li>`).join('')}</ul>
    <div class="dash">
      <div class="dash-h"><b>${pv ? `Доба роботи: СЕС ${fmtN(sys.kwp)} кВтп + УЗЕ ${fmtN(sys.kw)} кВт / ${fmtN(sys.kwh)} кВт·год` : `Доба роботи системи ${fmtN(sys.kw)} кВт / ${fmtN(sys.kwh)} кВт·год`}</b><span class="tag">Демо-дані</span></div>
      <div class="kpis" id="kpis"></div>
      <div class="chart" id="chart"></div>
      <div class="legend">${pv
        ? `<span><i style="background:var(--amber)"></i>Генерація СЕС</span><span><i style="background:var(--muted)"></i>Споживання об'єкта</span><span><i style="background:var(--primary)"></i>Імпорт з мережі</span><span><i style="background:var(--ok)"></i>Заряд УЗЕ</span><span><i style="background:var(--brand)"></i>Розряд УЗЕ</span><span><i style="background:var(--alarm)"></i>Рівень заряду, %</span>`
        : `<span><i style="background:var(--muted)"></i>Споживання об'єкта</span><span><i style="background:var(--primary)"></i>Імпорт з мережі</span><span><i style="background:var(--alarm)"></i>Межа імпорту</span><span><i style="background:var(--brand)"></i>Розряд УЗЕ</span><span><i style="background:var(--ok)"></i>Заряд УЗЕ</span><span><i style="background:var(--amber)"></i>Рівень заряду, %</span>`}
      </div>
      <div class="note">${pv ? 'Приклад сонячного дня для ілюстрації алгоритму. Реальні графіки залежать від СЕС, навантаження й налаштувань об\'єкта.' : 'Приклад добового графіка для ілюстрації алгоритму. Реальні межі, тарифи й уставки задаються під об\'єкт.'}</div>
    </div>
  </div>
</section>` : ''}
</main>
<footer><div class="wrap foot">${SITE.footer}</div></footer>
<div class="msheet" id="msheet" hidden>
  <div class="msheet-bg" data-close></div>
  <div class="msheet-p" role="dialog" aria-modal="true" aria-labelledby="msheetT">
    <div class="msheet-h"><b id="msheetT">Моделі</b><span id="mcount"></span><button type="button" class="mx" data-close aria-label="Закрити">×</button></div>
    <div class="mfil" id="mfil"></div>
    <div class="mlist" id="mlist"></div>
  </div>
</div>`;
  if (C.theme) for (const [k, v] of Object.entries(C.theme)) document.documentElement.style.setProperty('--' + k, v);
  if (document.getElementById('btnModels')) modelsSheet(C, SITE);
}

/* ---------- purpose and use cases (site/catalog.json → C.meta.apply); 'b' = from the manufacturer, 'e' = estimate ---------- */
function applyHtml(a, brand){
  if (!a) return '';
  const src = k => k === 'b' ? `<i class="src src-b">за ${esc(brand)}</i>` : '<i class="src src-e">оцінка</i>';
  const list = (h, xs) => xs && xs.length ? `<div><h3>${esc(h)}</h3><ul>${xs.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : '';
  return `<section class="block wrap" id="apply">
  <div class="sec-h"><h2>Призначення і застосування</h2><p>${esc(a.what)}</p></div>
  <div class="apply">
    <p class="ap-who"><b>Для кого.</b> ${esc(a.who)}</p>
    <ul class="ap-uses">${a.uses.map(([h, t, k]) => `<li><div class="ap-h"><b>${esc(h)}</b>${src(k)}</div><p>${esc(t)}</p></li>`).join('')}</ul>
    ${a.variants ? `<p class="ap-var"><b>Варіанти виконання:</b> ${esc(a.variants)}</p>` : ''}
    <div class="ap-cols">${list('Коли не підходить', a.no)}${list('Що ще потрібно', a.need)}</div>
    <p class="ap-note">«За ${esc(brand)}» — з документів і сторінок виробника. «Оцінка» — наш розрахунок або типовий сценарій: тривалість резерву = доступна енергія / навантаження, без урахування ККД і старіння.</p>
  </div>
</section>`;
}

/* ---------- models menu: a sheet with filters (type, backup, market) and grouped cards ---------- */
function modelsSheet(C, SITE){
  const $ = id => document.getElementById(id);
  const all = SITE.products || [], cat = SITE.catalog || { categories:{}, backup:{} };
  const F = { category:'', brand:'', backup:'', market:'' };
  const badge = p => p.backup === 'builtin' ? `⚡ ${p.ms ? '≤ ' + p.ms + ' мс' : 'вбудований перехід'}` : p.backup === 'sts' ? (p.stsOpt === 'option' ? 'STS — опція' : 'STS не в комплекті') : p.backup === 'bypass' ? 'Bypass' : p.backup === 'eps' ? 'EPS' : p.backup === 'dc' ? 'потрібен PCS' : p.backup === 'grid' ? 'мережевий PCS' : '';
  const num = p => [p.kw ? `${fmtN(p.kw)} кВт` : '', p.kwh ? `${String(p.kwh).replace('.', ',')} кВт·год` : ''].filter(Boolean).join(' · ');
  const groups = [['category', 'Тип', cat.categories], ['brand', 'Бренд', cat.brands || {}], ['backup', 'Резерв', cat.backup], ['market', 'Ринок', { EU:'EU 400 В', US:'US 208–240 В' }]];
  const brands = new Set(all.map(p => p.brand)).size > 1;
  function render(){
    const list = all.filter(p => Object.keys(F).every(k => !F[k] || p[k] === F[k]));
    $('mfil').innerHTML = groups.map(([k, h, opts]) => {
      const keys = Object.keys(opts).filter(o => all.some(p => p[k] === o));
      if (keys.length < 2) return '';
      return `<div class="mfg"><span>${h}</span>` + ['', ...keys].map(o => `<button type="button" data-f="${k}" data-v="${o}" class="chip${F[k] === o ? ' on' : ''}">${esc(o ? opts[o] : 'Усі')}</button>`).join('') + '</div>';
    }).join('');
    $('mcount').textContent = `${list.length} з ${all.length}`;
    const order = Object.keys(cat.categories);
    const byCat = order.map(c => [c, list.filter(p => p.category === c)]).filter(([, l]) => l.length);
    $('mlist').innerHTML = byCat.length ? byCat.map(([c, l]) => `<h4>${esc(cat.categories[c] || c)}</h4>` + l.map(p =>
      `<a class="mcard${p.id === C.id ? ' on' : ''}" href="${esc(p.href)}"><span class="mt">${esc(brands ? p.label : p.label.replace(/^\S+ /, ''))}</span>` +
      `<span class="mm"><span>${esc(num(p))}</span><i class="bk bk-${p.backup}">${esc(badge(p))}</i>${p.market === 'US' ? '<i class="bk">US</i>' : ''}</span></a>`).join('')).join('')
      : '<p class="mnone">Немає моделей з такими фільтрами.</p>';
  }
  const open = v => { $('msheet').hidden = !v; document.documentElement.classList.toggle('sheet-open', v); if (v){ render(); $('mlist').querySelector('.on')?.scrollIntoView({ block:'center' }); } };
  $('btnModels').addEventListener('click', () => open(true));
  $('msheet').addEventListener('click', e => {
    if (e.target.closest('[data-close]')) return open(false);
    const b = e.target.closest('[data-f]'); if (b){ F[b.dataset.f] = b.dataset.v; render(); return; }
    if (e.target.closest('a.mcard')) open(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('msheet').hidden) open(false); });
}
const fmtN = n => Math.round(n).toLocaleString('uk-UA').replace(/\s/g, ' ');

/* ================= engine ================= */
export function start(C, SITE){
  renderPage(C, SITE);
  const VIDEO = location.hash === '#video';
  if (VIDEO) document.documentElement.classList.add('video-mode');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const stage = $('stage'), canvas = $('c'), pinsEl = $('pins');
  const V = (x,y,z) => new THREE.Vector3(x,y,z);
  const A = a => V(a[0], a[1], a[2]);

  /* ---------- renderer / scene ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true, preserveDrawingBuffer: VIDEO });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(30, 1.6, 0.05, 100);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true; controls.dampingFactor = 0.08;
  const CAB_MAX = C.view?.maxDist ?? 14;
  controls.minDistance = 1.2; controls.maxDistance = CAB_MAX;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotateSpeed = 0.9;
  const hemi = new THREE.HemisphereLight(0xffffff, 0x8a9aa5, 0.6); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(4, 7, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  const SHX = Math.max(7, C.cabinet.w * 0.8);
  Object.assign(sun.shadow.camera, { left:-SHX, right:SHX, top:SHX, bottom:-SHX, near:1, far:30 + SHX });
  sun.shadow.bias = -0.0004; scene.add(sun);
  const fill = new THREE.DirectionalLight(0xdfefff, 0.5); fill.position.set(-5, 3, -2); scene.add(fill);
  const front = new THREE.DirectionalLight(0xffffff, 0.35); front.position.set(1, 2, 6); scene.add(front);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.ShadowMaterial({ opacity:0.16 }));
  ground.rotation.x = -Math.PI/2; ground.receiveShadow = true; scene.add(ground);

  /* ---------- helpers & materials ---------- */
  const std = (color, o={}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness:0.55, metalness:0.08 }, o));
  function box(w,h,d,mat,x=0,y=0,z=0){ const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat); m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; return m; }
  function cyl(r,h,mat,x=0,y=0,z=0,seg=28){ const m = new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg), mat); m.position.set(x,y,z); m.castShadow = true; return m; }
  function plane(w,h,mat,x,y,z){ const m = new THREE.Mesh(new THREE.PlaneGeometry(w,h), mat); m.position.set(x,y,z); return m; }
  function canvasTex(w,h,draw){ const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g,w,h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  const col = (k, d) => new THREE.Color((C.colors && C.colors[k]) || d).getHex();
  const texPerf = canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#2b3239'; g.fillRect(0,0,w,h); g.fillStyle='#0d1216'; for(let y=6;y<h;y+=10){ for(let x=(y/10)%2?11:6;x<w;x+=10){ g.beginPath(); g.arc(x,y,3.2,0,Math.PI*2); g.fill(); } } });
  texPerf.wrapS = texPerf.wrapT = THREE.RepeatWrapping; texPerf.repeat.set(3,3);
  const texLouver = canvasTex(256,256,(g,w,h)=>{ const base = (C.colors && C.colors.door) || '#F3F6F7'; g.fillStyle=base; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=16){ const gr = g.createLinearGradient(0,y,0,y+16); gr.addColorStop(0,'#3a4148'); gr.addColorStop(0.45,'#9aa3aa'); gr.addColorStop(0.55,base); gr.addColorStop(1,'#cfd5d9'); g.fillStyle=gr; g.fillRect(6,y+2,w-12,12); } g.strokeStyle='#b9c1c6'; g.lineWidth=4; [w/3, 2*w/3].forEach(x => { g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); }); });
  const LOGO = C.logo || { type:'text', text:C.brand };
  const texLogo = canvasTex(512,128,(g,w,h)=>{
    if (LOGO.type === 'plain'){ g.fillStyle = LOGO.color || '#1C3D5A'; g.font = `${LOGO.weight || 700} ${LOGO.size || 72}px Manrope, Arial, sans-serif`; g.textBaseline = 'middle';
      if (LOGO.align === 'center'){ g.textAlign = 'center'; g.fillText(LOGO.text, 256, LOGO.y || 68); } else g.fillText(LOGO.text, LOGO.x ?? 10, LOGO.y || 66); return; }
    if (LOGO.type === 'golen'){ g.lineWidth=10; g.strokeStyle='#13808F'; g.beginPath(); g.arc(64,64,44,0,Math.PI*2); g.stroke(); g.fillStyle='#E39B2D'; g.beginPath(); g.moveTo(70,24); g.lineTo(46,70); g.lineTo(64,70); g.lineTo(56,104); g.lineTo(84,54); g.lineTo(66,54); g.closePath(); g.fill(); g.fillStyle='#13808F'; g.font='800 64px Manrope, Arial, sans-serif'; g.textBaseline='middle'; g.fillText('GOLEN', 128, 68); return; }
    // brand mark: orange disc with a sun cut + wordmark (generic, not a copy of any trademark)
    g.fillStyle = LOGO.mark || '#E8742A'; g.beginPath(); g.arc(56,64,40,0,Math.PI*2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(70,52,16,0,Math.PI*2); g.fill();
    g.fillStyle = LOGO.color || '#1C3D5A'; g.font = '800 66px Manrope, Arial, sans-serif'; g.textBaseline='middle'; g.fillText(LOGO.text, 112, 68);
  });
  const texWarn = canvasTex(128,112,(g)=>{ g.fillStyle='#F2C230'; g.strokeStyle='#111'; g.lineWidth=8; g.beginPath(); g.moveTo(64,8); g.lineTo(122,106); g.lineTo(6,106); g.closePath(); g.fill(); g.stroke(); g.fillStyle='#111'; g.beginPath(); g.moveTo(70,30); g.lineTo(50,72); g.lineTo(64,72); g.lineTo(56,98); g.lineTo(80,58); g.lineTo(66,58); g.closePath(); g.fill(); });
  const texLabel = (txt, fg, bg) => canvasTex(512,160,(g,w,h)=>{ if (bg){ g.fillStyle = bg; g.fillRect(0,0,w,h); } g.fillStyle=fg; g.font='800 96px Manrope, Arial, sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,w/2,h/2+4); });
  const texEms = canvasTex(320,240,(g,w,h)=>{
    g.fillStyle='#0B2730'; g.fillRect(0,0,w,h);
    g.fillStyle='#7FD6EA'; g.font='700 22px Manrope, Arial, sans-serif'; g.fillText('EMS', 16, 34);
    g.fillStyle='#9AB0BC'; g.font='16px Arial, sans-serif'; g.fillText('SOC', 16, 76); g.fillText('P, кВт', 16, 140); g.fillText('T, °C', 170, 140);
    g.fillStyle='#1D3D47'; g.fillRect(70, 62, 230, 18); g.fillStyle='#3FB3C2'; g.fillRect(70, 62, 175, 18);
    g.fillStyle='#E4EDF1'; g.font='700 28px Arial, sans-serif'; g.fillText('−' + (C.kw ? Math.round(C.kw * 0.65) : 96), 16, 178); g.fillText('26', 170, 178);
    g.strokeStyle='#3FB3C2'; g.lineWidth=3; g.beginPath(); for (let i=0;i<=28;i++){ const x = 16 + i*10, y = 214 - 14*Math.sin(i/3) - i*0.4; i ? g.lineTo(x,y) : g.moveTo(x,y); } g.stroke();
  });

  const texLouvreDiag = canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#8E989F'; g.fillRect(0,0,w,h); g.strokeStyle='#5E676D'; g.lineWidth=5; for (let i=-h;i<w;i+=14){ g.beginPath(); g.moveTo(i,h); g.lineTo(i+h,0); g.stroke(); } g.strokeStyle='#B9C1C6'; g.lineWidth=8; g.strokeRect(4,4,w-8,h-8); });
  const texFan = canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#C9D0D4'; g.fillRect(0,0,w,h); g.fillStyle='#4C555B'; g.beginPath(); g.arc(128,128,112,0,Math.PI*2); g.fill(); g.fillStyle='#9AA3A9'; for (let y=-110;y<=110;y+=12){ for (let x=-110;x<=110;x+=12){ if (x*x+y*y < 105*105){ g.beginPath(); g.arc(128+x,128+y,4,0,Math.PI*2); g.fill(); } } } });
  const texFins = canvasTex(256,256,(g,w,h)=>{ g.fillStyle='#D3D9DC'; g.fillRect(0,0,w,h); for (let x=6;x<w;x+=16){ g.fillStyle='#A7B0B5'; g.fillRect(x,0,6,h); } });
  const texPanel = canvasTex(256,512,(g,w,h)=>{ g.fillStyle='#16233A'; g.fillRect(0,0,w,h); g.strokeStyle='#3E5576'; g.lineWidth=2; for (let x=0;x<=w;x+=w/6){ g.beginPath(); g.moveTo(x,0); g.lineTo(x,h); g.stroke(); } for (let y=0;y<=h;y+=h/12){ g.beginPath(); g.moveTo(0,y); g.lineTo(w,y); g.stroke(); } g.strokeStyle='#C9D0D4'; g.lineWidth=8; g.strokeRect(0,0,w,h); });
  // container style: corrugated wall profile (u repeats once per rib) and a printed face for simple battery modules
  const CONTAINER = C.cabinet.style === 'container';
  const texRib = canvasTex(64,8,(g,w)=>{ const gr = g.createLinearGradient(0,0,w,0); [[0,'#c9ced2'],[0.1,'#ffffff'],[0.4,'#f2f4f5'],[0.5,'#bcc2c7'],[0.6,'#e6e9eb'],[0.9,'#ffffff'],[1,'#c9ced2']].forEach(([o,c]) => gr.addColorStop(o,c)); g.fillStyle = gr; g.fillRect(0,0,w,8); });
  texRib.wrapS = THREE.RepeatWrapping;
  const texModFace = canvasTex(256,128,(g,w,h)=>{
    g.fillStyle = (C.colors && C.colors.modFace) || '#2A3138'; g.fillRect(0,0,w,h);
    g.fillStyle = '#15191C'; g.fillRect(8,22,12,84); g.fillRect(w-20,22,12,84);
    g.fillStyle = '#E8742A'; g.fillRect(34,26,28,28); g.fillRect(34,74,28,28);
    g.fillStyle = '#F4F6F7'; g.fillRect(84,36,104,40);
    g.fillStyle = '#1C3D5A'; g.font = '800 17px Manrope, Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(C.rack?.module.label || '', 136, 50);
    g.font = '600 12px Arial, sans-serif'; g.fillText(C.rack?.module.sub || '', 136, 67);
    g.fillStyle = '#15191C'; g.fillRect(200,40,30,18); g.fillStyle = '#2EE07A'; g.beginPath(); g.arc(214,84,5,0,Math.PI*2); g.fill();
  });

  const M = {
    shell: std(col('shell','#EDF1F3'), { roughness:0.5, transparent:true }),
    shellIn: std(col('shellIn','#D9E0E4'), { roughness:0.7, transparent:true, side:THREE.DoubleSide }),
    roof: std(col('roof','#E1E7EA'), { roughness:0.5, transparent:true }),
    plinth: std(col('plinth','#3A4650'), { roughness:0.7 }), slot: std(0x161C21, { roughness:0.9 }),
    door: std(col('door','#F3F6F7'), { roughness:0.45 }), doorIn: std(col('doorIn','#DDE3E6'), { roughness:0.6 }), frame: std(col('frame','#C9D2D8'), { roughness:0.6 }),
    accent: std(col('accent','#13808F'), { roughness:0.45 }),
    perf: new THREE.MeshStandardMaterial({ map:texPerf, roughness:0.8, metalness:0.1 }),
    louver: new THREE.MeshStandardMaterial({ map:texLouver, roughness:0.6, metalness:0.1 }),
    red: std(0xC8302B, { roughness:0.35 }), yellow: std(0xF2C230, { roughness:0.5 }),
    black: std(0x15191C, { roughness:0.4, metalness:0.3 }), white: std(0xFFFFFF, { roughness:0.4 }),
    led: new THREE.MeshStandardMaterial({ color:0x2EE07A, emissive:0x22c86a, emissiveIntensity:1.4 }),
    logo: new THREE.MeshBasicMaterial({ map:texLogo, transparent:true }), warn: new THREE.MeshBasicMaterial({ map:texWarn, transparent:true }),
    rack: std(0x2B343B, { roughness:0.5, metalness:0.4 }),
    module: std(col('module','#3B454E'), { roughness:0.55, metalness:0.25 }), modFace: std(col('modFace','#2A3138'), { roughness:0.6 }),
    orange: std(0xE8742A, { roughness:0.45 }),
    cell: std(0x3566D6, { roughness:0.35, metalness:0.1 }), term: std(0xBFC6CC, { roughness:0.3, metalness:0.8 }), copper: std(0xC77B3A, { roughness:0.35, metalness:0.7 }),
    hv: std(col('hv','#56636D'), { roughness:0.5, metalness:0.2 }), pcs: std(col('pcs','#6E7E89'), { roughness:0.5, metalness:0.25 }),
    chiller: std(col('chiller','#AEBAC2'), { roughness:0.5, metalness:0.2 }), fan: std(0x2C3439, { roughness:0.7 }),
    tan: std(0xC9A86A, { roughness:0.6 }), breaker: std(0xF1F3F4, { roughness:0.5 }),
    fire: std(0xC4302B, { roughness:0.35, metalness:0.2 }), detector: std(0xF4F6F7, { roughness:0.4 }), brass: std(0xC9A043, { roughness:0.3, metalness:0.8 }),
    beacon: new THREE.MeshStandardMaterial({ color:0xC8302B, emissive:0x000000, roughness:0.2, transparent:true, opacity:0.92 }),
    ems: std(0x1E262C, { roughness:0.4 }), emsScreen: new THREE.MeshBasicMaterial({ map:texEms }),
    screen: new THREE.MeshStandardMaterial({ color:0x0c3d47, emissive:0x2bb6c9, emissiveIntensity:0.9 }),
    pipeC: std(0x3D7BD9, { roughness:0.35, transparent:true }), pipeH: std(0xD9483D, { roughness:0.35, transparent:true }),
    sts: std(0xD8DFE3, { roughness:0.5 }), stsFace: std(0x2E3A43, { roughness:0.5 }), load: std(0x51616C, { roughness:0.6 }),
    win: new THREE.MeshStandardMaterial({ color:0xFFE7A8, emissive:0xFFC85A, emissiveIntensity:0.6 }),
    pole: std(0x7D8A93, { roughness:0.5, metalness:0.5 }), cable: std(0x23313B, { roughness:0.7 }),
    louvreDiag: new THREE.MeshStandardMaterial({ map:texLouvreDiag, roughness:0.7 }), fanGrille: new THREE.MeshStandardMaterial({ map:texFan, roughness:0.7 }),
    acIn: std(0xB3BDC3, { roughness:0.5, metalness:0.2 }), fins: new THREE.MeshStandardMaterial({ map:texFins, roughness:0.5, metalness:0.3 }),
    inv: std(col('inv','#E3E8EA'), { roughness:0.45, metalness:0.1 }), conn: std(0x1C2226, { roughness:0.5 }), connR: std(0xC8302B, { roughness:0.5 }),
    dist: std(col('dist','#D9DEE2'), { roughness:0.5, metalness:0.15 }), accent2: std(col('accent2','#9BC53D'), { roughness:0.5 }),
    panel: new THREE.MeshStandardMaterial({ map:texPanel, roughness:0.25, metalness:0.3 }), pframe: std(0x9AA3A9, { roughness:0.4, metalness:0.7 }), gen: std(0x2F6B4F, { roughness:0.5, metalness:0.3 }),
    doorRib: std(col('door','#F3F6F7'), { roughness:0.45, map:texRib }), modTex: new THREE.MeshStandardMaterial({ map:texModFace, roughness:0.55 }),
    coil: std(col('coil','#3F5566'), { roughness:0.45 }), yoke: std(0x59636B, { roughness:0.45, metalness:0.5 }), duct: std(col('duct','#C9D0D4'), { roughness:0.4, metalness:0.4 }),
    cab: std(col('cab','#E4E8EB'), { roughness:0.5, metalness:0.15 }),
  };
  if (CONTAINER) M.shell.map = texRib;
  for (const [k, m] of Object.entries(M)) m.name = k;
  const modLabelMat = C.rack?.module.label ? new THREE.MeshBasicMaterial({ map:texLabel(C.rack.module.label, '#1C3D5A', '#F4F6F7') }) : null;
  if (modLabelMat) modLabelMat.name = 'moduleLabel';

  /* ---------- cabinet geometry ---------- */
  const K = C.cabinet;
  const W = K.w, D = K.d, H = K.h, FLOOR = K.floor, ROOF = K.roof ?? 0.06, BODY_H = H - FLOOR - ROOF;
  const FRONT_Z = D/2 - 0.02;
  const DOOR_Y0 = FLOOR + 0.015, DOOR_H = BODY_H - 0.04;
  // doors: x0..x1 is the door leaf span; the hinge sits at x0 (left) or x1 (right). A single `door` spans the whole front.
  // open racks (cabinet.open) have no doors
  const OPEN = !!K.open;
  const DOORS = (OPEN ? [] : (K.doors || [{ ...K.door }])).map(d => {
    const side = d.hinge === 'right' ? -1 : 1;
    const x0 = d.x0 ?? (side > 0 ? -W/2 + 0.005 : W/2 - 0.005 - (W - 0.02));
    const x1 = d.x1 ?? x0 + (W - 0.02);
    return { cfg:d, side, x0, x1, w: x1 - x0 - (K.doors ? 0.006 : 0), hingeX: side > 0 ? x0 : x1 };
  });
  const MAIN = DOORS.length ? DOORS.reduce((a, b) => b.w > a.w ? b : a) : { side:1, w:0, hinge:null };
  const SIDE = MAIN.side;                                    // +1: main door hinged on the left (camera presets assume this)
  const DW = MAIN.w;
  const S_REF = Math.max((W + D) / 2.37, H / 2.35);          // camera presets were tuned on a 1.0 × 1.37 × 2.35 m cabinet
  const SY = H / 2.35;
  // presets assume hinges on the left (camera on the right); a right-hinged door mirrors them
  const sc = (a) => V(SIDE * a[0] * S_REF, a[1] * SY, a[2] * S_REF);
  const mv = (x, y, z) => V(SIDE * x, y, z);

  // stretch u so the rib texture keeps a constant pitch on walls of any length
  function ribUV(m, len, pitch=0.3){ const uv = m.geometry.attributes.uv; for (let i=0;i<uv.count;i++) uv.setX(i, uv.getX(i) * len / pitch); uv.needsUpdate = true; return m; }
  function buildExterior(g, hollow, shellMat, roofMat){
    if (OPEN){
      // open rack: base, corner posts, side rails and a top plate
      g.add(box(W, FLOOR, D, M.plinth, 0, FLOOR/2, 0));
      [-1, 1].forEach(sx => [-1, 1].forEach(sz => g.add(box(0.04, H - FLOOR, 0.04, M.frame, sx*(W/2 - 0.02), FLOOR + (H - FLOOR)/2, sz*(D/2 - 0.02)))));
      [-1, 1].forEach(sx => [0.25, 0.5, 0.75].forEach(f => g.add(box(0.02, 0.03, D - 0.06, M.frame, sx*(W/2 - 0.02), FLOOR + (H - FLOOR)*f, 0))));
      const roof = box(W, 0.03, D, roofMat, 0, H - 0.015, 0); g.add(roof);
      for (const it of (K.roofItems || [])) if (it.type !== 'eye') g.add(box(it.w, it.h, it.d, M[it.mat || 'frame'], it.x, H + it.h/2, it.z ?? 0));
      return { shell: [], roof };
    }
    g.add(box(W, FLOOR, D, M.plinth, 0, FLOOR/2, 0));
    (K.slots ?? [-0.26, 0.26]).forEach(x => g.add(plane(0.26 * W, FLOOR * 0.5, M.slot, x * W, FLOOR * 0.5, D/2 + 0.001)));
    const shell = [];
    if (hollow){
      const t = 0.02, yc = FLOOR + BODY_H/2, dz = D - 0.03;
      shell.push(ribUV(box(t, BODY_H, dz, shellMat, -W/2 + t/2, yc, -0.01), dz));
      shell.push(ribUV(box(t, BODY_H, dz, shellMat,  W/2 - t/2, yc, -0.01), dz));
      shell.push(ribUV(box(W - 2*t, BODY_H, t, shellMat, 0, yc, -D/2 + 0.005 + t/2), W - 2*t));
      // front wall between door openings (cabinets whose doors do not cover the whole front)
      if (K.frontWall){
        const spans = DOORS.map(d => [d.x0 - 0.004, d.x1 + 0.004]).sort((a, b) => a[0] - b[0]);
        let x = -W/2 + t;
        for (const [a, b] of [...spans, [W/2 - t, W/2 - t]]){ if (a - x > 0.01) shell.push(ribUV(box(a - x, BODY_H, 0.025, shellMat, (a + x)/2, yc, FRONT_Z + 0.0125), a - x)); x = Math.max(x, b); }
      }
      shell.push(box(W - 2*t, t, dz, shellMat, 0, FLOOR + t/2, -0.01));
      shell.push(box(W - 2*t, BODY_H, 0.004, M.shellIn, 0, yc, -D/2 + 0.04));
      (K.partitions || []).forEach(p => shell.push(box(0.012, BODY_H - 0.04, D - 0.1, M.shellIn, p.x, yc, -0.03)));
    } else {
      shell.push(box(W - 0.01, BODY_H, D - 0.03, shellMat, 0, FLOOR + BODY_H/2, -0.01));
    }
    shell.forEach(m => g.add(m));
    const ov = CONTAINER ? 0 : 0.04;
    const roof = box(W + ov, ROOF, D + ov, roofMat, 0, H - ROOF/2, 0); g.add(roof);
    if (CONTAINER){
      // ISO frame: corner castings, corner posts, top side rails
      const cw = 0.18, ch = 0.12, cd = 0.16;
      [-1, 1].forEach(sx => [-1, 1].forEach(sz => {
        [ch/2, H - ch/2].forEach(y => g.add(box(cw, ch, cd, M.frame, sx*(W/2 - cw/2 + 0.004), y, sz*(D/2 - cd/2 + 0.004))));
        g.add(box(0.1, H - 2*ch, 0.1, M.frame, sx*(W/2 - 0.05), H/2, sz*(D/2 - 0.05)));
      }));
      [-1, 1].forEach(sz => g.add(box(W - 0.36, 0.12, 0.05, M.frame, 0, H - 0.06, sz*(D/2 - 0.02))));
    }
    [-1, 1].forEach(s => g.add(box(0.004, BODY_H - 0.07, 0.012, M.frame, s*(W/2 - 0.001), FLOOR + BODY_H/2, 0.1)));
    // decorations: rear grilles, roof items, plinth front, side-mounted boxes
    for (const it of (K.rear || [])){
      if (it.type === 'grille'){ const m = plane(it.w, it.h, M.perf, it.x, it.y, -D/2 + 0.0035); m.rotation.y = Math.PI; g.add(m); }
      else g.add(box(it.w, it.h, it.d ?? 0.06, M.frame, it.x, it.y, -D/2 - (it.d ?? 0.06)/2 + 0.01));
    }
    for (const it of (K.roofItems || [])){
      if (it.type === 'fan'){ g.add(box(it.w, it.h, it.d, M.frame, it.x, H + it.h/2, it.z ?? 0)); const f = plane(Math.min(it.w, it.d) * 0.8, Math.min(it.w, it.d) * 0.8, M.fanGrille, it.x, H + it.h + 0.002, it.z ?? 0); f.rotation.x = -Math.PI/2; g.add(f); }
      else if (it.type === 'eye'){ const e = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.009, 8, 20), M.pole); e.position.set(it.x, H + 0.035, it.z); g.add(e); }
      else g.add(box(it.w, it.h, it.d, M[it.mat || 'frame'], it.x, H + it.h/2, it.z ?? 0));
    }
    for (const it of (K.baseItems || [])){
      if (it.type === 'nozzle'){ const n = cyl(0.04, 0.05, M.brass, it.x, FLOOR * 0.5, D/2 + 0.025); n.rotation.x = Math.PI/2; g.add(n); }
      else if (it.type === 'earth') g.add(box(0.03, 0.03, 0.004, M.white, it.x, FLOOR * 0.5, D/2 + 0.002));
      else g.add(plane(it.w, it.h ?? FLOOR * 0.5, M.slot, it.x, FLOOR * 0.5, D/2 + 0.002));
    }
    for (const it of (K.sideItems || [])){
      const b = new THREE.Group(); b.add(box(it.w, it.h, it.d, M[it.mat || 'inv'])); if (it.slot) b.add(box(it.w * 0.66, it.h * 0.38, it.d * 0.7, M.slot, Math.sign(it.x) * it.w * 0.17, -it.h * 0.37, 0));
      b.name = it.name || 'sideBox'; b.position.set(it.x, it.y, it.z); g.add(b);
    }
    if (K.band){ const bd = K.band; const m = plane(bd.w, bd.h, M.accent2, bd.x, bd.y, D/2 + 0.0015); g.add(m); }
    return { shell, roof };
  }
  // door items are given in door coordinates: x = distance from the hinge, y = height above ground
  function buildDoor(hinge, d){
    const side = d.side, dx = x => side * x, DWd = d.w;
    const y0 = d.cfg.y0 ?? DOOR_Y0, dh = d.cfg.h ?? DOOR_H;
    const meshes = [], keep = {};
    const add = m => { hinge.add(m); meshes.push(m); return m; };
    let leaf = CONTAINER ? M.doorRib : M.door; if (d.cfg.color){ leaf = leaf.clone(); leaf.color.set(d.cfg.color); }
    const lb = add(box(DWd, dh, 0.025, leaf, dx(DWd/2), y0 + dh/2, 0.0125)); if (CONTAINER) ribUV(lb, DWd);
    add(plane(DWd - 0.04, dh - 0.05, M.doorIn, dx(DWd/2), y0 + dh/2, -0.001)).rotation.y = Math.PI;
    add(box(DWd, 0.012, 0.03, M.frame, dx(DWd/2), y0 + 0.002, 0.014));
    for (const it of (d.cfg.items || [])){
      const x = dx(it.x);
      switch (it.type){
        case 'grille': {
          const mat = it.style === 'louver' ? M.louver : it.style === 'black' ? M.slot : M.perf;   // perf | mesh (perf without the top bar) | louver | black
          add(plane(it.w, it.h, mat, x, it.y, 0.026));
          if (it.style === 'perf') add(box(it.w + 0.02, 0.02, 0.012, M.frame, x, it.y + it.h/2 + 0.02, 0.03));
          if (it.inner) add(plane(it.w, it.h, M.louver, x, it.y, -0.002)).rotation.y = Math.PI;
          break; }
        case 'stripe': { const sh = it.h ?? dh, sy = it.y ?? y0 + dh/2; add(plane(it.w, sh, M.accent, x, sy, 0.0262));
          (it.ticks || []).forEach(y => add(box(Math.min(0.07, it.w * 0.62), 0.008, 0.004, M.white, x, y, 0.029))); break; }
        case 'handle': add(box(0.026, it.h ?? 0.2, 0.03, M.black, x, it.y, 0.04)); break;
        case 'logo': add(plane(it.w, it.h, M.logo, x, it.y, 0.0265)); break;
        case 'warn': add(plane(it.w ?? 0.085, it.h ?? 0.075, M.warn, x, it.y, 0.0265)); break;
        case 'slot': add(box(it.w, it.h, 0.006, M.black, x, it.y, 0.028)); break;
        case 'plate': add(box(it.w, it.h, 0.004, M[it.mat || 'white'], x, it.y, 0.026)); break;
        case 'line': add(box(it.w, it.h ?? 0.008, 0.004, M[it.mat || 'black'], x, it.y, 0.027)); break;
        case 'text': { const tm = new THREE.MeshBasicMaterial({ map:texLabel(it.text, it.color || '#2B3238'), transparent:true }); tm.name = 'doorText'; add(plane(it.w, it.h, tm, x, it.y, 0.0268)); break; }
        case 'estop': {
          const e = it.small ? [cyl(0.02, 0.02, M.red, x, it.y, 0.034)] : [cyl(0.05, 0.012, M.yellow, x, it.y, 0.034), cyl(0.032, 0.035, M.red, x, it.y, 0.05)];
          e.forEach(m => { m.rotation.x = Math.PI/2; hinge.add(m); });
          keep.estop = e; break; }
        case 'leds': {
          keep.leds = [];
          it.pts.forEach(([lx, ly], i) => {
            const c = new THREE.Color((it.colors && it.colors[i]) || '#2EE07A');
            const mat = new THREE.MeshStandardMaterial({ color:c, emissive:c, emissiveIntensity:1.1 }); mat.name = 'led';
            const l = new THREE.Mesh(new THREE.SphereGeometry(it.r ?? 0.009, 12, 8), mat); l.position.set(dx(lx), ly, 0.03); hinge.add(l);
            keep.leds.push(l);
          });
          break; }
        case 'key': [cyl(0.034, 0.012, M.white, x, it.y, 0.032), cyl(0.022, 0.03, M.black, x, it.y, 0.042)].forEach(m => { m.rotation.x = Math.PI/2; add(m); }); break;
        case 'beacon': { const bc = cyl(it.r ?? 0.022, 0.018, M.beacon, x, it.y, 0.036); bc.rotation.x = Math.PI/2; hinge.add(bc); keep.beacon = bc; break; }
        case 'ac': {
          const w = it.w ?? 0.52, h = it.h ?? 0.76;
          add(box(w, h, 0.03, M.frame, x, it.y, 0.03));
          add(plane(w - 0.06, h * 0.47, M.louvreDiag, x, it.y + h * 0.24, 0.046));
          const f = Math.min(w * 0.42, h * 0.29); add(plane(f, f, M.fanGrille, x, it.y - h * 0.24, 0.046));
          keep.acAt = [x, it.y, w, h]; break; }
        case 'ems': keep.emsAt = [x, it.y]; break;
        case 'dehumid': keep.dehumAt = [x, it.y, it.w ?? 0.13, it.h ?? 0.16]; break;
      }
    }
    return { meshes, ...keep };
  }

  /* ---------- interactive cabinet ---------- */
  const cabScene = new THREE.Group(); cabScene.name = C.id; scene.add(cabScene);
  const CB = new THREE.Group(); CB.name = 'cabinet'; cabScene.add(CB);
  const shellMat = M.shell.clone(), roofMat = M.roof.clone();
  const ext = buildExterior(CB, true, shellMat, roofMat);
  DOORS.forEach((d, i) => { const h = new THREE.Group(); h.name = DOORS.length > 1 ? `door${i+1}` : 'door'; h.position.set(d.hingeX, 0, FRONT_Z); CB.add(h); d.hinge = h; d.built = buildDoor(h, d); });
  const hinge = MAIN.hinge;   // null for open racks
  const findDoor = key => DOORS.find(d => d.built[key]);
  const door = { meshes: DOORS.flatMap(d => d.built.meshes) };
  for (const key of ['estop', 'leds', 'beacon', 'emsAt', 'dehumAt', 'acAt']){ const d = findDoor(key); if (d){ door[key] = d.built[key]; door[key + 'Door'] = d; } }
  // interior lighting: one lamp for a cabinet, a row of lamps along a container
  const nL = W > 3 ? Math.min(4, Math.ceil(W / 3)) : 1;
  const inLights = Array.from({ length:nL }, (_, i) => { const l = new THREE.PointLight(0xffffff, 0, nL > 1 ? 4.5 : 2.6, 1.5); l.position.set(nL > 1 ? -W/2 + (i + 0.5) * W / nL : 0.1, H * 0.81, D * (nL > 1 ? 0.1 : 0.33)); CB.add(l); return l; });

  const PICK = [], GROUPS = {};
  function tag(id, root, pickable=true){
    const list = GROUPS[id] || (GROUPS[id] = []);
    root.traverse(o => { if (o.isMesh){ if (!o.userData.sharedMat) o.material = o.material.clone(); o.userData.part = id; list.push(o); if (pickable) PICK.push(o); } });
  }
  door.meshes.forEach(m => tag('door', m));
  ext.shell.forEach(m => { m.userData.part = 'shell'; PICK.push(m); });
  if (door.estop) door.estop.forEach(m => tag('estop', m));
  (door.leds || []).forEach(m => tag('door', m));

  // rack posts and cooling pipes (static). One column at R.x, or R.columns [{x, n}] filled bottom-up;
  // module i sits in column MPOS[i].col at level MPOS[i].lvl
  const R = C.rack || { count:0, y0:0, pitch:0.2, z:0, module:{ w:0.1, h:0.1, d:0.1 } }, MOD = R.module, CELL = MOD.simple || !C.rack ? null : R.cell;
  const MW = MOD.w, MH = MOD.h, MD = MOD.d, TT = 0.012;
  const COLS = !C.rack ? [] : R.columns || [{ x: R.x ?? 0, n: R.count }];
  const MPOS = COLS.flatMap((c, ci) => Array.from({ length: c.n ?? R.count }, (_, l) => ({ x: c.x, lvl: l + (c.s || 0), col: ci })));
  const NM = MPOS.length, LEVELS = Math.max(0, ...COLS.map(c => (c.n ?? R.count) + (c.s || 0)));
  const modY = i => R.y0 + i * R.pitch;
  const rack = new THREE.Group(); rack.name = 'rack'; CB.add(rack);
  const RX = R.x ?? 0;
  const postZ = [R.z + MD/2 + 0.02, Math.max(R.z - MD/2 - 0.03, -D/2 + 0.06)], postX = MW/2 + 0.035;
  const rackTop = modY(LEVELS - 1) + MH/2 + (R.columns ? 0.04 : 0.12), rackBot = modY(0) - MH/2 - 0.01;
  if (!NM){ /* no battery rack (PCS cabinet) */ }
  else if (!R.columns){
    [[-postX, postZ[0]], [postX, postZ[0]], [-postX, postZ[1]], [postX, postZ[1]]].forEach(([x,z]) => rack.add(box(0.03, rackTop - rackBot, 0.03, M.rack, RX + x, (rackTop + rackBot)/2, z)));
    for (let i=0;i<NM;i++){ [-1,1].forEach(s => rack.add(box(0.02, 0.02, MD + 0.04, M.rack, RX + s*(MW/2 + 0.02), modY(i) - MH/2 - 0.005, R.z))); }
  } else {
    // many columns: posts and rails as instanced meshes
    const pw = 0.018, px = MW/2 + pw/2 + 0.002, mm = new THREE.Matrix4();
    const posts = new THREE.InstancedMesh(new THREE.BoxGeometry(pw, rackTop - rackBot, 0.03), M.rack, COLS.length * 4); posts.name = 'rackPosts';
    const rails = new THREE.InstancedMesh(new THREE.BoxGeometry(0.02, 0.015, MD + 0.04), M.rack, NM * 2); rails.name = 'rackRails';
    let k = 0; COLS.forEach(c => [-px, px].forEach(x => postZ.forEach(z => { mm.makeTranslation(c.x + x, (rackTop + rackBot)/2, z); posts.setMatrixAt(k++, mm); })));
    k = 0; MPOS.forEach(q => [-1, 1].forEach(sx => { mm.makeTranslation(q.x + sx*(MW/2 - 0.006), modY(q.lvl) - MH/2 - 0.008, R.z); rails.setMatrixAt(k++, mm); }));
    [posts, rails].forEach(o => { o.castShadow = true; rack.add(o); });
  }
  const pipes = new THREE.Group(); pipes.name = 'coolingPipes'; CB.add(pipes);
  if (C.cooling === 'liquid'){
    const pz = Math.max(R.z - MD/2 - 0.055, -D/2 + 0.065), pyb = modY(0) - MH/2 - 0.15, pyt = modY(LEVELS-1) + MH/2 + 0.15;
    [[RX - 0.12, M.pipeC], [RX - 0.04, M.pipeH]].forEach(([x, mat]) => {
      pipes.add(cyl(0.018, pyt - pyb, mat, x, (pyt + pyb)/2, pz));
      for (let i=0;i<LEVELS;i++){ const b = cyl(0.014, 0.07, mat, x, modY(i), pz + 0.03); b.rotation.x = Math.PI/2; pipes.add(b); }
    });
  }

  // parts that move: pull = drawer offset, xoff = explode offset
  const P = {};
  function part(id, group, p0, pull, xoff){ group.name = id; group.position.copy(p0); CB.add(group); tag(id, group); P[id] = { id, group, p0:p0.clone(), pull, xoff, t:0, target:0 }; return P[id]; }

  // battery modules with lid + cells
  const MODS = [];
  const cellX0 = CELL ? -(CELL.cols - 1) * CELL.px / 2 : 0, cellZ0 = CELL ? -(CELL.rows - 1) * CELL.pz / 2 : 0;
  function buildModule(){
    const g = new THREE.Group();
    if (MOD.simple){
      // closed module with a printed front (large racks: no lid, no cells)
      g.add(box(MW, MH, MD, M.module));
      g.add(plane(MW - 0.004, MH - 0.004, M.modTex, 0, 0, MD/2 + 0.001));
      return { g, simple:true, lidPivot:null, cells:null, base:[], lid:0, lidTarget:0, cell:-1, lift:0, liftTarget:0 };
    }
    g.add(box(MW, TT, MD, M.module, 0, -MH/2 + TT/2, 0));
    g.add(box(TT, MH - TT, MD, M.module, -MW/2 + TT/2, TT/2, 0));
    g.add(box(TT, MH - TT, MD, M.module,  MW/2 - TT/2, TT/2, 0));
    g.add(box(MW, MH - TT, TT, M.module, 0, TT/2, -MD/2 + TT/2));
    g.add(box(MW, MH, 0.02, M.modFace, 0, 0, MD/2 - 0.01));
    if (MOD.face === 'label'){
      g.add(box(0.06, 0.06, 0.04, M.orange, -MW*0.42, 0.03, MD/2 + 0.02));
      g.add(box(0.06, 0.06, 0.04, M.orange, -MW*0.42, -0.045, MD/2 + 0.02));
      const lw = Math.min(MW*0.36, 0.3);
      g.add(box(lw, MH*0.42, 0.012, M.white, 0, 0.005, MD/2 + 0.006));
      if (modLabelMat) g.add(plane(lw*0.84, MH*0.2, modLabelMat, 0, 0.01, MD/2 + 0.0125));
      g.add(box(0.05, 0.03, 0.03, M.black, MW*0.33, 0.02, MD/2 + 0.015));
      [-1,1].forEach(s => g.add(box(0.02, MH*0.5, 0.035, M.black, s*(MW/2 - 0.02), 0, MD/2 + 0.015)));
    } else {
      g.add(box(0.07, 0.07, 0.04, M.orange, -MW*0.366, 0.02, MD/2 + 0.02));
      g.add(box(0.07, 0.07, 0.04, M.orange,  MW*0.366, 0.02, MD/2 + 0.02));
      g.add(box(Math.min(0.24, MW*0.34), 0.05, 0.004, M.white, 0, 0.04, MD/2 + 0.002));
      [-1,1].forEach(s => g.add(box(0.02, 0.12, 0.035, M.black, s*(MW/2 - 0.02), 0, MD/2 + 0.015)));
    }
    const lidPivot = new THREE.Group(); lidPivot.name = 'lid'; lidPivot.position.set(0, MH/2, -MD/2); g.add(lidPivot);
    lidPivot.add(box(MW, TT, MD, M.module, 0, -TT/2, MD/2));
    const n = CELL.cols * CELL.rows;
    const cells = new THREE.InstancedMesh(new THREE.BoxGeometry(CELL.w, CELL.h, CELL.d), M.cell.clone(), n); cells.name = 'cells';
    const terms = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 12), M.term, n*2); terms.name = 'terminals';
    const bus = new THREE.InstancedMesh(new THREE.BoxGeometry(0.022, 0.003, CELL.pz + 0.008), M.copper, CELL.cols * (CELL.rows - 1)); bus.name = 'busbars';
    const m4 = new THREE.Matrix4(), base = [];
    const yc = -MH/2 + TT + CELL.h/2, tx = CELL.w * 0.33;
    let k = 0, b = 0;
    for (let c = 0; c < CELL.cols; c++){
      for (let r = 0; r < CELL.rows; r++){
        const x = cellX0 + c*CELL.px, z = cellZ0 + r*CELL.pz;
        m4.makeTranslation(x, yc, z); cells.setMatrixAt(k, m4); base.push(V(x, yc, z)); cells.setColorAt(k, new THREE.Color(1,1,1));
        m4.makeTranslation(x - tx, yc + CELL.h/2 + 0.005, z); terms.setMatrixAt(2*k, m4);
        m4.makeTranslation(x + tx, yc + CELL.h/2 + 0.005, z); terms.setMatrixAt(2*k + 1, m4);
        if (r < CELL.rows - 1){ m4.makeTranslation(x + (r % 2 ? -tx : tx), yc + CELL.h/2 + 0.011, z + CELL.pz/2); bus.setMatrixAt(b++, m4); }
        k++;
      }
    }
    cells.instanceMatrix.needsUpdate = true; cells.instanceColor.needsUpdate = true;
    [cells, terms, bus].forEach(o => { o.castShadow = true; o.userData.sharedMat = o !== cells; g.add(o); });
    cells.userData.cells = true;
    return { g, lidPivot, cells, base, lid:0, lidTarget:0, cell:-1, lift:0, liftTarget:0 };
  }
  const pullZ = (C.pullDepth ?? 0.98);
  for (let i = 0; i < NM; i++){
    const m = buildModule(), q = MPOS[i];
    const xo = R.explode || [0, 0.25, 0.17, 1.55];
    part('mod' + i, m.g, V(q.x, modY(q.lvl), R.z), V(0, 0, pullZ), V(0, xo[1] + q.lvl*xo[2], xo[3]));
    MODS.push(m);
  }
  // units: hv / pcs / chiller boxes with front details
  function unitFace(g, u){
    const [w, h, d] = u.size, fz = d/2;   // w along x, h along y, d along z
    if (u.kind === 'hv'){
      g.add(box(Math.min(0.2, w*0.4), Math.min(0.07, h*0.45), 0.02, M.screen, -w*0.27, h*0.07, fz + 0.005));
      g.add(box(0.06, 0.06, 0.05, M.orange, w*0.3, -h*0.1, fz + 0.02)); g.add(box(0.06, 0.06, 0.05, M.orange, w*0.15, -h*0.1, fz + 0.02));
      if (u.knob){ const k = cyl(0.035, 0.03, M.black, -w*0.2, -h*0.2, fz + 0.015); k.rotation.x = Math.PI/2; g.add(k); }
    } else if (u.kind === 'pcs'){
      if (u.face === 'breakers'){
        for (let k=0;k<5;k++) g.add(box(0.035, h*0.32, 0.03, M.breaker, w*0.05 + k*0.045, h*0.08, fz + 0.012));
        g.add(box(Math.min(0.12, w*0.2), 0.06, 0.02, M.screen, -w*0.3, h*0.15, fz + 0.005));
        g.add(box(0.05, 0.05, 0.04, M.orange, -w*0.3, -h*0.22, fz + 0.015));
        g.add(box(w*0.8, 0.012, 0.012, M.black, 0, -h*0.36, fz + 0.008));
      } else {
        for (let k=0;k<5;k++) g.add(box(w*0.82, 0.012, 0.02, M.fan, 0, -h*0.35 + k*h*0.13, fz));
        g.add(box(0.12, 0.06, 0.02, M.screen, 0, h*0.37, fz)); g.add(box(0.05, 0.05, 0.04, M.orange, -w*0.34, h*0.37, fz + 0.01));
      }
    } else if (u.kind === 'inv'){
      const fs = u.mount === 'right' ? 1 : -1;               // +1: hung on the right side wall, outer face towards +x
      const label = new THREE.MeshBasicMaterial({ map:texLabel(u.label || 'HYBRID', '#1C3D5A'), transparent:true }); label.name = 'invLabel';
      if (u.facing === 'out'){
        const scr = box(0.006, 0.07, 0.13, M.screen, fs*(w/2 + 0.002), h*0.27, 0); g.add(scr);
        const lp = plane(d*0.5, d*0.15, label, fs*(w/2 + 0.003), h*0.05, 0); lp.rotation.y = fs*Math.PI/2; g.add(lp);
        [-1, 1].forEach(k => g.add(box(0.03, h*0.6, 0.04, M.pole, -fs*(w/2 + 0.015), h*0.1, k*d*0.36)));
      } else {
        const fins = plane(d*0.96, h*0.9, M.fins, fs*(w/2 + 0.001), 0, 0); fins.rotation.y = fs*Math.PI/2; g.add(fins);
        [-1, 1].forEach(k => g.add(box(0.03, h*0.68, 0.04, M.pole, -fs*(w/2 + 0.015), h*0.23, k*d*0.38)));
        g.add(box(0.13, 0.07, 0.006, M.screen, 0, h*0.27, d/2 + 0.002));
        g.add(plane(Math.min(0.2, w*0.7), 0.06, label, 0, -h*0.18, d/2 + 0.002));
      }
      for (let i = 0; i < 8; i++) g.add(cyl(0.011, 0.05, i % 2 ? M.connR : M.conn, -fs*w*0.29 + fs*(i % 2) * w*0.11, -h/2 - 0.025, -d*0.38 + Math.floor(i/2) * d*0.135));
      [0.06, 0.12, 0.18, 0.235].forEach(z => g.add(cyl(0.018, 0.05, M.conn, fs*w*0.21, -h/2 - 0.025, (z - 0.06) * d / 0.52)));
    } else if (u.kind === 'dist'){
      for (let k=0;k<6;k++) g.add(box(0.03, h*0.22, 0.03, M.breaker, -w*0.35 + k*w*0.13, h*0.2, fz + 0.012));
      g.add(box(w*0.8, 0.012, 0.012, M.black, 0, -h*0.05, fz + 0.008));
      for (let k=0;k<4;k++) g.add(box(0.025, 0.04, 0.02, M.orange, -w*0.3 + k*w*0.2, -h*0.3, fz + 0.012));
    } else if (u.kind === 'chiller'){
      if (u.face === 'panel'){
        g.add(box(w*0.55, h*0.7, 0.012, M.tan, w*0.12, 0, fz + 0.006));
        g.add(box(w*0.12, h*0.75, 0.03, M.breaker, -w*0.36, 0, fz + 0.012));
        g.add(cyl(0.02, 0.06, M.pipeC, -w*0.38, h*0.2, fz + 0.03).rotateX(Math.PI/2));
        g.add(cyl(0.02, 0.06, M.pipeH, -w*0.34, h*0.2, fz + 0.03).rotateX(Math.PI/2));
      } else {
        const f = cyl(Math.min(0.13, h*0.3), 0.02, M.fan, 0, 0, fz); f.rotation.x = Math.PI/2; g.add(f);
      }
      g.add(cyl(0.025, 0.1, M.pipeC, -w*0.24, h/2 + 0.05, -d*0.36)); g.add(cyl(0.025, 0.1, M.pipeH, w*0.24, h/2 + 0.05, -d*0.36));
    } else if (u.kind === 'cab'){
      // floor-standing equipment cabinet (PCS, PBD, combiner): n leaves with screen, handle, grilles and a printed label
      const n = u.n || 1, lw = w / n;
      const lab = u.label ? new THREE.MeshBasicMaterial({ map:texLabel(u.label, '#1C3D5A'), transparent:true }) : null; if (lab) lab.name = 'cabLabel';
      for (let k = 0; k < n; k++){
        const cx = -w/2 + lw*(k + 0.5);
        if (k) g.add(box(0.006, h*0.96, 0.006, M.black, -w/2 + lw*k, 0, fz + 0.003));
        g.add(plane(lw*0.62, h*0.16, M.perf, cx, -h*0.33, fz + 0.002));
        g.add(plane(lw*0.62, h*0.07, M.perf, cx, h*0.41, fz + 0.002));
        if (!u.screens || u.screens.includes(k)){ g.add(box(Math.min(0.15, lw*0.4), 0.1, 0.012, M.screen, cx - lw*0.12, h*0.22, fz + 0.006)); g.add(cyl(0.018, 0.02, M.red, cx + lw*0.14, h*0.22, fz + 0.01).rotateX(Math.PI/2)); }
        g.add(box(0.022, Math.min(0.2, h*0.12), 0.03, M.black, cx + lw*0.38, 0, fz + 0.015));
        if (lab) g.add(plane(Math.min(0.3, lw*0.62), 0.075, lab, cx - lw*0.04, h*0.07, fz + 0.002));
      }
      g.add(plane(0.08, 0.07, M.warn, -w/2 + lw*0.5, -h*0.13, fz + 0.003));
    } else if (u.kind === 'hvstack'){
      // open rack with n high-voltage controller boxes
      const cols = u.cols || 2, rows = Math.ceil(u.n / cols), bw = w / cols - 0.03, bh = Math.min(0.26, (h - 0.12) / rows - 0.04);
      [-1, 1].forEach(sx => [-1, 1].forEach(sz => g.add(box(0.03, h, 0.03, M.rack, sx*(w/2 - 0.015), 0, sz*(d/2 - 0.015)))));
      [-1, 1].forEach(sy => g.add(box(w, 0.03, d, M.rack, 0, sy*(h/2 - 0.015), 0)));
      for (let k = 0; k < u.n; k++){
        const c = k % cols, r = Math.floor(k / cols);
        const b = new THREE.Group(); b.name = `hvController${k + 1}`; b.position.set(-w/2 + (c + 0.5) * w / cols, h/2 - 0.06 - (r + 0.5) * (h - 0.12) / rows, 0); g.add(b);
        b.add(box(bw, bh, d*0.9, M.hv));
        b.add(box(Math.min(0.12, bw*0.4), bh*0.3, 0.012, M.screen, -bw*0.22, bh*0.14, d*0.45 + 0.006));
        [0.16, 0.32].forEach(ox => b.add(box(0.045, 0.045, 0.03, M.orange, bw*ox, -bh*0.16, d*0.45 + 0.015)));
      }
    } else if (u.kind === 'transformer'){
      // dry-type transformer: base rails, core yokes, three resin coils, copper bars on top
      const r = Math.min(w / 7, d / 2.6), ch = h * 0.6, yb = -h/2 + 0.22, yt = yb + ch;
      [-1, 1].forEach(sz => g.add(box(w, 0.1, 0.08, M.yoke, 0, -h/2 + 0.05, sz*d*0.34)));
      g.add(box(w*0.96, 0.12, r*1.2, M.yoke, 0, yb - 0.06, 0)); g.add(box(w*0.96, 0.12, r*1.2, M.yoke, 0, yt + 0.06, 0));
      [-1, 1].forEach(sz => g.add(box(w*0.98, 0.06, 0.03, M.yoke, 0, yt + 0.06, sz*(r*0.6 + 0.02))));
      for (let k = -1; k <= 1; k++){
        const x = k * w / 3;
        g.add(cyl(r, ch, M.coil, x, yb + ch/2, 0, 32));
        [0.2, 0.8].forEach(f => g.add(cyl(r + 0.005, 0.025, M.copper, x, yb + ch*f, 0, 32)));
        const bt = h/2 - (yt + 0.12); g.add(box(0.03, bt, 0.07, M.copper, x + r*0.35, yt + 0.12 + bt/2, r*0.5));
        g.add(cyl(0.022, 0.08, M.white, x - r*0.35, yt + 0.16, r*0.5));
      }
      g.add(plane(0.09, 0.08, M.warn, 0, yb + ch*0.5, r + 0.006));
    } else if (u.kind === 'invbox'){
      // free-standing hybrid inverter / PCS housing: display, status LEDs, label, side fins, cable entries underneath
      const lab = new THREE.MeshBasicMaterial({ map:texLabel(u.label || String(C.brand || '').toUpperCase(), C.labelColor || '#1C3D5A'), transparent:true }); lab.name = 'invLabel';
      g.add(box(Math.min(0.2, w*0.35), Math.min(0.11, h*0.12), 0.012, M.screen, 0, h*0.2, fz + 0.006));
      [-1, 0, 1].forEach(k => g.add(box(0.014, 0.014, 0.008, k < 0 ? M.led : k ? M.red : M.yellow, k*0.035, h*0.2 - Math.min(0.11, h*0.12)/2 - 0.03, fz + 0.004)));
      g.add(plane(Math.min(0.34, w*0.6), Math.min(0.085, h*0.1), lab, 0, h*0.36, fz + 0.002));
      if (u.stripe) g.add(box(0.014, h*0.75, 0.004, M.accent2, -w/2 + 0.035, 0, fz + 0.002));
      [-1, 1].forEach(sx => { const f = plane(d*0.86, h*0.7, M.fins, sx*(w/2 + 0.001), -h*0.05, 0); f.rotation.y = sx*Math.PI/2; g.add(f); });
      if (u.wall) for (let i = 0; i < 6; i++) g.add(cyl(0.014, 0.05, i % 2 ? M.connR : M.conn, -w*0.3 + i*w*0.12, -h/2 - 0.025, 0));
      else g.add(box(w, 0.05, d, M.plinth, 0, -h/2 + 0.025, 0.002));
    } else if (u.kind === 'acu'){
      // packaged air conditioner: condenser grille over a fan
      g.add(plane(w*0.86, h*0.42, M.louvreDiag, 0, h*0.24, fz + 0.002));
      const f = Math.min(w*0.7, h*0.4); g.add(plane(f, f, M.fanGrille, 0, -h*0.24, fz + 0.002));
    } else if (u.kind === 'duct'){
      // air duct with outlets on the underside
      const nv = Math.max(1, Math.floor(w / 0.9));
      for (let k = 0; k < nv; k++) g.add(box(0.36, 0.006, d*0.6, M.slot, -w/2 + (k + 0.5) * w / nv, -h/2 - 0.003, 0));
    }
  }
  const UNITS = C.units || [];
  const UNIT = Object.fromEntries(UNITS.map(u => [u.id, u]));
  function unitGroup(u){ const g = new THREE.Group(); if (!['transformer', 'hvstack'].includes(u.kind)) g.add(box(u.size[0], u.size[1], u.size[2], M[u.mat || u.kind] || M.hv)); unitFace(g, u); if (u.rotY) g.rotation.y = u.rotY * Math.PI / 180; return g; }
  UNITS.forEach(u => { const p = part(u.id, unitGroup(u), A(u.pos), A(u.pull || [0, 0, pullZ]), A(u.explode)); p.outside = !!u.outside; });
  const unitIds = UNITS.map(u => u.id);

  // fire safety (inside: moves up on explode; outside: static)
  const FIRE = {}, FPIN = [];
  const fireIn = new THREE.Group(); fireIn.name = 'fireInside'; CB.add(fireIn);
  const fireOut = new THREE.Group(); fireOut.name = 'fireOutside'; CB.add(fireOut);
  const alarmMeshes = [];
  for (const f of (C.fire.items || [])){
    const [x, y, z] = f.pos || [0, 0, 0];
    let anchor = null;
    if (f.type === 'aerosol'){ const a = cyl(f.r ?? 0.055, f.len ?? 0.3, M.fire, x, y, z); if (!f.vertical) a.rotation.z = Math.PI/2; fireIn.add(a); fireIn.add(box(0.04, 0.06, 0.04, M.black, x, y + (f.vertical ? (f.len ?? 0.3)/2 + 0.03 : 0.055), z)); anchor = a; }
    else if (f.type === 'bottle'){ const b = cyl(f.r ?? 0.06, f.len ?? 0.32, M.fire, x, y, z); fireIn.add(b); fireIn.add(cyl(0.018, 0.05, M.black, x, y + (f.len ?? 0.32)/2 + 0.025, z)); anchor = b; }
    else if (f.type === 'pipe'){ const pp = cyl(0.012, f.y1 - f.y0, M.fire, x, (f.y0 + f.y1)/2, z); fireIn.add(pp); (f.nozzles || []).forEach(ny => fireIn.add(box(0.03, 0.02, 0.03, M.black, x, ny, z + 0.02))); anchor = pp; }
    else if (f.type === 'hpipe'){ const hp = cyl(0.016, f.x1 - f.x0, M.fire, (f.x0 + f.x1)/2, y, z); hp.rotation.z = Math.PI/2; fireIn.add(hp); (f.nozzles || []).forEach(nx => fireIn.add(cyl(0.014, 0.05, M.black, nx, y - 0.035, z))); anchor = hp; }
    else if (f.type === 'strip'){ const s = box(f.size[0], f.size[1], f.size[2], M.fire, x, y, z); fireIn.add(s); [-1,1].forEach(k => fireIn.add(cyl(0.012, 0.03, M.white, x + k*f.size[0]*0.3, y, z + f.size[2]/2 + 0.01).rotateX(Math.PI/2))); anchor = s; }
    else if (f.type === 'smoke'){ const sm = cyl(0.05, 0.02, M.detector, x, y, z); fireIn.add(sm); const led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 8), new THREE.MeshStandardMaterial({ color:0x772222, emissive:0x000000 })); led.material.name = 'smokeLed'; led.position.set(x + 0.03, y - 0.015, z); fireIn.add(led); alarmMeshes.push(led); anchor = sm; }
    else if (f.type === 'heat'){ const ht = cyl(0.05, 0.02, M.detector, x, y, z); fireIn.add(ht); anchor = ht; }
    else if (f.type === 'gas'){ const gs = box(0.04, 0.12, 0.1, M.detector, x, y, z); fireIn.add(gs); fireIn.add(box(0.005, 0.03, 0.05, M.screen, x - 0.022, y + 0.02, z)); anchor = gs; }
    else if (f.type === 'water'){ const k = f.face === 'front' ? 1 : -1; const w = cyl(0.03, 0.08, M.brass, x, y, k*(D/2 + 0.03)); w.rotation.x = Math.PI/2; fireOut.add(w); const wc = cyl(0.042, 0.02, M.brass, x, y, k*(D/2 + 0.075)); wc.rotation.x = Math.PI/2; fireOut.add(wc); anchor = w; }
    else if (f.type === 'vent'){ const v = box(f.size[0], f.size[1], f.size[2], M.frame, x, y, z); fireOut.add(v); anchor = v; }
    else if (f.type === 'beacon'){ anchor = door.beacon; }
    else if (f.type === 'estop'){ anchor = door.estop && door.estop[1]; }
    else if (f.type === 'led'){ anchor = door.leds && door.leds[f.index]; }
    if (anchor) FPIN.push({ f, anchor });
  }
  if (door.beacon){ alarmMeshes.push(door.beacon); tag('fire', door.beacon); }
  (C.fire.alarmLeds || []).forEach(i => { if (door.leds && door.leds[i]) alarmMeshes.push(door.leds[i]); });
  tag('fire', fireIn); tag('fire', fireOut);
  fireIn.traverse(o => { if (o.isMesh) o.receiveShadow = false; });
  // EMS screen and dehumidifier on the inner side of the door
  const emsG = new THREE.Group(); emsG.name = 'ems';
  if (door.emsAt){ emsG.position.set(door.emsAt[0], door.emsAt[1], -0.045); door.emsAtDoor.hinge.add(emsG);
    emsG.add(box(0.28, 0.34, 0.07, M.ems));
    const emsScr = plane(0.24, 0.18, M.emsScreen, 0, 0.04, -0.0355); emsScr.rotation.y = Math.PI; emsG.add(emsScr);
    tag('ems', emsG); }
  let dehum = null;
  if (door.dehumAt){ const [x, y, w, h] = door.dehumAt; dehum = new THREE.Group(); dehum.name = 'dehumidifier'; dehum.position.set(x, y, -0.04); door.dehumAtDoor.hinge.add(dehum);
    dehum.add(box(w, h, 0.06, M.fan)); const gr = plane(w*0.7, h*0.5, M.perf, 0, -h*0.1, -0.031); gr.rotation.y = Math.PI; dehum.add(gr);
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.008, 10, 8), M.led); l.position.set(w*0.3, h*0.35, -0.032); dehum.add(l);
    tag('dehumid', dehum); }
  // air conditioner built into a door: evaporator on the inner side
  let acG = null;
  if (door.acAt){ const [x, y, w, h] = door.acAt; acG = new THREE.Group(); acG.name = 'airConditioner'; acG.position.set(x, y, -0.1); door.acAtDoor.hinge.add(acG);
    acG.add(box(w - 0.04, h - 0.08, 0.17, M.acIn)); const g2 = plane((w - 0.04) * 0.75, h * 0.26, M.louvreDiag, 0, -h * 0.24, -0.086); g2.rotation.y = Math.PI; acG.add(g2);
    tag('ac', acG); }
  [...Object.values(P).map(p => p.group), rack, pipes].forEach(g => g.traverse(o => { if (o.isMesh) o.receiveShadow = false; }));
  const ALARM = alarmMeshes.map(o => ({ o, base: o.material.emissive.clone() }));

  /* ---------- state ---------- */
  const S = { door:0, doorT:0, explode:0, explodeT:0, fire:false, fireTest:0, sel:null, hover:null, ems:false, xray:0, xrayT:0 };
  const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3)/2;
  const clamp01 = t => Math.max(0, Math.min(1, t));
  const tmp = V(0,0,0), tmp2 = V(0,0,0), m4 = new THREE.Matrix4();
  const HL_HOVER = new THREE.Color(0x1f6f80), HL_SEL = new THREE.Color(col('accent','#13808F')), BLACK = new THREE.Color(0x000000);
  const SEL_CELL = new THREE.Color(0.35, 1.55, 1.35), WHITE = new THREE.Color(1,1,1);
  const DOOR_OPEN = K.doorOpen ?? 1.9;

  function apply(){
    const de = ease(S.doorT), xe = ease(S.explodeT);
    DOORS.forEach(d => { d.hinge.rotation.y = -d.side * Math.max(de, xe) * DOOR_OPEN; });
    inLights.forEach(l => { l.intensity = 1.4 * Math.max(de, xe); });
    for (const p of Object.values(P)) p.group.position.copy(p.p0).addScaledVector(p.pull, ease(p.t)).addScaledVector(p.xoff, xe);
    MODS.forEach(m => {
      if (!m.lidPivot) return;
      m.lidPivot.rotation.x = -ease(m.lid) * 1.25;
      if (m.cell >= 0){ const b = m.base[m.cell]; m4.makeTranslation(b.x, b.y + 0.34 * ease(m.lift), b.z); m.cells.setMatrixAt(m.cell, m4); m.cells.instanceMatrix.needsUpdate = true; }
    });
    fireIn.position.set(0, 0.95 * xe, 0.25 * xe);
    const xr = ease(S.xrayT);
    const op = Math.min(1 - 0.86 * xe, 1 - 0.78 * xr);
    [shellMat, roofMat, M.shellIn].forEach(m => { m.opacity = op; m.depthWrite = op > 0.95; });
    const dop = 1 - Math.max(0.5 * xe, 0.72 * xr);
    [...(GROUPS.door || []), ...(GROUPS.ac || [])].forEach(o => { o.material.transparent = true; o.material.opacity = dop; o.material.depthWrite = dop > 0.95; });
    const po = Math.max(0, 1 - xe * 2.2); M.pipeC.opacity = po; M.pipeH.opacity = po; pipes.visible = po > 0.01; rack.visible = xe < 0.5;
    for (const [id, list] of Object.entries(GROUPS)){
      const c = (S.sel === id || (S.fire && id === 'fire')) ? HL_SEL : (S.hover === id ? HL_HOVER : BLACK);
      const k = c === BLACK ? 0 : (c === HL_SEL ? 0.16 : 0.13);
      list.forEach(o => { if (o.material.emissive && o.material.name !== 'screen' && o.material.name !== 'led' && !o.userData.sharedMat){ o.material.emissive.copy(c); o.material.emissiveIntensity = k; } });
    }
    const on = S.fireTest > 0 && (Math.floor(S.fireTest * 4) % 2 === 0);
    ALARM.forEach(({ o, base }) => { const m = o.material; if (on){ m.emissive.set(0xff2a1a); m.emissiveIntensity = 2.4; } else if (m.name === 'led'){ m.emissive.copy(base); m.emissiveIntensity = 1.1; } else { m.emissive.set(0x000000); m.emissiveIntensity = 0; } });
  }

  /* ---------- info / rail ---------- */
  const INFO = C.info;
  const SYS = C.system;
  const ROWS = C.rows;
  let mode = 'cab';
  const pulledId = () => Object.values(P).find(p => p.target > 0.5 && !p.outside)?.id || null;
  const selMod = () => (S.sel && S.sel.startsWith('mod')) ? +S.sel.slice(3) : -1;
  const midCell = CELL ? Math.floor(CELL.cols / 2) * CELL.rows + Math.floor(CELL.rows / 2) : 0;
  // module names: "Модуль 5", or "Модуль 3.5" (column.level) for multi-column racks
  const modNo = i => R.columns ? `${MPOS[i].col + 1}.${MPOS[i].lvl + 1}` : `${i + 1}`;
  const colMid = ci => { const ids = MPOS.map((q, i) => q.col === ci ? i : -1).filter(i => i >= 0); return ids[Math.floor(ids.length / 2)]; };

  function renderRail(){
    const partsEl = $('parts'), det = $('detail');
    $('railH').textContent = mode === 'cab' ? (C.ui?.rail || 'Склад шафи') : mode === 'res' ? 'Схема резерву' : 'Склад системи';
    partsEl.innerHTML = '';
    if (mode === 'cab'){
      ROWS.forEach(([id, name], n) => {
        const li = document.createElement('li');
        const on = id === 'mods' ? selMod() >= 0 || S.sel === 'cell' : (S.sel === id || (id === 'fire' && S.fire));
        li.innerHTML = `<button type="button" class="row${on ? ' on' : ''}" data-row="${id}"><span class="k">${n+1}</span>${esc(name)}</button>`;
        if (id === 'mods'){ const d = document.createElement('div'); d.className = 'mods';
          if (NM > 16) COLS.forEach((c, ci) => { d.innerHTML += `<button type="button" data-col="${ci}" class="${selMod() >= 0 && MPOS[selMod()].col === ci ? 'on' : ''}" title="Стійка ${ci+1}">С${ci+1}</button>`; });
          else for (let i=0;i<NM;i++) d.innerHTML += `<button type="button" data-mod="${i}" class="${selMod() === i ? 'on' : ''}">М${i+1}</button>`;
          li.appendChild(d); }
        partsEl.appendChild(li);
      });
      let info = null, acts = [];
      const mi = selMod();
      if (S.sel === 'cell'){ info = INFO.cell; acts = [['cell-down','Опустити комірку'],['lid-close','Закрити модуль']]; }
      else if (mi >= 0){ info = { ...INFO.mod, name:`${INFO.mod.name} ${modNo(mi)}` }; const m = MODS[mi]; acts = P['mod'+mi].target < 0.5 ? [['pull','Висунути модуль']] : m.simple ? [['push','Засунути']] : (m.lidTarget < 0.5 ? [['lid-open','Відкрити модуль'],['push','Засунути']] : [['cell','Показати комірку'],['lid-close','Закрити модуль']]); }
      else if (S.sel === 'door'){ info = INFO.door; acts = [[S.door ? 'door-close' : 'door-open', S.door ? 'Закрити двері' : 'Відкрити двері']]; }
      else if (unitIds.includes(S.sel)){ const u = UNIT[S.sel]; info = INFO[S.sel]; acts = u.fixed ? [] : [[P[S.sel].target > 0.5 ? 'push' : 'pull', P[S.sel].target > 0.5 ? (u.pushLabel || 'Засунути') : (u.pullLabel || 'Висунути')]]; }
      else if (S.sel === 'fire' || S.fire){ info = INFO.fire; acts = [['fire-test','Тест сигналізації'],['fire-off','Вийти з режиму']]; }
      else if (S.sel === 'ems'){ info = INFO.ems; acts = [['ems-toggle', S.ems ? 'Сховати панель EMS' : 'Показати панель EMS']]; }
      else if (['estop', 'dehumid', 'ac'].includes(S.sel)){ info = INFO[S.sel]; }
      if (info){
        det.innerHTML = `<h3>${esc(info.name)}</h3><p>${esc(info.text)}</p>` + kvHtml(info.kv) + (acts.length ? `<div class="acts">${acts.map(([a,l],i) => `<button type="button" class="btn sm${i===0?' primary':''}" data-act="${a}">${l}</button>`).join('')}</div>` : '') + ((S.sel === 'cell' || mi >= 0) && C.notes?.module ? `<div class="small">${esc(C.notes.module)}</div>` : '');
      } else {
        det.innerHTML = `<h3>${esc(C.model)}</h3><p>${esc(C.summary.text)}</p>` + kvHtml(C.summary.kv);
      }
    } else {
      const SD = mode === 'res' ? RES : SYS;
      SD.parts.forEach((p, n) => { const li = document.createElement('li'); li.innerHTML = `<button type="button" class="row${S.sel === p.id ? ' on' : ''}" data-sys="${p.id}"><span class="k">${n+1}</span>${esc(p.name)}</button>`; partsEl.appendChild(li); });
      const cur = SD.parts.find(p => p.id === S.sel);
      const pvText = mode === 'res' ? ' ' + RES.modeText() : SYS.type === 'pv' ? ' ' + ({ day:'Вдень СЕС живить об\'єкт, надлишок заряджає батарею, мережа майже не потрібна.', eve:'Увечері батарея живить об\'єкт, мережа докриває решту.', out:`Мережа зникла: інвертор переходить на резерв ${SYS.backup ? 'за ' + SYS.backup : 'автоматично'}, об'єкт живиться від батареї та СЕС.` }[PVS.mode]) + (PVS.gen ? ' ДГУ підключено до входу генератора й заряджає батарею.' : '') : '';
      det.innerHTML = cur ? `<h3>${esc(cur.name)}</h3><p>${esc(cur.text)}</p>` + kvHtml(cur.kv) + (cur.html || '') : `<h3>${esc(SD.title)}</h3><p>${esc(SD.text)}${esc(pvText)}</p>` + (SD.html || '');
    }
    const parts = [`<b>${esc(C.model)}</b>`];
    if (mode !== 'cab') parts[0] = `<b>${esc((mode === 'res' ? RES : SYS).crumb)}</b>`;
    else {
      if (S.explode || (S.door && !OPEN)) parts.push(S.explode ? 'розібрано' : 'двері відкрито');
      const mi = selMod();
      if (mi >= 0 || S.sel === 'cell') parts.push(`Модуль ${modNo(mi >= 0 ? mi : S.cellMod)}`);
      if (S.sel === 'cell') parts.push('Комірка');
      if ([...unitIds, 'ems', 'estop', 'dehumid', 'ac'].includes(S.sel)) parts.push(esc(INFO[S.sel].name));
      if (S.fire) parts.push('Пожежна безпека');
    }
    $('crumb').innerHTML = parts.join(' › ');
    $('emsPanel').hidden = !(mode === 'cab' && S.ems);
    $('btnDoor').textContent = S.door ? 'Закрити двері' : 'Відкрити двері';
    $('btnExplode').setAttribute('aria-pressed', S.explode ? 'true' : 'false');
    $('btnExplode').textContent = S.explode ? 'Зібрати' : 'Розібрати все';
    $('btnFire').setAttribute('aria-pressed', S.fire ? 'true' : 'false');
    UNITS.filter(u => u.button).forEach(u => $('btnU_' + u.id).setAttribute('aria-pressed', S.sel === u.id && P[u.id].target > 0.5 ? 'true' : 'false'));
  }

  /* ---------- camera ---------- */
  let camTween = null;
  function flyTo(pos, tgt, dur=0.9){ if (VIDEO) return; camTween = { p0:camera.position.clone(), t0:controls.target.clone(), p1:pos.clone(), t1:tgt.clone(), t:0, dur: reduceMotion ? 0.001 : dur }; }
  function focus(tgt, off){ flyTo(tgt.clone().add(off), tgt); }
  const camDef = { cab:[[4.1,2.4,5.9],[0,1.12,0.1]], open:[[2.6,2.0,4.6],[0,1.2,0.45]], exp:[[5.8,3.4,7.2],[-0.1,1.45,0.5]], fire:[[2.6,2.1,5.6],[0.05,1.45,0.05]] };
  const CAM = {};
  for (const [k, [p, t]] of Object.entries({ ...camDef, ...(C.cams || {}) })) CAM[k] = { pos: C.cams?.[k] ? A(p) : sc(p), tgt: C.cams?.[k] ? A(t) : sc(t) };
  function setCamNow(v){ camera.position.copy(v.pos); controls.target.copy(v.tgt); controls.update(); }
  setCamNow(CAM.cab);
  function partWorld(id, out){ return P[id].group.getWorldPosition(out); }
  function focusPart(id){
    if (UNIT[id]?.cam){ flyTo(A(UNIT[id].cam[0]), A(UNIT[id].cam[1])); return; }
    // camera offsets from the pulled part; containers look in frontally through the door opening (C.focus)
    const target = P[id].p0.clone().add(P[id].pull), FO = C.focus || {};
    if (id.startsWith('mod')) focus(target.clone().add(V(0, 0.02, 0.05)), FO.mod ? A(FO.mod) : mv(1.25, 1.2, 1.5));
    else focus(target, FO.unit ? A(FO.unit) : mv(1.5, 0.9, 1.9));
  }
  // camera on an item mounted on the inner side of a door, as it will be once the door is open
  function innerView(group, d){
    const h = d.hinge, r = h.rotation.y; h.rotation.y = -d.side * DOOR_OPEN; h.updateMatrixWorld(true);
    const t = group.getWorldPosition(V(0,0,0)); h.rotation.y = r; h.updateMatrixWorld(true);
    flyTo(t.clone().add(V(d.side * 1.47, 0.18, 0.77)), t);
  }
  const emsView = () => innerView(emsG, door.emsAtDoor);

  /* ---------- actions ---------- */
  function setDoor(v){ S.door = v ? 1 : 0; if (!v){ retractAll(); S.ems = false; } }
  function retractAll(except){ Object.values(P).forEach(p => { if (p.id !== except) p.target = 0; }); MODS.forEach((m, i) => { if ('mod'+i !== except){ m.lidTarget = 0; dropCell(m); } }); }
  function dropCell(m){ if (m.cell >= 0) m.liftTarget = 0; }
  // units hung outside the cabinet (side-mounted inverter) move away from the wall with the door closed
  function pull(id){ setFire(false); S.explode = 0; if (P[id].outside){ S.door = 0; S.ems = false; } else S.door = 1; retractAll(id); P[id].target = 1; S.sel = id; focusPart(id); }
  function push(id){ P[id].target = 0; if (id.startsWith('mod')){ const m = MODS[+id.slice(3)]; m.lidTarget = 0; dropCell(m); } if (P[id].outside) flyTo(CAM.cab.pos, CAM.cab.tgt); else flyTo(CAM.open.pos, CAM.open.tgt); }
  function openLid(i, v){ const m = MODS[i]; if (P['mod'+i].target < 0.5) pull('mod'+i); m.lidTarget = v ? 1 : 0; if (!v) dropCell(m); S.sel = 'mod' + i; }
  function showCell(i, idx){
    const m = MODS[i];
    if (m.lidTarget < 0.5) openLid(i, true);
    if (m.cell >= 0 && m.cell !== idx){ const b = m.base[m.cell]; m4.makeTranslation(b.x, b.y, b.z); m.cells.setMatrixAt(m.cell, m4); m.cells.setColorAt(m.cell, WHITE); m.lift = 0; }
    m.cell = idx; m.liftTarget = 1; m.cells.setColorAt(idx, SEL_CELL); m.cells.instanceColor.needsUpdate = true; m.cells.instanceMatrix.needsUpdate = true;
    S.sel = 'cell'; S.cellMod = i;
    const b = m.base[idx]; const t = P['mod'+i].p0.clone().add(P['mod'+i].pull).add(V(b.x, b.y + 0.3, b.z));
    focus(t, mv(0.85, 0.7, 1.15));
  }
  function setFire(v){ S.fire = v; S.xray = v ? 1 : 0; if (v){ S.sel = 'fire'; S.door = 0; S.ems = false; retractAll(); } else if (S.sel === 'fire') S.sel = null; }
  function act(a){
    const mi = selMod();
    switch (a){
      case 'door-open': setDoor(true); S.sel = 'door'; flyTo(CAM.open.pos, CAM.open.tgt); break;
      case 'door-close': setDoor(false); S.sel = 'door'; flyTo(CAM.cab.pos, CAM.cab.tgt); break;
      case 'pull': pull(mi >= 0 ? 'mod'+mi : S.sel); break;
      case 'push': push(mi >= 0 ? 'mod'+mi : S.sel); break;
      case 'lid-open': openLid(mi, true); focusPart('mod'+mi); break;
      case 'lid-close': { const i = mi >= 0 ? mi : S.cellMod; openLid(i, false); focusPart('mod'+i); break; }
      case 'cell': showCell(mi, midCell); break;
      case 'cell-down': { const m = MODS[S.cellMod]; m.liftTarget = 0; S.sel = 'mod' + S.cellMod; focusPart('mod'+S.cellMod); break; }
      case 'fire-test': S.fireTest = 4; break;
      case 'fire-off': setFire(false); flyTo(CAM.cab.pos, CAM.cab.tgt); break;
      case 'ems-toggle': S.ems = !S.ems; break;
    }
    renderRail();
  }
  function selectRow(id){
    if (mode !== 'cab'){ S.sel = (S.sel === id) ? null : id; renderRail(); return; }
    if (id !== 'fire') setFire(false);
    if (id === 'door'){ S.sel = 'door'; if (!S.door){ setDoor(true); flyTo(CAM.open.pos, CAM.open.tgt); } }
    else if (id === 'mods' && NM){ pull('mod' + Math.floor(NM / 2)); }
    else if (unitIds.includes(id)){ pull(id); }
    else if (id === 'fire'){ S.explode = 0; retractAll(); setFire(true); flyTo(CAM.fire.pos, CAM.fire.tgt); }
    else if (id === 'ems' && door.emsAt){ S.explode = 0; retractAll(); S.door = 1; S.sel = 'ems'; S.ems = true; emsView(); }
    else if (id === 'dehumid' && dehum){ S.explode = 0; retractAll(); S.door = 1; S.sel = 'dehumid'; innerView(dehum, door.dehumAtDoor); }
    else if (id === 'ac' && acG){ S.explode = 0; retractAll(); S.door = 1; S.sel = 'ac'; innerView(acG, door.acAtDoor); }
    renderRail();
  }
  $('parts').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.mod){ pull('mod' + b.dataset.mod); renderRail(); }
    else if (b.dataset.col){ pull('mod' + colMid(+b.dataset.col)); renderRail(); }
    else if (b.dataset.row) selectRow(b.dataset.row);
    else if (b.dataset.sys) selectRow(b.dataset.sys);
  });
  $('detail').addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b) act(b.dataset.act); });
  $('btnDoor').addEventListener('click', () => { act(S.door ? 'door-close' : 'door-open'); });
  $('btnExplode').addEventListener('click', () => {
    S.explode = S.explode ? 0 : 1; setFire(false); retractAll(); S.ems = false; S.sel = null;
    if (S.explode) flyTo(CAM.exp.pos, CAM.exp.tgt); else flyTo(S.door ? CAM.open.pos : CAM.cab.pos, S.door ? CAM.open.tgt : CAM.cab.tgt);
    renderRail();
  });
  $('btnFire').addEventListener('click', () => { if (S.fire) act('fire-off'); else selectRow('fire'); });
  if (!FPIN.length) $('btnFire').hidden = true;
  UNITS.filter(u => u.button).forEach(u => $('btnU_' + u.id).addEventListener('click', () => { if (S.sel === u.id && P[u.id].target > 0.5){ push(u.id); S.sel = null; renderRail(); } else selectRow(u.id); }));
  function setSpin(on){ controls.autoRotate = on; $('btnSpin').setAttribute('aria-pressed', on); $('btnSpin2').setAttribute('aria-pressed', on); }
  $('btnSpin').addEventListener('click', () => setSpin(!controls.autoRotate));
  $('btnSpin2').addEventListener('click', () => setSpin(!controls.autoRotate));
  $('btnReset').addEventListener('click', () => { S.explode = 0; setFire(false); setDoor(false); S.sel = null; S.ems = false; flyTo(CAM.cab.pos, CAM.cab.tgt); renderRail(); });
  $('btnReset2').addEventListener('click', () => { const c = camFor('sys'); flyTo(c.pos, c.tgt); });

  /* ---------- export (named nodes and materials) ---------- */
  function exportRoot(){
    apply(); cabScene.updateMatrixWorld(true);
    const root = cabScene.clone(true);
    root.traverse(o => { if (o.isMesh && !o.name) o.name = (o.userData.part || o.parent?.name || 'mesh') + '_' + (o.material?.name || 'mat'); if (o.isLight) o.visible = false; });
    root.userData = { product: C.id, brand: C.brand, model: C.model, units: 'm', accuracy: C.accuracy.level };
    return root;
  }
  function download(data, name, type){ const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); }
  async function exportGlb(){ const glb = await new GLTFExporter().parseAsync(exportRoot(), { binary:true, onlyVisible:true }); return glb; }
  async function exportUsdz(){ return new USDZExporter().parse(exportRoot()); }
  $('btnGlb').addEventListener('click', async () => download(await exportGlb(), `${C.id}.glb`, 'model/gltf-binary'));
  $('btnUsdz').addEventListener('click', async () => download(await exportUsdz(), `${C.id}.usdz`, 'model/vnd.usdz+zip'));

  /* ---------- picking ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function hitAt(cx, cy){
    const r = canvas.getBoundingClientRect(); ndc.set(((cx - r.left) / r.width) * 2 - 1, -((cy - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const list = S.explodeT > 0.3 ? PICK.filter(o => o.userData.part !== 'shell') : PICK;
    const hits = ray.intersectObjects(list, false).filter(h => h.object.visible && (!h.object.material.transparent || h.object.material.opacity > 0.3 || h.object.userData.part !== 'door'));
    return hits[0] || null;
  }
  function onPick(h){
    if (!h) return;
    const id = h.object.userData.part;
    if (id === 'door' || id === 'shell'){ if (!S.door && !S.explode){ act('door-open'); return; } if (id === 'door'){ S.sel = 'door'; renderRail(); } return; }
    if (id === 'estop' || id === 'dehumid' || id === 'ac'){ S.sel = id; renderRail(); return; }
    if (id === 'fire'){ selectRow('fire'); return; }
    if (id === 'ems'){ S.sel = 'ems'; S.ems = true; renderRail(); return; }
    if (id.startsWith('mod')){
      const i = +id.slice(3), m = MODS[i];
      if (m.simple){ if (P[id].target < 0.5) pull(id); else S.sel = id; renderRail(); return; }
      if (h.object.userData.cells && m.lid > 0.6 && h.instanceId !== undefined){ showCell(i, h.instanceId); renderRail(); return; }
      if (P[id].target < 0.5) pull(id); else if (m.lidTarget < 0.5) { openLid(i, true); focusPart(id); } else S.sel = id;
      renderRail(); return;
    }
    if (P[id]){ if (P[id].target < 0.5) pull(id); else S.sel = id; renderRail(); }
  }
  let down = null, hinted = false;
  canvas.addEventListener('pointerdown', e => { down = { x:e.clientX, y:e.clientY }; if (!hinted){ hinted = true; $('hint').style.opacity = 0; } setSpin(false); });
  canvas.addEventListener('pointerup', e => { if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 6 && mode === 'cab') onPick(hitAt(e.clientX, e.clientY)); down = null; });
  let moveQueued = null;
  canvas.addEventListener('pointermove', e => { if (e.buttons || e.pointerType === 'touch') return; moveQueued = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerleave', () => { S.hover = null; canvas.classList.remove('hot'); });
  controls.addEventListener('start', () => { camTween = null; });

  function exteriorCopy(x){ const g = new THREE.Group(); g.position.set(x, 0, 0); buildExterior(g, false, M.shell, M.roof);
    DOORS.forEach(d => { const h = new THREE.Group(); h.position.set(d.hingeX, 0, FRONT_Z); g.add(h); buildDoor(h, d); });
    if (OPEN && NM){ // an open rack shows its modules from outside
      const im = new THREE.InstancedMesh(new THREE.BoxGeometry(MW, MH, MD), M.module, NM), mm = new THREE.Matrix4();
      MPOS.forEach((q, i) => { mm.makeTranslation(q.x, modY(q.lvl), R.z); im.setMatrixAt(i, mm); }); im.castShadow = true; g.add(im);
      const fm = new THREE.InstancedMesh(new THREE.PlaneGeometry(MW - 0.01, MH - 0.01), M.modTex, NM);
      MPOS.forEach((q, i) => { mm.makeTranslation(q.x, modY(q.lvl), R.z + MD/2 + 0.002); fm.setMatrixAt(i, mm); }); g.add(fm);
    }
    return g; }
  /* ---------- system scene ---------- */
  const sysScene = new THREE.Group(); sysScene.name = 'system'; sysScene.visible = false; scene.add(sysScene);
  // PV tables: 2 rows of `cols` panels at 25°, legs on both ends
  function addPvTables(tables, cols){
    const PANEL = { w:1.13, l:2.28 }, tilt = 25 * Math.PI / 180, half = cols / 2 * (PANEL.w + 0.02);
    const panelsIM = new THREE.InstancedMesh(new THREE.BoxGeometry(PANEL.w, 0.035, PANEL.l), M.panel, tables.length * cols * 2); panelsIM.name = 'pvPanels'; panelsIM.castShadow = true;
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, 0, 0)), mm = new THREE.Matrix4(); let k = 0;
    tables.forEach(tp => {
      for (let row = 0; row < 2; row++) for (let c = 0; c < cols; c++){
        const along = (row - 0.5) * (PANEL.l + 0.02);
        mm.compose(V(tp.x + (c - (cols - 1)/2) * (PANEL.w + 0.02), 1.15 + Math.sin(tilt) * (-along), tp.z + Math.cos(tilt) * along), q, V(1,1,1)); panelsIM.setMatrixAt(k++, mm);
      }
      [-half + 0.15, half - 0.15].forEach(ddx => [-1.7, 1.7].forEach(dz => { const legH = 1.15 + Math.sin(tilt) * (-dz) - 0.05; sysScene.add(box(0.06, legH, 0.06, M.pframe, tp.x + ddx, legH/2, tp.z + dz * Math.cos(tilt))); }));
    });
    panelsIM.instanceMatrix.needsUpdate = true; sysScene.add(panelsIM);
  }
  let updateFlows = () => {}, setOutage = () => {}, sysAnchors = {}, applySysMode = () => {}, getOutage = () => false;
  const PVS = { mode:'day', gen:false };
  if (SYS && SYS.type !== 'pv'){
    const n = SYS.count, step = W + 0.2;
    const essX = Array.from({ length:n }, (_, i) => (i - (n - 1)/2) * step);
    const lastX = essX[n - 1];
    essX.forEach(x => sysScene.add(exteriorCopy(x)));
    const STS_P = V(lastX + 1.9, 0, 0.05);
    const sts = new THREE.Group(); sts.position.copy(STS_P); sysScene.add(sts);
    sts.add(box(0.92, 0.1, 0.7, M.plinth, 0, 0.05, 0)); sts.add(box(0.9, 1.95, 0.68, M.sts, 0, 1.075, 0)); sts.add(box(0.7, 1.2, 0.01, M.stsFace, 0, 1.25, 0.345));
    sts.add(plane(0.5, 0.16, new THREE.MeshBasicMaterial({ map:texLabel(SYS.hub || 'STS','#FFFFFF'), transparent:true }), 0, 1.62, 0.352));
    const stsLed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 8), M.led.clone()); stsLed.position.set(-0.2, 1.38, 0.355); sts.add(stsLed);
    const stsLed2 = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 8), new THREE.MeshStandardMaterial({ color:0x6b7780, emissive:0x000000 })); stsLed2.position.set(0.2, 1.38, 0.355); sts.add(stsLed2);
    sts.add(box(0.035, 0.22, 0.03, M.black, 0.36, 1.1, 0.36));
    const EMS_P = V(STS_P.x, 0, D/2 + 0.5);
    const emsBox = new THREE.Group(); emsBox.position.copy(EMS_P); sysScene.add(emsBox);
    emsBox.add(box(0.06, 1.1, 0.06, M.pole, 0, 0.55, 0)); emsBox.add(box(0.5, 0.36, 0.08, M.ems, 0, 1.25, 0)); emsBox.add(plane(0.42, 0.3, M.emsScreen, 0, 1.25, 0.042));
    const LOAD_P = V(STS_P.x + 2.3, 0, 0.05);
    const loadG = new THREE.Group(); loadG.position.copy(LOAD_P); sysScene.add(loadG);
    loadG.add(box(1.5, 1.4, 1.2, M.load, 0, 0.7, 0)); loadG.add(box(1.6, 0.08, 1.3, M.plinth, 0, 1.44, 0));
    for (let i=0;i<3;i++) loadG.add(box(0.28, 0.32, 0.01, M.win, -0.45 + i*0.45, 0.92, 0.605));
    loadG.add(box(0.36, 0.62, 0.01, M.stsFace, 0, 0.31, 0.605));
    const GRID_P = V(STS_P.x, 0, -D/2 - 2.3);
    const pylon = new THREE.Group(); pylon.position.copy(GRID_P); sysScene.add(pylon);
    pylon.add(box(0.1, 3.2, 0.1, M.pole, 0, 1.6, 0)); pylon.add(box(1.3, 0.06, 0.08, M.pole, 0, 2.9, 0)); pylon.add(box(0.9, 0.06, 0.08, M.pole, 0, 2.5, 0));
    [-0.55, 0, 0.55].forEach(x => pylon.add(cyl(0.03, 0.14, M.white, x, 2.98, 0)));
    const polyPath = pts => { const cp = new THREE.CurvePath(); for (let i=0;i<pts.length-1;i++) cp.add(new THREE.LineCurve3(pts[i], pts[i+1])); return cp; };
    const Y = 0.03, zBus = D/2 + 0.32;
    const essPaths = essX.map(x => polyPath([ V(x, Y, D/2 + 0.05), V(x, Y, zBus), V(STS_P.x, Y, zBus), V(STS_P.x, Y, 0.42) ]));
    const loadPath = polyPath([ V(STS_P.x + 0.46, Y, 0.05), V(LOAD_P.x - 0.76, Y, 0.05) ]);
    const gridPath = polyPath([ V(GRID_P.x, Y, GRID_P.z + 0.1), V(STS_P.x, Y, -0.36) ]);
    const gridCableMat = M.cable.clone();
    [...essPaths, loadPath].forEach(p => sysScene.add(new THREE.Mesh(new THREE.TubeGeometry(p, 64, 0.018, 8, false), M.cable)));
    sysScene.add(new THREE.Mesh(new THREE.TubeGeometry(gridPath, 32, 0.018, 8, false), gridCableMat));
    const makeFlow = (path, k, color) => { const grp = new THREE.Group(); const mat = new THREE.MeshBasicMaterial({ color }); for (let i=0;i<k;i++) grp.add(new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), mat)); grp.userData = { path, n:k, mat }; sysScene.add(grp); return grp; };
    const flowsEss = essPaths.map(p => makeFlow(p, 7, 0x2E9A6A));
    // AC coupling: PV field behind the cabinets, string inverters feeding the same AC bus
    let flowsPV = [], pvC = null, invC = null;
    if (SYS.pvField){
      const pf = SYS.pvField, x0 = essX[0] - W/2, x1 = lastX + W/2, rows = pf.rows || 2, perRow = Math.max(1, Math.round((x1 - x0 + 1) / 5.4));
      const tables = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < perRow; c++) tables.push(V(x0 + (c + 0.5) * (x1 - x0) / perRow, 0, -D/2 - 4.4 - r * 4.6));
      addPvTables(tables, 4);
      const ni = pf.inverters || 0, invRows = Math.ceil(ni / 8), invS = [];
      for (let i = 0; i < ni; i++){
        const r = Math.floor(i / 8), k = i % 8, nk = Math.min(8, ni - r*8);
        const ip = V(x0 + (k + 0.5) * (x1 - x0) / nk, 0, -D/2 - 1.5 - r * 0.9); invS.push(ip);
        const g = new THREE.Group(); g.position.copy(ip); sysScene.add(g);
        [-0.35, 0.35].forEach(dx => g.add(box(0.05, 0.75, 0.05, M.pole, dx, 0.375, 0)));
        g.add(box(0.85, 0.62, 0.3, M.inv, 0, 1.06, 0)); g.add(box(0.14, 0.06, 0.01, M.screen, 0, 1.18, -0.155));
      }
      const zBus = -D/2 - 0.75;
      invS.forEach(ip => sysScene.add(new THREE.Mesh(new THREE.TubeGeometry(polyPath([ V(ip.x, Y, ip.z - 0.3), V(ip.x, Y, tables[0].z + 1.6) ]), 8, 0.012, 6, false), M.cable)));
      const pvPaths = invS.map(ip => polyPath([ V(ip.x, Y, ip.z + 0.1), V(ip.x, Y, zBus), V(STS_P.x - 0.3, Y, zBus), V(STS_P.x - 0.3, Y, -0.36) ]));
      pvPaths.forEach(p => sysScene.add(new THREE.Mesh(new THREE.TubeGeometry(p, 64, 0.016, 8, false), M.cable)));
      flowsPV = pvPaths.map(p => makeFlow(p, 6, 0xF0A63A));
      pvC = V((x0 + x1)/2, 2.6, tables[0].z - (rows - 1) * 2.3); invC = V((x0 + x1)/2, 1.7, invS.length ? invS[0].z : 0);
    }
    const flowLoad = makeFlow(loadPath, 6, 0xF0A63A);
    const flowGrid = makeFlow(gridPath, 8, 0xF0A63A);
    let outage = false; getOutage = () => outage;
    const moveFlow = (grp, time, dir) => { const { path, n:k } = grp.userData; grp.children.forEach((s, i) => { let u = ((time * 0.16) + i / k) % 1; if (dir < 0) u = 1 - u; s.position.copy(path.getPointAt(u)); s.position.y = 0.07; }); };
    updateFlows = time => {
      flowGrid.visible = !outage;
      flowsEss.forEach(f => { moveFlow(f, time, outage ? 1 : -1); f.userData.mat.color.set(outage ? 0x2fc4d6 : 0x2E9A6A); });
      moveFlow(flowLoad, time, 1); flowLoad.userData.mat.color.set(outage ? 0x2fc4d6 : 0xF0A63A);
      if (!outage) moveFlow(flowGrid, time, 1);
      flowsPV.forEach(f => moveFlow(f, time, 1));
    };
    setOutage = v => {
      outage = v;
      $('btnOutage').textContent = v ? 'Повернути мережу' : 'Імітувати відключення мережі';
      $('sdot').classList.toggle('off', v);
      $('stext').textContent = v ? (SYS.outageText || 'Мережі немає · навантаження живиться від шаф через STS') : 'Мережа є · навантаження живиться від мережі';
      gridCableMat.color.set(v ? 0xC8462B : 0x23313B);
      stsLed.material.emissive.set(v ? 0x000000 : 0x22c86a); stsLed.material.color.set(v ? 0x6b7780 : 0x2EE07A);
      stsLed2.material.emissive.set(v ? 0xE39B2D : 0x000000); stsLed2.material.color.set(v ? 0xF0B04A : 0x6b7780);
    };
    setOutage(false);
    $('btnOutage').addEventListener('click', () => setOutage(!outage));
    sysAnchors = { ess:() => V(0, H + 0.25, 0), sts:() => V(STS_P.x, 2.3, STS_P.z), emsS:() => V(EMS_P.x, 1.6, EMS_P.z), load:() => V(LOAD_P.x, 1.75, LOAD_P.z), grid:() => V(GRID_P.x, 3.35, GRID_P.z),
                   pvf:() => pvC || V(0, 2, -5), sinv:() => invC || V(0, 1.5, -2) };
    const cx = (essX[0] + LOAD_P.x) / 2;
    CAM.sys = SYS.cam ? { pos: A(SYS.cam[0]), tgt: A(SYS.cam[1]) } : { pos: V(cx - 0.9, 6.6, 13.6 + Math.max(0, n - 4) * 0.8), tgt: V(cx, 1.0, -0.5) };
  }

  if (SYS && SYS.type === 'pv'){
    // solar plant + storage on one hybrid inverter; layout tuned for an inverter on the left wall, mirrored for the right
    const invU = UNIT[SYS.invUnit] || UNITS.find(u => u.kind === 'inv');
    const ms = invU && invU.mount === 'right' ? -1 : 1, X = x => ms * x;
    const cab = exteriorCopy(0); sysScene.add(cab);
    if (invU){ const g = unitGroup(invU); g.position.copy(A(invU.pos)); sysScene.add(g); }
    const tables = [ V(X(-6.2), 0, -4.6), V(X(1.6), 0, -4.6), V(X(-6.2), 0, -9.4), V(X(1.6), 0, -9.4) ];
    addPvTables(tables, 6);
    const LOAD_P = V(X(4.6), 0, 0.6), GRID_P = V(X(4.6), 0, -2.3), GEN_P = V(X(-2.6), 0, 1.4);
    const loadG = new THREE.Group(); loadG.position.copy(LOAD_P); sysScene.add(loadG);
    loadG.add(box(1.8, 1.6, 1.4, M.load, 0, 0.8, 0)); loadG.add(box(1.9, 0.08, 1.5, M.plinth, 0, 1.64, 0));
    for (let i=0;i<3;i++) loadG.add(box(0.32, 0.36, 0.01, M.win, -0.55 + i*0.55, 1.05, 0.705));
    loadG.add(box(0.4, 0.7, 0.01, M.stsFace, 0, 0.35, 0.705));
    const pylon = new THREE.Group(); pylon.position.copy(GRID_P); sysScene.add(pylon);
    pylon.add(box(0.1, 3.2, 0.1, M.pole, 0, 1.6, 0)); pylon.add(box(1.3, 0.06, 0.08, M.pole, 0, 2.9, 0)); [-0.55, 0, 0.55].forEach(x => pylon.add(cyl(0.03, 0.14, M.white, x, 2.98, 0)));
    let genG = null;
    if (SYS.gen){ genG = new THREE.Group(); genG.position.copy(GEN_P); sysScene.add(genG);
      genG.add(box(1.3, 0.9, 0.75, M.gen, 0, 0.5, 0)); genG.add(box(1.36, 0.08, 0.8, M.plinth, 0, 0.04, 0)); genG.add(plane(0.5, 0.15, new THREE.MeshBasicMaterial({ map:texLabel('ДГУ','#FFFFFF'), transparent:true }), 0, 0.7, 0.38)); }
    const polyPath = pts => { const cp = new THREE.CurvePath(); for (let i=0;i<pts.length-1;i++) cp.add(new THREE.LineCurve3(pts[i], pts[i+1])); return cp; };
    const Y = 0.03, invX = X(-W/2 - 0.2), INV_IN = V(invX, Y, 0.12);
    const pvPaths = tables.map((tp, i) => polyPath([ V(tp.x + X(3.6), Y, tp.z), V(X(-1.6 + i * 0.12), Y, tp.z), V(X(-1.6 + i * 0.12), Y, 0.12), INV_IN ]));
    const loadPath = polyPath([ V(X(W/2 + 0.05), Y, 0.3), V(LOAD_P.x - X(0.95), Y, 0.3) ]);
    const gridPath = polyPath([ V(GRID_P.x, Y, GRID_P.z + 0.1), V(GRID_P.x, Y, -0.6), V(X(W/2 + 0.05), Y, -0.6) ]);
    const genPath = polyPath([ V(GEN_P.x + X(0.7), Y, GEN_P.z), V(X(-1.2), Y, GEN_P.z), V(X(-1.2), Y, 0.4), V(invX, Y, 0.4) ]);
    const gridCableMat = M.cable.clone();
    [...pvPaths, loadPath, ...(SYS.gen ? [genPath] : [])].forEach(p => sysScene.add(new THREE.Mesh(new THREE.TubeGeometry(p, 64, 0.02, 8, false), M.cable)));
    sysScene.add(new THREE.Mesh(new THREE.TubeGeometry(gridPath, 32, 0.02, 8, false), gridCableMat));
    const makeFlow = (path, k, color) => { const grp = new THREE.Group(); const mat = new THREE.MeshBasicMaterial({ color }); for (let i=0;i<k;i++) grp.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), mat)); grp.userData = { path, n:k, mat }; sysScene.add(grp); return grp; };
    const fPV = pvPaths.map(p => makeFlow(p, 10, 0xF0A63A));
    const fLoad = makeFlow(loadPath, 6, 0x2fc4d6), fGrid = makeFlow(gridPath, 8, 0x4ABED8), fGen = makeFlow(genPath, 8, 0x4CC28C);
    const moveFlow = (grp, time, speed=0.12) => { const { path, n:k } = grp.userData; grp.children.forEach((sp, i) => { sp.position.copy(path.getPointAt(((time * speed) + i / k) % 1)); sp.position.y = 0.09; }); };
    updateFlows = time => {
      const day = PVS.mode !== 'eve';
      fPV.forEach(f => { f.visible = day; if (day) moveFlow(f, time, 0.06); });
      moveFlow(fLoad, time);
      fGrid.visible = PVS.mode === 'eve'; if (fGrid.visible) moveFlow(fGrid, time);
      fGen.visible = PVS.gen; if (PVS.gen) moveFlow(fGen, time);
    };
    const STATUS = { day:['dot', 'День: СЕС живить об\'єкт і заряджає батарею'], eve:['dot', 'Вечір: батарея живить об\'єкт'], out:['dot off', SYS.backup ? `Мережі немає: резерв за ${SYS.backup}` : 'Мережі немає: інвертор живить об\'єкт від батареї'], gen:['dot off', 'Мережі немає: ДГУ заряджає батарею'] };
    applySysMode = () => {
      const night = PVS.mode === 'eve' && mode === 'sys';
      sun.intensity = night ? 0.3 : 1.6; sun.color.set(night ? 0xffb27a : 0xffffff); hemi.intensity = night ? 0.25 : 0.6;
      renderer.toneMappingExposure = night ? 0.62 : 1.05; stage.classList.toggle('night', night);
      M.win.emissiveIntensity = night ? 1.8 : 0.5;
      const key = PVS.gen ? 'gen' : PVS.mode, pw = (SYS.power || {})[key] || {};
      sysPins.forEach(({p, el}) => { el.querySelector('.t').textContent = pw[p.id] ? `${p.name} · ${pw[p.id]}` : p.name; });
      gridCableMat.color.set(PVS.mode === 'out' ? 0xC8462B : 0x23313B);
      $('sdot').className = STATUS[key][0]; $('stext').textContent = STATUS[key][1];
      ['mDay','mEve','mOut'].forEach((id, i) => $(id).setAttribute('aria-pressed', ['day','eve','out'][i] === PVS.mode ? 'true' : 'false'));
      if ($('mGen')) $('mGen').setAttribute('aria-pressed', PVS.gen ? 'true' : 'false');
      renderRail();
    };
    [['mDay','day'],['mEve','eve'],['mOut','out']].forEach(([id, m]) => $(id).addEventListener('click', () => { PVS.mode = m; if (m !== 'out') PVS.gen = false; applySysMode(); }));
    if ($('mGen')) $('mGen').addEventListener('click', () => { PVS.gen = !PVS.gen; if (PVS.gen) PVS.mode = 'out'; applySysMode(); });
    sysAnchors = { scab:() => V(0, H + 0.3, 0), sinv:() => V(invX - X(0.1), 2.0, 0.12), spv:() => V(X(-5.0), 2.5, -4.6), sload:() => V(LOAD_P.x, 2.0, LOAD_P.z), sgrid:() => V(GRID_P.x, 3.35, GRID_P.z), sgen:() => V(GEN_P.x, 1.2, GEN_P.z) };
    CAM.sys = { pos: V(X(9.5), 6.5, 13.5), tgt: V(X(-0.8), 0.8, -3.2) };
  }


  /* ---------- backup power scheme: who switches the load when the grid fails (C.meta from site/catalog.json) ---------- */
  const META = C.meta;
  const resScene = new THREE.Group(); resScene.name = 'backupScheme'; resScene.visible = false; scene.add(resScene);
  let RES = null, updateRes = () => {}, resAnchors = {}, setRes = () => {}, RES_MODE = () => 'grid';
  if (META && !META.noRes){
    const BK = META.backup, Y = 0.03, US = META.market === 'US';
    resScene.add(exteriorCopy(0));
    UNITS.filter(u => u.outside).forEach(u => { const g = unitGroup(u); g.position.copy(A(u.pos)); resScene.add(g); });
    const bb = new THREE.Box3().setFromObject(resScene);
    const minX = bb.min.x, maxX = bb.max.x, minZ = bb.min.z, maxZ = bb.max.z, topY = bb.max.y;
    const route = (a, b) => { const cp = new THREE.CurvePath(); const m = V(a.x, Y, b.z); if (a.distanceTo(m) > 1e-3) cp.add(new THREE.LineCurve3(a, m)); if (m.distanceTo(b) > 1e-3) cp.add(new THREE.LineCurve3(m, b)); return cp; };
    const tag3 = txt => { const m = new THREE.MeshBasicMaterial({ map:texLabel(txt, '#1C3D5A', '#F4F6F7') }); m.name = 'label'; return m; };
    const boxAt = (x, z, w, h, d, mat, txt) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.add(box(w, 0.08, d, M.plinth, 0, 0.04, 0)); g.add(box(w * 0.98, h, d * 0.98, mat, 0, 0.08 + h/2, 0));
      if (txt) g.add(plane(Math.min(0.62, w * 0.86), Math.min(0.2, w * 0.28), tag3(txt), 0, 0.08 + h * 0.78, d * 0.49 + 0.004)); resScene.add(g); return g; };
    // where the load is switched over
    const xR = maxX + 1.8, swU = META.sw ? UNIT[META.sw] : null;
    let SW, swTop, ESSP = null;
    if (BK === 'sts' || BK === 'dc'){
      boxAt(xR, 0.1, 0.9, 1.9, 0.75, BK === 'sts' ? M.sts : M.pcs, BK === 'sts' ? 'STS' : 'PCS ?');
      SW = V(xR, Y, 0.55); swTop = V(xR, 2.25, 0.1); ESSP = V(maxX + 0.02, Y, 0.1);
    } else if (swU && swU.outside){
      const pu = A(swU.pos); SW = V(pu.x, Y, Math.max(pu.z, 0) + swU.size[2] / 2 + 0.3); swTop = V(pu.x, pu.y + swU.size[1] / 2 + 0.3, pu.z);
      ESSP = V((minX + Math.min(maxX, pu.x - swU.size[0])) / 2, Y, maxZ + 0.25);
    } else {
      const pu = swU ? A(swU.pos) : V(maxX - 0.4, 1.2, 0); SW = V(pu.x, Y, maxZ + 0.3); swTop = V(pu.x, topY + 0.35, pu.z);
    }
    let BATP = null;
    if (META.category === 'pcs'){ const bx = minX - 1.4; boxAt(bx, 0.1, 1.0, 2.0, 0.9, M.module, 'BATTERY'); BATP = V(bx, Y, 0.6); ESSP = BATP; }
    // grid, ATS, genset, critical load
    const LX = Math.max(xR, maxX) + 4.2, LZ = 0.9;
    const loadG = new THREE.Group(); loadG.position.set(LX, 0, LZ); resScene.add(loadG);
    loadG.add(box(1.8, 1.6, 1.4, M.load, 0, 0.8, 0)); loadG.add(box(1.9, 0.08, 1.5, M.plinth, 0, 1.64, 0));
    for (let i = 0; i < 3; i++) loadG.add(box(0.32, 0.36, 0.01, M.win, -0.55 + i * 0.55, 1.05, 0.705));
    const LOADP = V(LX - 0.95, Y, LZ);
    const GRIDP = V(xR, Y, minZ - 2.6);
    const pylon = new THREE.Group(); pylon.position.set(xR, 0, minZ - 2.7); resScene.add(pylon);
    pylon.add(box(0.1, 3.2, 0.1, M.pole, 0, 1.6, 0)); pylon.add(box(1.3, 0.06, 0.08, M.pole, 0, 2.9, 0)); [-0.55, 0, 0.55].forEach(x => pylon.add(cyl(0.03, 0.14, M.white, x, 2.98, 0)));
    const ats = META.gen === 'ats', ATSP = V(xR, Y, minZ - 1.25);
    if (ats){ const a = boxAt(xR, minZ - 1.25, 0.6, 0.85, 0.38, M.dist, 'ATS'); a.add(box(0.08, 0.6, 0.08, M.pole, 0, -0.2, 0)); }
    const GX = xR + 3.4, GZ = minZ - 1.6;
    const genG = new THREE.Group(); genG.position.set(GX, 0, GZ); resScene.add(genG);
    genG.add(box(1.3, 0.9, 0.75, M.gen, 0, 0.5, 0)); genG.add(box(1.36, 0.08, 0.8, M.plinth, 0, 0.04, 0));
    genG.add(plane(0.5, 0.15, new THREE.MeshBasicMaterial({ map:texLabel('ДГУ', '#FFFFFF'), transparent:true }), 0, 0.72, 0.38));
    const GENP = V(GX - 0.68, Y, GZ);
    // cables and flows
    const gridMat = M.cable.clone();
    const segs = {};
    const seg = (k, a, b, mat = M.cable) => { const path = route(a, b); segs[k] = path; resScene.add(new THREE.Mesh(new THREE.TubeGeometry(path, 48, 0.022, 8, false), mat)); };
    if (ats){ seg('grid', GRIDP, ATSP, gridMat); seg('gen', GENP, ATSP); seg('ats', ATSP, SW); }
    else { seg('grid', GRIDP, SW, gridMat); seg('gen', GENP, SW); }
    seg('load', SW, LOADP);
    if (ESSP && ESSP.distanceTo(SW) > 0.35) seg('ess', ESSP, SW);
    const FL = {};
    for (const [k, path] of Object.entries(segs)){
      const grp = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color:0xF0A63A }), n = Math.max(4, Math.round(path.getLength() / 0.7));
      for (let i = 0; i < n; i++) grp.add(new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), mat));
      grp.userData = { path, n, mat }; resScene.add(grp); FL[k] = grp;
    }
    const swLed = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), new THREE.MeshStandardMaterial({ color:0x2EE07A, emissive:0x22c86a, emissiveIntensity:1.2 }));
    swLed.position.copy(swTop).add(V(0, -0.15, 0)); resScene.add(swLed);
    const RS = { mode:'grid' }; RES_MODE = () => RS.mode;
    const move = (k, time, dir, color) => { const g = FL[k]; if (!g) return; g.visible = true; g.userData.mat.color.set(color); const { path, n } = g.userData;
      g.children.forEach((sp, i) => { let u = ((time * 0.14) + i / n) % 1; if (dir < 0) u = 1 - u; sp.position.copy(path.getPointAt(u)); sp.position.y = 0.09; }); };
    const ORANGE = 0xF0A63A, CYAN = 0x2fc4d6, GREEN = 0x4CC28C, CHG = 0x2E9A6A;
    updateRes = time => {
      Object.values(FL).forEach(g => { g.visible = false; });
      const m = RS.mode, dc = BK === 'dc';
      if (m === 'grid'){ move('grid', time, 1, ORANGE); if (ats) move('ats', time, 1, ORANGE); move('load', time, 1, ORANGE); move('ess', time, -1, CHG); }
      else if (m === 'out'){ move('ess', time, 1, CYAN); move('load', time, 1, CYAN); }
      else { move('gen', time, 1, GREEN); if (ats) move('ats', time, 1, GREEN); move('load', time, 1, GREEN); move('ess', time, -1, CHG); }
      if (dc && m === 'out' && !(META.compat?.list || []).some(x => x.fit === 'ok')) FL.load && (FL.load.visible = false);
    };
    const T = META.time || '';
    const outText = {
      builtin: `Мережі немає · ${META.switch} сам переводить навантаження на батарею (${T})`,
      sts: `Мережі немає · STS перемикає навантаження на шафи (${T})`,
      bypass: `Мережі немає · ${META.switch} переводить контейнер в автономний режим (${T})`,
      dc: `Мережі немає · батарея живить навантаження лише через зовнішній PCS`,
    }[BK];
    const genText = ats ? 'Працює ДГУ · ATS перемкнув вхід з мережі на генератор; навантаження й заряд батареї — від ДГУ'
                        : 'Працює ДГУ · генератор підключено до входу GEN інвертора; навантаження й заряд батареї — від ДГУ';
    setRes = m => {
      RS.mode = m;
      gridMat.color.set(m === 'grid' ? 0x23313B : 0xC8462B);
      swLed.material.color.set(m === 'grid' ? 0x2EE07A : m === 'out' ? 0x2fc4d6 : 0x4CC28C); swLed.material.emissive.copy(swLed.material.color);
      $('sdot').className = m === 'grid' ? 'dot' : 'dot off';
      $('stext').textContent = m === 'grid' ? 'Мережа є · навантаження від мережі, батарея заряджається' : m === 'out' ? outText : genText;
      [['rGrid', 'grid'], ['rOut', 'out'], ['rGen', 'gen']].forEach(([id, k]) => { if ($(id)) $(id).setAttribute('aria-pressed', RS.mode === k ? 'true' : 'false'); });
      renderRail();
    };
    // rail texts
    const ico = { ok:'✓', part:'⚠', no:'✗' };
    const compatHtml = META.compat ? `<div class="compat"><b>${esc(META.compat.battery || META.compat.pcs)}</b><ul>` +
      META.compat.list.map(x => `<li class="f-${x.fit}"><span>${ico[x.fit]}</span> ${esc(x.label)}<small>${esc(x.why)}</small></li>`).join('') +
      '</ul><small>Сумісність лише за напругою батареї з даташитів; потужність і струм треба перевірити окремо.</small></div>' : '';
    const swName = { builtin: META.switch, sts: META.switch, bypass: META.switch, dc: META.switch }[BK];
    const parts = [
      { id:'res_ess', name: META.essName || C.model, text: META.essText ? META.essText : { builtin: 'Батарея і гібридний перетворювач: при відключенні мережі навантаження живиться без зовнішнього перемикача.', sts: 'Шафи з PCS: PCS працює й автономно, а безперервне живлення критичного навантаження дає STS.', bypass: 'Контейнер: перемикання між мережевим і автономним режимом робить Bypass усередині.', dc: 'Батарея постійного струму: без PCS вона не живить навантаження змінного струму.' }[BK] + (META.category === 'pcs' ? ' Батарея — зовнішня.' : ''), kv: [] },
      { id:'res_sw', name: swName, text: `Перемикання: ${T}. Джерело: ${META.source}.` + (META.warn ? ' ' + META.warn : ''), kv: [], html: META.category !== 'pcs' ? compatHtml : '' },
      ...(META.category === 'pcs' ? [{ id:'res_bat', name:'Батарея (зовнішня)', text:'PCS працює з батарейною стійкою або кластером. Сумісні батареї — нижче.', kv:[], html: compatHtml }] : []),
      { id:'res_grid', name: US ? 'Мережа 208–240 В' : 'Мережа 0,4 кВ', text:'Основне живлення; від мережі заряджається батарея.', kv:[] },
      ...(ats ? [{ id:'res_ats', name:'ATS мережа ↔ ДГУ (стороннє обладнання)', text:'Автоматичний перемикач вводу: при зникненні мережі запускає й підключає ДГУ. Ставиться між мережею й генератором; у постачання виробника не входить. ' + ((SITE.catalog && SITE.catalog.ats) || ''), kv:[] }] : []),
      { id:'res_gen', name:'ДГУ (опція)', text: ats ? 'Генератор підключається через ATS.' : 'Генератор підключається до входу GEN інвертора або PCS.', kv:[] },
      { id:'res_load', name:'Критичне навантаження', text:'Споживачі, які мають працювати й під час відключення мережі.', kv:[] },
    ];
    RES = { title:'Резервне живлення', crumb:`${C.model} · резерв`, parts,
      text: META.typeText || { builtin:'Тип: вбудований перехід у гібридному інверторі.', sts:'Тип: PCS + STS.', bypass:'Тип: Bypass у контейнері.', dc:'Тип: батарея без PCS — потрібен зовнішній перетворювач.' }[BK],
      html: compatHtml && META.category !== 'pcs' ? compatHtml : '',
      caption: 'Схема резерву: що перемикає навантаження, коли зникає мережа. STS, ATS, ДГУ, трансформатор і об\'єкт — стороннє обладнання, якщо не сказано інше; їх вигляд умовний.',
      modeText: () => ({ grid:'Зараз: мережа є.', out:'Зараз: відключення мережі. ' + outText.split('·')[1], gen:'Зараз: працює ДГУ.' }[RS.mode]) };
    resAnchors = { res_ess: () => V((minX + maxX) / 2, topY + 0.35, 0), res_sw: () => swTop.clone().add(V(0, 0.15, 0)), res_bat: () => (BATP || V(0,0,0)).clone().setY(2.4),
      res_grid: () => V(xR, 3.4, minZ - 2.7), res_ats: () => V(xR, 1.35, minZ - 1.25), res_gen: () => V(GX, 1.3, GZ), res_load: () => V(LX, 2.0, LZ) };
    [['rGrid', 'grid'], ['rOut', 'out'], ['rGen', 'gen']].forEach(([id, k]) => { if ($(id)) $(id).addEventListener('click', () => setRes(k)); });
    const rb = new THREE.Box3().setFromObject(resScene), rc = rb.getCenter(V(0,0,0)), rs = rb.getSize(V(0,0,0));
    const dist = Math.max(rs.x * 1.3, rs.z * 1.6, 7) + 3;
    CAM.res = { pos: rc.clone().add(V(0.15 * dist, 0.62 * dist, 0.78 * dist)), tgt: V(rc.x, 0.6, rc.z + 0.3) };
    $('btnReset3').addEventListener('click', () => { const c = camFor('res'); flyTo(c.pos, c.tgt); });
  }

  /* ---------- pins ---------- */
  function makePin(n, label, onClick, cls=''){ const b = document.createElement('button'); b.className = 'pin ' + cls; b.type = 'button'; b.innerHTML = `<span class="n">${n}</span><span class="t">${esc(label)}</span>`; b.addEventListener('click', onClick); pinsEl.appendChild(b); return b; }
  const hingeLocal = (x,y,z) => () => hinge.localToWorld(V(x,y,z));
  const openIdle = () => S.explodeT > 0.55 || ((S.door || OPEN) && !pulledId() && !S.fire && (OPEN || S.doorT > 0.9));
  const rowN = id => ROWS.findIndex(r => r[0] === id) + 1;
  const pinOff = C.pinOffset || {};
  const PINS = [
    ...(hinge ? [{ id:'door', n:rowN('door'), label:INFO.door.name, at:hingeLocal(SIDE * (DW - 0.035), H * 0.64, 0.05), show:() => S.sel === 'door' && S.doorT < 0.1, go:() => selectRow('door') }] : []),
    ...(acG ? [{ id:'ac', n:rowN('ac') || rowN('door'), label:INFO.ac?.short || INFO.ac?.name || 'Кондиціонер', at:() => acG.localToWorld(V(0, 0.05, -0.1)), show:() => S.sel === 'ac' || (openIdle() && S.explodeT < 0.1), go:() => selectRow('ac') }] : []),
    ...(NM ? [{ id:'mods', n:rowN('mods'), label:INFO.mods?.name || 'Батарейні модулі', at:() => partWorld('mod' + (NM - 1), tmp2).clone().add(V(0, 0.2, 0.3)), show:openIdle, go:() => selectRow('mods') }] : []),
    ...MODS.map((_, i) => ({ id:'mod'+i, n:rowN('mods'), label:`${INFO.mod.short || 'Модуль'} ${modNo(i)}`, at:() => partWorld('mod'+i, tmp2).clone().add(V(-MW*0.37, MH*0.7, MD*0.44)), show:() => S.sel === 'mod'+i, go:() => {} })),
    ...(CELL ? [{ id:'cell', n:'·', label:INFO.cell.name, at:() => { const m = MODS[S.cellMod ?? 0]; const b = m.base[Math.max(0, m.cell)]; return partWorld('mod'+(S.cellMod ?? 0), tmp2).clone().add(V(b.x, b.y + 0.34*ease(m.lift) + 0.14, b.z)); }, show:() => S.sel === 'cell', go:() => {} }] : []),
    ...UNITS.map(u => ({ id:u.id, n:rowN(u.id), label:INFO[u.id].short || INFO[u.id].name, at:() => partWorld(u.id, tmp2).clone().add(A(pinOff[u.id] || [0, u.size[1]/2 + 0.07, 0.3])),
      show: u.outside ? () => (S.sel !== u.id && !S.fire && !pulledId() && S.sel !== 'cell' && (u.mount === 'right' ? 1 : -1) * (camera.position.x - controls.target.x) > -0.4) || S.explodeT > 0.55
                      : () => S.sel === u.id || openIdle(), go:() => selectRow(u.id), lab: !!u.outside })),
    ...UNITS.flatMap(u => (u.pins || []).map((q, k) => ({ id:`${u.id}_p${k}`, n:q.n, label:q.label, at:() => P[u.id].group.localToWorld(A(q.at)), show:() => S.sel === u.id && P[u.id].t > 0.6, cls:q.left ? 'left' : '', go:() => {}, lab:true }))),
    ...(FPIN.length ? [{ id:'firep', n:rowN('fire'), label:INFO.fire.short || 'Пожежогасіння', at:() => FPIN[0].anchor.getWorldPosition(tmp2).clone().add(V(0, 0.12, 0)), show:() => S.explodeT > 0.55, go:() => selectRow('fire') }] : []),
    ...(door.emsAt ? [{ id:'ems', n:rowN('ems'), label:'EMS', at:() => emsG.localToWorld(V(0, 0.22, -0.05)), show:() => S.sel === 'ems' || openIdle(), go:() => selectRow('ems') }] : []),
    ...(dehum ? [{ id:'dehumid', n:rowN('dehumid'), label:INFO.dehumid.short || INFO.dehumid.name, at:() => dehum.localToWorld(V(0, 0.13, -0.05)), show:() => S.sel === 'dehumid' || openIdle(), go:() => selectRow('dehumid') }] : []),
    ...FPIN.map(({ f, anchor }, i) => ({ id:'f'+i, n:i+1, label:f.label, at:() => anchor.getWorldPosition(tmp2).clone().add(A(f.pin || [0, 0.1, 0])), show:() => S.fire && !S.explode, cls:'fire' + (f.left ? ' left' : ''), go:() => {} })),
  ];
  PINS.forEach(p => { p.el = makePin(p.n, p.label, () => p.go(), p.cls || ''); });
  const resPins = RES ? RES.parts.map((p, i) => ({ p, el: makePin(i+1, p.name, () => selectRow(p.id), 'lab') })) : [];
  const sysPins = SYS ? SYS.parts.map((p, i) => ({ p, el: makePin(i+1, p.name, () => selectRow(p.id), SYS.type === 'pv' ? 'lab' + (p.id === 'sgrid' ? ' left' : '') : '') })) : [];
  function placePin(el, w){ const r = stage.getBoundingClientRect(); tmp.copy(w).project(camera); if (tmp.z > 1 || Math.abs(tmp.x) > 1.05 || Math.abs(tmp.y) > 1.05){ el.hidden = true; return; } el.hidden = false; el.style.left = ((tmp.x + 1) / 2 * r.width) + 'px'; el.style.top = ((1 - tmp.y) / 2 * r.height) + 'px'; }
  function updatePins(){
    PINS.forEach(p => { const vis = mode === 'cab' && p.show(); if (!vis){ p.el.hidden = true; return; } placePin(p.el, p.at()); p.el.classList.toggle('active', S.sel === p.id || (p.id === 'cell' && S.sel === 'cell')); p.el.classList.toggle('lab', !!p.lab || S.explodeT > 0.55 || S.fire || p.id === 'cell' || p.id.startsWith('mod')); });
    sysPins.forEach(({p, el}) => { if (mode !== 'sys'){ el.hidden = true; return; } placePin(el, sysAnchors[p.id]()); el.classList.toggle('active', S.sel === p.id); });
    resPins.forEach(({p, el}) => { if (mode !== 'res'){ el.hidden = true; return; } placePin(el, resAnchors[p.id]()); el.classList.toggle('active', S.sel === p.id); });
  }

  /* ---------- mode switching ---------- */
  // system and backup scenes are framed for a wide stage; on a narrow (phone) stage pull the camera back
  function camFor(m){
    const c = CAM[m], k = m === 'cab' ? 1 : Math.min(1.6, Math.max(1, 1.25 / camera.aspect));
    return { pos: c.tgt.clone().add(c.pos.clone().sub(c.tgt).multiplyScalar(k)), tgt: c.tgt };
  }
  const capText = () => mode === 'cab' ? C.caption : (mode === 'res' ? RES : SYS).caption;
  function setMode(m){
    mode = m; S.sel = null; S.ems = false;
    stage.dataset.mode = m;
    $('tabCab').classList.toggle('on', m === 'cab'); $('tabCab').setAttribute('aria-selected', m === 'cab');
    ['Sys', 'Res'].forEach(k => { const t = $('tab' + k); if (t){ t.classList.toggle('on', m === k.toLowerCase()); t.setAttribute('aria-selected', m === k.toLowerCase()); } });
    cabScene.visible = m === 'cab'; sysScene.visible = m === 'sys'; resScene.visible = m === 'res';
    $('barCab').hidden = m !== 'cab'; $('barSys').hidden = m !== 'sys'; $('barRes').hidden = m !== 'res'; $('status').hidden = m === 'cab';
    $('cap').textContent = capText();
    const cv = camFor(m);
    controls.minDistance = m === 'cab' ? 1.2 : 3; controls.maxDistance = m === 'cab' ? CAB_MAX : Math.max(24, cv.pos.distanceTo(cv.tgt) * 1.3);
    flyTo(cv.pos, cv.tgt, 0.8);
    if (m !== 'cab') setSpin(false);
    applySysMode();
    if (m === 'res') setRes(RES_MODE());
    if (m === 'sys' && SYS.type !== 'pv') setOutage(getOutage());
    renderRail();
  }
  $('cap').textContent = capText();
  stage.dataset.mode = 'cab';
  $('tabCab').addEventListener('click', () => setMode('cab'));
  if ($('tabSys')) $('tabSys').addEventListener('click', () => setMode('sys'));
  if ($('tabRes')) $('tabRes').addEventListener('click', () => setMode('res'));

  /* ---------- loop ---------- */
  function resize(){ const r = stage.getBoundingClientRect(); const w = Math.max(1, r.width), h = Math.max(1, r.height); renderer.setSize(w, h, false); if (!camera.view || !camera.view.enabled) camera.aspect = w / h; camera.updateProjectionMatrix(); }
  new ResizeObserver(resize).observe(stage); resize();
  const approach = (v, t, rate, dt) => Math.abs(t - v) < 0.0005 ? t : v + (t - v) * Math.min(1, dt * rate);
  const clock = new THREE.Clock();
  let started = false;
  function frame(){
    const dt = Math.min(0.05, clock.getDelta()), time = clock.elapsedTime;
    const RT = reduceMotion ? 60 : 3.2;
    if (camTween){ camTween.t += dt / camTween.dur; const k = ease(Math.min(1, camTween.t)); camera.position.lerpVectors(camTween.p0, camTween.p1, k); controls.target.lerpVectors(camTween.t0, camTween.t1, k); if (camTween.t >= 1) camTween = null; }
    S.doorT = approach(S.doorT, S.door, RT * 0.8, dt);
    S.explodeT = approach(S.explodeT, S.explode, RT, dt);
    S.xrayT = approach(S.xrayT, S.xray, RT, dt);
    Object.values(P).forEach(p => { p.t = approach(p.t, p.target, RT, dt); });
    MODS.forEach(m => { m.lid = approach(m.lid, m.lidTarget, RT, dt); m.lift = approach(m.lift, m.liftTarget, RT, dt); if (m.cell >= 0 && m.lift < 0.001 && m.liftTarget === 0){ const b = m.base[m.cell]; m4.makeTranslation(b.x, b.y, b.z); m.cells.setMatrixAt(m.cell, m4); m.cells.setColorAt(m.cell, WHITE); m.cells.instanceColor.needsUpdate = true; m.cells.instanceMatrix.needsUpdate = true; m.cell = -1; } });
    if (S.fireTest > 0) S.fireTest = Math.max(0, S.fireTest - dt);
    $('crumb').classList.toggle('alarm', S.fireTest > 0);
    if (moveQueued && mode === 'cab' && !camTween){ const h = hitAt(moveQueued[0], moveQueued[1]); const id = h ? h.object.userData.part : null; S.hover = (id && id !== 'shell') ? id : (id === 'shell' && !S.door ? 'door' : null); canvas.classList.toggle('hot', !!S.hover); moveQueued = null; }
    apply();
    if (sysScene.visible) updateFlows(time);
    if (resScene.visible) updateRes(time);
    controls.update();
    renderer.render(scene, camera);
    updatePins();
    if (!started){ started = true; $('loading').hidden = true; }
  }

  /* ---------- video timeline (#video) ---------- */
  const VT = C.video || {};
  const vPcs = VT.unit || unitIds.find(id => /pcs/.test(id)) || unitIds[0];
  const vMod = Math.floor(NM / 2);
  const KF = [
    [0,    [4.6, 2.3, 5.4], [0, 1.15, 0.1]],
    [3.5,  [3.7, 2.2, 5.9], [0, 1.15, 0.1]],
    [5.5,  [2.7, 2.0, 4.7], [0, 1.2, 0.4]],
    [7.0,  null, null],
    [8.8,  null, null],
    [10.6, [1.35, 2.6, 2.55], [0, 1.4, 0.92]],
    [12.2, [1.05, 2.35, 2.05], [0, 1.4, 0.92]],
    [13.6, [0.95, 2.38, 2.05], [0.09, 1.66, 0.92]],
    [15.2, [0.95, 2.38, 2.05], [0.09, 1.66, 0.92]],
    [16.6, [2.7, 2.0, 4.7], [0, 1.2, 0.4]],
    [17.8, [2.6, 2.1, 5.6], [0.05, 1.45, 0.05]],
    [20.0, [2.25, 2.05, 5.3], [0.05, 1.45, 0.05]],
    [22.2, [6.0, 3.5, 7.0], [-0.1, 1.45, 0.5]],
    [25.0, [7.6, 3.5, 4.8], [-0.1, 1.45, 0.5]],
  ].map(([t, p, g]) => {
    if (p) return [t, sc(p), sc(g)];
    const u = P[vPcs] ? P[vPcs].p0.clone().add(P[vPcs].pull) : V(0, 0.5, 0.8);   // look at the pulled unit
    return [t, u.clone().add(mv(1.78, 1.0, 2.2)), u];
  });
  // modules: point the 10.6–15.2 s shots at the middle module
  { const mt = V(R.x ?? 0, modY(vMod) + 0.02, R.z + pullZ), ref = sc([0, 1.4, 0.92]);
    for (const k of [5,6,7,8]){ const off = KF[k][1].clone().sub(KF[k][2]); KF[k][2] = mt.clone().add(KF[k][2].clone().sub(ref)); KF[k][1] = KF[k][2].clone().add(off); } }
  function camAt(t){
    let i = 0; while (i < KF.length - 2 && t > KF[i+1][0]) i++;
    const [t0, p0, g0] = KF[i], [t1, p1, g1] = KF[i+1];
    const k = ease(clamp01((t - t0) / (t1 - t0)));
    return [p0.clone().lerp(p1, k), g0.clone().lerp(g1, k)];
  }
  const seg = (t, a, b) => clamp01((t - a) / (b - a));
  const VTT = VT.titles || {};
  window.renderAt = function(t){
    stage.classList.add('lab-on');
    const vth = $('vth'), vts = $('vts');
    if (t < 25 || !SYS){
      if (mode !== 'cab'){ mode = 'cab'; cabScene.visible = true; sysScene.visible = false; }
      if (!camera.view || !camera.view.enabled){ camera.aspect = 1720/720; camera.setViewOffset(1720, 720, 0, 0, 1280, 720); }
      S.doorT = seg(t, 3.5, 5.5) - seg(t, 16.7, 17.5);
      S.xrayT = seg(t, 16.9, 17.7) - seg(t, 20.2, 20.8);
      if (P[vPcs]) P[vPcs].t = seg(t, 5.6, 6.8) - seg(t, 8.6, 9.5);
      const vm = MODS[vMod], vk = 'mod' + vMod;
      if (vm){ P[vk].t = seg(t, 9.6, 10.8) - seg(t, 15.6, 16.5); vm.lid = seg(t, 11.0, 12.2) - seg(t, 15.1, 15.8); }
      if (vm && vm.cells){
      if (t >= 12.4 && t < 15.3){ vm.cell = midCell; vm.lift = seg(t, 12.4, 13.4) - seg(t, 14.4, 15.1); vm.cells.setColorAt(vm.cell, SEL_CELL); S.cellMod = vMod; }
      else { if (vm.cell >= 0){ const b = vm.base[vm.cell]; m4.makeTranslation(b.x, b.y, b.z); vm.cells.setMatrixAt(vm.cell, m4); vm.cells.setColorAt(vm.cell, WHITE); } vm.cell = -1; vm.lift = 0; }
      vm.cells.instanceColor.needsUpdate = true; vm.cells.instanceMatrix.needsUpdate = true;
      }
      S.fire = t >= 17.4 && t < 20.4; S.fireTest = (t >= 18.4 && t < 20.4) ? 20.4 - t : 0;
      S.explodeT = seg(t, 20.4, 22.2); S.explode = S.explodeT > 0.5 ? 1 : 0;
      Object.values(P).forEach(p => { p.target = p.t > 0.01 ? 1 : 0; });
      S.door = S.doorT > 0.5 ? 1 : 0;
      S.sel = (t >= 5.6 && t < 9.5) ? vPcs : (t >= 9.6 && t < 12.4) ? vk : (t >= 12.4 && t < 15.1) ? 'cell' : (t >= 15.1 && t < 16.5) ? vk : null;
      const [cp, ct] = camAt(Math.min(t, 25)); camera.position.copy(cp); camera.lookAt(ct); controls.target.copy(ct);
      const T = t < 3.5 ? VTT.intro : t < 5.6 ? VTT.open : t < 9.6 ? VTT.unit : t < 12.4 ? VTT.module : t < 15.3 ? VTT.cell : t < 17.4 ? VTT.back : t < 20.4 ? VTT.fire : VTT.explode;
      vth.textContent = T ? T[0] : C.model; vts.textContent = T ? T[1] : '';
    } else {
      if (mode !== 'sys'){ mode = 'sys'; cabScene.visible = false; sysScene.visible = true; camera.clearViewOffset(); camera.aspect = 1280/720; camera.updateProjectionMatrix(); }
      const tt = t - 25;
      if (SYS.type === 'pv'){ PVS.mode = tt > 4 ? 'out' : 'day'; PVS.gen = false; applySysMode(); } else setOutage(tt > 4);
      const tgt = CAM.sys.tgt.clone().add(V(-0.1, 0.05, 0.1));
      const ang = 0.08 + 0.22 * clamp01(tt/8), rad = 12.2 - 1.2 * clamp01(tt/8), hgt = 6.2 - 0.6 * clamp01(tt/8);
      camera.position.set(tgt.x + Math.sin(ang)*rad, hgt, tgt.z + Math.cos(ang)*rad); camera.lookAt(tgt); controls.target.copy(tgt);
      updateFlows(t);
      const T = tt > 4 ? VTT.outage : VTT.system;
      vth.textContent = T ? T[0] : SYS.title; vts.textContent = T ? T[1] : '';
    }
    apply();
    renderer.render(scene, camera);
    updatePins();
    $('loading').hidden = true;
    return true;
  };

  // test hooks
  window.__ess = { act, selectRow, setMode, pull, S, P, exportGlb, exportUsdz, CAM, camera, controls, setRes };
  renderRail();
  if (VIDEO){ resize(); window.__ready = true; }
  else { setSpin(!reduceMotion && !location.search.includes('nospin')); renderer.setAnimationLoop(frame); }

  if (SITE.ems && SYS) (SYS.type === 'pv' ? emsDemoPV(SYS.kw, SYS.kwh, SYS.kwp) : emsDemo(SYS.kw, SYS.kwh));
}

/* ---------- EMS demo chart, scaled to the system ---------- */
function emsDemo(PMAX, E){
  const k = PMAX / 520;
  const load = [260,250,245,240,245,265,320,400,500,560,575,540,470,455,450,470,500,560,590,585,520,430,340,290].map(v => v * k);
  const CAP = Math.round(460 * k / 10) * 10, SMIN = 0.10*E, SMAX = 0.95*E;
  let soc = 0.25*E;
  const chg = [], dis = [], imp = [], socArr = [];
  const nightH = [0,1,2,3,4,5,6];
  for (let h=0; h<24; h++){
    let c = 0, d = 0;
    if (nightH.includes(h) || h === 23){ const hoursLeft = h === 23 ? 8 : 7 - h; c = Math.min(PMAX, Math.max(0, (SMAX - soc) / hoursLeft), CAP - load[h]); }
    if (load[h] > CAP){ d = Math.min(PMAX, load[h] - CAP, soc - SMIN); }
    soc = soc + c - d;
    chg.push(c); dis.push(d); imp.push(load[h] - d + c); socArr.push(soc / E * 100);
  }
  const peak = Math.max(...load), impPeak = Math.max(...imp);
  const dE = dis.reduce((a,b)=>a+b,0), cE = chg.reduce((a,b)=>a+b,0);
  document.getElementById('kpis').innerHTML = [
    [fmtN(peak)+' кВт','пік споживання'],[fmtN(impPeak)+' кВт','пік імпорту з мережі'],[fmtN(dE)+' кВт·год','розряд за добу'],[fmtN(cE)+' кВт·год','заряд у нічний тариф']
  ].map(([b,s]) => `<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join('');
  const top = Math.ceil(Math.max(...load) * 1.15 / 100) * 100, bTop = Math.ceil(Math.max(...dis, ...chg) * 1.2 / 20) * 20 || 20;
  const Wv = 760, Hv = 360, L = 44, R = 44, T = 18, mid = 228, B = 330;
  const x = h => L + (h + 0.5) * (Wv - L - R) / 24;
  const yP = v => mid - (v / top) * (mid - T);
  const yB = v => B - 8 - (v / bTop) * (B - mid - 26);
  const yS = s => B - 8 - (s / 100) * (B - mid - 26);
  const zones = [ [0,7,'Ніч'], [8,11,'Пік'], [20,22,'Пік'], [23,24,'Ніч'] ];
  const mono = 'font-family="IBM Plex Mono, monospace"';
  let s = `<svg viewBox="0 0 ${Wv} ${Hv}" role="img" aria-label="Демо-графік роботи EMS за добу">`;
  zones.forEach(([a,b,l]) => { const xa = L + a*(Wv-L-R)/24, xb = L + b*(Wv-L-R)/24; s += `<rect x="${xa}" y="${T}" width="${xb-xa}" height="${B-T}" fill="${l==='Ніч' ? 'var(--primary)' : 'var(--amber)'}" opacity="0.07"/><text x="${(xa+xb)/2}" y="${T+12}" font-size="11" text-anchor="middle" fill="var(--muted)" ${mono}>${l}</text>`; });
  [0, top/3, 2*top/3, top].map(v => Math.round(v)).forEach(v => { s += `<line x1="${L}" x2="${Wv-R}" y1="${yP(v)}" y2="${yP(v)}" stroke="var(--line)" stroke-width="1"/><text x="${L-6}" y="${yP(v)+4}" font-size="11" text-anchor="end" fill="var(--muted)" ${mono}>${v}</text>`; });
  s += `<text x="${L}" y="${T-4}" font-size="11" fill="var(--muted)" ${mono}>кВт</text>`;
  const ptsLoad = load.map((v,h) => `${x(h)},${yP(v)}`).join(' ');
  s += `<polygon points="${x(0)},${yP(0)} ${ptsLoad} ${x(23)},${yP(0)}" fill="var(--muted)" opacity="0.10"/>`;
  s += `<polyline points="${ptsLoad}" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="5 4"/>`;
  s += `<line x1="${L}" x2="${Wv-R}" y1="${yP(CAP)}" y2="${yP(CAP)}" stroke="var(--alarm)" stroke-width="1.5" stroke-dasharray="3 3"/><text x="${Wv-R}" y="${yP(CAP)-5}" font-size="11" text-anchor="end" fill="var(--alarm)" ${mono}>межа ${CAP} кВт</text>`;
  s += `<polyline points="${imp.map((v,h) => `${x(h)},${yP(v)}`).join(' ')}" fill="none" stroke="var(--primary)" stroke-width="2.6"/>`;
  s += `<line x1="${L}" x2="${Wv-R}" y1="${B-8}" y2="${B-8}" stroke="var(--line)"/>`;
  const bw = (Wv-L-R)/24 * 0.62;
  for (let h=0; h<24; h++){
    if (dis[h] > 0) s += `<rect x="${x(h)-bw/2}" y="${yB(dis[h])}" width="${bw}" height="${(B-8)-yB(dis[h])}" fill="var(--brand)" rx="2"/>`;
    if (chg[h] > 0) s += `<rect x="${x(h)-bw/2}" y="${yB(chg[h])}" width="${bw}" height="${(B-8)-yB(chg[h])}" fill="var(--ok)" opacity="0.8" rx="2"/>`;
  }
  s += `<polyline points="${socArr.map((v,h) => `${x(h)},${yS(v)}`).join(' ')}" fill="none" stroke="var(--amber)" stroke-width="2.2"/>`;
  s += `<text x="${Wv-R+6}" y="${yS(100)+4}" font-size="11" fill="var(--amber)" ${mono}>100%</text><text x="${Wv-R+6}" y="${yS(0)+4}" font-size="11" fill="var(--amber)" ${mono}>0%</text>`;
  s += `<text x="${L}" y="${mid+14}" font-size="11" fill="var(--muted)" ${mono}>УЗЕ: заряд / розряд, рівень заряду</text>`;
  [0,3,6,9,12,15,18,21].forEach(h => { s += `<text x="${x(h)}" y="${Hv-8}" font-size="11" text-anchor="middle" fill="var(--muted)" ${mono}>${String(h).padStart(2,'0')}:00</text>`; });
  s += `</svg>`;
  document.getElementById('chart').innerHTML = s;
}

/* ---------- EMS demo chart for PV + storage, scaled to the system ---------- */
function emsDemoPV(PMAX, E, KWP){
  const hours = [...Array(24).keys()];
  const pv = hours.map(h => h < 6 || h > 19 ? 0 : Math.max(0, 0.85 * KWP * Math.sin(Math.PI * (h - 6) / 13.5)));
  const load = [26,25,24,24,25,28,34,42,50,54,56,55,52,50,51,53,55,58,60,57,50,42,34,29].map(v => v * PMAX / 50);
  const SMIN = 0.1*E, SMAX = 0.95*E; let soc = 0.3*E;
  const chg = [], dis = [], imp = [], socA = [];
  hours.forEach(h => {
    let c = 0, d = 0; const surplus = pv[h] - load[h];
    if (surplus > 0) c = Math.min(PMAX, surplus, SMAX - soc); else d = Math.min(PMAX, -surplus, soc - SMIN);
    soc += c - d; chg.push(c); dis.push(d); imp.push(Math.max(0, load[h] - pv[h] - d)); socA.push(soc / E * 100);
  });
  const sum = a => a.reduce((x,y) => x + y, 0);
  const selfUse = 100 * (1 - sum(imp) / sum(load));
  document.getElementById('kpis').innerHTML = [[fmtN(sum(pv))+' кВт·год','генерація СЕС за добу'],[fmtN(sum(load))+' кВт·год','споживання'],[fmtN(sum(imp))+' кВт·год','імпорт з мережі'],[fmtN(selfUse)+' %','покриття від СЕС і УЗЕ']].map(([b,s]) => `<div class="kpi"><b>${b}</b><span>${s}</span></div>`).join('');
  const top = Math.ceil(Math.max(...pv, ...load) * 1.12 / 25) * 25, bTop = Math.ceil(Math.max(...chg, ...dis) * 1.2 / 10) * 10 || 10;
  const Wv = 760, Hv = 360, L = 44, R = 44, T = 18, mid = 228, B = 330;
  const x = h => L + (h + 0.5) * (Wv - L - R) / 24, yP = v => mid - (v / top) * (mid - T), yB = v => B - 8 - (v / bTop) * (B - mid - 26), yS = s => B - 8 - (s / 100) * (B - mid - 26);
  const mono = 'font-family="IBM Plex Mono, monospace"';
  let s = `<svg viewBox="0 0 ${Wv} ${Hv}" role="img" aria-label="Демо-графік роботи СЕС і УЗЕ за добу">`;
  [0, top/4, top/2, 3*top/4, top].map(v => Math.round(v)).forEach(v => { s += `<line x1="${L}" x2="${Wv-R}" y1="${yP(v)}" y2="${yP(v)}" stroke="var(--line)"/><text x="${L-6}" y="${yP(v)+4}" font-size="11" text-anchor="end" fill="var(--muted)" ${mono}>${v}</text>`; });
  s += `<text x="${L}" y="${T-4}" font-size="11" fill="var(--muted)" ${mono}>кВт</text>`;
  const ptsPV = pv.map((v,h) => `${x(h)},${yP(v)}`).join(' ');
  s += `<polygon points="${x(0)},${yP(0)} ${ptsPV} ${x(23)},${yP(0)}" fill="var(--amber)" opacity="0.22"/><polyline points="${ptsPV}" fill="none" stroke="var(--amber)" stroke-width="2.2"/>`;
  s += `<polyline points="${load.map((v,h) => `${x(h)},${yP(v)}`).join(' ')}" fill="none" stroke="var(--muted)" stroke-width="2" stroke-dasharray="5 4"/>`;
  s += `<polyline points="${imp.map((v,h) => `${x(h)},${yP(v)}`).join(' ')}" fill="none" stroke="var(--primary)" stroke-width="2.6"/>`;
  s += `<line x1="${L}" x2="${Wv-R}" y1="${B-8}" y2="${B-8}" stroke="var(--line)"/>`;
  const bw = (Wv-L-R)/24 * 0.62;
  hours.forEach(h => { if (chg[h] > 0) s += `<rect x="${x(h)-bw/2}" y="${yB(chg[h])}" width="${bw}" height="${(B-8)-yB(chg[h])}" fill="var(--ok)" rx="2"/>`; if (dis[h] > 0) s += `<rect x="${x(h)-bw/2}" y="${yB(dis[h])}" width="${bw}" height="${(B-8)-yB(dis[h])}" fill="var(--brand)" rx="2"/>`; });
  s += `<polyline points="${socA.map((v,h) => `${x(h)},${yS(v)}`).join(' ')}" fill="none" stroke="var(--alarm)" stroke-width="2.2"/>`;
  s += `<text x="${Wv-R+6}" y="${yS(100)+4}" font-size="11" fill="var(--alarm)" ${mono}>100%</text><text x="${Wv-R+6}" y="${yS(0)+4}" font-size="11" fill="var(--alarm)" ${mono}>0%</text>`;
  s += `<text x="${L}" y="${mid+14}" font-size="11" fill="var(--muted)" ${mono}>УЗЕ: заряд / розряд, рівень заряду</text>`;
  [0,3,6,9,12,15,18,21].forEach(h => { s += `<text x="${x(h)}" y="${Hv-8}" font-size="11" text-anchor="middle" fill="var(--muted)" ${mono}>${String(h).padStart(2,'0')}:00</text>`; });
  document.getElementById('chart').innerHTML = s + '</svg>';
}
