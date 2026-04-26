/* ============================================================
   IF I AWAKEN IN LOS ANGELES — BRAND TOKENS
   ============================================================
   Three locked brand directions. Toggle between them by setting
   window.BRAND = 'cinema' | 'opera' | 'chapbook' before render,
   or use getBrand() / setBrand() / onBrandChange() at runtime.

   Shared thread across all three:
   - The distressed wordmark (same logo files)
   - The same production photography (treated differently)

   USAGE
   -----
   // in your HTML:
   <script src="brand/brand-tokens.js"></script>
   // then anywhere:
   const b = Brand.tokens();           // current brand's tokens
   const c = Brand.tokens('opera');    // specific brand's tokens
   Brand.set('chapbook');              // switch at runtime

   All three brands expose the SAME token shape so components
   can read b.colors.bg, b.type.display, b.photo.filter, etc.
   ============================================================ */

(function () {
  'use strict';

  // ---------- DIRECTION 01 · THEATRICAL CINEMA ----------
  const CINEMA = {
    id: 'cinema',
    name: 'Theatrical Cinema',
    tagline: 'Editorial · Cinematic · Bold',
    mood: 'Flagship. Film-poster energy, letterbox framing, declarative.',
    colors: {
      primary:    '#C8322B',   // Signal Red
      bg:         '#EFE7D7',   // Paper
      bgDeep:     '#E6DAC3',   // Paper Deep
      ink:        '#0E0A09',   // Ink
      inkSoft:    '#3A2E28',
      inkMute:    '#7A6A5F',
      accent:     '#E8B23A',   // Ember
      onPrimary:  '#EFE7D7',
      onInk:      '#EFE7D7',
      rule:       'rgba(14,10,9,0.15)',
      // Photo gradient overlay stops (top → bottom)
      photoVeil:  'linear-gradient(180deg, rgba(200,50,43,0.2) 0%, rgba(14,10,9,0.45) 60%, rgba(14,10,9,0.92) 100%)',
    },
    type: {
      display:  "'Barlow Condensed', sans-serif",
      displayWeight: 900,
      displayCase:   'uppercase',
      displayTrack:  '-0.01em',
      editorial: "'Fraunces', 'Iowan Old Style', Georgia, serif",
      editorialStyle: 'normal',         // italic reserved for emphasis
      body:      "'Fraunces', 'Iowan Old Style', Georgia, serif",
      label:     "'JetBrains Mono', ui-monospace, monospace",
      labelTrack: '0.28em',
      labelWeight: 400,
    },
    photo: {
      // All photography grayscale + slight contrast lift
      filter: 'grayscale(1) contrast(1.15) brightness(0.92)',
      tint: null,                 // no color tint
      overlay: 'rgba(14,10,9,0.45)',
    },
    frame: {
      // Poster / card framing style
      border: 'none',
      letterbox: true,            // top/bottom black bars on hero
      cornerRadius: 0,
    },
    ornament: {
      rule: '·',                  // single interpunct between metadata
      divider: null,              // no flourish dividers
      romanNumerals: true,        // section markers as I. II. III.
    },
    voice: {
      register: 'editorial',      // declarative, cinematic
      sectionMarker: (n) => ['I.', 'II.', 'III.', 'IV.', 'V.', 'VI.'][n - 1] || `${n}.`,
    },
  };

  // ---------- DIRECTION 02 · OPERA THEATRICAL ----------
  const OPERA = {
    id: 'opera',
    name: 'Opera Theatrical',
    tagline: 'Ornate · Ceremonial · Gilded',
    mood: 'Playbill. Oxblood theater walls, brass trim, italic display.',
    colors: {
      primary:    '#C2A15B',   // Gilded Brass (used as gold accent)
      bg:         '#3A0E0C',   // Oxblood
      bgDeep:     '#200706',   // Midnight
      ink:        '#14100C',
      inkSoft:    '#5E1917',
      inkMute:    '#C2A15B',   // brass doubles as muted ink on dark
      accent:     '#C2A15B',
      brassDeep:  '#8C6A2E',
      ivory:      '#F2E8D5',
      onPrimary:  '#14100C',
      onInk:      '#F2E8D5',
      rule:       'rgba(242,232,213,0.18)',
      photoVeil:  'linear-gradient(180deg, rgba(58,14,12,0.4) 0%, rgba(32,7,6,0.95) 100%)',
    },
    type: {
      display:  "'Fraunces', 'Playfair Display', serif",
      displayWeight: 300,
      displayStyle:  'italic',    // Opera defaults to italic display
      displayCase:   'none',
      displayTrack:  '-0.015em',
      editorial: "'Fraunces', serif",
      editorialStyle: 'italic',
      body:      "'Cormorant Garamond', 'EB Garamond', serif",
      label:     "'Cormorant Garamond', serif",
      labelStyle: 'italic',
      labelTrack: '0.3em',
      labelWeight: 500,
    },
    photo: {
      // B&W duotoned oxblood, brass highlights
      filter: 'grayscale(1) contrast(1.15) brightness(0.85)',
      tint:   { color: '#3A0E0C', mode: 'color',   opacity: 0.9 },
      highlight: { color: '#C2A15B', mode: 'overlay', opacity: 0.18 },
      overlay: 'rgba(32,7,6,0.85)',
    },
    frame: {
      // Double brass frame inside hero / posters
      border: '1px solid #C2A15B',
      borderDouble: '6px double #8C6A2E',  // for playbill cards
      letterbox: false,
      cornerRadius: 0,
    },
    ornament: {
      rule: '✦',                  // brass star between metadata
      divider: '❦',               // fleuron centered on horizontal rules
      romanNumerals: true,
      sectionSymbol: '§',         // § I, § II, § III
    },
    voice: {
      register: 'ceremonial',     // archaic, MMXXVII dates, ornate
      sectionMarker: (n) => `§ ${['I','II','III','IV','V','VI'][n - 1] || n}`,
    },
  };

  // ---------- DIRECTION 03 · CHAPBOOK POP ----------
  const CHAPBOOK = {
    id: 'chapbook',
    name: 'Chapbook Pop',
    tagline: 'Bookish · Colorful · Warm',
    mood: 'Hand-set pamphlet. Forest + bone + drop caps, with color-block pops.',
    colors: {
      primary:    '#1F3028',   // Forest Green (structural)
      bg:         '#EFE4CE',   // Bone
      bgDeep:     '#E2D3B2',   // Vellum
      ink:        '#14140F',
      inkSoft:    '#1F3028',
      inkMute:    '#6B5A3A',
      accent:     '#B04527',   // Terracotta (drop caps, flourishes)
      gold:       '#C0924A',
      // Pop colors — use as full-field blocks, one per moment
      popRust:    '#C44A2E',
      popOchre:   '#D89A3A',
      popTeal:    '#1C3D3D',
      onPrimary:  '#EFE4CE',
      onInk:      '#EFE4CE',
      rule:       'rgba(20,20,15,0.18)',
      photoVeil:  'linear-gradient(180deg, rgba(31,48,40,0.1) 0%, rgba(20,20,15,0.85) 100%)',
    },
    type: {
      display:  "'EB Garamond', 'Cormorant Garamond', Garamond, serif",
      displayWeight: 400,
      displayStyle:  'italic',
      displayCase:   'none',
      displayTrack:  '-0.005em',
      editorial: "'EB Garamond', serif",
      editorialStyle: 'italic',
      body:      "'EB Garamond', Garamond, serif",
      label:     "'Inter Tight', sans-serif",
      labelTrack: '0.18em',
      labelWeight: 600,
      dropCap: {
        family: "'EB Garamond', serif",
        color:  '#B04527',
        size:   120,
        weight: 500,
      },
    },
    photo: {
      // B&W base, tinted with a pop color via multiply blend.
      // Caller picks which pop to use per image.
      filter: 'grayscale(1) contrast(1.15) brightness(1)',
      tint:   { color: '#C44A2E', mode: 'multiply', opacity: 0.6 }, // default: rust
      overlay: 'rgba(20,20,15,0.5)',
    },
    frame: {
      border: '1px solid rgba(20,20,15,0.18)',
      borderDouble: '6px double #1F3028',   // chapbook cover
      letterbox: false,
      cornerRadius: 0,
    },
    ornament: {
      rule: '·',
      divider: '✦ ❦ ✦',
      romanNumerals: true,
      sectionSymbol: '§',
    },
    voice: {
      register: 'chapbook',        // pamphlet-ish, warm, annotated
      sectionMarker: (n) => `§ ${n} ·`,
    },
  };

  const BRANDS = { cinema: CINEMA, opera: OPERA, chapbook: CHAPBOOK };
  const DEFAULT = 'cinema';
  const STORAGE_KEY = 'iials.brand';

  // ---------- Runtime API ----------
  let current = (function () {
    try {
      const stored = (typeof localStorage !== 'undefined') && localStorage.getItem(STORAGE_KEY);
      if (stored && BRANDS[stored]) return stored;
    } catch (e) {}
    if (typeof window !== 'undefined' && window.BRAND && BRANDS[window.BRAND]) return window.BRAND;
    return DEFAULT;
  })();

  const listeners = new Set();

  const Brand = {
    LIST: ['cinema', 'opera', 'chapbook'],
    ALL: BRANDS,
    DEFAULT,
    get: () => current,
    set(id) {
      if (!BRANDS[id]) throw new Error(`Unknown brand: ${id}`);
      if (id === current) return;
      current = id;
      try { localStorage.setItem(STORAGE_KEY, id); } catch (e) {}
      listeners.forEach((fn) => { try { fn(id, BRANDS[id]); } catch (e) {} });
    },
    tokens: (id) => BRANDS[id || current],
    meta: (id) => {
      const b = BRANDS[id || current];
      return { id: b.id, name: b.name, tagline: b.tagline, mood: b.mood };
    },
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    // Helper: CSS variables for the current brand, spread onto :root or any element.
    cssVars(id) {
      const b = BRANDS[id || current];
      return {
        '--brand-primary':   b.colors.primary,
        '--brand-bg':        b.colors.bg,
        '--brand-bg-deep':   b.colors.bgDeep,
        '--brand-ink':       b.colors.ink,
        '--brand-ink-soft':  b.colors.inkSoft,
        '--brand-ink-mute':  b.colors.inkMute,
        '--brand-accent':    b.colors.accent,
        '--brand-on-primary': b.colors.onPrimary,
        '--brand-on-ink':    b.colors.onInk,
        '--brand-rule':      b.colors.rule,
        '--brand-display':   b.type.display,
        '--brand-editorial': b.type.editorial,
        '--brand-body':      b.type.body,
        '--brand-label':     b.type.label,
        '--brand-label-track': b.type.labelTrack,
        '--brand-photo-filter': b.photo.filter,
      };
    },
  };

  // ---------- Google Fonts (inject once) ----------
  if (typeof document !== 'undefined' && !document.getElementById('brand-fonts')) {
    const link = document.createElement('link');
    link.id = 'brand-fonts';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?' +
      'family=Barlow+Condensed:ital,wght@0,300;0,400;0,500;0,600;0,700;0,900;1,400;1,700&' +
      'family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&' +
      'family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&' +
      'family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&' +
      'family=Inter+Tight:wght@300;400;500;600;700&' +
      'family=JetBrains+Mono:wght@300;400;500&' +
      'family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&' +
      'display=swap';
    document.head.appendChild(link);
  }

  // ---------- Expose ----------
  if (typeof window !== 'undefined') window.Brand = Brand;
  if (typeof module !== 'undefined' && module.exports) module.exports = Brand;
})();
