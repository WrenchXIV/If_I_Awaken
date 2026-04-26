/* ==========================================================
   EXPERIMENT · PROMENADE-WALK
   Click "Walk forward" to advance to the next stop. The stage
   photo dollies (scale + pan) into its target zoom for the
   beat. Each beat is a stop on the path through the show.
   ========================================================== */

(function(){
  const tour = document.getElementById('tour');
  const stops = Array.from(document.querySelectorAll('.stop'));
  const fwdBtn = document.getElementById('walkFwd');
  const backBtn = document.getElementById('walkBack');
  const counter = document.getElementById('counter');
  const total = document.getElementById('total');
  const where = document.getElementById('where');

  let idx = 0;
  let walking = false;

  total.textContent = String(stops.length).padStart(2,'0');

  // Apply per-stop zoom/pan to each .stage based on data attrs
  stops.forEach(stop => {
    const stage = stop.querySelector('.stage');
    const img = stop.dataset.img;
    if (img && stage) stage.style.backgroundImage = `url('${img}')`;
    const zoom = parseFloat(stop.dataset.zoom || '1.0');
    const cx = parseFloat(stop.dataset.cx || '50');
    const cy = parseFloat(stop.dataset.cy || '50');
    stop.style.setProperty('--zoom', zoom);
    stop.style.setProperty('--bgX', cx + '%');
    stop.style.setProperty('--bgY', cy + '%');
  });

  function setStop(i){
    if (i < 0 || i >= stops.length) return;
    if (walking) return;
    walking = true;
    tour.classList.add('is-walking');
    fwdBtn.classList.add('is-walking');

    stops.forEach((s,j)=>s.classList.toggle('is-current', j===i));
    idx = i;

    counter.textContent = String(i+1).padStart(2,'0');
    where.textContent = stops[i].dataset.where || stops[i].dataset.id;

    backBtn.disabled = i === 0;
    if (i === stops.length - 1) {
      fwdBtn.querySelector('.fwd-label').textContent = 'You\'ve arrived';
      fwdBtn.disabled = true;
    } else {
      fwdBtn.querySelector('.fwd-label').textContent = 'Walk forward';
      fwdBtn.disabled = false;
    }

    setTimeout(() => {
      walking = false;
      tour.classList.remove('is-walking');
      fwdBtn.classList.remove('is-walking');
    }, 1400);
  }

  fwdBtn.addEventListener('click', () => setStop(idx + 1));
  backBtn.addEventListener('click', () => setStop(idx - 1));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown'){
      e.preventDefault(); setStop(idx + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp'){
      e.preventDefault(); setStop(idx - 1);
    }
  });

  setStop(0);
})();
