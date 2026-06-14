# Astro version of srikanth-iyer.github.io

An alternative build of the personal site using the [Astro](https://astro.build)
architecture, as a counterpart to the hand-written static HTML in the repo root.

## Why Astro

The root site is plain HTML/CSS/JS served directly. This version demonstrates a
component-based architecture with a build step:

- **Components & layouts** — `src/layouts/Layout.astro`, `src/components/`
  (`Section.astro`, `Boids.astro`) instead of one long HTML file.
- **Content as data** — site metadata, nav, and JSON-LD all derive from
  `src/data/site.ts`, so they stay in sync from one source of truth.
- **Zero JS by default** — pages render to static HTML at build time. The only
  client-side script is the boids animation, bundled from
  `src/scripts/boids.js` via `Boids.astro`.

The visual design and content match the main minimalist site exactly.

## Run it

```sh
cd astro-site
npm install
npm run dev      # local dev server at http://localhost:4321
npm run build    # static output in dist/
npm run preview  # serve the built dist/ locally
```

## Deploying

`npm run build` emits a fully static site to `dist/`. Because this repo's root
is already served by GitHub Pages as the live site, this Astro build is **not**
auto-deployed — it's an option to evaluate. To make it the live site you'd
either:

- add a GitHub Actions workflow that builds `astro-site/` and publishes `dist/`
  to Pages, or
- build locally and copy `dist/` to wherever Pages serves from.

`node_modules/`, `dist/`, and `.astro/` are gitignored.
