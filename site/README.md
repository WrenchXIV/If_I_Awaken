# If I Awaken in Los Angeles — Interactive Tour

The interactive tour website. Static Astro site that turns the eight locked
design HTML files (Lobby + Spaces 1–7) into a navigable, mobile-friendly tour.

## Run locally

```bash
cd site
npm install
npm run dev          # http://localhost:4321/tour
```

`npm run dev` and `npm run build` both run a `prebuild` step that:
1. Mirrors images from `../Interactive Tour/` into `public/images/`
2. Mirrors audio from `../tour audio/` into `public/audio/`
3. Re-extracts content from the design HTMLs into `src/data/spaces/*.json`

So if you regenerate AI images or update a design HTML, just `npm run dev`
again — it picks up automatically.

## Edit mode

Add `?edit=1` to any URL (e.g. `/tour/space-1?edit=1`).
A password gate appears. Default password: **`awaken`** — rotate before going public
by replacing the SHA-256 hash in `src/components/EditorOverlay.astro`
(`EDITOR_HASH` constant). To compute a new hash:

```bash
echo -n 'your-password' | shasum -a 256
```

In edit mode:
- Click any text to edit it inline.
- Hover any block to get a Delete / Restore button.
- Edits save to your browser's localStorage as you type.
- Click **Export changes** to download a JSON file. Send it to me in chat
  and I'll commit the edits to the source content files.

## Deploy

The site is configured to deploy at `/tour` on `ifiawakeninla.com`.
A `vercel.json` is checked in. To deploy:

1. Push the branch to GitHub.
2. Import the repo into Vercel.
3. Set **Root Directory** to `site`.
4. Vercel auto-detects Astro. Build command: `npm run build`. Output: `dist`.
5. Once happy, point the custom domain `www.ifiawakeninla.com` at the project
   (or use a rewrite from the pitch-deck site to proxy `/tour/*` here).

## Project structure

```
site/
├── astro.config.mjs        # base path = /tour
├── tailwind.config.cjs     # design tokens lifted from site-deck v6
├── public/
│   ├── images/             # synced from /Interactive Tour at build
│   └── audio/              # synced from /tour audio at build
├── scripts/
│   ├── sync-assets.mjs     # mirrors binaries from repo root
│   └── extract-content.mjs # parses design HTMLs into JSON
├── src/
│   ├── components/         # Hero, Callout, MetaRow, PlanView, BeatSequence,
│   │                       # PerspectiveGallery, DesignState, SpaceFooter,
│   │                       # AudioPlayer, EditorOverlay, SiteHeader
│   ├── data/spaces/        # one JSON file per space (edit these for content)
│   ├── layouts/TourLayout.astro
│   ├── lib/spaces.ts       # space order & navigation helpers
│   ├── lib/content.ts      # JSON loader
│   ├── pages/
│   │   ├── index.astro     # master-plan landing
│   │   └── [space].astro   # generates one page per space
│   ├── styles/global.css   # design tokens, beat-tag styling, reveal animation
│   └── types.ts            # SpaceContent shape
```
