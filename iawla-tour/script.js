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

  // Initialize
  setCurrent(0);
  navDots.forEach((d, i) => d.classList.toggle('active', i === 0));
})();
