# astro-portfolio

A `nikhitasingh.com`-inspired portfolio variant of Srikanth Iyer's site, built
with [Astro](https://astro.build). Warm cream paper, expressive serif display
type ([Fraunces](https://fonts.google.com/specimen/Fraunces)), a clean
grotesque for body text ([Inter](https://fonts.google.com/specimen/Inter)),
generous editorial whitespace, a single centered column, and one terracotta
accent. Light and dark themes follow the system preference.

This is a **standalone variant**, like the other entries under `styles/`. It is
**not** auto-deployed — GitHub Pages serves the hand-written `index.html` at the
repo root. Build and deploy this only if you choose to promote it.

## Design language

Faithful to the reference's calm, personal, editorial feel:

- **Palette** — warm off-white paper (`#fbf7f0`), warm near-black ink, a single
  terracotta accent (`#c2643d`) used sparingly. A full dark theme mirrors it.
- **Type** — Fraunces (variable serif) for the name, headings, and pull-quotes;
  Inter for body. Both are self-hosted via `@fontsource-variable` — zero
  external font requests at runtime.
- **Layout** — one ~38rem measure, centered, with large vertical rhythm and a
  sticky minimal nav that grows a hairline on scroll.
- **Motion** — gentle scroll-reveal via `IntersectionObserver`, fully disabled
  under `prefers-reduced-motion`.

## Architecture

Content-as-data, markup-as-components — the same philosophy as `astro-site/`:

```
src/
  data/site.ts          all prose + metadata (the only file to edit for content)
  layouts/Layout.astro  <head>, self-hosted fonts, JSON-LD, global CSS
  components/
    Nav.astro           sticky top navigation
    Section.astro       numbered, titled content section
  styles/global.css     design tokens + base styles
  pages/index.astro     hero + sections + footer, scoped styles, reveal script
public/
  favicon.svg           three agents emerging from local rules
  robots.txt
```

To change wording, edit **`src/data/site.ts`** only. Sections live in
`pages/index.astro`.

## Develop

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # static output to ./dist
pnpm preview    # serve the build
pnpm check      # astro + TypeScript diagnostics
```

Requires Node 18+ and pnpm. The build is fully static (`output: "static"`).

## Promote to the main site

This variant is not wired into GitHub Pages. To ship it, deploy the contents of
`dist/` (e.g. via a GitHub Action) or copy the built HTML/CSS over the root —
and carry over the canonical URL and JSON-LD already encoded in `Layout.astro`.
