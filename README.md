# srikanth-iyer.github.io

Personal website of Srikanth Iyer — complex systems researcher and storyteller.

Plain HTML/CSS/JS, no build step. Served by GitHub Pages from the `main` branch
at <https://srikanth-iyer.github.io>.

## Structure

- `index.html` — main site: minimalist white, single page (about, research,
  stories, ethos, contact), boids animation in the header
- `style.css` — main stylesheet
- `boids.js` — the flocking simulation behind the header
- `llms.txt` — markdown summary of the site for LLM agents
- `robots.txt` — welcomes all crawlers, including AI bots
- `styles/` — alternative looks for the same content:
  - `styles/al-folio/` — academic (al-folio inspired)
  - `styles/condesa/` — airy editorial serif
  - `styles/dct/` — density-classification-task spacetime diagrams (live GKL cellular automaton)
- `astro-site/` — the same site rebuilt on the [Astro](https://astro.build)
  architecture (components, layouts, content-as-data, zero-JS-by-default) as an
  alternative to the hand-written static HTML. It has its own build step and is
  not auto-deployed; see `astro-site/README.md` to run or deploy it.
- `astro-folio/` — an academic-portfolio version: Astro + the al-folio design
  and feature set (BibTeX publications, projects, news, CV timeline, blog with
  math, dark mode). Built on the Apache-2.0 `chiffonng/astro-academic` theme;
  also build-stepped and not auto-deployed. See `astro-folio/README.md`.
- `astro-portfolio/` — a `nikhitasingh.com`-inspired variant: Astro, warm cream
  paper, expressive serif display type (Fraunces) over a clean sans (Inter),
  generous editorial whitespace, light/dark themes. Content-as-data, zero
  external requests; build-stepped and not auto-deployed. See
  `astro-portfolio/README.md`.

## Choosing a style

Each alternative is a self-contained `index.html` + `style.css`. To promote one
to the main site, copy its two files over the root `index.html` and `style.css`
(and port over the JSON-LD block and meta tags from the root `index.html`,
plus remove its `noindex` meta tag).

## Editing

Open `index.html` and edit the text directly. `TODO` comments mark spots
waiting for real links (papers, Scholar, LinkedIn). Push to `main` and GitHub
Pages redeploys automatically within a minute or two.
