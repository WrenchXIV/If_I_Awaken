# Catch-up note — If I Awaken in Los Angeles

A primer for a new chat picking up work on this project. Read this first, then `brand/README.md`, then the target file.

---

## The show (facts)

- **Title**: *If I Awaken in Los Angeles* (full; always use the full title, never "If I Awaken" alone in marketing copy)
- **New permanent home**: **539 S Mission Rd, Los Angeles** — opens **June 2027**
- **Director (for the new show)**: **Andrew Scoville** (NYC) — Here Lies Love (Broadway assoc. dir.), Theater of the Mind (DCPA, David Byrne/Mala Gaonkar), Money Heist: The Experience (Netflix). Specializes in immersive, multi-room, audience-on-foot productions.
- **Producer**: Get Lit — Words Ignite (Diane Luby Lane, founder) with Brandon XIV and Shane Snow
- **Composer**: Derrick Hodge (Grammy-winning; live album out now)
- **Pilot**: Aug 1, 2025 at The Ford Theatre (sold out, 1,000+). *Directed by Gina Belafonte at The Ford — do NOT credit her on the 2027 show.* The 2027 show is Scoville's.
- **Structure**: 6 acts (~110 min) — Hollywood Tour → Boyle Heights Tianguis → The Five Towns → South Central / The Blood → The Canyons / Folk → Topanga / Finale
- **Four simultaneous layers**: spoken word · live band · dance · immersive video. Never more than 6 feet from a voice.
- **Key press** (from pilot): Hollywood Times, Deadline, Foster Hedison, Aloe Blacc, Pereira — all reviews are of the pilot production at The Ford.
- **LA Phil is NOT a partner** of the new show (was part of the pilot context, has been removed).

## Files that matter

### Decks
- **`site-deck v4.html`** — ⭐ current target. 22-slide investor/pitch + program hybrid. Uses `<deck-stage>` (see `deck-stage.js`). Has Tweaks panel for brand + voice toggles.
- `site-deck v3.html` — 17-slide investor pitch only (v4 includes all of this)
- `site-deck v2.html` — v3 without Tweaks panel
- `site-deck.html` — the original "digital program" version (different audience, but some slides were merged into v4: Director, Experience, Journey, Venue, Runtime, Reserve)
- `site-deck-prebrand.html` — backup before the brand system was wired in; safe to ignore
- `program.html` / `program v2.html` / `program v3.html` — interactive digital program (separate deliverable, not currently active)

### Brand system
- **`brand/brand-tokens.js`** — the three locked brand directions as runtime tokens. API: `Brand.tokens()`, `Brand.set(id)`, `Brand.onChange(fn)`. Persists selection in localStorage.
- **`brand/README.md`** — read this. Documents the three directions.
- `brand/final-1-cinema.jsx` / `final-2-opera.jsx` / `final-3-chapbook.jsx` — the static brand-board artboards that defined each direction.
- `brand-final.html` — the canvas showing all three directions side by side.
- `brand-board.html` — the older 13-variation exploration canvas.

### Assets
- `assets/brand/logo-oneline.png`, `logo-twoline.png` — red-block logo lockups (exactly as provided by client)
- `assets/brand/photo-01-bw.jpg` through `photo-04-finale.jpg` — production photos (B&W in Cinema direction; duotoned in Opera; treated in Chapbook)
- `uploads/` — original source materials (the client's PDF deck, the Ford script, logos, photos)

## The three brand directions (locked)

Toggled via the Tweaks panel in `site-deck v4.html`. All three share:
- Red (`#C9242A` / `#9E1B21`) as primary
- Heavy condensed sans-serif display type (Oswald / Antonio / Anton family)
- Italic serif as voice-counterweight
- The red-block logo

The differences:

1. **Cinema** (default) — newsprint-ivory paper, JetBrains Mono accents, black & white photography. *Cinematic, editorial, press-kit energy.*
2. **Opera** — oxblood + brass, Playfair Display italic accents, warm duotoned photography. *Theatrical, ornate, playbill energy.*
3. **Chapbook** — bone paper, forest-green accents, EB Garamond italics, terracotta highlights. *Literary, handmade, poetry-pamphlet energy.*

Brand direction is a runtime toggle — changing it re-skins every slide. Any new component should read from the CSS vars (`--paper`, `--ink`, `--red`, `--f-display`, `--f-serif`, etc.) never from hardcoded hexes.

## Voice tokens (copywriting)

Same Tweaks panel has a **Voice** toggle independent of the visual brand. Copy that's voice-dependent is wrapped in:

```html
<span data-voice-set>
  <span data-voice="cinema">Editorial copy.</span>
  <span data-voice="opera">Ceremonial copy.</span>
  <span data-voice="chapbook">Chapbook/literary copy.</span>
</span>
```

For block-level swaps: `<span data-voice-set="block">...</span>`.

When adding new copy to v4, wrap anything marketing-tone in this pattern with all three variants. Neutral factual copy (address, runtime, dates) stays as plain text.

## Current user preference

The user has set **Chapbook** as their live brand selection (as of last session). Keep Chapbook looking great as the default review experience, but the deck must still toggle cleanly to Cinema and Opera.

## Slide map of `site-deck v4.html` (22 slides)

1. **Cover** — title + metadata strip
2. Hollywood Times press quote
3. The Show — director's note / premise
4. On Stage — full-bleed production photo
5. Deadline press quote
6. Landmark Premiere — Ford 2025 stats
7. Foster Hedison press quote
8. Live Album — 30K+ stat, Derrick Hodge credit
9. Aloe Blacc endorsement
10. City Speaks Back — community / contest angle
11. Pereira press quote
12. Producers — Get Lit roster
13. Special Guests — talent list
14. Global Stage — world tour framing
15. Franchise — model / expansion
16. **Director** (Andrew Scoville) — credits grid
17. **The Experience** — 4 layers grid (dark slide)
18. **Journey Map** — SVG floorplan + 6 acts list
19. **Venue & Access** — logistics + before-you-arrive
20. **Your 110 Minutes** — minute-by-minute rundown
21. Note from the Creative Director (orig v3)
22. **Reserve** — contact, pills, practical info (dark full-bleed)

## Iteration rules of thumb

- Don't reintroduce LA Phil or the August 2025 Ford date for the *current* show. Those belong only to the pilot context (press quotes, premiere slide).
- Always preserve the Tweaks panel (brand + voice toggles). Wire new copy into `data-voice-set` and new colors into CSS vars.
- Don't hardcode brand hexes in new CSS; use `var(--red)`, `var(--ink)`, `var(--paper)`, etc. (See `site-deck v4.html` `:root` block.)
- Keep the `<deck-stage width="1920" height="1080">` shell; slides are direct `<section>` children.
- The validator flags some "overlapping" and "sub-24px" items on Cover and press-quote slides — these are intentional (decorative quote marks layering behind blockquotes; micro-labels on the cover metadata strip). Don't "fix" them without checking.
- When copying v4 to a vN+1, register the new file as the asset `Site Deck v(N+1)`.

## Known TODOs the user mentioned but wasn't completed

- On press quote slides (2, 5, 7, 9, 11), the user asked to add a top-left kicker line: **"REVIEW FROM OUR PILOT PRODUCTION AT THE FORD THEATRE"** — styled like the bottom-left "IF I AWAKEN IN LOS ANGELES" (same font, tracking, uppercase, size). This was requested right before the session cut off and has *not* been applied yet.

---

*Written at the end of session on April 23, 2026. Continue from `site-deck v4.html`.*
