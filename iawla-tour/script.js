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

  // ---- Hero carousels (auto-advance + click-thumb) ----
  document.querySelectorAll('.space-carousel').forEach(initCarousel);

  function initCarousel(root) {
    const slides = Array.from(root.querySelectorAll('.carousel-slide'));
    const thumbs = Array.from(root.querySelectorAll('.thumb'));
    if (slides.length < 2) return;

    const INTERVAL_MS = 6000;
    const RESUME_AFTER_MS = 12000;
    let idx = Math.max(0, slides.findIndex((s) => s.classList.contains('active')));
    let timer = null;
    let paused = false;
    let resumeTimer = null;

    function show(next) {
      next = (next + slides.length) % slides.length;
      if (next === idx) return;
      slides[idx].classList.remove('active');
      thumbs[idx]?.classList.remove('active');
      idx = next;
      slides[idx].classList.add('active');
      thumbs[idx]?.classList.add('active');
    }

    function tick() { if (!paused) show(idx + 1); }
    function start() { stop(); timer = setInterval(tick, INTERVAL_MS); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function pause() { paused = true; stop(); }
    function resume() { paused = false; start(); }

    function bumpResume() {
      pause();
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(resume, RESUME_AFTER_MS);
    }

    thumbs.forEach((t, i) => {
      t.addEventListener('click', () => { show(i); bumpResume(); });
    });

    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', () => { if (!resumeTimer) resume(); });
    root.addEventListener('focusin', pause);
    root.addEventListener('focusout', () => { if (!resumeTimer) resume(); });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else if (!paused) start();
    });

    start();
  }

  // ---- Edit mode (text + image swap + add + save HTML) ----
  const EDITABLE_SEL = [
    '.slide h1', '.slide h2', '.slide h3',
    '.slide p:not(.bow-contact)',
    '.space-eyebrow', '.space-image-cap',
    '.space-meta-item dt', '.space-meta-item dd',
    '.eyebrow', '.section-title', '.section-sub',
    '.zone-body strong', '.zone-body span',
    '.bow-tagline', '.bow-contact',
    '.lobby-img-cap',
    '.drawer-head h2', '.drawer-head-eyebrow',
    '.beat-title', '.beat-desc', '.tag',
    '.cover-tagline', '.cover-credit', '.cover-mark',
    '.numbers .num-row .num', '.numbers .num-row .label',
    '.argument-quote', '.argument-attrib'
  ].join(',');

  const STORE_TEXT = 'iawla-edits-text-v1';
  const STORE_IMG = 'iawla-edits-images-v1';

  function getEditableEls() { return Array.from(document.querySelectorAll(EDITABLE_SEL)); }
  function getSwappableImgs() {
    return Array.from(document.querySelectorAll(
      '.carousel-slide, .lobby-img img, .venue-image img, .space-image > img:not(.carousel-slide)'
    ));
  }

  // Apply any saved edits BEFORE wiring edit-mode so reloaded text shows up
  applyStoredEdits();

  function applyStoredEdits() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORE_TEXT) || '{}');
      const els = getEditableEls();
      els.forEach((el, i) => { if (stored[i] != null) el.innerHTML = stored[i]; });
    } catch (e) { /* ignore */ }
    try {
      const imgs = JSON.parse(localStorage.getItem(STORE_IMG) || '{}');
      const all = getSwappableImgs();
      Object.keys(imgs).forEach((i) => { if (all[+i]) all[+i].src = imgs[i]; });
    } catch (e) { /* ignore */ }
  }

  let textSaveTimer = null;
  function saveText(el) {
    clearTimeout(textSaveTimer);
    textSaveTimer = setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORE_TEXT) || '{}');
        const els = getEditableEls();
        const idx = els.indexOf(el);
        if (idx === -1) return;
        stored[idx] = el.innerHTML;
        localStorage.setItem(STORE_TEXT, JSON.stringify(stored));
        flashSavedHint();
      } catch (e) { /* ignore */ }
    }, 400);
  }

  function saveImage(imgEl) {
    try {
      const stored = JSON.parse(localStorage.getItem(STORE_IMG) || '{}');
      const all = getSwappableImgs();
      const idx = all.indexOf(imgEl);
      if (idx === -1) return;
      stored[idx] = imgEl.src;
      localStorage.setItem(STORE_IMG, JSON.stringify(stored));
      flashSavedHint();
    } catch (e) {
      flashSavedHint('Storage full — image too large to auto-save', true);
    }
  }

  function clearLocalEdits() {
    try {
      localStorage.removeItem(STORE_TEXT);
      localStorage.removeItem(STORE_IMG);
    } catch (e) { /* ignore */ }
  }

  function hasLocalEdits() {
    try {
      const t = localStorage.getItem(STORE_TEXT);
      const i = localStorage.getItem(STORE_IMG);
      return (t && t !== '{}') || (i && i !== '{}');
    } catch (e) { return false; }
  }

  let savedHintTimer = null;
  function flashSavedHint(msg, isError) {
    const el = document.getElementById('edit-status');
    if (!el) return;
    el.textContent = msg || 'Saved · local';
    el.classList.toggle('error', !!isError);
    el.classList.add('show');
    clearTimeout(savedHintTimer);
    savedHintTimer = setTimeout(() => el.classList.remove('show'), 1400);
  }

  initEditMode();

  function initEditMode() {
    const bar = document.createElement('div');
    bar.id = 'edit-bar';
    bar.innerHTML = `
      <span id="edit-status" aria-live="polite"></span>
      <button id="edit-toggle" type="button" title="Edit text and images">Edit</button>
      <button id="edit-save" type="button" hidden title="Download a new HTML file with your edits">Save HTML</button>
      <button id="edit-clear" type="button" hidden title="Clear local-only edits and reload">Clear local</button>
      <button id="edit-discard" type="button" hidden title="Reload (drafts saved locally remain)">Reload</button>
    `;
    document.body.appendChild(bar);

    const toggle = bar.querySelector('#edit-toggle');
    const saveBtn = bar.querySelector('#edit-save');
    const discardBtn = bar.querySelector('#edit-discard');
    const clearBtn = bar.querySelector('#edit-clear');

    if (hasLocalEdits()) flashSavedHint('Local draft loaded');

    let editing = false;

    function setEditing(on) {
      editing = on;
      document.body.classList.toggle('edit-mode', on);
      toggle.textContent = on ? 'Done' : 'Edit';
      saveBtn.hidden = !on;
      discardBtn.hidden = !on;
      clearBtn.hidden = !on;

      document.querySelectorAll(EDITABLE_SEL).forEach((el) => {
        if (on) el.setAttribute('contenteditable', 'true');
        else el.removeAttribute('contenteditable');
      });

      document.querySelectorAll('.space-carousel').forEach((root) => decorateCarousel(root, on));
      document.querySelectorAll('.lobby-img img').forEach((img) => decorateLobbyImg(img, on));
      document.querySelectorAll('.venue-image img').forEach((img) => decorateLobbyImg(img, on));
    }

    document.addEventListener('input', (e) => {
      const el = e.target.closest('[contenteditable="true"]');
      if (el) saveText(el);
    });

    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all local drafts and reload? This wipes any text/image edits saved in this browser.')) {
        clearLocalEdits();
        location.reload();
      }
    });

    toggle.addEventListener('click', () => setEditing(!editing));
    discardBtn.addEventListener('click', () => {
      if (confirm('Discard unsaved edits? The page will reload.')) location.reload();
    });
    saveBtn.addEventListener('click', () => {
      const wasEditing = editing;
      if (wasEditing) setEditing(false);

      const clone = document.documentElement.cloneNode(true);
      clone.querySelector('#edit-bar')?.remove();
      clone.querySelectorAll('.thumb-add, .thumb-delete').forEach((n) => n.remove());
      clone.querySelectorAll('[contenteditable]').forEach((n) => n.removeAttribute('contenteditable'));

      const html = '<!DOCTYPE html>\n' + clone.outerHTML;
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'index.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);

      if (wasEditing) setEditing(true);
    });

    function decorateCarousel(root, on) {
      const thumbsWrap = root.querySelector('.carousel-thumbs');
      let addBtn = thumbsWrap.querySelector('.thumb-add');

      if (on && !addBtn) {
        addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = 'thumb thumb-add';
        addBtn.title = 'Add a new image';
        addBtn.textContent = '+';
        addBtn.addEventListener('click', (e) => { e.stopPropagation(); addImageToCarousel(root); });
        thumbsWrap.appendChild(addBtn);
      } else if (!on && addBtn) {
        addBtn.remove();
      }

      root.querySelectorAll('.carousel-slide').forEach((slide, i) => {
        if (on && !slide._editBound) {
          slide._editBound = true;
          slide.addEventListener('click', (e) => {
            if (!editing) return;
            e.preventDefault();
            replaceImage(root, i);
          });
        }
      });

      root.querySelectorAll('.thumb:not(.thumb-add)').forEach((thumb) => {
        let del = thumb.querySelector('.thumb-delete');
        if (on && !del) {
          del = document.createElement('span');
          del.className = 'thumb-delete';
          del.textContent = '×';
          del.title = 'Remove this image';
          del.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = Array.from(thumbsWrap.querySelectorAll('.thumb:not(.thumb-add)')).indexOf(thumb);
            removeImageFromCarousel(root, idx);
          });
          thumb.appendChild(del);
        } else if (!on && del) {
          del.remove();
        }
      });
    }

    function decorateLobbyImg(img, on) {
      if (on && !img._editBound) {
        img._editBound = true;
        img.addEventListener('click', async (e) => {
          if (!editing) return;
          e.preventDefault();
          const file = await pickImage();
          if (!file) return;
          img.src = await readFileAsDataURL(file);
          saveImage(img);
        });
      }
    }

    function readFileAsDataURL(file) {
      return new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
    }

    function pickImage() {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.style.display = 'none';
        document.body.appendChild(input);
        input.onchange = () => {
          const f = input.files && input.files[0] || null;
          input.remove();
          resolve(f);
        };
        input.click();
      });
    }

    async function replaceImage(root, slideIdx) {
      const file = await pickImage();
      if (!file) return;
      const url = await readFileAsDataURL(file);
      const slides = root.querySelectorAll('.carousel-slide');
      const thumbs = root.querySelectorAll('.thumb:not(.thumb-add)');
      if (slides[slideIdx]) {
        slides[slideIdx].src = url;
        saveImage(slides[slideIdx]);
      }
      const thumbImg = thumbs[slideIdx]?.querySelector('img');
      if (thumbImg) thumbImg.src = url;
    }

    async function addImageToCarousel(root) {
      const file = await pickImage();
      if (!file) return;
      const url = await readFileAsDataURL(file);
      const stage = root.querySelector('.space-image');
      const thumbsWrap = root.querySelector('.carousel-thumbs');
      const cap = stage.querySelector('.space-image-cap');

      const slide = document.createElement('img');
      slide.className = 'carousel-slide';
      slide.src = url;
      slide.alt = '';
      if (cap) stage.insertBefore(slide, cap); else stage.appendChild(slide);

      const newIdx = root.querySelectorAll('.carousel-slide').length - 1;
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'thumb';
      thumb.dataset.idx = String(newIdx);
      thumb.setAttribute('aria-label', 'Image ' + (newIdx + 1));
      thumb.innerHTML = `<img src="${url}" alt=""/>`;

      const addBtn = thumbsWrap.querySelector('.thumb-add');
      if (addBtn) thumbsWrap.insertBefore(thumb, addBtn);
      else thumbsWrap.appendChild(thumb);

      thumb.addEventListener('click', () => {
        root.querySelectorAll('.carousel-slide').forEach((s) => s.classList.remove('active'));
        root.querySelectorAll('.thumb:not(.thumb-add)').forEach((t) => t.classList.remove('active'));
        slide.classList.add('active');
        thumb.classList.add('active');
      });

      slide.addEventListener('click', async (e) => {
        if (!editing) return;
        e.preventDefault();
        const f = await pickImage();
        if (!f) return;
        const u = await readFileAsDataURL(f);
        slide.src = u;
        thumb.querySelector('img').src = u;
      });

      decorateCarousel(root, true);
    }

    function removeImageFromCarousel(root, idx) {
      const slides = root.querySelectorAll('.carousel-slide');
      const thumbs = root.querySelectorAll('.thumb:not(.thumb-add)');
      if (slides.length <= 1) {
        alert('Each carousel needs at least one image.');
        return;
      }
      const wasActive = slides[idx]?.classList.contains('active');
      slides[idx]?.remove();
      thumbs[idx]?.remove();
      if (wasActive) {
        const remainingSlides = root.querySelectorAll('.carousel-slide');
        const remainingThumbs = root.querySelectorAll('.thumb:not(.thumb-add)');
        remainingSlides[0]?.classList.add('active');
        remainingThumbs[0]?.classList.add('active');
      }
    }
  }

  // Initialize
  setCurrent(0);
  navDots.forEach((d, i) => d.classList.toggle('active', i === 0));
})();
