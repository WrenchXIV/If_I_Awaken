# Brand System — If I Awaken in Los Angeles

Three locked brand directions, toggleable across anything we build on this project.

**Shared thread across all three:**
- The distressed wordmark (`assets/brand/logo-twoline.png`, `logo-oneline.png`) — always kept with its texture
- The same four production photos (`assets/brand/photo-*.jpg`) — treated differently per direction

**The three directions** (see `brand-final.html` for full boards):

| ID | Name | Mood | When to reach for it |
|---|---|---|---|
| `cinema` | Theatrical Cinema | Editorial · Cinematic · Bold | Flagship pieces, investor decks, film-poster energy |
| `opera` | Opera Theatrical | Ornate · Ceremonial · Gilded | Playbills, premiere invitations, donor materials |
| `chapbook` | Chapbook Pop | Bookish · Colorful · Warm | Printed programs, community-facing materials, merch |

## Using the brand system

### 1. Include the tokens file

```html
<script src="brand/brand-tokens.js"></script>
```

This also injects the shared Google Fonts stylesheet.

### 2. Read the tokens

```js
const b = Brand.tokens();          // current brand's tokens
const b = Brand.tokens('opera');   // specific brand

b.colors.bg;          // page background
b.colors.primary;     // primary accent (brand red / brass / forest)
b.type.display;       // display font-family
b.type.editorial;     // editorial serif
b.photo.filter;       // CSS filter string for all photography
```

### 3. Switch brand at runtime

```js
Brand.set('chapbook');                     // persists to localStorage
Brand.onChange((id, tokens) => { ... });   // re-render on toggle
```

### 4. Or use CSS variables

```js
Object.assign(document.documentElement.style, Brand.cssVars());
// then:
// color: var(--brand-ink); background: var(--brand-bg);
// font-family: var(--brand-display);
```

## Token shape (identical across all three brands)

```
colors:    primary, bg, bgDeep, ink, inkSoft, inkMute, accent,
           onPrimary, onInk, rule, photoVeil (gradient)
type:      display, editorial, body, label,
           displayWeight, displayStyle, displayCase, displayTrack,
           labelTrack, labelWeight
photo:     filter (CSS), tint (color/mode/opacity), overlay
frame:     border, borderDouble, letterbox, cornerRadius
ornament:  rule, divider, romanNumerals, sectionSymbol
voice:     register, sectionMarker(n)
```

Brand-specific extras (opera's `brassDeep`, chapbook's `popRust/popOchre/popTeal` + `dropCap`) live under their own namespaces and should only be used in pieces that commit to that direction.

## Files

- `brand/brand-tokens.js` — the runtime tokens + API
- `brand/final-1-cinema.jsx` — Direction 01 reference board
- `brand/final-2-opera.jsx` — Direction 02 reference board
- `brand/final-3-chapbook.jsx` — Direction 03 reference board
- `brand-final.html` — all three side-by-side on a canvas
- `assets/brand/` — shared logos + production photography
