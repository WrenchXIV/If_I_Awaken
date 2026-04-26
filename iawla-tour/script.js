/* ==========================================================
   PINNED-SPACES · v3
   - SVG injection (warehouse + per-space plans)
   - Phase swap by scroll progress within each .space-pin-wrap
   - Beat clusters with staggered + scroll-driven fade-in
   - Inline edit mode (contenteditable, localStorage, export)
   - Beat delete (in edit mode)
   ========================================================== */
(function(){

const WAREHOUSE_SVG = `
<svg class="warehouse-svg" viewBox="0 0 1000 600" xmlns="http://www.w3.org/2000/svg" aria-label="Warehouse layout">
  <defs>
    <marker id="wsArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <polygon points="0 0, 6 3, 0 6" fill="#5a5340"/>
    </marker>
  </defs>
  <rect x="20" y="20" width="960" height="560" fill="none" stroke="#2a2420" stroke-width="1" stroke-dasharray="3,4"/>
  <rect x="20" y="20" width="560" height="560" fill="#0e0c0a" stroke="#3a3128" stroke-width="1"/>
  <rect x="20" y="20" width="200" height="100" fill="#14110f" stroke="#2a2420" stroke-width="0.5" stroke-dasharray="2,3"/>
  <text x="120" y="73" fill="#5a5340" font-family="JetBrains Mono" font-size="9" letter-spacing="2" text-anchor="middle">BACK OF HOUSE</text>

  <g class="ws-space" data-space="06">
    <rect class="ws-rect" x="220" y="20" width="160" height="160" fill="#14110f" stroke="#3a3128" stroke-width="1"/>
    <text class="ws-num" x="300" y="100" fill="#5a5340" font-family="Playfair Display" font-style="italic" font-size="38" font-weight="500" text-anchor="middle">06</text>
    <text class="ws-name" x="300" y="125" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="2" text-anchor="middle">STAGE · SEATING</text>
  </g>
  <g class="ws-space" data-space="01">
    <rect class="ws-rect" x="380" y="120" width="80" height="440" fill="#14110f" stroke="#3a3128" stroke-width="1"/>
    <rect x="380" y="140" width="3" height="400" fill="#3a3128"/>
    <text class="ws-num" x="420" y="350" fill="#5a5340" font-family="Playfair Display" font-style="italic" font-size="38" font-weight="500" text-anchor="middle" transform="rotate(-90, 420, 350)">01</text>
    <text class="ws-name" x="420" y="378" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="2" text-anchor="middle" transform="rotate(-90, 420, 378)">HOLLYWOOD BLVD</text>
  </g>
  <g class="ws-space" data-space="05">
    <rect class="ws-rect" x="200" y="180" width="180" height="200" fill="#14110f" stroke="#3a3128" stroke-width="1"/>
    <text class="ws-num" x="290" y="280" fill="#5a5340" font-family="Playfair Display" font-style="italic" font-size="38" font-weight="500" text-anchor="middle">05</text>
    <text class="ws-name" x="290" y="305" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="2" text-anchor="middle">FOLK LA</text>
  </g>
  <g class="ws-space" data-space="04">
    <rect class="ws-rect" x="20" y="200" width="180" height="180" fill="#14110f" stroke="#3a3128" stroke-width="1"/>
    <text class="ws-num" x="110" y="290" fill="#5a5340" font-family="Playfair Display" font-style="italic" font-size="38" font-weight="500" text-anchor="middle">04</text>
    <text class="ws-name" x="110" y="315" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="2" text-anchor="middle">BLACK LA</text>
  </g>
  <g class="ws-space" data-space="03">
    <rect class="ws-rect" x="20" y="380" width="180" height="200" fill="#14110f" stroke="#3a3128" stroke-width="1"/>
    <text class="ws-num" x="110" y="475" fill="#5a5340" font-family="Playfair Display" font-style="italic" font-size="38" font-weight="500" text-anchor="middle">03</text>
    <text class="ws-name" x="110" y="500" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="2" text-anchor="middle">ASIAN LA</text>
  </g>
  <g class="ws-space" data-space="02">
    <rect class="ws-rect" x="200" y="380" width="180" height="200" fill="#14110f" stroke="#3a3128" stroke-width="1"/>
    <text class="ws-num" x="290" y="475" fill="#5a5340" font-family="Playfair Display" font-style="italic" font-size="38" font-weight="500" text-anchor="middle">02</text>
    <text class="ws-name" x="290" y="500" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="2" text-anchor="middle">BOYLE HEIGHTS</text>
  </g>
  <circle cx="200" cy="380" r="36" fill="#181512" stroke="#5a5340" stroke-width="1"/>
  <text x="200" y="384" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="1.5" text-anchor="middle">BAND STAGE</text>

  <rect x="620" y="20" width="360" height="270" fill="#14110f" stroke="#3a3128" stroke-width="1"/>
  <text x="800" y="155" fill="#5a5340" font-family="Playfair Display" font-style="italic" font-size="22" font-weight="500" text-anchor="middle">Entry</text>
  <text x="800" y="180" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="2.5" text-anchor="middle">RED CARPET</text>
  <rect x="620" y="310" width="360" height="270" fill="#14110f" stroke="#3a3128" stroke-width="1"/>
  <text x="800" y="450" fill="#5a5340" font-family="Playfair Display" font-style="italic" font-size="22" font-weight="500" text-anchor="middle">Lobby</text>
  <text x="800" y="475" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="2.5" text-anchor="middle">BAR · GIFTSHOP</text>

  <path d="M 620 200 L 470 200" stroke="#5a5340" stroke-width="1" fill="none" stroke-dasharray="3,4" opacity="0.5" marker-end="url(#wsArrow)"/>

  <g transform="translate(950, 50)">
    <circle r="14" fill="none" stroke="#3a3128" stroke-width="0.5"/>
    <text y="-2" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="1" text-anchor="middle">N</text>
    <line x1="0" y1="2" x2="0" y2="10" stroke="#5a5340" stroke-width="0.5"/>
  </g>
</svg>
`;

// SPACE 01 PLAN — taller (640 viewBox) + ~150 audience dots
function buildPlan01(){
  // 4 columns x ~38 rows of dots = ~152 audience members
  let dots = '';
  for (let row = 0; row < 38; row++) {
    for (let col = 0; col < 4; col++) {
      const x = 245 + col * 14;
      const y = 100 + row * 13;
      dots += `<circle cx="${x}" cy="${y}" r="3" fill="#a89b82" opacity="0.7"/>`;
    }
  }
  // 7 evenly spaced tourist dancers along the LED side
  let tourists = '';
  for (let i = 0; i < 7; i++){
    const cy = 110 + i * 80;
    tourists += `<circle cx="180" cy="${cy}" r="6" fill="#e07856" stroke="#0a0908" stroke-width="1.5"/>`;
  }
  return `
<svg viewBox="0 0 440 660" xmlns="http://www.w3.org/2000/svg" aria-label="Space 01 plan">
  <defs>
    <linearGradient id="ledGlow1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6ec6ff" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#6ec6ff" stop-opacity="0.15"/>
    </linearGradient>
    <marker id="ar1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#f0c674"/></marker>
    <marker id="ar1r" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#c8583a"/></marker>
  </defs>
  <rect x="20" y="20" width="400" height="620" fill="none" stroke="#2a2420" stroke-width="1" stroke-dasharray="3,4"/>
  <rect x="60" y="60" width="240" height="540" fill="#3a331e" stroke="#d4a24c" stroke-width="1.5"/>
  <rect x="60" y="80" width="8" height="500" fill="#6ec6ff"/>
  <rect x="68" y="80" width="40" height="500" fill="url(#ledGlow1)" opacity="0.4"/>

  <g fill="#d4a24c" opacity="0.55">
    <polygon points="125,140 128,148 136,148 130,153 132,161 125,156 118,161 120,153 114,148 122,148"/>
    <polygon points="220,250 223,258 231,258 225,263 227,271 220,266 213,271 215,263 209,258 217,258"/>
    <polygon points="170,380 173,388 181,388 175,393 177,401 170,396 163,401 165,393 159,388 167,388"/>
    <polygon points="130,470 133,478 141,478 135,483 137,491 130,486 123,491 125,483 119,478 127,478"/>
    <polygon points="200,540 203,548 211,548 205,553 207,561 200,556 193,561 195,553 189,548 197,548"/>
  </g>

  ${tourists}
  ${dots}

  <circle cx="130" cy="320" r="7" fill="#f0c674" stroke="#0a0908" stroke-width="1.5"/>
  <text x="146" y="324" fill="#f0c674" font-family="JetBrains Mono" font-size="10" letter-spacing="1">TOUR GUIDE</text>

  <rect x="310" y="60" width="110" height="540" fill="#14110f" stroke="#5a5245" stroke-width="1" stroke-dasharray="2,3"/>
  <text x="365" y="335" fill="#5a5245" font-family="JetBrains Mono" font-size="11" letter-spacing="3" text-anchor="middle">LOBBY</text>

  <path d="M 310 280 L 295 280" stroke="#f0c674" stroke-width="1.5" fill="none" marker-end="url(#ar1)"/>
  <text x="312" y="270" fill="#f0c674" font-family="JetBrains Mono" font-size="9" letter-spacing="1">ENTRY</text>

  <path d="M 180 600 L 180 625" stroke="#c8583a" stroke-width="1.5" fill="none" marker-end="url(#ar1r)"/>
  <text x="188" y="628" fill="#c8583a" font-family="JetBrains Mono" font-size="9" letter-spacing="1">→ TUNNEL</text>

  <text x="40" y="320" fill="#6ec6ff" font-family="JetBrains Mono" font-size="10" letter-spacing="2" transform="rotate(-90, 40, 320)" text-anchor="middle">LED WALL · 110 ft</text>
  <text x="270" y="48" fill="#a89b82" font-family="JetBrains Mono" font-size="9" letter-spacing="2" text-anchor="middle">AUDIENCE · 150</text>
  <text x="180" y="48" fill="#e07856" font-family="JetBrains Mono" font-size="9" letter-spacing="2" text-anchor="middle">TOURIST DANCERS</text>
  <text x="100" y="48" fill="#d4a24c" font-family="JetBrains Mono" font-size="9" letter-spacing="2" text-anchor="middle">WALK OF FAME</text>
</svg>
`;
}

const PLAN_02 = `
<svg viewBox="-40 -40 720 720" xmlns="http://www.w3.org/2000/svg" aria-label="Space 02 plan">
  <defs>
    <linearGradient id="muralGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e07856" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#c85f38" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#e07856" stop-opacity="0.6"/>
    </linearGradient>
    <marker id="ar2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><polygon points="0 0, 8 4, 0 8" fill="#f0c674"/></marker>
  </defs>
  <rect x="40" y="40" width="560" height="560" fill="#1a0f08" stroke="#e07856" stroke-width="1.5" stroke-dasharray="4,4"/>
  <rect x="40" y="40" width="560" height="14" fill="url(#muralGrad)"/>
  <text x="320" y="33" fill="#e07856" font-family="JetBrains Mono" font-size="9" letter-spacing="3" text-anchor="middle">SOUTH MURAL WALL</text>
  <text x="560" y="100" fill="#5a5245" font-family="JetBrains Mono" font-size="8" letter-spacing="1" text-anchor="middle">N</text>
  <line x1="560" y1="104" x2="560" y2="120" stroke="#5a5245" stroke-width="0.5"/>
  <path d="M 630 570 L 605 570" stroke="#f0c674" stroke-width="2" fill="none" marker-end="url(#ar2)"/>
  <text x="625" y="560" fill="#f0c674" font-family="JetBrains Mono" font-size="9" letter-spacing="1" text-anchor="end">ENTRY</text>

  <g transform="translate(320,340)">
    <circle cx="0" cy="0" r="135" fill="#2a1a10" stroke="#a89b82" stroke-width="1" stroke-dasharray="3,4" opacity="0.8"/>
    <text x="0" y="5" fill="#a89b82" font-family="Playfair Display" font-size="16" font-style="italic" text-anchor="middle">The Courtyard</text>
    <text x="0" y="22" fill="#a89b82" font-family="JetBrains Mono" font-size="7" letter-spacing="2" text-anchor="middle">~150 PAX</text>
  </g>
  <g transform="translate(40,40)">
    <circle cx="0" cy="0" r="80" fill="#2a2018" stroke="#f0c674" stroke-width="2"/>
    <circle cx="0" cy="0" r="40" fill="none" stroke="#f0c674" stroke-width="0.5" stroke-dasharray="2,3" opacity="0.7"/>
    <text x="0" y="-100" fill="#f0c674" font-family="JetBrains Mono" font-size="11" letter-spacing="2" text-anchor="middle">BAND STAGE</text>
  </g>
  <g fill="#a89070">
    <circle cx="405" cy="340" r="14"/><circle cx="362" cy="414" r="14"/><circle cx="278" cy="414" r="14"/>
    <circle cx="235" cy="340" r="14"/><circle cx="278" cy="266" r="14"/><circle cx="362" cy="266" r="14"/>
  </g>
  <g fill="#c8a078">
    <circle cx="405" cy="340" r="8"/><circle cx="362" cy="414" r="8"/><circle cx="278" cy="414" r="8"/>
    <circle cx="235" cy="340" r="8"/><circle cx="278" cy="266" r="8"/><circle cx="362" cy="266" r="8"/>
  </g>
  <rect x="215" y="165" width="55" height="28" fill="#1a1208" stroke="#6ec6ff" stroke-width="1.5"/>
  <text x="242" y="184" fill="#6ec6ff" font-family="JetBrains Mono" font-size="6" letter-spacing="1" text-anchor="middle">BILLBOARD</text>
  <rect x="370" y="165" width="55" height="28" fill="#1a1208" stroke="#6ec6ff" stroke-width="1.5"/>
  <text x="397" y="184" fill="#6ec6ff" font-family="JetBrains Mono" font-size="6" letter-spacing="1" text-anchor="middle">BILLBOARD</text>

  <rect x="55" y="140" width="42" height="36" fill="#5a4030"/><rect x="55" y="136" width="42" height="5" fill="#c85f38" opacity="0.7"/>
  <rect x="55" y="260" width="42" height="36" fill="#5a4030"/><rect x="55" y="256" width="42" height="5" fill="#c85f38" opacity="0.7"/>
  <rect x="55" y="380" width="42" height="36" fill="#5a4030"/><rect x="55" y="376" width="42" height="5" fill="#c85f38" opacity="0.7"/>
  <rect x="55" y="500" width="42" height="36" fill="#5a4030"/><rect x="55" y="496" width="42" height="5" fill="#c85f38" opacity="0.7"/>
  <text x="76" y="190" fill="#c85f38" font-family="JetBrains Mono" font-size="7" letter-spacing="1" text-anchor="middle">STALLS</text>

  <g transform="translate(320,490)">
    <ellipse cx="0" cy="8" rx="55" ry="5" fill="#000" opacity="0.5"/>
    <path d="M -50 0 Q -50 -16 -40 -18 L 40 -18 Q 50 -16 50 0 Z" fill="#8a2a2a"/>
    <path d="M -40 -18 L -20 -26 L 20 -26 L 40 -18" fill="#6a1a1a"/>
    <circle cx="-28" cy="6" r="7" fill="#0a0908"/><circle cx="28" cy="6" r="7" fill="#0a0908"/>
    <text x="0" y="26" fill="#c8583a" font-family="JetBrains Mono" font-size="8" letter-spacing="2" text-anchor="middle">LOWRIDER</text>
  </g>
  <g transform="translate(135,220)">
    <rect x="-22" y="-14" width="44" height="28" fill="#c85f38"/>
    <polygon points="-22,-14 22,-14 28,-22 -28,-22" fill="#8a4a30"/>
    <text x="0" y="22" fill="#c85f38" font-family="JetBrains Mono" font-size="7" letter-spacing="1" text-anchor="middle">TACOS</text>
  </g>
  <g transform="translate(80,80)">
    <circle cx="0" cy="0" r="14" fill="#e89ab0" stroke="#0a0908" stroke-width="2"/>
    <text x="0" y="36" fill="#e89ab0" font-family="JetBrains Mono" font-size="9" letter-spacing="2" text-anchor="middle">YOUTH POET</text>
  </g>
  <g transform="translate(320,75)">
    <circle cx="0" cy="0" r="14" fill="#a066c2" stroke="#0a0908" stroke-width="2"/>
    <text x="0" y="36" fill="#a066c2" font-family="JetBrains Mono" font-size="9" letter-spacing="2" text-anchor="middle">ELDER POET</text>
  </g>
  <g transform="translate(500,465)">
    <line x1="28" y1="18" x2="-28" y2="-18" stroke="#f0c674" stroke-width="3" stroke-linecap="round" marker-end="url(#ar2)"/>
    <text x="0" y="40" fill="#f0c674" font-family="JetBrains Mono" font-size="11" letter-spacing="3" text-anchor="middle">AUDIENCE</text>
  </g>
</svg>
`;

// ----- Inject SVGs -----
document.querySelectorAll('.warehouse-svg-wrap').forEach(wrap => {
  const space = wrap.closest('.space');
  const id = space ? space.dataset.space : null;
  wrap.innerHTML = WAREHOUSE_SVG;
  if (id) {
    const lit = wrap.querySelector(`.ws-space[data-space="${id}"]`);
    if (lit) lit.classList.add('is-lit');
  }
});
document.querySelectorAll('.plan-svg-wrap').forEach(wrap => {
  const space = wrap.closest('.space');
  const id = space ? space.dataset.space : null;
  if (id === '01') wrap.innerHTML = buildPlan01();
  else if (id === '02') wrap.innerHTML = PLAN_02;
});

// ==========================================================
// EDIT MODE
// ==========================================================
const STORAGE_KEY = 'iawla_v3_edits_v1';
const editables = Array.from(document.querySelectorAll('[data-edit]'));
// Assign stable IDs based on position
editables.forEach((el, i) => { el.dataset.editId = 'e' + i; });

const stored = (function(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch(_) { return {}; }
})();

// Apply stored edits on load
editables.forEach(el => {
  const id = el.dataset.editId;
  if (stored[id] !== undefined && stored[id] !== el.innerHTML) {
    el.innerHTML = stored[id];
    el.classList.add('is-edited');
  }
});

function saveEdits(){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); }
  catch(_) {}
}

function enterEditMode(){
  document.body.classList.add('edit-on');
  editables.forEach(el => {
    el.contentEditable = 'true';
    el.spellcheck = false;
  });
}

editables.forEach(el => {
  el.addEventListener('input', () => {
    stored[el.dataset.editId] = el.innerHTML;
    el.classList.add('is-edited');
    saveEdits();
  });
  // Prevent multiline weirdness with single-line elements
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && el.tagName !== 'P' && !el.querySelector('br')) {
      e.preventDefault();
      el.blur();
    }
  });
});

// Edit mode is on by default for the prototype
enterEditMode();

// Toolbar
const etShow = document.getElementById('etShow');
const etReset = document.getElementById('etReset');
const editPanel = document.getElementById('editPanel');
const epClose = document.getElementById('epClose');
const epText = document.getElementById('epText');
const epCopy = document.getElementById('epCopy');

function buildExport(){
  const out = {};
  // Group by section heading + element selector for context
  editables.forEach(el => {
    const id = el.dataset.editId;
    if (stored[id] !== undefined) {
      // include a small label for context
      const section = el.closest('section');
      const label = section ? (section.dataset.marker || section.className.split(' ')[0]) : '';
      out[id] = { label, html: stored[id] };
    }
  });
  // Also include deletions
  if (deletedBeats.length){
    out._deletedBeats = deletedBeats.slice();
  }
  return out;
}

etShow.addEventListener('click', () => {
  epText.value = JSON.stringify(buildExport(), null, 2);
  editPanel.hidden = false;
});
epClose.addEventListener('click', () => { editPanel.hidden = true; });
editPanel.addEventListener('click', (e) => {
  if (e.target === editPanel) editPanel.hidden = true;
});

epCopy.addEventListener('click', () => {
  epText.select();
  navigator.clipboard.writeText(epText.value).then(() => {
    epCopy.textContent = 'Copied ✓';
    setTimeout(() => epCopy.textContent = 'Copy to clipboard', 1500);
  });
});

etReset.addEventListener('click', () => {
  if (!confirm('Reset all your edits and reload?')) return;
  localStorage.removeItem(STORAGE_KEY);
  // also clear deleted beats
  localStorage.removeItem(STORAGE_KEY + '_dels');
  location.reload();
});

// ----- Beat delete -----
const DELS_KEY = STORAGE_KEY + '_dels';
let deletedBeats = (function(){
  try { return JSON.parse(localStorage.getItem(DELS_KEY) || '[]'); }
  catch(_) { return []; }
})();

document.querySelectorAll('.beat-card').forEach((card, i) => {
  card.dataset.beatKey = (() => {
    const cluster = card.closest('.cluster');
    const space = card.closest('.space');
    const sid = space ? space.dataset.space : 'x';
    const cid = cluster ? cluster.dataset.cluster : 'x';
    const idx = Array.from(cluster ? cluster.querySelectorAll('.beat-card') : [card]).indexOf(card);
    return `s${sid}-c${cid}-b${idx}`;
  })();
  if (deletedBeats.includes(card.dataset.beatKey)) card.remove();
});

document.body.addEventListener('click', (e) => {
  const del = e.target.closest('.bc-del');
  if (!del) return;
  const card = del.closest('.beat-card');
  if (!card) return;
  if (!confirm('Delete this beat?')) return;
  if (!deletedBeats.includes(card.dataset.beatKey)) deletedBeats.push(card.dataset.beatKey);
  try { localStorage.setItem(DELS_KEY, JSON.stringify(deletedBeats)); } catch(_) {}
  card.remove();
});

// ==========================================================
// PHASE SWAP + STAGGERED FADE
// ==========================================================
const railFill = document.getElementById('railFill');
const marker = document.getElementById('spaceMarker');
const spaces = Array.from(document.querySelectorAll('.space'));
const slides = Array.from(document.querySelectorAll('[data-marker]'));

function phaseRanges(clusters){
  return {
    wh: [0.00, 0.22],
    pl: [0.22, 0.45],
    photoStart: 0.45,
    photoSpan: 0.55, // remaining
    clusters
  };
}

let ticking = false;
function onScroll(){
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    if (railFill) railFill.style.width = pct + '%';

    const vh = window.innerHeight;
    let bestSlide = null, bestArea = 0;
    slides.forEach(s => {
      const r = s.getBoundingClientRect();
      const top = Math.max(0, r.top);
      const bot = Math.min(vh, r.bottom);
      const area = Math.max(0, bot - top);
      if (area > bestArea){ bestArea = area; bestSlide = s; }
    });
    if (bestSlide && marker) marker.textContent = bestSlide.dataset.marker;

    spaces.forEach(space => {
      const wrap = space.querySelector('.space-pin-wrap');
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const total = r.height - vh;
      if (total <= 0) return;
      const progress = Math.max(0, Math.min(1, (-r.top) / total));
      const clusters = parseInt(wrap.dataset.clusters || '2', 10);
      const ranges = phaseRanges(clusters);

      const phaseEls = space.querySelectorAll('.phase');
      const clusterEls = space.querySelectorAll('.cluster');

      let active = 'warehouse';
      if (progress < ranges.wh[1]) active = 'warehouse';
      else if (progress < ranges.pl[1]) active = 'plan';
      else active = 'photo';

      phaseEls.forEach(p => p.classList.toggle('is-active', p.dataset.phase === active));

      if (active === 'photo'){
        // Determine which cluster is active
        const photoProgress = (progress - ranges.photoStart) / ranges.photoSpan;
        const perCluster = 1 / clusters;
        let activeCluster = Math.min(clusters - 1, Math.floor(photoProgress / perCluster));
        clusterEls.forEach((c, i) => c.classList.toggle('is-active', i === activeCluster));

        // Drive bg-layer crossfade + camera-style transform.
        // Each bg-layer maps to its cluster slice; visibility ramps up at slice
        // start, full during slice, ramps down across the last 15% into next.
        const bgLayers = space.querySelectorAll('.bg-layer');
        bgLayers.forEach((layer, i) => {
          const clusterIdx = parseInt(layer.dataset.cluster || i, 10);
          const start = clusterIdx * perCluster;
          const local = (photoProgress - start) / perCluster; // can be <0 or >1
          let vis = 0;
          if (local >= -0.15 && local <= 1.15){
            if (local < 0) vis = (local + 0.15) / 0.15;
            else if (local > 0.85) vis = 1 - (local - 0.85) / 0.15;
            else vis = 1;
          }
          vis = Math.max(0, Math.min(1, vis));
          layer.style.setProperty('--vis', vis.toFixed(3));
          // camera move: scale 1.0 → 1.06 + slight upward drift across the slice
          const t = Math.max(0, Math.min(1, local));
          layer.style.setProperty('--scale', (1 + t * 0.06).toFixed(3));
          layer.style.setProperty('--ty', (-t * 2).toFixed(2) + '%');
        });

        // Within the active cluster, drive each beat-card's --reveal var
        // Cluster local progress: 0 → 1 across this cluster's slice
        const clusterLocal = Math.max(0, Math.min(1, (photoProgress - activeCluster * perCluster) / perCluster));
        const cards = clusterEls[activeCluster] ? clusterEls[activeCluster].querySelectorAll('.beat-card') : [];
        const n = cards.length || 1;
        // Each beat reveals over a portion of cluster local progress.
        // beat i fully revealed at progress = (i+1)/n; starts revealing at i/n.
        cards.forEach((card, i) => {
          const start = i / n * 0.85;       // start a bit earlier
          const end = (i + 1) / n * 0.95;   // fully visible slightly before next
          const reveal = Math.max(0, Math.min(1, (clusterLocal - start) / (end - start)));
          card.style.setProperty('--reveal', reveal.toFixed(3));
        });
        // Other clusters' cards reset to 0
        clusterEls.forEach((c, i) => {
          if (i !== activeCluster){
            c.querySelectorAll('.beat-card').forEach(card => card.style.setProperty('--reveal', 0));
          }
        });
      } else {
        clusterEls.forEach(c => {
          c.classList.remove('is-active');
          c.querySelectorAll('.beat-card').forEach(card => card.style.setProperty('--reveal', 0));
        });
        space.querySelectorAll('.bg-layer').forEach(layer => layer.style.setProperty('--vis', 0));
      }
    });

    ticking = false;
  });
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);

// Default: first phase of each space active so something shows pre-scroll
spaces.forEach(space => {
  const first = space.querySelector('.phase-warehouse');
  if (first) first.classList.add('is-active');
});

onScroll();

})();
