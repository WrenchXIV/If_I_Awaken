/* ==========================================================
   PINNED-SPACES · v2 — investor edition
   - Inject warehouse SVG into each .warehouse-svg-wrap (lit per space)
   - Inject plan SVG into each .plan-svg-wrap (per space)
   - Phase swap: warehouse → plan → photo+clusters by scroll progress
   - Track active space marker + global rail fill
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

  <g>
    <circle cx="200" cy="380" r="36" fill="#181512" stroke="#5a5340" stroke-width="1"/>
    <text x="200" y="384" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="1.5" text-anchor="middle">BAND STAGE</text>
  </g>

  <g>
    <rect x="620" y="20" width="360" height="270" fill="#14110f" stroke="#3a3128" stroke-width="1"/>
    <text x="800" y="155" fill="#5a5340" font-family="Playfair Display" font-style="italic" font-size="22" font-weight="500" text-anchor="middle">Entry</text>
    <text x="800" y="180" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="2.5" text-anchor="middle">RED CARPET</text>
    <rect x="620" y="310" width="360" height="270" fill="#14110f" stroke="#3a3128" stroke-width="1"/>
    <text x="800" y="450" fill="#5a5340" font-family="Playfair Display" font-style="italic" font-size="22" font-weight="500" text-anchor="middle">Lobby</text>
    <text x="800" y="475" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="2.5" text-anchor="middle">BAR · GIFTSHOP</text>
  </g>

  <g stroke="#5a5340" stroke-width="1" fill="none" stroke-dasharray="3,4" opacity="0.5">
    <path d="M 620 200 L 470 200" marker-end="url(#wsArrow)"/>
  </g>

  <g transform="translate(950, 50)">
    <circle r="14" fill="none" stroke="#3a3128" stroke-width="0.5"/>
    <text y="-2" fill="#5a5340" font-family="JetBrains Mono" font-size="8" letter-spacing="1" text-anchor="middle">N</text>
    <line x1="0" y1="2" x2="0" y2="10" stroke="#5a5340" stroke-width="0.5"/>
  </g>
</svg>
`;

const PLAN_01 = `
<svg viewBox="0 0 440 560" xmlns="http://www.w3.org/2000/svg" aria-label="Space 01 plan">
  <defs>
    <linearGradient id="ledGlow1" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#6ec6ff" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#6ec6ff" stop-opacity="0.15"/>
    </linearGradient>
    <marker id="ar1" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="#f0c674"/>
    </marker>
    <marker id="ar1r" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="#c8583a"/>
    </marker>
  </defs>
  <rect x="20" y="20" width="400" height="520" fill="none" stroke="#2a2420" stroke-width="1" stroke-dasharray="3,4"/>
  <rect x="60" y="60" width="240" height="440" fill="#3a331e" stroke="#d4a24c" stroke-width="1.5"/>
  <rect x="60" y="80" width="8" height="400" fill="#6ec6ff"/>
  <rect x="68" y="80" width="40" height="400" fill="url(#ledGlow1)" opacity="0.4"/>

  <g fill="#d4a24c" opacity="0.55">
    <polygon points="125,120 128,128 136,128 130,133 132,141 125,136 118,141 120,133 114,128 122,128"/>
    <polygon points="220,210 223,218 231,218 225,223 227,231 220,226 213,231 215,223 209,218 217,218"/>
    <polygon points="170,330 173,338 181,338 175,343 177,351 170,346 163,351 165,343 159,338 167,338"/>
    <polygon points="130,400 133,408 141,408 135,413 137,421 130,416 123,421 125,413 119,408 127,408"/>
    <polygon points="200,450 203,458 211,458 205,463 207,471 200,466 193,471 195,463 189,458 197,458"/>
  </g>

  <g>
    <circle cx="180" cy="110" r="6" fill="#e07856" stroke="#0a0908" stroke-width="1.5"/>
    <circle cx="180" cy="200" r="6" fill="#e07856" stroke="#0a0908" stroke-width="1.5"/>
    <circle cx="180" cy="290" r="6" fill="#e07856" stroke="#0a0908" stroke-width="1.5"/>
    <circle cx="180" cy="380" r="6" fill="#e07856" stroke="#0a0908" stroke-width="1.5"/>
    <circle cx="180" cy="470" r="6" fill="#e07856" stroke="#0a0908" stroke-width="1.5"/>
  </g>

  <g fill="#a89b82" opacity="0.8">
    <circle cx="285" cy="110" r="4"/><circle cx="275" cy="118" r="4"/>
    <circle cx="285" cy="170" r="4"/><circle cx="275" cy="178" r="4"/>
    <circle cx="285" cy="230" r="4"/><circle cx="275" cy="238" r="4"/>
    <circle cx="285" cy="290" r="4"/><circle cx="275" cy="298" r="4"/>
    <circle cx="285" cy="350" r="4"/><circle cx="275" cy="358" r="4"/>
    <circle cx="285" cy="410" r="4"/><circle cx="275" cy="418" r="4"/>
    <circle cx="285" cy="470" r="4"/><circle cx="275" cy="478" r="4"/>
  </g>

  <circle cx="130" cy="280" r="7" fill="#f0c674" stroke="#0a0908" stroke-width="1.5"/>
  <text x="146" y="284" fill="#f0c674" font-family="JetBrains Mono" font-size="10" letter-spacing="1">TOUR GUIDE</text>

  <rect x="310" y="60" width="110" height="440" fill="#14110f" stroke="#5a5245" stroke-width="1" stroke-dasharray="2,3"/>
  <text x="365" y="285" fill="#5a5245" font-family="JetBrains Mono" font-size="11" letter-spacing="3" text-anchor="middle">LOBBY</text>

  <path d="M 310 240 L 295 240" stroke="#f0c674" stroke-width="1.5" fill="none" marker-end="url(#ar1)"/>
  <text x="312" y="230" fill="#f0c674" font-family="JetBrains Mono" font-size="9" letter-spacing="1">ENTRY</text>

  <path d="M 180 500 L 180 525" stroke="#c8583a" stroke-width="1.5" fill="none" marker-end="url(#ar1r)"/>
  <text x="188" y="528" fill="#c8583a" font-family="JetBrains Mono" font-size="9" letter-spacing="1">→ TUNNEL</text>

  <text x="40" y="280" fill="#6ec6ff" font-family="JetBrains Mono" font-size="10" letter-spacing="2" transform="rotate(-90, 40, 280)" text-anchor="middle">LED WALL · 110 ft</text>
  <text x="285" y="48" fill="#a89b82" font-family="JetBrains Mono" font-size="9" letter-spacing="2" text-anchor="middle">AUDIENCE</text>
  <text x="180" y="48" fill="#e07856" font-family="JetBrains Mono" font-size="9" letter-spacing="2" text-anchor="middle">TOURIST DANCERS</text>
  <text x="100" y="48" fill="#d4a24c" font-family="JetBrains Mono" font-size="9" letter-spacing="2" text-anchor="middle">WALK OF FAME</text>
</svg>
`;

const PLAN_02 = `
<svg viewBox="-40 -40 720 720" xmlns="http://www.w3.org/2000/svg" aria-label="Space 02 plan">
  <defs>
    <linearGradient id="muralGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#e07856" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="#c85f38" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#e07856" stop-opacity="0.6"/>
    </linearGradient>
    <marker id="ar2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
      <polygon points="0 0, 8 4, 0 8" fill="#f0c674"/>
    </marker>
  </defs>
  <rect x="40" y="40" width="560" height="560" fill="#1a0f08" stroke="#e07856" stroke-width="1.5" stroke-dasharray="4,4"/>
  <rect x="40" y="40" width="560" height="14" fill="url(#muralGrad)"/>
  <text x="320" y="33" fill="#e07856" font-family="JetBrains Mono" font-size="9" letter-spacing="3" text-anchor="middle">SOUTH MURAL WALL</text>

  <text x="560" y="100" fill="#5a5245" font-family="JetBrains Mono" font-size="8" letter-spacing="1" text-anchor="middle">N</text>
  <line x1="560" y1="104" x2="560" y2="120" stroke="#5a5245" stroke-width="0.5"/>

  <path d="M 630 570 L 605 570" stroke="#f0c674" stroke-width="2" fill="none" marker-end="url(#ar2)"/>
  <text x="625" y="560" fill="#f0c674" font-family="JetBrains Mono" font-size="9" letter-spacing="1" text-anchor="end">ENTRY (TUNNEL)</text>

  <g transform="translate(320,340)">
    <circle cx="0" cy="0" r="135" fill="#2a1a10" stroke="#a89b82" stroke-width="1" stroke-dasharray="3,4" opacity="0.8"/>
    <text x="0" y="5" fill="#a89b82" font-family="Playfair Display" font-size="16" font-style="italic" text-anchor="middle">The Courtyard</text>
    <text x="0" y="22" fill="#a89b82" font-family="JetBrains Mono" font-size="7" letter-spacing="2" text-anchor="middle">~150 PAX</text>
  </g>

  <g transform="translate(40,40)">
    <circle cx="0" cy="0" r="80" fill="#2a2018" stroke="#f0c674" stroke-width="2"/>
    <circle cx="0" cy="0" r="40" fill="none" stroke="#f0c674" stroke-width="0.5" stroke-dasharray="2,3" opacity="0.7"/>
    <text x="0" y="-100" fill="#f0c674" font-family="JetBrains Mono" font-size="11" letter-spacing="2" text-anchor="middle">BAND STAGE</text>
    <text x="0" y="-86" fill="#f0c674" font-family="JetBrains Mono" font-size="8" letter-spacing="1" text-anchor="middle" opacity="0.7">20 FT · 5-PC JAZZ</text>
  </g>

  <g fill="#a89070">
    <circle cx="405" cy="340" r="14"/><circle cx="362" cy="414" r="14"/><circle cx="278" cy="414" r="14"/>
    <circle cx="235" cy="340" r="14"/><circle cx="278" cy="266" r="14"/><circle cx="362" cy="266" r="14"/>
  </g>
  <g fill="#c8a078">
    <circle cx="405" cy="340" r="8"/><circle cx="362" cy="414" r="8"/><circle cx="278" cy="414" r="8"/>
    <circle cx="235" cy="340" r="8"/><circle cx="278" cy="266" r="8"/><circle cx="362" cy="266" r="8"/>
  </g>

  <g>
    <rect x="215" y="165" width="55" height="28" fill="#1a1208" stroke="#6ec6ff" stroke-width="1.5"/>
    <text x="242" y="184" fill="#6ec6ff" font-family="JetBrains Mono" font-size="6" letter-spacing="1" text-anchor="middle">BILLBOARD</text>
    <rect x="370" y="165" width="55" height="28" fill="#1a1208" stroke="#6ec6ff" stroke-width="1.5"/>
    <text x="397" y="184" fill="#6ec6ff" font-family="JetBrains Mono" font-size="6" letter-spacing="1" text-anchor="middle">BILLBOARD</text>
  </g>

  <g>
    <rect x="55" y="140" width="42" height="36" fill="#5a4030"/><rect x="55" y="136" width="42" height="5" fill="#c85f38" opacity="0.7"/>
    <rect x="55" y="260" width="42" height="36" fill="#5a4030"/><rect x="55" y="256" width="42" height="5" fill="#c85f38" opacity="0.7"/>
    <rect x="55" y="380" width="42" height="36" fill="#5a4030"/><rect x="55" y="376" width="42" height="5" fill="#c85f38" opacity="0.7"/>
    <rect x="55" y="500" width="42" height="36" fill="#5a4030"/><rect x="55" y="496" width="42" height="5" fill="#c85f38" opacity="0.7"/>
    <rect x="543" y="140" width="42" height="36" fill="#5a4030"/><rect x="543" y="136" width="42" height="5" fill="#c85f38" opacity="0.7"/>
  </g>
  <text x="76" y="190" fill="#c85f38" font-family="JetBrains Mono" font-size="7" letter-spacing="1" text-anchor="middle">STALLS</text>

  <g transform="translate(320,490)">
    <ellipse cx="0" cy="8" rx="55" ry="5" fill="#000" opacity="0.5"/>
    <path d="M -50 0 Q -50 -16 -40 -18 L 40 -18 Q 50 -16 50 0 Z" fill="#8a2a2a"/>
    <path d="M -40 -18 L -20 -26 L 20 -26 L 40 -18" fill="#6a1a1a"/>
    <circle cx="-28" cy="6" r="7" fill="#0a0908"/><circle cx="28" cy="6" r="7" fill="#0a0908"/>
    <circle cx="-28" cy="6" r="4" fill="#d4a24c"/><circle cx="28" cy="6" r="4" fill="#d4a24c"/>
    <text x="0" y="26" fill="#c8583a" font-family="JetBrains Mono" font-size="8" letter-spacing="2" text-anchor="middle">LOWRIDER</text>
  </g>

  <g transform="translate(135,220)">
    <rect x="-22" y="-14" width="44" height="28" fill="#c85f38"/>
    <polygon points="-22,-14 22,-14 28,-22 -28,-22" fill="#8a4a30"/>
    <rect x="-18" y="-10" width="36" height="6" fill="#1a1208"/>
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

// ----- Inject SVGs into wraps -----
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
  if (id === '01') wrap.innerHTML = PLAN_01;
  else if (id === '02') wrap.innerHTML = PLAN_02;
});

// ----- Phase swap & marker tracking -----
const railFill = document.getElementById('railFill');
const marker = document.getElementById('spaceMarker');
const spaces = Array.from(document.querySelectorAll('.space'));
const slides = Array.from(document.querySelectorAll('[data-marker]'));

function phaseRanges(clusters){
  // 25% warehouse · 25% plan · (50% / clusters) per cluster
  const wh = [0.00, 0.22];
  const pl = [0.22, 0.45];
  const beats = [];
  const beatStart = 0.45;
  const beatSpan = 1 - beatStart;
  for (let i = 0; i < clusters; i++){
    beats.push([beatStart + (i/clusters)*beatSpan, beatStart + ((i+1)/clusters)*beatSpan]);
  }
  return { wh, pl, beats };
}

let ticking = false;
function onScroll(){
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    if (railFill) railFill.style.width = pct + '%';

    // active slide marker — pick whichever has most viewport coverage
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

    // Per-space phase swap
    spaces.forEach(space => {
      const wrap = space.querySelector('.space-pin-wrap');
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const total = r.height - vh;
      if (total <= 0) return;
      const progress = Math.max(0, Math.min(1, (-r.top) / total));
      const clusters = parseInt(wrap.dataset.clusters || '2', 10);
      const { wh, pl, beats } = phaseRanges(clusters);

      const phaseEls = space.querySelectorAll('.phase');
      const photoEl = space.querySelector('.phase-photo');
      const clusterEls = space.querySelectorAll('.cluster');

      // determine which phase
      let active = 'warehouse';
      if (progress < wh[1]) active = 'warehouse';
      else if (progress < pl[1]) active = 'plan';
      else active = 'photo';

      phaseEls.forEach(p => {
        p.classList.toggle('is-active', p.dataset.phase === active);
      });

      // determine which cluster (when in photo phase)
      if (active === 'photo'){
        let activeCluster = 0;
        for (let i = 0; i < beats.length; i++){
          if (progress >= beats[i][0] && progress < beats[i][1]){ activeCluster = i; break; }
          if (progress >= beats[i][1]) activeCluster = i;
        }
        clusterEls.forEach((c, i) => c.classList.toggle('is-active', i === activeCluster));
      } else {
        clusterEls.forEach(c => c.classList.remove('is-active'));
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
