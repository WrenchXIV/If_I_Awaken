/* ================================================================
   IF I AWAKEN IN LOS ANGELES · PITCH 2026 — SCRIPT
   - Scroll-snap section tracking
   - Keyboard navigation
   - Hash deep-linking
   - Chapter rail + bottom chrome
   - Chapter map overlay (M key)
   - Journey lateral navigation (per-section)
   - Rounds tab switcher
   ================================================================ */

(function () {
  const deck = document.getElementById('deck');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const rail = document.getElementById('rail');
  const progressFill = document.getElementById('progress-fill');
  const chapterLabel = document.getElementById('chapter-label');
  const chapterCounter = document.getElementById('chapter-counter');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const mapBtn = document.getElementById('map-btn');
  const mapClose = document.getElementById('map-close');
  const mapOverlay = document.getElementById('map-overlay');
  const mapGrid = document.getElementById('map-grid');

  // Slides where the bottom chrome should use paper styling
  const paperSlides = new Set(['producers', 'why', 'rounds']);

  let current = 0;

  // ----------------------------------------------------------------
  // BUILD CHAPTER RAIL (left dots)
  // ----------------------------------------------------------------

  slides.forEach((slide, i) => {
    const item = document.createElement('div');
    item.className = 'rail-item';
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'Go to ' + slide.dataset.chapter);
    item.dataset.index = i;

    const tip = document.createElement('span');
    tip.className = 'rail-tip';
    tip.textContent = pad2(i + 1) + ' · ' + slide.dataset.chapter;
    item.appendChild(tip);

    item.addEventListener('click', () => goTo(i));
    rail.appendChild(item);
  });

  // ----------------------------------------------------------------
  // BUILD CHAPTER MAP
  // ----------------------------------------------------------------

  slides.forEach((slide, i) => {
    const card = document.createElement('div');
    card.className = 'map-card';
    card.dataset.index = i;
    card.innerHTML =
      '<span class="mc-num">' + pad2(i + 1) + '</span>' +
      '<span class="mc-title">' + slide.dataset.chapter + '</span>';
    card.addEventListener('click', () => {
      closeMap();
      goTo(i);
    });
    mapGrid.appendChild(card);
  });

  // ----------------------------------------------------------------
  // SCROLL TRACKING (IntersectionObserver)
  // Reads scrollTop authoritatively to avoid stale-entry races where
  // multiple slides' intersection events fire during rapid scrolling.
  // ----------------------------------------------------------------

  let suppressObserver = 0; // timestamp until which observer changes are ignored

  function whichSlideIsCurrent() {
    const sTop = deck.scrollTop + deck.clientHeight * 0.4;
    for (let i = slides.length - 1; i >= 0; i--) {
      if (slides[i].offsetTop <= sTop) return i;
    }
    return 0;
  }

  const io = new IntersectionObserver((entries) => {
    // Reveal animation
    entries.forEach((e) => {
      if (e.intersectionRatio > 0.25) e.target.classList.add('in-view');
    });

    if (Date.now() < suppressObserver) return;

    const idx = whichSlideIsCurrent();
    if (idx !== current) setCurrent(idx);
  }, {
    root: deck,
    threshold: [0, 0.25, 0.5, 0.75, 1],
  });

  slides.forEach((s) => io.observe(s));

  // Also track scroll directly — IO can miss updates in fast scrolls.
  let scrollRaf = 0;
  deck.addEventListener('scroll', () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      if (Date.now() < suppressObserver) return;
      const idx = whichSlideIsCurrent();
      if (idx !== current) setCurrent(idx);
    });
  }, { passive: true });

  // ----------------------------------------------------------------
  // STATE UPDATE
  // ----------------------------------------------------------------

  function setCurrent(idx) {
    current = idx;
    const slide = slides[idx];

    // Always ensure the current slide animates in — covers the deep-link
    // case where the IntersectionObserver may not have fired yet.
    slide.classList.add('in-view');

    // Rail
    Array.from(rail.children).forEach((el, i) => {
      el.classList.toggle('active', i === idx);
    });

    // Chrome
    chapterLabel.textContent = pad2(idx + 1) + ' · ' + slide.dataset.chapter;
    chapterCounter.textContent = pad2(idx + 1) + ' / ' + pad2(slides.length);

    // Progress
    progressFill.style.width = ((idx + 1) / slides.length * 100) + '%';

    // Paper background — adjust chrome
    document.body.classList.toggle('on-paper', paperSlides.has(slide.id));

    // Map current marker
    Array.from(mapGrid.children).forEach((el, i) => {
      el.classList.toggle('current', i === idx);
    });

    // Hash update (without re-jumping)
    if (slide.id && history.replaceState) {
      history.replaceState(null, '', '#' + slide.id);
    }
  }

  // ----------------------------------------------------------------
  // NAVIGATION
  // ----------------------------------------------------------------

  function goTo(idx) {
    idx = Math.max(0, Math.min(slides.length - 1, idx));
    suppressObserver = Date.now() + 700;
    slides[idx].scrollIntoView({ behavior: 'smooth', block: 'start' });
    setCurrent(idx);
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  // ----------------------------------------------------------------
  // KEYBOARD
  // ----------------------------------------------------------------

  document.addEventListener('keydown', (e) => {
    if (mapOverlay.classList.contains('open')) {
      if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        closeMap();
      }
      return;
    }

    // Don't interfere with form fields (none, but safe)
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        // If we're on the journey slide and not at last neighborhood, advance neighborhood instead
        if (slides[current].id === 'journey' && journeyIdx < 6) {
          journeyGoTo(journeyIdx + 1);
        } else if (slides[current].id === 'rounds' && roundIdx < 3) {
          roundsGoTo(roundIdx + 1);
        } else {
          goTo(current + 1);
        }
        break;
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault();
        if (slides[current].id === 'journey' && journeyIdx > 1) {
          journeyGoTo(journeyIdx - 1);
        } else if (slides[current].id === 'rounds' && roundIdx > 1) {
          roundsGoTo(roundIdx - 1);
        } else {
          goTo(current - 1);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (slides[current].id === 'journey') {
          journeyGoTo(journeyIdx + 1);
        } else if (slides[current].id === 'rounds') {
          roundsGoTo(roundIdx + 1);
        } else {
          goTo(current + 1);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (slides[current].id === 'journey') {
          journeyGoTo(journeyIdx - 1);
        } else if (slides[current].id === 'rounds') {
          roundsGoTo(roundIdx - 1);
        } else {
          goTo(current - 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        goTo(0);
        break;
      case 'End':
        e.preventDefault();
        goTo(slides.length - 1);
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        openMap();
        break;
      default:
        // Number keys 1-9: jump
        if (/^[1-9]$/.test(e.key)) {
          const n = parseInt(e.key, 10) - 1;
          if (n < slides.length) {
            e.preventDefault();
            goTo(n);
          }
        }
    }
  });

  // ----------------------------------------------------------------
  // CHAPTER MAP OPEN/CLOSE
  // ----------------------------------------------------------------

  mapBtn.addEventListener('click', openMap);
  mapClose.addEventListener('click', closeMap);
  mapOverlay.addEventListener('click', (e) => {
    if (e.target === mapOverlay) closeMap();
  });

  function openMap() {
    mapOverlay.classList.add('open');
    mapOverlay.setAttribute('aria-hidden', 'false');
  }
  function closeMap() {
    mapOverlay.classList.remove('open');
    mapOverlay.setAttribute('aria-hidden', 'true');
  }

  // ----------------------------------------------------------------
  // HASH DEEP-LINK on initial load
  // ----------------------------------------------------------------

  function jumpToId(id, opts) {
    if (!id) return;
    const idx = slides.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const smooth = opts && opts.smooth;
    suppressObserver = Date.now() + (smooth ? 800 : 400);
    if (smooth) {
      slides[idx].scrollIntoView({ block: 'start', behavior: 'smooth' });
    } else {
      // Use scrollIntoView with instant behavior — most reliable across
      // scroll-snap contexts. Also re-fire on next frame in case
      // late font-load reflow has shifted the offset.
      slides[idx].scrollIntoView({ block: 'start', behavior: 'instant' });
      requestAnimationFrame(() => {
        slides[idx].scrollIntoView({ block: 'start', behavior: 'instant' });
      });
    }
    setCurrent(idx);
  }

  // Capture the initial hash NOW, before setCurrent overwrites the URL.
  const initialHash = location.hash.replace('#', '');

  window.addEventListener('load', () => {
    slides[0].classList.add('in-view');

    if (initialHash) {
      // Jump first (which sets current correctly), then set up rest.
      // Multiple attempts because font-load reflows can shift snap targets.
      const tryJump = () => jumpToId(initialHash);
      tryJump();
      setTimeout(tryJump, 80);
      setTimeout(tryJump, 250);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => requestAnimationFrame(tryJump));
      }
    } else {
      setCurrent(0);
    }
  });

  window.addEventListener('hashchange', () => {
    const id = location.hash.replace('#', '');
    if (id) jumpToId(id, { smooth: true });
  });

  // ----------------------------------------------------------------
  // JOURNEY LATERAL NAVIGATION
  // ----------------------------------------------------------------

  const journeyTrack = document.getElementById('journey-track');
  const journeyCards = journeyTrack ? Array.from(journeyTrack.children) : [];
  const jPrev = document.getElementById('j-prev');
  const jNext = document.getElementById('j-next');
  const jDots = document.getElementById('j-dots');
  let journeyIdx = 1;

  if (journeyCards.length) {
    // Build dots
    journeyCards.forEach((card, i) => {
      const d = document.createElement('div');
      d.className = 'j-dot';
      d.dataset.step = i + 1;
      d.addEventListener('click', () => journeyGoTo(i + 1));
      jDots.appendChild(d);
    });

    jPrev.addEventListener('click', () => journeyGoTo(journeyIdx - 1));
    jNext.addEventListener('click', () => journeyGoTo(journeyIdx + 1));

    // Initial position
    journeyGoTo(1);
  }

  function journeyGoTo(step) {
    step = Math.max(1, Math.min(journeyCards.length, step));
    journeyIdx = step;
    const card = journeyCards[step - 1];
    if (!card) return;

    // Cards
    journeyCards.forEach((c, i) => c.classList.toggle('current', i === step - 1));

    // Dots
    Array.from(jDots.children).forEach((d, i) => d.classList.toggle('current', i === step - 1));

    // Translate track so the active card is centered
    const stage = journeyTrack.parentElement;
    const stageWidth = stage.clientWidth;
    const cardLeft = card.offsetLeft;
    const cardWidth = card.offsetWidth;
    const target = cardLeft - (stageWidth / 2 - cardWidth / 2);
    journeyTrack.style.transform = 'translateX(' + (-target) + 'px)';
  }

  // Re-center on resize
  window.addEventListener('resize', () => {
    if (journeyCards.length) journeyGoTo(journeyIdx);
  });

  // ----------------------------------------------------------------
  // ROUNDS TAB SWITCHER
  // ----------------------------------------------------------------

  const roundsTabs = Array.from(document.querySelectorAll('.r-tab'));
  const roundsPanels = Array.from(document.querySelectorAll('.round-panel'));
  let roundIdx = 1;

  roundsTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      roundsGoTo(parseInt(tab.dataset.round, 10));
    });
  });

  function roundsGoTo(n) {
    n = Math.max(1, Math.min(3, n));
    roundIdx = n;
    roundsTabs.forEach((t) => t.classList.toggle('active', parseInt(t.dataset.round, 10) === n));
    roundsPanels.forEach((p) => p.classList.toggle('active', parseInt(p.dataset.round, 10) === n));
  }

  // ----------------------------------------------------------------
  // UTIL
  // ----------------------------------------------------------------

  function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
  }
})();
