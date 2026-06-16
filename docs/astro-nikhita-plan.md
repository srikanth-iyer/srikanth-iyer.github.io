# Continuation plan: nikhitasingh.com-style version (Astro)

> **Purpose & how to use this doc.** This is a self-contained brief so a brand
> **new** Claude Code web session can finish a task that this session was
> blocked on. A new session starts from a fresh container with only this repo
> cloned, so this plan is committed into the repo (on branch
> `claude/personal-website-design-qnj4k7`) to survive the session boundary.
> In the new session say: *"continue docs/astro-nikhita-plan.md"*. Safe to
> delete once the work is done.

## Context

Owner: **Srikanth Iyer** — complex systems researcher & storyteller
(email `shriek123@gmail.com`, GitHub `srikanth-iyer`). Repo is the user-pages
site `srikanth-iyer.github.io`; active branch
**`claude/personal-website-design-qnj4k7`**.

Existing versions already in the repo (do not disturb):
- root `index.html` + `style.css` + `boids.js` — main hand-written static site
- `styles/al-folio/`, `styles/condesa/`, `styles/dct/` — plain HTML/CSS "looks"
- `astro-site/` — minimalist Astro rebuild (boids hero)
- `astro-folio/` — Astro + al-folio academic theme (chiffonng/astro-academic)

The user wants **another version, styled after https://www.nikhitasingh.com/
(#bio)**, built as an **Astro variant**. Use **only the sections relevant to
the user** — they chose: **Bio/About (lead), Research, Writing/Stories, Ethos,
Contact**. Do **not** blindly copy all of the reference's sections (skip
press/talks/portfolio-grid/etc. unless they map to the above).

## Why this is a continuation (the blocker)

`www.nikhitasingh.com` is **not on this environment's network egress
allowlist**, so it cannot be fetched here (live site, Wayback, reader proxies,
and headless Chrome all return `403 "Host not in allowlist"`). The user will
**add the host to the egress allowlist and start a new session** so the
reference can actually be studied. Network-policy docs:
https://code.claude.com/docs/en/claude-code-on-the-web

## Step 1 — Study the reference (new session, do FIRST)

Confirm access, then capture the design. Puppeteer (bundled Chrome) is already
a devDep at the **repo root** (`node_modules/puppeteer`). Use it:

```js
// node -e "..."  from repo root
const puppeteer = require("puppeteer");
const b = await puppeteer.launch({ args:["--no-sandbox","--disable-setuid-sandbox","--ignore-certificate-errors"], ignoreHTTPSErrors:true });
const p = await b.newPage();
await p.setUserAgent("Mozilla/5.0 ... Chrome/126.0 Safari/537.36");
await p.setViewport({ width:1440, height:1024 });
await p.goto("https://www.nikhitasingh.com/", { waitUntil:"networkidle2" });
// screenshot fullPage + mobile (390px); also extract nav links, [id] section
// anchors, h1/h2/h3 text, computed bodyBg/color/fontFamily, accent link color.
```

If it still returns `403 Host not in allowlist`, STOP and tell the user the
allowlist isn't active yet (it applies per-environment/new session). Take
desktop + mobile screenshots, then catalog: section list & anchors, nav style
(top/sticky/sidebar, single-page scroll), palette (bg/text/accent hex), fonts
(serif/sans, names, sizes/weights), per-section layout (column/grid/cards,
image placement), and any animations. Map the reference's sections → only the
user's chosen sections; design each in the reference's visual language.

## Step 2 — Build the Astro variant

- New folder **`astro-portfolio/`** (keep it separate from `astro-site/` and
  `astro-folio/`). Scaffold a **fresh minimal Astro project** (cleaner than
  forking a theme, since this is a bespoke look): `astro@^6`, TypeScript
  optional, plain CSS (or Tailwind 4 if the reference clearly warrants it).
- Recreate the reference's look (colors, fonts, spacing, nav, section layout)
  faithfully, but populate with the user's content.
- Componentize like `astro-site/`: a `Layout.astro` (head, meta, JSON-LD
  `Person`), a data file for site/profile config, and one component per section.
- `prefers-reduced-motion` honored if any animation is used.

### User content to reuse (already in the repo — copy/adapt, don't reinvent)
- **About/Bio + Ethos prose:** `astro-folio/src/content/about.md` and root
  `index.html` (#about, #ethos).
- **Research (3 threads):** emergent computation; LLM agents in socio-economic
  models; systems that deserve to exist — full text in
  `astro-folio/src/content/projects/*.md` and root `index.html` (#research).
- **Writing/Stories:** advertising → sold feature film script; patron saints
  Terry Pratchett & Ursula K. Le Guin — root `index.html` (#stories) /
  `astro-folio/src/content/misc.md`.
- **Ethos:** the four questions (net positive / honest at the boundaries /
  legible to the governed / Weatherwax test) — root `index.html` (#ethos).
- **Contact:** `shriek123@gmail.com`, `github.com/srikanth-iyer`.
- Tagline: "Complex systems researcher · storyteller".

## Environment learnings (avoid rediscovering)

- **Node ≥22** present in the cloud env; in the cloud, `corepack enable pnpm`
  then `pnpm install/build` works. (On the user's local **Windows**, corepack
  hits `EPERM` writing to `C:\Program Files\nodejs` — use the standalone pnpm
  installer or `npm install --legacy-peer-deps`; an `.npmrc` with
  `legacy-peer-deps=true` is the committed workaround pattern, see
  `astro-folio/.npmrc`.)
- **Screenshots:** serve built output with `python3 -m http.server <port>
  --directory dist` and drive it with the repo-root Puppeteer. External CDNs
  (jsdelivr, fonts, icons) are blocked by the allowlist → they appear
  unstyled in sandbox screenshots but render on a real deploy; not a bug.
- **gitignore** `node_modules/`, `dist/`, `.astro/` in the new project; do not
  commit build artifacts.

## Verification

- `pnpm build` (or `npm run build`) succeeds → static `dist/`.
- Screenshot home (and key sections) at desktop + mobile; compare side-by-side
  with the reference screenshots from Step 1; send to the user.
- Confirm content readable without JS; JSON-LD parses; no console errors
  (ignore allowlist CDN cert errors).

## Deliver

- Add `astro-portfolio/` to the root `README.md` structure list and give it its
  own `README.md` (run/build/deploy + attribution if any base is used).
- Commit and push to `claude/personal-website-design-qnj4k7` (no PR unless
  asked). Like the other Astro variants, it has a build step so it is **not**
  auto-deployed by GitHub Pages — note that going live needs a GitHub Actions
  Pages workflow.

## This session's only action

Commit this file to the repo (path `docs/astro-nikhita-plan.md`) on branch
`claude/personal-website-design-qnj4k7` and push, so the new session has it.
No site code is written in this session.
