# If I Awaken in Los Angeles — Pitch Site

A cinematic pitch site for the immersive theatre production. Built as a slide-deck-style site with richer navigation than a traditional deck.

## Sections (21 chapters)

1. Cover
2. The Pitch — "This is the show LA has been missing"
3. The Pilot — Ford Theatre premiere, 1,000+ tickets
4. The Album — 30K+ first-week listens
5. The Awakening — 1,400+ video submissions
6. The Show — critic praise
7. Who It's For — residents / visitors / world
8. A Global Stage — World Cup, Super Bowl, Olympics
9. The Experience — 90-min walk through real LA
10. The Thesis — LA is more than Hollywood
11. The Journey — seven neighborhoods (lateral within section)
12. What We're Building — stats grid
13. Note from the Creator
14. The Team — producers, director, GM
15. The Franchise — Chicago, New York, London
16. Why LA Needs This — investment thesis
17. The Ask — three rounds (tabbed)
18. The Economics — weekly model
19. Additional Revenue — dark days, 6 differentiators
20. The Opportunity — Sleep No More, Meow Wolf, Here Lies Love
21. Reserve — CTA

## Navigation

- **Scroll** or **↑ ↓ Space PgUp PgDn** — section by section
- **← →** — also navigates within the journey (7 neighborhoods) and rounds (3 rounds)
- **1 – 9** — jump directly to chapters 1–9
- **Home / End** — first / last
- **M** — open the chapter map overlay
- **Esc** — close map
- **Left rail** — click any dot to jump
- **Bottom bar** — prev / next buttons + Map button
- **Hash deep-links** — `index.html#economics`, `#producers`, etc. — every section is shareable

## Tech

Plain HTML / CSS / JS, no build step. Drop the folder on any static host (S3, Netlify, Vercel, Cloudflare Pages, GitHub Pages).

```
pitch-site/
├── index.html        # all content
├── styles.css        # design system + per-section styles
├── script.js         # nav, hash routing, journey, rounds, map
└── assets/
    ├── photos/       # cover, journey, team, etc.
    └── brand/        # logos
```

## Running locally

Any static server works. From this folder:

```bash
python3 -m http.server 8765
```

Then open `http://localhost:8765`.

## Design notes

Visual DNA pulled directly from the source deck (`Brandon_Updated_IF_I_AWAKEN_IN_LOS_ANGELES_DECK_2027`):

- **Palette**: black `#0A0A0A`, paper `#F2EDE2`, logo red `#D63A3F`, gold `#C7A86A`, green `#46C36B`
- **Display**: Oswald 600/700 (condensed, the red-block headlines)
- **Editorial**: Fraunces italic (the "LA is more than Hollywood" voice)
- **Body**: Inter / Inter Tight
- **Mono**: JetBrains Mono for eyebrows, labels, chrome

Cream "paper" sections are reserved for investor / business slides (Producers, Why LA, The Ask) — mirroring the deck's two-tone approach.
