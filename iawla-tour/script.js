/* ==========================================================
   EXPERIMENT · SCORE-DRIVEN
   Beats are timed. Like a conductor: the score advances.
   You can pause, step back, step forward.
   ========================================================== */

(function(){
  const beats = Array.from(document.querySelectorAll('.beat'));
  const transport = document.getElementById('transport');
  const playBtn = document.getElementById('play');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');
  const counter = document.getElementById('counter');
  const total = document.getElementById('total');
  const barFill = document.getElementById('barFill');
  const cueLine = document.getElementById('cueLine');
  const replayBtn = document.getElementById('replay');

  let idx = 0;
  let playing = false;
  let beatStart = 0;
  let elapsed = 0;
  let raf = null;

  total.textContent = String(beats.length).padStart(2,'0');

  function setActive(i){
    beats.forEach((b,j)=>b.classList.toggle('is-active', j===i));
    idx = i;
    counter.textContent = String(i+1).padStart(2,'0');
    const cue = beats[i].querySelector('.beat-cue, .beat-eyebrow, .cover-prompt');
    cueLine.textContent = cue ? cue.textContent.trim() : (beats[i].dataset.beatId || '');
    elapsed = 0; beatStart = performance.now();
    barFill.style.width = '0%';
    if (i === beats.length - 1) { stop(); barFill.style.width='100%'; }
    playBtn.classList.add('tick');
    setTimeout(()=>playBtn.classList.remove('tick'), 1000);
  }

  function tick(now){
    if (!playing) return;
    const dur = parseInt(beats[idx].dataset.duration || 8000, 10);
    elapsed = now - beatStart;
    const pct = Math.min(100, (elapsed / dur) * 100);
    barFill.style.width = pct + '%';
    if (elapsed >= dur && dur > 0) {
      if (idx < beats.length - 1) setActive(idx + 1);
      else stop();
    }
    raf = requestAnimationFrame(tick);
  }

  function play(){
    if (idx === beats.length - 1) return;
    playing = true;
    transport.classList.add('is-playing');
    beatStart = performance.now() - elapsed;
    raf = requestAnimationFrame(tick);
  }
  function pause(){
    playing = false;
    transport.classList.remove('is-playing');
    if (raf) cancelAnimationFrame(raf);
  }
  function stop(){ pause(); elapsed = 0; }

  function next(){
    pause();
    if (idx < beats.length - 1) setActive(idx + 1);
  }
  function prev(){
    pause();
    if (idx > 0) setActive(idx - 1);
  }

  playBtn.addEventListener('click', () => playing ? pause() : play());
  nextBtn.addEventListener('click', next);
  prevBtn.addEventListener('click', prev);
  if (replayBtn) replayBtn.addEventListener('click', () => { setActive(0); play(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'Home') setActive(0);
    else if (e.key === 'End') setActive(beats.length - 1);
  });

  setActive(0);
})();
