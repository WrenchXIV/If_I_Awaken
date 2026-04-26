/* ==========================================================
   EXPERIMENT · EMBODIED-CUES
   Each beat declares a gesture (tap/hold/drag/wait/none). The
   beat completes only when the gesture is performed; only then
   does "Continue" enable in the ribbon.
   ========================================================== */

(function(){
  const beats = Array.from(document.querySelectorAll('.beat'));
  const counterEl = document.getElementById('counter');
  const totalEl = document.getElementById('total');
  const nextBtn = document.getElementById('next');
  const backBtn = document.getElementById('back');
  let idx = 0;

  totalEl.textContent = String(beats.length).padStart(2,'0');

  // Apply per-beat bg image
  beats.forEach(beat => {
    const img = beat.dataset.img;
    const bg = beat.querySelector('.bg');
    if (img && bg && !bg.classList.contains('blackout')){
      bg.style.backgroundImage = `url('${img}')`;
    }
  });

  function updateChrome(){
    counterEl.textContent = String(idx+1).padStart(2,'0');
    backBtn.disabled = idx === 0;
    const beat = beats[idx];
    nextBtn.disabled = !beat.classList.contains('beat-revealed');
    nextBtn.textContent = idx === beats.length - 1 ? 'Restart ↺' : 'Continue →';
  }

  function setActive(i){
    if (i < 0 || i >= beats.length) {
      // wrap-around: restart
      if (i >= beats.length) i = 0;
      else return;
    }
    beats.forEach((b,j)=>b.classList.toggle('is-active', j===i));
    idx = i;
    armGesture(beats[i]);
    updateChrome();
  }

  function complete(beat){
    beat.classList.add('beat-revealed');
    updateChrome();
  }

  // ----- gesture: tap -----
  function armTap(beat){
    const need = parseInt(beat.dataset.tapCount || '1', 10);
    const targets = Array.from(beat.querySelectorAll('.tap-target'));
    let count = 0;
    // reset
    targets.forEach(t => t.classList.remove('tapped'));
    targets.forEach(t => {
      t.onclick = () => {
        if (t.classList.contains('tapped')) return;
        t.classList.add('tapped');
        count++;
        if (count >= need) complete(beat);
      };
    });
  }

  // ----- gesture: hold -----
  function armHold(beat){
    const need = parseInt(beat.dataset.holdMs || '2400', 10);
    const zone = beat.querySelector('.g-hold');
    const fill = beat.querySelector('.hold-fill');
    let start = 0, raf = null, holding = false;

    function tick(now){
      if (!holding) return;
      const p = Math.min(100, ((now - start) / need) * 100);
      if (fill) fill.style.setProperty('--p', p);
      if (p >= 100) { stopHold(); complete(beat); return; }
      raf = requestAnimationFrame(tick);
    }
    function startHold(){
      if (beat.classList.contains('beat-revealed')) return;
      holding = true; start = performance.now();
      zone.classList.add('is-holding');
      raf = requestAnimationFrame(tick);
    }
    function stopHold(){
      holding = false;
      zone.classList.remove('is-holding');
      if (raf) cancelAnimationFrame(raf);
      if (!beat.classList.contains('beat-revealed')) {
        if (fill) fill.style.setProperty('--p', 0);
      }
    }

    zone.onmousedown = startHold;
    zone.ontouchstart = (e) => { e.preventDefault(); startHold(); };
    window.addEventListener('mouseup', stopHold);
    window.addEventListener('touchend', stopHold);
  }

  // ----- gesture: drag (axis x/y, threshold) -----
  function armDrag(beat){
    const axis = beat.dataset.dragAxis || 'x';
    const need = parseInt(beat.dataset.dragDistance || '300', 10);
    const apart = beat.dataset.dragDir === 'apart';

    if (apart){
      const left = beat.querySelector('.k-left');
      const right = beat.querySelector('.k-right');
      let lx = 0, rx = 0, dragL = false, dragR = false, sxL = 0, sxR = 0;

      const startL = (x) => { dragL = true; sxL = x - lx; };
      const moveL = (x) => { if (!dragL) return; lx = Math.min(0, x - sxL); left.style.transform = `translateX(${lx}px)`; checkApart(); };
      const endL = () => { dragL = false; };
      const startR = (x) => { dragR = true; sxR = x - rx; };
      const moveR = (x) => { if (!dragR) return; rx = Math.max(0, x - sxR); right.style.transform = `translateX(${rx}px)`; checkApart(); };
      const endR = () => { dragR = false; };
      const checkApart = () => {
        if (Math.abs(lx) + Math.abs(rx) >= need) complete(beat);
      };

      left.onmousedown = e => startL(e.clientX);
      right.onmousedown = e => startR(e.clientX);
      left.ontouchstart = e => startL(e.touches[0].clientX);
      right.ontouchstart = e => startR(e.touches[0].clientX);
      window.addEventListener('mousemove', e => { moveL(e.clientX); moveR(e.clientX); });
      window.addEventListener('touchmove', e => { moveL(e.touches[0].clientX); moveR(e.touches[0].clientX); }, {passive:true});
      window.addEventListener('mouseup', () => { endL(); endR(); });
      window.addEventListener('touchend', () => { endL(); endR(); });
      return;
    }

    const knob = beat.querySelector('.drag-knob');
    if (!knob) return;
    let s = 0, p = 0, dragging = false;

    const startD = (val) => { dragging = true; s = val - p; knob.parentElement.classList.add('is-dragging'); };
    const moveD = (val) => {
      if (!dragging) return;
      p = val - s;
      if (axis === 'x') knob.style.transform = `translateX(${p}px)`;
      else knob.style.transform = `translateY(${p}px)`;
      if (Math.abs(p) >= need) complete(beat);
    };
    const endD = () => {
      dragging = false;
      if (knob.parentElement) knob.parentElement.classList.remove('is-dragging');
    };

    knob.onmousedown = e => startD(axis === 'x' ? e.clientX : e.clientY);
    knob.ontouchstart = e => startD(axis === 'x' ? e.touches[0].clientX : e.touches[0].clientY);
    window.addEventListener('mousemove', e => moveD(axis === 'x' ? e.clientX : e.clientY));
    window.addEventListener('touchmove', e => moveD(axis === 'x' ? e.touches[0].clientX : e.touches[0].clientY), {passive:true});
    window.addEventListener('mouseup', endD);
    window.addEventListener('touchend', endD);
  }

  // ----- gesture: wait -----
  function armWait(beat){
    const need = parseInt(beat.dataset.waitMs || '3000', 10);
    const fill = beat.querySelector('.wait-fill');
    const start = performance.now();
    function tick(now){
      const p = Math.min(100, ((now - start) / need) * 100);
      if (fill) fill.style.width = p + '%';
      if (p >= 100) complete(beat);
      else if (beats[idx] === beat) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function armGesture(beat){
    const g = beat.dataset.gesture;
    if (g === 'tap') armTap(beat);
    else if (g === 'hold') armHold(beat);
    else if (g === 'drag') armDrag(beat);
    else if (g === 'wait') armWait(beat);
    else complete(beat);
  }

  // ----- chrome buttons -----
  nextBtn.addEventListener('click', () => {
    if (idx === beats.length - 1) setActive(0);
    else setActive(idx + 1);
  });
  backBtn.addEventListener('click', () => setActive(idx - 1));
  document.querySelectorAll('.advance').forEach(btn => {
    btn.addEventListener('click', () => setActive(idx + 1));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || (e.key === ' ' && beats[idx].classList.contains('beat-revealed'))){
      e.preventDefault();
      if (!nextBtn.disabled) nextBtn.click();
    } else if (e.key === 'ArrowLeft'){
      e.preventDefault();
      backBtn.click();
    }
  });

  // Init
  setActive(0);
})();
