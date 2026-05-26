# VERSIONS — design notes

The pitch site ships in 10 versions. The discreet bottom-right switcher (or `Shift+V`) flips between them. Each version varies on **copy + slide order + navigation**; three (v6, v7, v10) are also visual departures.

All versions share the persistent **timeline across pilot → album → awakening → show**, with dates, stats, and a progress fill that advances as you scroll through the four chapters. Each version embodies the timeline slightly differently (compact under the header in v1–v5, room-stamped in v6, KPI-deltas in v7, scene markers in v9, etc.).

---

## v1 · THE TOUR  *(the original)*

The cinematic walkthrough as built from the deck. 21 sections in deck order. Vertical scroll-snap, left chapter rail, bottom chrome, chapter-map overlay. Voice: cinematic / editorial. **The baseline against which the others are an A/B.**

## v2 · THE COLD OPEN  *(film grammar)*

Lead with a moment from inside the show — a single immersive scene — *before* any brand or context, then pull back. This mirrors how feature films work: drop the audience into the world, *then* explain it.

- **Order:** Cold open → "What you just read…" → track record (with timeline) → thesis → journey → stakes → team → economics → ask → franchise → reserve.
- **Nav:** Bottom **filmstrip thumbnail rail** showing every chapter as a tiny photo tile; current is highlighted. Replaces v1's dot rail.
- **Voice:** Cinematic, present tense, low chrome. "Stand inside the city you think you know."

## v3 · THE MEMO  *(McKinsey pyramid)*

Bottom-Line-Up-Front. Investors who skim a memo see the answer in the first 30 seconds: what we're raising, why, and the five proof points. The rest of the document supports the conclusion.

- **Order:** BLUF (the ask + thesis up front) → Terms → Thesis → Proof points (demand / timing / team) → Asset → Model → Close.
- **Nav:** **Sticky TOC sidebar** with numbered sections (M-01, M-02, …). Document-grade typography, cream-paper sections for business slides, dark sections for the proof chapters.
- **Voice:** Analytical, declarative, no narrative scaffolding. "This memo argues that…"

## v4 · HERO'S JOURNEY  *(Pixar / StoryBrand)*

Diane Luby Lane is the protagonist. LA is the world. The team is the fellowship. **The investor is the guide** who hands the hero the sword — explicit in the "The Guide" section.

- **Order:** Prologue → Act I (Hero / Call) → Act II break → Pilot / Album / Awakening (Tests) → Act III break → Show / Guide / Stakes / Numbers / Return.
- **Nav:** **Chapter-book** metaphor — "Page 01 / 14", "Turn Page ↓", roman-numeral act-breaks. Browser-page-turn animation via scroll.
- **Voice:** Narrative serif (EB Garamond), present-tense at climaxes, drop caps on the openings.

## v5 · TWO-TRACK  *(artist + investor)*

Every section presents both perspectives side-by-side: the artistic story on the left, the investor framing on the right, separated by a hairline divider. The same content, expressed in two voices, simultaneously.

- **Order:** Same as v1, but every section is dual-panel.
- **Nav:** Top-center **lens switcher** (`ARTIST | BOTH | INVESTOR`). Toggling shrinks the non-emphasized side to 0.55 opacity and 1/3 width. State persists in localStorage. Keys `A` / `B` / `I` switch lenses.
- **Voice:** Artist column = serif italic, poetic; Investor column = sans-serif, monospace numbers, analytical.

## v6 · THE WALKING TOUR  *(visual departure · spatial)*

The pitch site **is** the venue. A floor plan in the corner shows you what room you're in. The 12 sections of the pitch correspond to 12 actual rooms of the proposed 30,000 sq ft warehouse. Walking the site mirrors walking the show.

- **Order:** Rooms — Lobby (pitch) → Box Office (ask) → Marquee (timing) → Hollywood Blvd (pilot) → Boyle Heights (album) → Asian Arc (contest) → Black LA (team) → Folk LA (creator note) → The Stage (show concept) → Real LA (franchise) → Back of House (numbers) → Exit (reserve).
- **Nav:** Persistent **floor-plan SVG** top-right. Click any room to jump. Wayfinding header on each section: ROOM 04 · HOLLYWOOD BOULEVARD · 06 W → 254 W · 48 N.
- **Visual:** Architectural / museum-guide / wayfinding. Coordinates and square footage everywhere.

## v7 · THE RECEIPTS  *(visual departure · data-led)*

A persistent KPI dashboard across the top of every section shows the key numbers at all times — raise, demand signals, breakeven, weekly gross, opening date. Comparables and bar charts throughout. For investors who want evidence first and narrative second.

- **Order:** Receipts (opening data) → Pilot data → Album data → Contest data → Comparables table → Market sizing → Operating model → Events upside → Cap structure → Team credentials → Close.
- **Nav:** **Sticky KPI bar** ($8.97M / 1,000+ / 30K+ / 1,400+ / 61% / $163K / 06/2027). Section headers numbered §01–§11.
- **Visual:** Monospace + Inter Tight. Hairline tables. Horizontal bar charts. Fintech aesthetic that respects the red/black brand.

## v8 · THE FAQ  *(question-driven)*

The pitch as the 15 questions a thoughtful investor would actually ask, in the order they'd ask them. Each section is one question + the team's direct answer. Anticipates objections head-on (Q04: *"Why won't this just be another LA arts project that overpromises?"*; Q08: *"What happens to my money if it doesn't sell?"*).

- **Order:** Q01 The ask → Q02 Why LA / why now → Q03 What have you proven (× 3 with timeline) → Q04 Why won't this overpromise → Q05 Who's making it → Q06 What's the show → Q07 Economics → Q08 Downside → Q09 Beyond tickets → Q10 Comparables → Q11 Upside → Q12 Risks → Q13 Why 2026 → Q14 Next step → Q15 More detail.
- **Nav:** **Question list sidebar** — left panel showing all 15 questions, current highlighted, click to jump.
- **Voice:** Conversational, the team's actual answer in their own words.

## v9 · THE TRIPTYCH  *(three acts)*

The pitch as a three-act play. Each act has its own color signature; the act bar at the top of the screen changes color as you move between acts.

- **Order:**
  - **Act I — THE INVITATION** (red): Premise · Why now · Terms preview.
  - **Act II — THE PROOF** (gold): Pilot · Album · Contest · Verdict (with persistent timeline) · Team · Show · Model.
  - **Act III — THE OPPORTUNITY** (cream/white): Rounds · Franchise · Close.
- **Nav:** Top-center **3-act tab bar** with roman numerals. Keys `1` / `2` / `3` jump to acts. Scene numbers (I.1, I.2, II.1, …) inside acts.
- **Voice:** Theatrical, structured like a play. Each scene a single dramatic beat.

## v10 · THE WHISPER  *(visual departure · type-led)*

For investors who hate flashy pitch decks. Written as a **letter from the producers** in the Berkshire Hathaway shareholder-letter tradition. Cream paper, EB Garamond serif, hairline rules, no photographs in the body, numbered paragraphs (¶1 through ¶14), and inline footnotes that link related sections.

- **Order:** One long letter with 14 numbered sections — Preamble · Thesis · Pilot · Album · Contest · Window · Team · Show · Model · Events Upside · Risk · Franchise · Terms · Close. The "Close" section has cross-reference footnotes (↗ ¶3, ¶7, ¶9, ¶11) that link back to the relevant paragraphs.
- **Nav:** **Sidebar TOC** with paragraph numbers (¶ 1, ¶ 2, …). Bottom utility bar has a `PRINT` button — this version is designed to print to a polished PDF.
- **Voice:** Restrained, confident, business-letter. *"Theatrical investment is not for everyone. The most honest way to discuss it, in our view, is the way Warren Buffett discusses paper mills and railroads."*

---

## Frameworks used (research-backed)

Each variant lifts from a proven pattern in investor-pitch storytelling:

| Version | Framework | Why it suits this raise |
|---|---|---|
| v1 The Tour | Standard slide-deck flow | Familiar baseline; the safest default |
| v2 Cold Open | Cinematic / *in medias res* | Theatrical investors will respond to the form-first hook |
| v3 The Memo | McKinsey pyramid / BLUF | Time-pressed institutional readers; "skim-friendly" |
| v4 Hero's Journey | Joseph Campbell / Donald Miller StoryBrand | Donor-adjacent / family-office investors who care about the story |
| v5 Two-Track | Dual-perspective / split-screen | Mixed rooms — when both sides need to feel addressed |
| v6 Walking Tour | Spatial / museum wayfinding | Mirrors the *product* — useful for the experience-economy investor |
| v7 The Receipts | Data-first / dashboard storytelling | Analytical / VC-adjacent / "show me the model" investors |
| v8 The FAQ | Anticipated-objection format | Cold pitches over email; lets investors self-navigate |
| v9 The Triptych | Three-act / theatrical structure | Strong narrative arc; closes well |
| v10 The Whisper | Berkshire-letter / long-form essay | Sophisticated investors who distrust pitch decks on principle |

## Connecting conceptually-related sections

Beyond the timeline across pilot → show, each version connects related pieces of the story through its own nav idiom:

- **v1** — chapter rail dots all section; map overlay shows clusters.
- **v2** — filmstrip thumbnails visually group photo-rich sections.
- **v3** — TOC sections grouped by numbered memo prefix (M-04, M-04.b, M-04.c are obviously one argument).
- **v4** — three acts visually bracket the proof sections inside the middle act.
- **v5** — the lens switcher *is* the connector: every section's two views are literally side by side.
- **v6** — the floor plan groups rooms by physical adjacency; demand-proof rooms cluster on the same wall.
- **v7** — the KPI bar surfaces the same data points across every section, making the through-line explicit.
- **v8** — question Q03 is presented as Q03 / Q03b / Q03c, three pieces of one demand argument.
- **v9** — the three acts each get a color; sections within an act inherit the color.
- **v10** — explicit inline footnotes (¶3↗, ¶7↗, ¶9↗) link the "Close" back to the supporting paragraphs.

## Switcher

A shared discreet bottom-right pill loads on every version (`shared/switcher.js` + `shared/switcher.css`). Click to expand the panel of all 10 versions; click any row to jump. `Shift+V` toggles the panel from the keyboard. The pill auto-detects the current version from `<body data-version="vN">`.

## URLs

Live (once GitHub Pages is on `main`):

- `wrenchxiv.github.io/If_I_Awaken/pitch-site/` — v1 (the Tour)
- `wrenchxiv.github.io/If_I_Awaken/pitch-site/v2.html` — Cold Open
- `wrenchxiv.github.io/If_I_Awaken/pitch-site/v3.html` — The Memo
- `wrenchxiv.github.io/If_I_Awaken/pitch-site/v4.html` — Hero's Journey
- `wrenchxiv.github.io/If_I_Awaken/pitch-site/v5.html` — Two-Track
- `wrenchxiv.github.io/If_I_Awaken/pitch-site/v6.html` — Walking Tour
- `wrenchxiv.github.io/If_I_Awaken/pitch-site/v7.html` — The Receipts
- `wrenchxiv.github.io/If_I_Awaken/pitch-site/v8.html` — The FAQ
- `wrenchxiv.github.io/If_I_Awaken/pitch-site/v9.html` — The Triptych
- `wrenchxiv.github.io/If_I_Awaken/pitch-site/v10.html` — The Whisper
