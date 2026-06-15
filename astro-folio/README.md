# Srikanth Iyer — al-folio-style site, built with Astro (`astro-folio/`)

An academic-portfolio version of the site that pairs **Astro's** benefits
(static generation, zero-JS-by-default, content collections, type safety) with
the **al-folio** design language and feature set: an about/profile page,
BibTeX-driven publications, project/research cards, a news feed, a CV/experience
timeline, a blog with KaTeX math and code highlighting, dark mode, and SEO.

It is one of several options in this repo, alongside the hand-written static
site (repo root) and the minimalist Astro `astro-site/`.

## Attribution

This folder is built on the **[`chiffonng/astro-academic`](https://github.com/chiffonng/astro-academic)**
theme by My (Chiffon) Nguyen, used under the **Apache License 2.0** (see
[`LICENSE`](LICENSE)). That theme is itself an al-folio alternative and credits
**[`alshedivat/al-folio`](https://github.com/alshedivat/al-folio)** for its
publications component.

**Modifications** (per Apache-2.0 §4): replaced all of the original author's
personal content and configuration with Srikanth Iyer's
(`src/site.config.ts`, `src/content/**`), removed the hardcoded CV-PDF link on
the homepage, and adjusted navigation. No upstream source code was relicensed;
the `LICENSE` file is retained unchanged.

## Run it

Requires **Node ≥ 22** and **pnpm** (`corepack enable pnpm`).

```sh
cd astro-folio
pnpm install
pnpm dev      # http://localhost:4321
pnpm build    # static output in dist/
pnpm preview  # serve the built dist/
```

## Where to edit

- `src/site.config.ts` — name, tagline, email, GitHub, nav, publication author
  highlighting, footer.
- `src/content/about.md` — the about/profile prose.
- `src/content/publications/main.bib` — publications (currently **placeholder**
  "in preparation" entries; replace with your real BibTeX).
- `src/content/projects/*.md` — research/project cards.
- `src/content/updates/*.md` — news feed items (date comes from the filename).
- `src/content/blog/**` — blog posts (author refs `src/content/people.toml`).
- `src/content/experience.json` — CV/experience timeline (has `TODO` entries to
  fill in: degree, institution, advertising roles).
- `src/styles/global.css` — theme colors (Catppuccin-based) and accent.

## Search

The upstream theme leaves search "upcoming"; this folder adds full-text search
with [Pagefind](https://pagefind.app/) via the `astro-pagefind` integration
(`astro.config.ts`) and a dedicated `/search` page (`src/pages/search.astro`).
The index is built automatically on `pnpm build`.

## Notes / TODO

- The profile avatar (`src/assets/avatar.jpg`) and Open Graph image
  (`public/img/social-preview.png`) are generated **placeholders** — replace
  them with your own.
- Like `astro-site/`, this needs a build step, so it is **not** auto-deployed by
  GitHub Pages; going live would require a GitHub Actions Pages workflow.
