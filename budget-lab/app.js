/* If I Awaken — Budget Lab
   Pure-static client: deep-clone v7 defaults, render UI, recompute on every input change.
*/

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const fmtMoney = (n, opts = {}) => {
  if (!isFinite(n)) return '—';
  const sign = n < 0 ? '-' : '';
  const a = Math.abs(n);
  if (opts.compact && a >= 1000) {
    if (a >= 1e6) return sign + '$' + (a / 1e6).toFixed(2) + 'M';
    return sign + '$' + (a / 1000).toFixed(1) + 'K';
  }
  return sign + '$' + a.toLocaleString(undefined, { maximumFractionDigits: 0 });
};
const fmtPct = (n) => isFinite(n) ? (n * 100).toFixed(1) + '%' : '—';
const fmtInt = (n) => isFinite(n) ? Math.round(n).toLocaleString() : '—';

const DAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_FLAG = {
  'Thursday': 'Community Night',
  'Saturday': 'Peak',
};
const DAY_FLAG_FULL = {
  'Thursday — COMMUNITY NIGHT': 'Thursday',
  'Saturday — PEAK': 'Saturday',
};
const TIERS = ['Community', 'Standard', 'Premium', 'VIP'];
const TIER_DESC = {
  Community: 'Accessible — students, neighborhood partners',
  Standard:  'Market rate — general audience',
  Premium:   'Theatergoers, tourists, immersive fans',
  VIP:       'Bar credit + gift voucher + priority',
};
const TIER_KEY = { Community: 'c', Standard: 's', Premium: 'p', VIP: 'v' };

// =================== STATE ===================
let state = null;

function deepClone(o) { return JSON.parse(JSON.stringify(o)); }

function freshStateFromV7() {
  const d = deepClone(window.V7_DEFAULTS);
  // Build a flat-keyed state
  const s = {
    capacityPct: 0.80,    // top-sheet projection toggle
    assumptionsLeft: d.assumptionsLeft,
    assumptionsRight: d.assumptionsRight,
    seating: d.seating.map(t => ({
      day: t.day.replace(/ —.*$/, ''),  // strip the "— COMMUNITY NIGHT" / "— PEAK" suffix
      dayFlag: (t.day.match(/—\s*(.+)$/) || [,''])[1] || '',
      tier: t.tier.replace(/\s*\(.*\)$/, ''),  // strip "(bar + shop voucher)" from VIP
      showsPerWeek: t.showsPerWeek,
      seatsPerShow: t.seatsPerShow,
      price: t.price,
    })),
    fnb: d.fnb.map(f => ({
      name: f.name,
      perCap: f.perCap,
      penetration: f.penetration,
      cogs: f.cogs,
    })),
    productionBudget: d.productionBudget.map(c => ({
      id: c.id, name: c.name, items: c.items, total: c.v7Total, isOverride: false, _v7: c.v7Total,
    })),
    weeklyOperating: d.weeklyOperating.map(c => ({
      id: c.id, name: c.name, items: c.items, total: c.v7Total, isOverride: false, _v7: c.v7Total,
    })),
  };
  return s;
}

// helpers to read assumptions by label
function asmGet(label) {
  const left = state.assumptionsLeft.find(x => x.label === label);
  if (left) return left.value;
  const right = state.assumptionsRight.find(x => x.label === label);
  if (right) return right.value;
  return null;
}
function asmSet(label, value) {
  const left = state.assumptionsLeft.find(x => x.label === label);
  if (left) { left.value = value; return; }
  const right = state.assumptionsRight.find(x => x.label === label);
  if (right) { right.value = value; }
}

// =================== COMPUTATION ===================
function compute() {
  const seatCap = +asmGet('Seat Capacity per show') || 0;
  const showsPerWeek = state.seating.reduce((acc, r) => {
    // Sum of unique day shows/wk (since each tier in a day shares it)
    return acc;
  }, 0);
  // Better: derive showsPerWeek as sum of distinct day showsPerWeek (already coupled per day in our state).
  const dayShows = {};
  for (const t of state.seating) {
    if (!(t.day in dayShows)) dayShows[t.day] = t.showsPerWeek;
  }
  const totalShows = Object.values(dayShows).reduce((a, b) => a + b, 0);

  const weeklyCapacity = seatCap * totalShows;

  // Ticket gross: sum over tiers of shows * seats * price
  let ticketGross = 0;
  let totalTickets = 0;
  for (const t of state.seating) {
    const g = (+t.showsPerWeek || 0) * (+t.seatsPerShow || 0) * (+t.price || 0);
    ticketGross += g;
    totalTickets += (+t.showsPerWeek || 0) * (+t.seatsPerShow || 0);
  }
  const avgTicket = totalTickets > 0 ? ticketGross / totalTickets : 0;

  // F&B / Merch — gross & net
  let fnbGross = 0, fnbNet = 0;
  let merchGross = 0, merchNet = 0;
  for (const f of state.fnb) {
    const g = (+f.perCap || 0) * weeklyCapacity * (+f.penetration || 0);
    const n = g * (1 - (+f.cogs || 0));
    if (/merch/i.test(f.name)) {
      merchGross += g; merchNet += n;
    } else {
      fnbGross += g; fnbNet += n;
    }
  }

  const grossCombined = ticketGross + fnbNet + merchNet;

  // Op costs
  const prodTotal = state.productionBudget.reduce((a, c) => a + (+c.total || 0), 0);
  const opTotal = state.weeklyOperating.reduce((a, c) => a + (+c.total || 0), 0);

  // Break-even: % of capacity at which combined weekly revenue covers weekly op.
  // Credit-card fees scale with ticket revenue (3% of GWBOR); rest is fixed.
  // F&B/Merch net is real revenue every show, so it offsets op cost.
  //   op(x) = op_fixed + 0.03 * x * ticketGross
  //   revenue(x) = x * (ticketGross + fnbNet + merchNet)
  //   solve: x * (0.97*ticketGross + fnbNet + merchNet) = op_fixed
  const opFixed = opTotal - 0.03 * ticketGross;
  const denom = 0.97 * ticketGross + fnbNet + merchNet;
  const breakevenPct = denom > 0 ? opFixed / denom : Infinity;

  // Weekly investment contribution at chosen capacity %
  const cap = state.capacityPct;
  const ticketAtCap = ticketGross * cap;
  const fnbNetAtCap = fnbNet * cap;
  const merchNetAtCap = merchNet * cap;
  const opAtCap = opFixed + 0.03 * ticketAtCap;
  const contribAtCap = ticketAtCap + fnbNetAtCap + merchNetAtCap - opAtCap;

  return {
    seatCap, totalShows, weeklyCapacity,
    ticketGross, avgTicket, totalTickets,
    fnbGross, fnbNet, merchGross, merchNet,
    grossCombined,
    prodTotal, opTotal,
    breakevenPct,
    contribAtCap,
    capacityPct: cap,
    runWeeks: +asmGet('Performance Weeks (run)') || 0,
  };
}

// =================== RENDERERS ===================

function renderTopSheet(c) {
  $('#kpi-shows').textContent = fmtInt(c.totalShows);
  $('#kpi-avgprice').textContent = '$' + (c.avgTicket || 0).toFixed(0);
  $('#kpi-cap').textContent = fmtInt(c.seatCap);
  $('#kpi-run').textContent = fmtInt(c.runWeeks) + ' wks';

  $('#kpi-gross').textContent = fmtMoney(c.grossCombined);
  $('#kpi-gross-tix').textContent = fmtMoney(c.ticketGross);
  $('#kpi-gross-fb').textContent  = fmtMoney(c.fnbNet);
  $('#kpi-gross-mc').textContent  = fmtMoney(c.merchNet);

  $('#kpi-op').textContent = fmtMoney(c.opTotal);
  $('#kpi-op-sub').textContent = fmtInt(c.runWeeks) + '-wk run = ' + fmtMoney(c.opTotal * c.runWeeks, { compact: true }) + ' total';

  const beEl = $('#kpi-be');
  beEl.textContent = isFinite(c.breakevenPct) ? fmtPct(c.breakevenPct) : '—';
  beEl.className = 'kpi-value ' + (c.breakevenPct > 1 ? 'kpi-negative' : c.breakevenPct < 0.7 ? 'kpi-positive' : '');

  const contribEl = $('#kpi-contrib');
  contribEl.textContent = fmtMoney(c.contribAtCap);
  contribEl.className = 'kpi-value ' + (c.contribAtCap < 0 ? 'kpi-negative' : 'kpi-positive');
  $('#kpi-contrib-cap').textContent = (c.capacityPct * 100).toFixed(0) + '%';
}

function renderTicketMatrix() {
  const root = $('#ticket-matrix');
  root.innerHTML = '';

  // Index seating by [day][tier]
  const byKey = {};
  const dayShowsOf = {};
  for (const t of state.seating) {
    const k = t.day + '|' + t.tier;
    byKey[k] = t;
    if (!(t.day in dayShowsOf)) dayShowsOf[t.day] = t.showsPerWeek;
  }

  // Header row
  const corner = el('div', 'tm-cell tm-corner', 'Tier × Day');
  root.appendChild(corner);
  for (const day of DAYS) {
    const col = el('div', 'tm-cell tm-day');
    const flag = (Object.values(state.seating).find(s => s.day === day) || {}).dayFlag || '';
    col.innerHTML = `
      <div class="tm-day-name">${day}</div>
      <div class="tm-day-flag">${flag || '&nbsp;'}</div>
      <div class="tm-day-shows">
        <label>Shows</label>
        <input type="number" min="0" step="1" value="${dayShowsOf[day] ?? 0}" data-day="${day}" data-field="dayShows">
      </div>
    `;
    root.appendChild(col);
  }

  // Tier rows
  for (const tier of TIERS) {
    const tierCell = el('div', `tm-cell tm-tier tm-tier-${TIER_KEY[tier]}`);
    tierCell.innerHTML = `
      <div class="tm-tier-name">${tier}</div>
      <div class="tm-tier-desc">${TIER_DESC[tier] || ''}</div>
    `;
    root.appendChild(tierCell);

    for (const day of DAYS) {
      const t = byKey[day + '|' + tier];
      const cell = el('div', 'tm-cell tm-cell-edit');
      if (!t) {
        cell.classList.add('empty');
        cell.innerHTML = `<div class="tm-cell-empty-add">＋ Add ${tier}<br>tier on ${day}</div>`;
        cell.addEventListener('click', () => {
          state.seating.push({
            day, dayFlag: (Object.values(state.seating).find(s => s.day === day) || {}).dayFlag || '',
            tier, showsPerWeek: dayShowsOf[day] || 0, seatsPerShow: 0, price: 0,
          });
          rerender();
        });
      } else {
        cell.innerHTML = `
          <div class="tm-input-row">
            <span class="tm-input-label">Seats / show</span>
            <input class="tm-input" type="number" min="0" step="1" value="${t.seatsPerShow}" data-day="${day}" data-tier="${tier}" data-field="seatsPerShow">
          </div>
          <div class="tm-input-row">
            <span class="tm-input-label">Price</span>
            <input class="tm-input price" type="number" min="0" step="1" value="${t.price}" data-day="${day}" data-tier="${tier}" data-field="price">
          </div>
          <div class="tm-cell-foot">
            <span>Wk gross <b>${fmtMoney(t.showsPerWeek * t.seatsPerShow * t.price)}</b></span>
            <button class="tm-clear" title="Remove tier" data-day="${day}" data-tier="${tier}" data-field="remove">remove</button>
          </div>
        `;
      }
      root.appendChild(cell);
    }
  }

  // Wire input listeners
  $$('input[data-field]', root).forEach(inp => {
    inp.addEventListener('input', onTicketEdit);
  });
  $$('button[data-field=remove]', root).forEach(b => {
    b.addEventListener('click', () => {
      state.seating = state.seating.filter(t => !(t.day === b.dataset.day && t.tier === b.dataset.tier));
      rerender();
    });
  });

  // Stats panel
  const c = compute();
  $('#ticket-stats').innerHTML = `
    <div>Weekly capacity: <b>${fmtInt(c.weeklyCapacity)}</b> seats</div>
    <div>Tickets at 100%: <b>${fmtInt(c.totalTickets)}</b></div>
    <div>Avg ticket: <b>$${(c.avgTicket || 0).toFixed(2)}</b></div>
    <div>Weekly gross potential: <b>${fmtMoney(c.ticketGross)}</b></div>
  `;

  // Warnings: per-day seat sum vs capacity
  const seatCap = +asmGet('Seat Capacity per show') || 0;
  const warns = [];
  for (const day of DAYS) {
    const dayTiers = state.seating.filter(t => t.day === day);
    const seatSum = dayTiers.reduce((a, t) => a + (+t.seatsPerShow || 0), 0);
    if (seatSum > 0 && seatSum !== seatCap) {
      warns.push(`<span class="warn">${day}: tiers sum to ${seatSum} seats / show — does not match capacity of ${seatCap}.</span>`);
    }
  }
  $('#ticket-warnings').innerHTML = warns.join('');
}

function onTicketEdit(e) {
  const v = +e.target.value;
  const { day, tier, field } = e.target.dataset;
  if (field === 'dayShows') {
    // Update shows/week for every tier on that day
    state.seating.forEach(t => { if (t.day === day) t.showsPerWeek = v; });
    rerenderSilent(); // recompute, no full ticket rebuild needed (we'll just refresh kpi/stats and footers)
    refreshTicketFooters();
    refreshAll();
    return;
  }
  const t = state.seating.find(t => t.day === day && t.tier === tier);
  if (!t) return;
  t[field] = v;
  refreshTicketFooters();
  refreshAll();
}

function refreshTicketFooters() {
  $$('.tm-cell-edit', $('#ticket-matrix')).forEach(cell => {
    const inputs = $$('input', cell);
    if (inputs.length < 2) return;
    const day = inputs[0].dataset.day;
    const tier = inputs[0].dataset.tier;
    const t = state.seating.find(t => t.day === day && t.tier === tier);
    if (!t) return;
    const foot = $('.tm-cell-foot b', cell);
    if (foot) foot.textContent = fmtMoney((t.showsPerWeek||0) * (t.seatsPerShow||0) * (t.price||0));
  });
}

function renderFnb() {
  const root = $('#fnb-table');
  root.innerHTML = '';
  const headers = ['Category', 'Per-cap ($)', 'Penetration', 'COGS %', 'Weekly gross', 'Weekly net'];
  for (const h of headers) root.appendChild(el('div', 'fnb-h', h));

  const c = compute();
  const weeklyCapacity = c.weeklyCapacity;

  state.fnb.forEach((f, idx) => {
    const gross = (+f.perCap || 0) * weeklyCapacity * (+f.penetration || 0);
    const net = gross * (1 - (+f.cogs || 0));
    const row = [
      el('div', 'fnb-c label', f.name),
      makeFnbInput(idx, 'perCap', f.perCap, '0.5'),
      makeFnbInput(idx, 'penetration', f.penetration, '0.01', { isPct: true }),
      makeFnbInput(idx, 'cogs', f.cogs, '0.01', { isPct: true }),
      el('div', 'fnb-c computed', fmtMoney(gross)),
      el('div', 'fnb-c computed', `<b>${fmtMoney(net)}</b>`),
    ];
    row.forEach(c => root.appendChild(c));
  });
}

function makeFnbInput(idx, field, value, step, opts={}) {
  const wrap = el('div', 'fnb-c');
  const input = document.createElement('input');
  input.type = 'number';
  input.step = step;
  input.value = opts.isPct ? (value * 100).toFixed(1) : value;
  input.dataset.idx = idx;
  input.dataset.field = field;
  if (opts.isPct) input.dataset.pct = '1';
  input.addEventListener('input', e => {
    let v = +e.target.value;
    if (e.target.dataset.pct) v = v / 100;
    state.fnb[idx][field] = v;
    refreshAll();
  });
  wrap.appendChild(input);
  if (opts.isPct) {
    const pct = document.createElement('span');
    pct.textContent = ' %';
    pct.style.cssText = 'font-size:11px;color:var(--ink-soft);margin-left:4px;';
    wrap.appendChild(pct);
  }
  return wrap;
}

function renderAssumptions() {
  const left = $('#asm-left');
  const right = $('#asm-right');
  left.innerHTML = ''; right.innerHTML = '';
  state.assumptionsLeft.forEach((a, i) => left.appendChild(makeAsmRow('left', i, a)));
  state.assumptionsRight.forEach((a, i) => right.appendChild(makeAsmRow('right', i, a)));
}

function makeAsmRow(col, idx, a) {
  const row = el('div', 'asm-row');
  row.innerHTML = `<div class="asm-label">${a.label}</div>`;
  const isText = typeof a.value === 'string';
  if (isText) row.classList.add('text-input');
  const input = document.createElement('input');
  input.type = isText ? 'text' : 'number';
  input.step = isText ? null : 'any';
  input.value = a.value;
  input.dataset.col = col;
  input.dataset.idx = idx;
  input.addEventListener('input', () => {
    const v = isText ? input.value : (+input.value);
    if (col === 'left') state.assumptionsLeft[idx].value = v;
    else state.assumptionsRight[idx].value = v;
    refreshAll();
  });
  row.appendChild(input);
  return row;
}

function renderCategoryList(cats, rootSel, grandSel) {
  const root = $(rootSel);
  root.innerHTML = '';
  cats.forEach((c, i) => root.appendChild(makeCategoryRow(cats, c, i)));
  refreshGrand(cats, grandSel);
}

function refreshGrand(cats, grandSel) {
  const total = cats.reduce((a, c) => a + (+c.total || 0), 0);
  $(grandSel).innerHTML = `Grand Total<br><b>${fmtMoney(total)}</b>`;
}

function makeCategoryRow(cats, cat, idx) {
  const wrap = el('div', 'cat');
  const itemSum = cat.items.reduce((a, i) => a + i.amount, 0);
  const v7 = cat._v7;
  const delta = (cat.total || 0) - v7;
  const deltaClass = Math.abs(delta) < 0.5 ? '' : (delta > 0 ? 'up' : 'down');
  const deltaTxt = Math.abs(delta) < 0.5 ? `≡ v7` : (delta > 0 ? `+${fmtMoney(delta, {compact:true})}` : `${fmtMoney(delta, {compact:true})}`);

  wrap.innerHTML = `
    <div class="cat-head">
      <div class="cat-toggle">＋</div>
      <div class="cat-name"><span class="cat-id">${cat.id}</span>${escapeHtml(cat.name.replace(/^\(\d+[a-z]?\)\s*/,''))}</div>
      <div class="cat-total-wrap">
        <input type="number" class="cat-total ${cat.isOverride ? 'dirty' : ''}" value="${cat.total}" step="1">
        <button class="cat-reset" title="Reset to v7">v7</button>
      </div>
      <div class="cat-delta ${deltaClass}">${deltaTxt}</div>
    </div>
    <div class="cat-body"></div>
  `;

  const head = $('.cat-head', wrap);
  const body = $('.cat-body', wrap);
  const totalInput = $('.cat-total', wrap);
  const resetBtn = $('.cat-reset', wrap);

  // Build line item table lazily on first expand
  let built = false;
  const buildBody = () => {
    if (built) return; built = true;
    const lineSum = cat.items.reduce((a, i) => a + i.amount, 0);
    let rows = '';
    for (const it of cat.items) {
      rows += `<tr><td class="code">${escapeHtml(it.code)}</td><td>${escapeHtml(it.name)}</td><td class="amt">${fmtMoney(it.amount)}</td></tr>`;
    }
    body.innerHTML = `
      <table class="cat-items">
        <thead><tr><th>Code</th><th>Line item (v7)</th><th class="amt">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td></td><td><b>Sum of v7 line items</b></td><td class="amt"><b>${fmtMoney(lineSum)}</b></td></tr></tfoot>
      </table>
      <p class="cat-body-note">Line items shown for reference. Editing the category total above overrides this rollup.</p>
    `;
  };

  head.addEventListener('click', e => {
    // Don't toggle if clicking on the input/button/delta
    if (e.target.closest('input, button, .cat-delta')) return;
    wrap.classList.toggle('open');
    if (wrap.classList.contains('open')) {
      $('.cat-toggle', wrap).textContent = '−';
      buildBody();
    } else {
      $('.cat-toggle', wrap).textContent = '＋';
    }
  });

  totalInput.addEventListener('input', () => {
    cat.total = +totalInput.value || 0;
    cat.isOverride = Math.abs(cat.total - cat._v7) > 0.5;
    totalInput.classList.toggle('dirty', cat.isOverride);
    // Update delta display
    const d = cat.total - cat._v7;
    const deltaEl = $('.cat-delta', wrap);
    deltaEl.className = 'cat-delta ' + (Math.abs(d) < 0.5 ? '' : (d > 0 ? 'up' : 'down'));
    deltaEl.textContent = Math.abs(d) < 0.5 ? '≡ v7' : (d > 0 ? `+${fmtMoney(d,{compact:true})}` : fmtMoney(d,{compact:true}));
    refreshAll();
  });

  resetBtn.addEventListener('click', e => {
    e.stopPropagation();
    cat.total = cat._v7;
    cat.isOverride = false;
    totalInput.value = cat._v7;
    totalInput.classList.remove('dirty');
    const deltaEl = $('.cat-delta', wrap);
    deltaEl.className = 'cat-delta';
    deltaEl.textContent = '≡ v7';
    refreshAll();
  });

  return wrap;
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

// =================== ORCHESTRATION ===================
function rerender() {
  renderTopSheet(compute());
  renderTicketMatrix();
  renderFnb();
  renderAssumptions();
  renderCategoryList(state.productionBudget, '#prod-list', '#prod-grand');
  renderCategoryList(state.weeklyOperating, '#ops-list', '#ops-grand');
  updateHash();
}
function rerenderSilent() {
  // Just recompute & refresh KPIs + grands, without full rebuild of categories/fnb
}
function refreshAll() {
  const c = compute();
  renderTopSheet(c);
  // Refresh F&B computed cells live (they depend on weekly capacity)
  refreshFnbComputed(c);
  refreshGrand(state.productionBudget, '#prod-grand');
  refreshGrand(state.weeklyOperating, '#ops-grand');
  updateHash();
}
function refreshFnbComputed(c) {
  // Only refresh the computed (non-input) cells in F&B without rebuilding inputs (avoids losing focus).
  const root = $('#fnb-table');
  if (!root) return;
  const computed = $$('.fnb-c.computed', root);
  if (computed.length === 0) return;
  state.fnb.forEach((f, idx) => {
    const gross = (+f.perCap || 0) * c.weeklyCapacity * (+f.penetration || 0);
    const net = gross * (1 - (+f.cogs || 0));
    const grossEl = computed[idx * 2];
    const netEl = computed[idx * 2 + 1];
    if (grossEl) grossEl.textContent = fmtMoney(gross);
    if (netEl) netEl.innerHTML = `<b>${fmtMoney(net)}</b>`;
  });
}

// =================== HASH STATE (share URL) ===================
function updateHash() {
  // Build a minimal diff vs v7 baseline
  const v7 = window.V7_DEFAULTS;
  const diff = { c: state.capacityPct };

  const al = state.assumptionsLeft.map(a => a.value);
  const ar = state.assumptionsRight.map(a => a.value);
  const v7al = v7.assumptionsLeft.map(a => a.value);
  const v7ar = v7.assumptionsRight.map(a => a.value);
  if (JSON.stringify(al) !== JSON.stringify(v7al)) diff.al = al;
  if (JSON.stringify(ar) !== JSON.stringify(v7ar)) diff.ar = ar;

  const seat = state.seating.map(t => [t.day, t.tier, t.showsPerWeek, t.seatsPerShow, t.price]);
  const v7seat = v7.seating.map(t => [t.day.replace(/ —.*$/,''), t.tier.replace(/\s*\(.*\)$/,''), t.showsPerWeek, t.seatsPerShow, t.price]);
  if (JSON.stringify(seat) !== JSON.stringify(v7seat)) diff.s = seat;

  const fnb = state.fnb.map(f => [f.perCap, f.penetration, f.cogs]);
  const v7fnb = v7.fnb.map(f => [f.perCap, f.penetration, f.cogs]);
  if (JSON.stringify(fnb) !== JSON.stringify(v7fnb)) diff.f = fnb;

  const prodOv = {}, opsOv = {};
  state.productionBudget.forEach(c => { if (c.isOverride) prodOv[c.id] = c.total; });
  state.weeklyOperating.forEach(c => { if (c.isOverride) opsOv[c.id] = c.total; });
  if (Object.keys(prodOv).length) diff.p = prodOv;
  if (Object.keys(opsOv).length) diff.o = opsOv;

  const enc = btoa(unescape(encodeURIComponent(JSON.stringify(diff)))).replace(/=+$/, '');
  if (location.hash !== '#s=' + enc) {
    history.replaceState(null, '', '#s=' + enc);
  }
  $('#hash-state').textContent = `${enc.length} bytes encoded`;
}

function loadFromHash() {
  if (!location.hash.startsWith('#s=')) return false;
  try {
    const enc = location.hash.slice(3);
    const json = decodeURIComponent(escape(atob(enc)));
    const d = JSON.parse(json);
    if (d.c != null) state.capacityPct = +d.c;
    if (d.al) state.assumptionsLeft.forEach((a, i) => { if (d.al[i] !== undefined) a.value = d.al[i]; });
    if (d.ar) state.assumptionsRight.forEach((a, i) => { if (d.ar[i] !== undefined) a.value = d.ar[i]; });
    if (d.s) {
      // Replace seating entirely
      state.seating = d.s.map(([day, tier, sw, sp, p]) => ({
        day, dayFlag: DAY_FLAG[day] || '', tier, showsPerWeek: sw, seatsPerShow: sp, price: p
      }));
    }
    if (d.f) {
      d.f.forEach((row, i) => {
        if (state.fnb[i]) {
          state.fnb[i].perCap = row[0];
          state.fnb[i].penetration = row[1];
          state.fnb[i].cogs = row[2];
        }
      });
    }
    if (d.p) state.productionBudget.forEach(c => { if (d.p[c.id] != null) { c.total = d.p[c.id]; c.isOverride = true; } });
    if (d.o) state.weeklyOperating.forEach(c => { if (d.o[c.id] != null) { c.total = d.o[c.id]; c.isOverride = true; } });
    return true;
  } catch (e) {
    console.warn('Could not load hash state:', e);
    return false;
  }
}

// =================== SAVE / LOAD scenarios (localStorage) ===================
const LS_KEY = 'iia_budget_lab_scenarios_v1';
function loadScenarios() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch { return {}; }
}
function saveScenarios(s) {
  localStorage.setItem(LS_KEY, JSON.stringify(s));
}

function showSaveDialog() {
  const dlg = $('#save-dialog');
  $('#save-name').value = '';
  refreshSaveList();
  dlg.showModal();
  dlg.addEventListener('close', () => {
    if (dlg.returnValue === 'save') {
      const name = $('#save-name').value.trim();
      if (!name) return;
      const all = loadScenarios();
      all[name] = { hash: location.hash, savedAt: new Date().toISOString() };
      saveScenarios(all);
    }
  }, { once: true });
}

function refreshSaveList() {
  const list = $('#save-list');
  const all = loadScenarios();
  const names = Object.keys(all).sort();
  if (names.length === 0) {
    list.innerHTML = '<li style="color:var(--ink-soft);font-style:italic;">No saved scenarios yet.</li>';
    return;
  }
  list.innerHTML = '';
  for (const n of names) {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${escapeHtml(n)}</span>
      <span>
        <button class="load" data-name="${escapeHtml(n)}">Load</button>
        <button class="del" data-name="${escapeHtml(n)}">Delete</button>
      </span>
    `;
    list.appendChild(li);
  }
  $$('.load', list).forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    const all = loadScenarios();
    const sc = all[b.dataset.name];
    if (sc) {
      location.hash = sc.hash;
      $('#save-dialog').close();
      bootstrap();
    }
  }));
  $$('.del', list).forEach(b => b.addEventListener('click', e => {
    e.preventDefault();
    const all = loadScenarios();
    delete all[b.dataset.name];
    saveScenarios(all);
    refreshSaveList();
  }));
}

// =================== BOOT ===================
function bootstrap() {
  state = freshStateFromV7();
  loadFromHash();
  rerender();
  $('#cap-slider').value = Math.round(state.capacityPct * 100);
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrap();

  $('#cap-slider').addEventListener('input', e => {
    state.capacityPct = (+e.target.value) / 100;
    refreshAll();
  });

  $('#btn-reset').addEventListener('click', () => {
    if (confirm('Reset all values to v7 defaults? Any unsaved changes will be lost.')) {
      history.replaceState(null, '', location.pathname);
      bootstrap();
    }
  });

  $('#btn-share').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      const btn = $('#btn-share');
      const old = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = old, 1400);
    } catch {
      prompt('Copy this URL:', location.href);
    }
  });

  $('#btn-save').addEventListener('click', showSaveDialog);
});
