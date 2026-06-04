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
    corporateEvents: {
      types: d.corporateEvents.types.map(t => ({
        name: t.name, price: t.price, cost: t.cost, perMonth: t.perMonth,
      })),
    },
    cashReserve: {
      weeks: d.cashReserve.weeks,
      useFormula: d.cashReserve.useFormula,
      amountOverride: d.cashReserve.amountOverride,
    },
    preproductionBudget: d.preproductionBudget.map(c => ({
      id: c.id, name: c.name, items: c.items, total: c.v7Total, isOverride: false, _v7: c.v7Total,
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
  const preprodTotal = state.preproductionBudget.reduce((a, c) => a + (+c.total || 0), 0);
  const prodTotal = state.productionBudget.reduce((a, c) => a + (+c.total || 0), 0);
  const opTotal = state.weeklyOperating.reduce((a, c) => a + (+c.total || 0), 0);

  // Corporate events (dark-day rentals)
  const runWeeks = +asmGet('Performance Weeks (run)') || 0;
  const runMonths = runWeeks / (52 / 12);  // ~4.333 weeks/month
  let eventsMonthlyGross = 0, eventsMonthlyCost = 0;
  for (const t of state.corporateEvents.types) {
    const gross = (+t.price || 0) * (+t.perMonth || 0);
    const cost = (+t.cost || 0) * (+t.perMonth || 0);
    eventsMonthlyGross += gross;
    eventsMonthlyCost += cost;
  }
  const eventsMonthlyNet = eventsMonthlyGross - eventsMonthlyCost;
  const eventsRunGross = eventsMonthlyGross * runMonths;
  const eventsRunNet = eventsMonthlyNet * runMonths;

  // Cash on hand / operating reserve
  const cashFormula = (+state.cashReserve.weeks || 0) * opTotal;
  const cashReserveAmount = state.cashReserve.useFormula
    ? cashFormula
    : (+state.cashReserve.amountOverride || 0);

  // Break-even: % of capacity at which combined weekly revenue covers weekly op.
  // Credit-card fees scale with ticket revenue (3% of GWBOR); rest is fixed.
  // F&B/Merch net is real revenue every show, so it offsets op cost.
  //   op(x) = op_fixed + 0.03 * x * ticketGross
  //   revenue(x) = x * (ticketGross + fnbNet + merchNet)
  //   solve: x * (0.97*ticketGross + fnbNet + merchNet) = op_fixed
  const opFixed = opTotal - 0.03 * ticketGross;
  const denom = 0.97 * ticketGross + fnbNet + merchNet;
  const breakevenPct = denom > 0 ? opFixed / denom : Infinity;

  // Weekly net profit scenarios: 50% / 75% / 100% of tickets sold.
  // Revenue at x% sold = x * (ticketGross + fnbNet + merchNet)
  // Op at x% sold = opFixed + 0.03 * x * ticketGross  (only CC fee varies)
  // Net = revenue - op = x*(0.97*ticketGross + fnbNet + merchNet) - opFixed
  // Months to recoup $8M (linear, assumes no other claim on weekly net):
  //   months = 8_000_000 / (weeklyNet * 4.33)
  const RECOUP_TARGET = 8_000_000;
  const WEEKS_PER_MONTH = 4.33;
  const scenarioFor = (pct) => {
    const weeklyNet = pct * (0.97 * ticketGross + fnbNet + merchNet) - opFixed;
    const monthsToRecoup = weeklyNet > 0
      ? RECOUP_TARGET / (weeklyNet * WEEKS_PER_MONTH)
      : Infinity;
    return { pct, weeklyNet, monthsToRecoup };
  };
  const scenarios = {
    s50:  scenarioFor(0.50),
    s75:  scenarioFor(0.75),
    s100: scenarioFor(1.00),
  };

  return {
    seatCap, totalShows, weeklyCapacity,
    ticketGross, avgTicket, totalTickets,
    fnbGross, fnbNet, merchGross, merchNet,
    grossCombined,
    preprodTotal, prodTotal, opTotal,
    breakevenPct,
    scenarios,
    runWeeks,
    runMonths,
    eventsMonthlyGross, eventsMonthlyCost, eventsMonthlyNet,
    eventsRunGross, eventsRunNet,
    cashReserveAmount,
    cashFormula,
  };
}

// =================== RENDERERS ===================

function renderTopSheet(c) {
  $('#kpi-shows').textContent = fmtInt(c.totalShows);
  $('#kpi-avgprice').textContent = '$' + (c.avgTicket || 0).toFixed(0);
  $('#kpi-cap').textContent = fmtInt(c.seatCap);
  $('#kpi-run').textContent = fmtInt(c.runWeeks) + ' wks';
  const runSubEl = $('#kpi-run-sub');
  if (runSubEl) {
    const months = c.runMonths;
    const monthsTxt = months >= 10 ? months.toFixed(1) : months.toFixed(1);
    runSubEl.textContent = `performance weeks · ≈ ${monthsTxt} months`;
  }

  $('#kpi-gross').textContent = fmtMoney(c.grossCombined);
  $('#kpi-gross-tix').textContent = fmtMoney(c.ticketGross);
  $('#kpi-gross-fb').textContent  = fmtMoney(c.fnbNet);
  $('#kpi-gross-mc').textContent  = fmtMoney(c.merchNet);

  $('#kpi-op').textContent = fmtMoney(c.opTotal);
  $('#kpi-op-sub').textContent = fmtInt(c.runWeeks) + '-wk run = ' + fmtMoney(c.opTotal * c.runWeeks, { compact: true }) + ' total';

  const beEl = $('#kpi-be');
  beEl.textContent = isFinite(c.breakevenPct) ? fmtPct(c.breakevenPct) : '—';
  beEl.className = 'kpi-value ' + (c.breakevenPct > 1 ? 'kpi-negative' : c.breakevenPct < 0.7 ? 'kpi-positive' : '');

  // Weekly Investment Contribution — 3-row scenario table (50/75/100% sold)
  const fmtMonths = (m) => {
    if (!isFinite(m)) return '—';
    if (m > 999) return '>999 mo';
    if (m >= 100) return Math.round(m) + ' mo';
    return m.toFixed(1) + ' mo';
  };
  const renderScenario = (key, suffix) => {
    const s = c.scenarios[key];
    const netEl = $('#kpi-net-' + suffix);
    const moEl  = $('#kpi-mo-'  + suffix);
    if (netEl) {
      netEl.textContent = fmtMoney(s.weeklyNet);
      netEl.classList.toggle('neg', s.weeklyNet < 0);
      netEl.classList.toggle('pos', s.weeklyNet > 0);
    }
    if (moEl) {
      moEl.textContent = fmtMonths(s.monthsToRecoup);
      moEl.classList.toggle('neg', !isFinite(s.monthsToRecoup));
    }
  };
  renderScenario('s50',  '50');
  renderScenario('s75',  '75');
  renderScenario('s100', '100');

  // Capitalization block — Preprod (R1) + Production (R2) + Cash Reserve (R3)
  const opRun = c.opTotal * c.runWeeks;
  const totalCap = c.preprodTotal + c.prodTotal + c.cashReserveAmount;
  const valuation = c.preprodTotal > 0 ? Math.round(c.preprodTotal / 0.10) : 0;
  $('#kpi-preprod').textContent = fmtMoney(c.preprodTotal, { compact: true });
  const preprodDelta = c.preprodTotal - 1_000_000;
  $('#kpi-preprod-sub').innerHTML =
    'Round 1 · ' +
    (Math.abs(preprodDelta) < 500
      ? '<b style="color:var(--accent-pos)">$1M for 10% equity</b>'
      : preprodDelta > 0
        ? `$1M for 10% · <b style="color:var(--accent-neg)">+${fmtMoney(preprodDelta, { compact: true })}</b>`
        : `$1M for 10% · <b>${fmtMoney(-preprodDelta, { compact: true })} under</b>`);
  $('#kpi-prod').textContent = fmtMoney(c.prodTotal, { compact: true });
  $('#kpi-prod-sub').textContent = 'Round 2 · one-time build';
  $('#kpi-oprun').textContent = fmtMoney(opRun, { compact: true });
  $('#kpi-oprun-sub').textContent = fmtInt(c.runWeeks) + '-wk run · operating';
  $('#kpi-totalcap').textContent = fmtMoney(totalCap, { compact: true });
  $('#kpi-totalcap-sub').innerHTML = `Total raise · post-money <b>${fmtMoney(valuation, { compact: true })}</b>`;

  // Cash on Hand KPI (R3)
  const cashEl = $('#kpi-cash');
  if (cashEl) cashEl.textContent = fmtMoney(c.cashReserveAmount, { compact: true });
  const cashSubEl = $('#kpi-cash-sub');
  if (cashSubEl) cashSubEl.innerHTML = `Round 3 · ${state.cashReserve.weeks} wks × weekly op`;

  // Corporate Events KPI (Economics block)
  const eventsEl = $('#kpi-events');
  if (eventsEl) {
    eventsEl.textContent = fmtMoney(c.eventsRunNet, { compact: true });
    eventsEl.className = 'kpi-value ' + (c.eventsRunNet > 0 ? 'kpi-positive' : '');
  }
  const eventsSubEl = $('#kpi-events-sub');
  if (eventsSubEl) {
    const bookings = state.corporateEvents.types.reduce((a, t) => a + (+t.perMonth || 0), 0);
    eventsSubEl.textContent = `${bookings}/mo · ${fmtInt(c.runMonths)} mo run`;
  }
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
  if (opts.isPct) {
    // input + % suffix on the same row, % to the right of the number
    const inner = el('div', 'fnb-pct-wrap');
    inner.appendChild(input);
    const suffix = document.createElement('span');
    suffix.className = 'fnb-pct-suffix';
    suffix.textContent = '%';
    inner.appendChild(suffix);
    wrap.appendChild(inner);
  } else {
    wrap.appendChild(input);
  }
  return wrap;
}

// Hide editorial breakdown rows that aren't useful for what-if testing
const HIDDEN_ASSUMPTIONS = new Set(['of which AEA', 'of which non-union']);
// Everything after this label in the list moves to the right column
const ASSUMPTIONS_SPLIT_AFTER = 'Monthly Warehouse Rent';

function renderEvents() {
  const root = $('#events-grid');
  if (!root) return;
  root.innerHTML = '';

  // Header row
  const head = el('div', 'ev-row ev-row-head');
  head.innerHTML = `
    <div class="ev-c ev-c-name">Event type</div>
    <div class="ev-c ev-c-input">Avg price / booking</div>
    <div class="ev-c ev-c-input">Cost to run / booking</div>
    <div class="ev-c ev-c-input">Bookings / month</div>
    <div class="ev-c ev-c-out">Monthly gross</div>
    <div class="ev-c ev-c-out">Monthly net</div>
  `;
  root.appendChild(head);

  state.corporateEvents.types.forEach((t, idx) => {
    const row = el('div', 'ev-row');
    row.innerHTML = `
      <div class="ev-c ev-c-name">
        <input type="text" class="ev-name-input" value="${escapeHtml(t.name)}">
      </div>
      <div class="ev-c ev-c-input"><input type="text" inputmode="numeric" class="ev-price"  value="${fmtMoney(t.price)}"></div>
      <div class="ev-c ev-c-input"><input type="text" inputmode="numeric" class="ev-cost"   value="${fmtMoney(t.cost)}"></div>
      <div class="ev-c ev-c-input"><input type="number" min="0" step="1"  class="ev-pmonth" value="${t.perMonth}"></div>
      <div class="ev-c ev-c-out computed ev-gross"></div>
      <div class="ev-c ev-c-out computed ev-net"></div>
    `;
    const parseCurrency = s => {
      const n = Number(String(s).replace(/[^0-9.\-]/g, ''));
      return isFinite(n) ? n : 0;
    };
    const wireNum = (sel, key, parser = parseCurrency, isCurrency = true) => {
      const input = $(sel, row);
      input.addEventListener('focus', () => {
        input.value = isCurrency ? String(Math.round(t[key])) : String(t[key]);
        input.select();
      });
      input.addEventListener('input', () => {
        t[key] = parser(input.value);
        refreshAll();
      });
      input.addEventListener('blur', () => {
        input.value = isCurrency ? fmtMoney(t[key]) : String(t[key]);
      });
    };
    wireNum('.ev-price',  'price');
    wireNum('.ev-cost',   'cost');
    wireNum('.ev-pmonth', 'perMonth', s => Math.max(0, Math.round(+s || 0)), false);

    $('.ev-name-input', row).addEventListener('input', e => {
      t.name = e.target.value;
      updateHash();
    });

    root.appendChild(row);
  });

  // Totals footer
  const foot = el('div', 'ev-row ev-row-foot');
  foot.innerHTML = `
    <div class="ev-c ev-c-name"><b>Totals</b></div>
    <div class="ev-c"></div>
    <div class="ev-c"></div>
    <div class="ev-c ev-c-input"><b id="ev-total-bookings">—</b><span> /mo</span></div>
    <div class="ev-c ev-c-out computed"><b id="ev-total-gross">—</b></div>
    <div class="ev-c ev-c-out computed"><b id="ev-total-net">—</b></div>
  `;
  root.appendChild(foot);

  // Stats card (run-period)
  const stats = $('#events-stats');
  if (stats) {
    stats.innerHTML = `
      <div class="ev-stat">
        <div class="ev-stat-label">Run-period gross</div>
        <div class="ev-stat-val" id="ev-stat-gross">—</div>
      </div>
      <div class="ev-stat ev-stat-pos">
        <div class="ev-stat-label">Run-period net</div>
        <div class="ev-stat-val" id="ev-stat-net">—</div>
      </div>
    `;
  }

  refreshEventsComputed(compute());
}

function renderCashReserve() {
  const wks = $('#cash-weeks');
  const mode = $('#cash-mode');
  const amt = $('#cash-amount');
  if (!wks || !mode || !amt) return;

  wks.value = state.cashReserve.weeks;
  mode.value = state.cashReserve.useFormula ? 'formula' : 'manual';
  // amount filled by refresh function below

  const parseCurrency = s => {
    const n = Number(String(s).replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : 0;
  };

  wks.addEventListener('input', () => {
    state.cashReserve.weeks = Math.max(0, Math.round(+wks.value || 0));
    refreshAll();
  });
  mode.addEventListener('change', () => {
    state.cashReserve.useFormula = mode.value === 'formula';
    refreshAll();
  });
  amt.addEventListener('focus', () => {
    if (!state.cashReserve.useFormula) {
      amt.value = String(Math.round(state.cashReserve.amountOverride || 0));
      amt.select();
    }
  });
  amt.addEventListener('input', () => {
    if (!state.cashReserve.useFormula) {
      state.cashReserve.amountOverride = parseCurrency(amt.value);
      refreshAll();
    }
  });
  amt.addEventListener('blur', () => {
    amt.value = fmtMoney(state.cashReserve.useFormula
      ? compute().cashReserveAmount
      : state.cashReserve.amountOverride);
  });

  refreshCashComputed(compute());
}

function refreshCashComputed(c) {
  const wks = $('#cash-weeks');
  const mode = $('#cash-mode');
  const amt = $('#cash-amount');
  const grand = $('#cash-grand');
  const formHint = $('#cash-formula-hint');
  const amtHint = $('#cash-amount-hint');
  if (!wks) return;

  if (wks !== document.activeElement) wks.value = state.cashReserve.weeks;
  if (mode) mode.value = state.cashReserve.useFormula ? 'formula' : 'manual';
  if (amt && amt !== document.activeElement) amt.value = fmtMoney(c.cashReserveAmount);
  if (amt) amt.disabled = state.cashReserve.useFormula;

  if (formHint) formHint.textContent = `${state.cashReserve.weeks} wks × ${fmtMoney(c.opTotal)}/wk = ${fmtMoney(c.cashFormula)}`;
  if (amtHint) amtHint.textContent = state.cashReserve.useFormula
    ? 'Locked — change to Manual override to edit.'
    : 'Type any amount — overrides the formula.';
  if (grand) grand.innerHTML = `Reserve Total<br><b>${fmtMoney(c.cashReserveAmount)}</b>`;
}

function refreshEventsComputed(c) {
  const root = $('#events-grid');
  if (!root) return;
  const rows = $$('.ev-row:not(.ev-row-head):not(.ev-row-foot)', root);
  state.corporateEvents.types.forEach((t, idx) => {
    const row = rows[idx]; if (!row) return;
    const gross = (+t.price || 0) * (+t.perMonth || 0);
    const cost = (+t.cost || 0) * (+t.perMonth || 0);
    const net = gross - cost;
    $('.ev-gross', row).innerHTML = `<b>${fmtMoney(gross)}</b>`;
    $('.ev-net', row).innerHTML = `<b>${fmtMoney(net)}</b>`;
  });
  const tb = $('#ev-total-bookings');
  if (tb) tb.textContent = fmtInt(state.corporateEvents.types.reduce((a, t) => a + (+t.perMonth || 0), 0));
  const tg = $('#ev-total-gross');
  if (tg) tg.textContent = fmtMoney(c.eventsMonthlyGross);
  const tn = $('#ev-total-net');
  if (tn) tn.textContent = fmtMoney(c.eventsMonthlyNet);
  const sg = $('#ev-stat-gross');
  if (sg) sg.textContent = fmtMoney(c.eventsRunGross, { compact: true });
  const sn = $('#ev-stat-net');
  if (sn) sn.textContent = fmtMoney(c.eventsRunNet, { compact: true });
}

function renderAssumptions() {
  const left = $('#asm-left');
  const right = $('#asm-right');
  if (left) left.innerHTML = '';
  if (right) right.innerHTML = '';
  let movedToRight = false;
  state.assumptionsLeft.forEach((a, i) => {
    if (HIDDEN_ASSUMPTIONS.has(a.label.trim())) return;
    const row = makeAsmRow('left', i, a);
    const target = movedToRight && right ? right : left;
    if (target) target.appendChild(row);
    if (a.label.trim() === ASSUMPTIONS_SPLIT_AFTER) movedToRight = true;
  });
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

// Strip parenthetical "(WEEKLY)" and trailing " — +50%" / similar editorial annotations from category names
function cleanCategoryName(rawName) {
  return rawName
    .replace(/^\(\d+[a-z]?\)\s*/, '')
    .replace(/\s*\(WEEKLY\)\s*/i, '')
    .replace(/\s*—\s*\+\d+%\s*$/, '')
    .trim();
}

function makeCategoryRow(cats, cat, idx) {
  const wrap = el('div', 'cat');

  wrap.innerHTML = `
    <div class="cat-head">
      <div class="cat-toggle">＋</div>
      <div class="cat-name">${escapeHtml(cleanCategoryName(cat.name))}</div>
      <div class="cat-total-wrap">
        <input type="text" inputmode="numeric" class="cat-total ${cat.isOverride ? 'dirty' : ''}" value="${fmtMoney(cat.total)}">
      </div>
    </div>
    <div class="cat-body"></div>
  `;

  const head = $('.cat-head', wrap);
  const body = $('.cat-body', wrap);
  const totalInput = $('.cat-total', wrap);

  // Build line item table lazily on first expand
  let built = false;
  const buildBody = () => {
    if (built) return; built = true;
    const lineSum = cat.items.reduce((a, i) => a + i.amount, 0);
    let rows = '';
    for (const it of cat.items) {
      rows += `<tr><td>${escapeHtml(it.name)}</td><td class="amt">${fmtMoney(it.amount)}</td></tr>`;
    }
    body.innerHTML = `
      <table class="cat-items">
        <thead><tr><th>Line item (v7)</th><th class="amt">Amount</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td><b>Sum of v7 line items</b></td><td class="amt"><b>${fmtMoney(lineSum)}</b></td></tr></tfoot>
      </table>
      <p class="cat-body-note">Line items shown for reference. Editing the category total above overrides this rollup.</p>
    `;
  };

  head.addEventListener('click', e => {
    // Don't toggle if clicking on the input
    if (e.target.closest('input')) return;
    wrap.classList.toggle('open');
    if (wrap.classList.contains('open')) {
      $('.cat-toggle', wrap).textContent = '−';
      buildBody();
    } else {
      $('.cat-toggle', wrap).textContent = '＋';
    }
  });

  // Currency-aware text input: parse digits on change, reformat on blur, plain digits on focus.
  const parseCurrency = (s) => {
    const n = Number(String(s).replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : 0;
  };
  totalInput.addEventListener('focus', () => {
    totalInput.value = String(Math.round(cat.total));
    totalInput.select();
  });
  totalInput.addEventListener('input', () => {
    cat.total = parseCurrency(totalInput.value);
    cat.isOverride = Math.abs(cat.total - cat._v7) > 0.5;
    totalInput.classList.toggle('dirty', cat.isOverride);
    refreshAll();
  });
  totalInput.addEventListener('blur', () => {
    totalInput.value = fmtMoney(cat.total);
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
  renderEvents();
  renderAssumptions();
  renderCategoryList(state.preproductionBudget, '#prepro-list', '#prepro-grand');
  renderCategoryList(state.productionBudget, '#prod-list', '#prod-grand');
  renderCategoryList(state.weeklyOperating, '#ops-list', '#ops-grand');
  renderCashReserve();
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
  refreshEventsComputed(c);
  refreshCashComputed(c);
  refreshGrand(state.preproductionBudget, '#prepro-grand');
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

  const ev = state.corporateEvents.types.map(t => [t.name, t.price, t.cost, t.perMonth]);
  const v7ev = v7.corporateEvents.types.map(t => [t.name, t.price, t.cost, t.perMonth]);
  if (JSON.stringify(ev) !== JSON.stringify(v7ev)) diff.e = ev;

  const cr = [state.cashReserve.weeks, state.cashReserve.useFormula ? 1 : 0, state.cashReserve.amountOverride];
  const v7cr = [v7.cashReserve.weeks, v7.cashReserve.useFormula ? 1 : 0, v7.cashReserve.amountOverride];
  if (JSON.stringify(cr) !== JSON.stringify(v7cr)) diff.cr = cr;

  const preproOv = {}, prodOv = {}, opsOv = {};
  state.preproductionBudget.forEach(c => { if (c.isOverride) preproOv[c.id] = c.total; });
  state.productionBudget.forEach(c => { if (c.isOverride) prodOv[c.id] = c.total; });
  state.weeklyOperating.forEach(c => { if (c.isOverride) opsOv[c.id] = c.total; });
  if (Object.keys(preproOv).length) diff.pp = preproOv;
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
    if (d.e) {
      d.e.forEach((row, i) => {
        if (state.corporateEvents.types[i]) {
          state.corporateEvents.types[i].name = row[0];
          state.corporateEvents.types[i].price = row[1];
          state.corporateEvents.types[i].cost = row[2];
          state.corporateEvents.types[i].perMonth = row[3];
        }
      });
    }
    if (d.cr) {
      state.cashReserve.weeks = d.cr[0];
      state.cashReserve.useFormula = !!d.cr[1];
      state.cashReserve.amountOverride = d.cr[2];
    }
    if (d.pp) state.preproductionBudget.forEach(c => { if (d.pp[c.id] != null) { c.total = d.pp[c.id]; c.isOverride = true; } });
    if (d.p) state.productionBudget.forEach(c => { if (d.p[c.id] != null) { c.total = d.p[c.id]; c.isOverride = true; } });
    if (d.o) state.weeklyOperating.forEach(c => { if (d.o[c.id] != null) { c.total = d.o[c.id]; c.isOverride = true; } });
    return true;
  } catch (e) {
    console.warn('Could not load hash state:', e);
    return false;
  }
}

// =================== SAVE / LOAD scenarios (localStorage) ===================
const LS_KEY = 'iia_budget_lab_scenarios_v2';
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
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrap();

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
