/* ==========================================================
   EXPERIMENT · CURTAIN-REVEAL
   - Active beat shows curtain-down by default.
   - Drag up on the curtain to lift it (or click for instant lift).
   - Once lifted, "Continue" button appears; click → next beat.
   ========================================================== */

(function(){
  const beats = Array.from(document.querySelectorAll('.beat'));
  const counter = document.getElementById('counter');
  let idx = 0;

  // Apply per-beat background image
  beats.forEach(beat => {
    const img = beat.dataset.img;
    const bg = beat.querySelector('.beat-bg');
    if (img && bg && !bg.classList.contains('blackout')){
      bg.style.backgroundImage = `url('${img}')`;
    }
  });

  function updateCounter(){
    counter.textContent = `${String(idx+1).padStart(2,'0')} / ${String(beats.length).padStart(2,'0')}`;
  }

  function setActive(i){
    if (i < 0 || i >= beats.length) return;
    beats[idx].classList.remove('is-revealed');
    // reset curtain transform
    const oldCurtain = beats[idx].querySelector('.curtain');
    if (oldCurtain) oldCurtain.style.transform = '';
    beats.forEach((b,j)=>b.classList.toggle('is-active', j===i));
    idx = i;
    updateCounter();
    // If beat has no curtain, mark as revealed so continue is shown
    if (beats[i].dataset.noCurtain) beats[i].classList.add('is-revealed');
  }

  function reveal(beat){
    beat.classList.add('is-revealed');
  }

  // Continue button
  document.querySelectorAll('.continue-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setActive(idx + 1);
    });
  });

  // Curtain interaction: click to lift, or drag-up
  beats.forEach(beat => {
    const curtain = beat.querySelector('.curtain');
    if (!curtain) return;

    let dragging = false;
    let startY = 0;
    let dy = 0;

    curtain.addEventListener('click', (e) => {
      if (Math.abs(dy) > 10) return; // ignore if it was a drag
      reveal(beat);
    });

    function start(y){
      if (beat.classList.contains('is-revealed')) return;
      dragging = true;
      startY = y;
      dy = 0;
      curtain.classList.add('is-dragging');
    }
    function move(y){
      if (!dragging) return;
      dy = y - startY;
      const t = Math.min(0, dy);  // only allow upward
      curtain.style.transform = `translateY(${t}px)`;
    }
    function end(){
      if (!dragging) return;
      dragging = false;
      curtain.classList.remove('is-dragging');
      const liftedFar = Math.abs(dy) > window.innerHeight * 0.18;
      curtain.style.transform = '';
      if (liftedFar) reveal(beat);
    }

    curtain.addEventListener('mousedown', e => start(e.clientY));
    window.addEventListener('mousemove', e => move(e.clientY));
    window.addEventListener('mouseup', end);

    curtain.addEventListener('touchstart', e => start(e.touches[0].clientY), {passive:true});
    window.addEventListener('touchmove', e => move(e.touches[0].clientY), {passive:true});
    window.addEventListener('touchend', end);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === ' '){
      e.preventDefault();
      const cur = beats[idx];
      if (!cur.classList.contains('is-revealed')) reveal(cur);
      else setActive(idx + 1);
    } else if (e.key === 'ArrowRight' || e.key === 'PageDown'){
      e.preventDefault();
      const cur = beats[idx];
      if (!cur.classList.contains('is-revealed')) reveal(cur);
      else setActive(idx + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp'){
      e.preventDefault();
      setActive(idx - 1);
    }
  });

  // Init
  if (beats[0].dataset.noCurtain) beats[0].classList.add('is-revealed');
  updateCounter();
})();
