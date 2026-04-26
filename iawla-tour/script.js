/* ==========================================================
   EXPERIMENT · PINNED-SPACES
   - Track scroll progress (top rail).
   - Update space-name marker based on which space is visible.
   - Mark the beat closest to viewport center as `.is-in`
     so it fades in over the pinned stage.
   ========================================================== */

(function(){
  const railFill = document.getElementById('railFill');
  const marker   = document.getElementById('spaceMarker');
  const beats    = Array.from(document.querySelectorAll('.beat'));
  const spaces   = Array.from(document.querySelectorAll('[data-space-name]'));

  let ticking = false;
  function onScroll(){
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct  = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      railFill.style.width = pct + '%';

      // active beat = nearest to viewport mid
      const mid = window.innerHeight / 2;
      let bestBeat = null, bestBeatDist = Infinity;
      beats.forEach(b => {
        const r = b.getBoundingClientRect();
        const c = r.top + r.height / 2;
        const d = Math.abs(c - mid);
        if (d < bestBeatDist){ bestBeatDist = d; bestBeat = b; }
      });
      beats.forEach(b => b.classList.toggle('is-in', b === bestBeat));

      // active space marker = the one most occupying the viewport
      let bestSpace = null, bestSpaceArea = 0;
      spaces.forEach(s => {
        const r = s.getBoundingClientRect();
        const top = Math.max(0, r.top);
        const bot = Math.min(window.innerHeight, r.bottom);
        const area = Math.max(0, bot - top);
        if (area > bestSpaceArea){ bestSpaceArea = area; bestSpace = s; }
      });
      if (bestSpace && marker) marker.textContent = bestSpace.dataset.spaceName;

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  onScroll();

  // Keyboard nav: jump beat-to-beat
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' '){
      e.preventDefault();
      const cur = beats.findIndex(b => b.classList.contains('is-in'));
      const target = beats[Math.min(beats.length-1, cur+1)] || beats[beats.length-1];
      if (target) target.scrollIntoView({behavior:'smooth', block:'center'});
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp'){
      e.preventDefault();
      const cur = beats.findIndex(b => b.classList.contains('is-in'));
      const target = beats[Math.max(0, cur-1)] || beats[0];
      if (target) target.scrollIntoView({behavior:'smooth', block:'center'});
    }
  });
})();
