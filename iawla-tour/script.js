/* ============================================================
   IF I AWAKEN IN LOS ANGELES — Investor Tour
   Navigation, progress, and beats-drawer logic
   ============================================================ */
(function () {
  'use strict';

  const slides = Array.from(document.querySelectorAll('.slide'));
  const navDots = Array.from(document.querySelectorAll('.nav-dot'));
  const progressEl = document.querySelector('#progress .current');
  const showMark = document.getElementById('showmark');
  const total = slides.length;

  // ---- Track current slide via IntersectionObserver ----
  let currentIndex = 0;
  function setCurrent(idx) {
    if (idx === currentIndex) return;
    currentIndex = idx;
    navDots.forEach((d, i) => d.classList.toggle('active', i === idx));
    if (progressEl) progressEl.textContent = String(idx + 1).padStart(2, '0');
    if (showMark) showMark.classList.toggle('visible', idx > 0 && idx < total - 1);
  }

  const io = new IntersectionObserver(
    (entries) => {
      // Pick the entry most in view
      let best = null;
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (best) {
        const idx = slides.indexOf(best.target);
        if (idx !== -1) setCurrent(idx);
      }
    },
    { threshold: [0.45, 0.55, 0.65] }
  );
  slides.forEach((s) => io.observe(s));

  // ---- Keyboard navigation ----
  function goTo(idx) {
    idx = Math.max(0, Math.min(total - 1, idx));
    slides[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function isDrawerOpen() {
    return document.querySelector('.drawer.open');
  }

  document.addEventListener('keydown', (e) => {
    // Don't intercept if typing in an input or if drawer is open (let Esc close drawer)
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

    if (isDrawerOpen()) {
      if (e.key === 'Escape') closeDrawer();
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        goTo(currentIndex + 1);
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        goTo(currentIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(total - 1);
        break;
    }
  });

  // ---- Side-nav clicks (smooth scroll instead of jumping) ----
  navDots.forEach((dot, i) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      goTo(i);
    });
  });

  // ---- Beat sequence drawers ----
  const backdrop = document.getElementById('drawer-backdrop');

  function openDrawer(key) {
    const drawer = document.getElementById('drawer-' + key);
    if (!drawer) return;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.querySelectorAll('.drawer.open').forEach((d) => {
      d.classList.remove('open');
      d.setAttribute('aria-hidden', 'true');
    });
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-open-beats]').forEach((btn) => {
    btn.addEventListener('click', () => openDrawer(btn.dataset.openBeats));
  });
  document.querySelectorAll('.drawer-close').forEach((btn) => {
    btn.addEventListener('click', closeDrawer);
  });
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  // ---- Plan SVG drag/snap (works on every .plan-svg) ----
  document.querySelectorAll('.plan-svg').forEach((svg) => initPlanDrag(svg));

  function initPlanDrag(svg) {
    const draggables = svg.querySelectorAll('[data-draggable]');
    if (!draggables.length) return;

    const planKey = svg.closest('.space-slide')?.dataset.key
      || svg.closest('.slide')?.id
      || 'plan';
    const STORAGE_KEY = 'iawla-plan-' + planKey;

    const defaults = {};
    draggables.forEach((el) => {
      const id = el.dataset.id;
      const m = (el.getAttribute('transform') || '').match(/translate\(([^,\s]+)[,\s]+([^)\s]+)\)/);
      defaults[id] = m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 0, y: 0 };
    });

    let positions = JSON.parse(JSON.stringify(defaults));

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        positions = { ...defaults, ...JSON.parse(saved) };
        Object.keys(positions).forEach(applyPosition);
      }
    } catch (e) { /* ignore */ }

    function applyPosition(id) {
      const el = svg.querySelector('[data-id="' + CSS.escape(id) + '"]');
      if (!el) return;
      const p = positions[id];
      el.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
    }

    let saveTimer = null;
    function scheduleSave() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(positions)); }
        catch (e) { /* ignore */ }
      }, 200);
    }

    function screenToSVG(event) {
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    }

    let drag = null;

    svg.addEventListener('pointerdown', (e) => {
      const target = e.target.closest('[data-draggable]');
      if (!target || !svg.contains(target)) return;
      e.preventDefault();
      const id = target.dataset.id;
      const start = screenToSVG(e);
      const cur = positions[id];
      drag = {
        id, target, pid: e.pointerId,
        offset: { x: cur.x - start.x, y: cur.y - start.y }
      };
      target.classList.add('dragging');
      target.parentNode.appendChild(target);
      try { target.setPointerCapture(e.pointerId); } catch (err) {}
    });

    svg.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const cur = screenToSVG(e);
      positions[drag.id] = { x: cur.x + drag.offset.x, y: cur.y + drag.offset.y };
      applyPosition(drag.id);
    });

    function endDrag() {
      if (!drag) return;
      drag.target.classList.remove('dragging');
      try { drag.target.releasePointerCapture(drag.pid); } catch (err) {}
      drag = null;
      scheduleSave();
    }
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    document.addEventListener('pointerup', endDrag);

    // Reset button (added per space-plan container)
    const planWrap = svg.closest('.space-plan');
    if (planWrap && !planWrap.querySelector('.plan-reset')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'plan-reset';
      btn.textContent = 'Reset layout';
      btn.addEventListener('click', () => {
        positions = JSON.parse(JSON.stringify(defaults));
        Object.keys(positions).forEach(applyPosition);
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      });
      planWrap.appendChild(btn);
    }
  }

  // Initialize
  setCurrent(0);
  navDots.forEach((d, i) => d.classList.toggle('active', i === 0));
})();
