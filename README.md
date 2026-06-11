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
  - `styles/app-landing/` — gradient app-landing-page look
  - `styles/tokyo/` — one-page portfolio, huge display type
  - `styles/condesa/` — airy editorial serif

## Choosing a style

Each alternative is a self-contained `index.html` + `style.css`. To promote one
to the main site, copy its two files over the root `index.html` and `style.css`
(and port over the JSON-LD block and meta tags from the root `index.html`,
plus remove its `noindex` meta tag).

## Editing

Open `index.html` and edit the text directly. `TODO` comments mark spots
waiting for real links (papers, Scholar, LinkedIn). Push to `main` and GitHub
Pages redeploys automatically within a minute or two.
