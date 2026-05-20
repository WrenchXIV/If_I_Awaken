/* ================================================================
   PITCH SITE · VERSION SWITCHER
   Mounts a discreet pill at bottom-right of every version.
   ================================================================ */

(function () {
  const VERSIONS = [
    { id: 'v1',  file: 'index.html',  name: 'The Tour',       sub: 'cinematic walkthrough · the deck as built' },
    { id: 'v2',  file: 'v2.html',  name: 'The Cold Open',     sub: 'drop into the show, then pull back' },
    { id: 'v3',  file: 'v3.html',  name: 'The Memo',          sub: 'ask first, then proof · McKinsey pyramid' },
    { id: 'v4',  file: 'v4.html',  name: 'Hero’s Journey', sub: 'Diane as protagonist · narrative arc' },
    { id: 'v5',  file: 'v5.html',  name: 'Two-Track',         sub: 'artist view + investor view · toggle' },
    { id: 'v6',  file: 'v6.html',  name: 'The Walking Tour',  sub: 'map-as-nav · sections-as-rooms' },
    { id: 'v7',  file: 'v7.html',  name: 'The Receipts',      sub: 'data-led · comparables · dashboard' },
    { id: 'v8',  file: 'v8.html',  name: 'The FAQ',           sub: 'question-driven · address objections' },
    { id: 'v9',  file: 'v9.html',  name: 'The Triptych',      sub: 'three acts · invitation/proof/opportunity' },
    { id: 'v10', file: 'v10.html', name: 'The Whisper',       sub: 'minimal · Berkshire-letter · type-led' },
  ];

  // Detect current version from script tag data attribute, body class, or URL
  function detectCurrent() {
    const me = document.currentScript || document.querySelector('script[data-version]');
    if (me && me.dataset.version) return me.dataset.version;
    if (document.body && document.body.dataset.version) return document.body.dataset.version;
    const path = location.pathname.split('/').pop();
    const m = path.match(/v(\d+)\.html?$/i);
    if (m) return 'v' + m[1];
    return 'v1';
  }

  function build() {
    const current = detectCurrent();
    const root = document.createElement('div');
    root.id = 'vsw';

    const currentInfo = VERSIONS.find(v => v.id === current) || VERSIONS[0];

    root.innerHTML =
      '<div class="vsw-pill">' +
        '<span class="vsw-num">' + currentInfo.id.toUpperCase() + '</span>' +
        '<span class="vsw-name">' + currentInfo.name + '</span>' +
        '<span class="vsw-chev"></span>' +
      '</div>' +
      '<div class="vsw-panel">' +
        VERSIONS.map(v =>
          '<div class="vsw-row ' + (v.id === current ? 'current' : '') + '" data-file="' + v.file + '">' +
            '<span class="vsw-r-num">' + v.id.toUpperCase() + '</span>' +
            '<div>' +
              '<div class="vsw-r-name">' + v.name + '</div>' +
              '<div class="vsw-r-sub">' + v.sub + '</div>' +
            '</div>' +
          '</div>'
        ).join('') +
        '<div class="vsw-foot">IF I AWAKEN · PITCH 2026 · 10 VERSIONS</div>' +
      '</div>';

    document.body.appendChild(root);

    const pill = root.querySelector('.vsw-pill');
    pill.addEventListener('click', (e) => {
      e.stopPropagation();
      root.classList.toggle('open');
    });

    root.querySelectorAll('.vsw-row').forEach(row => {
      row.addEventListener('click', () => {
        const file = row.dataset.file;
        if (file) location.href = file;
      });
    });

    document.addEventListener('click', (e) => {
      if (!root.contains(e.target)) root.classList.remove('open');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') root.classList.remove('open');
      // Shift+V toggles panel
      if (e.key === 'V' && e.shiftKey) {
        e.preventDefault();
        root.classList.toggle('open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
