# srikanth-iyer.github.io

Personal website of Srikanth Iyer, built with [Astro](https://astro.build) and published on GitHub Pages.

The site uses the **Collective** design system: one shared grammar (fonts, spacing, the teal "thread" colour for links and section numbers, the header, navigation and footer) and a separate look, or *dialect*, for each section.

## How the site is organised

| Page | Address | Section look | File |
| --- | --- | --- | --- |
| Home | `/` | introduction, then a short preview band for every section | `src/pages/index.astro` |
| Research | `/research/` | white paper, data orange, claim titles | `src/pages/research.astro` |
| Art | `/art/` | dark gallery, square frames | `src/pages/art.astro` |
| Film & writing | `/film/` | script paper, screenplay slug lines | `src/pages/film.astro` |
| Notes | `/notes/` | warm paper, italic serif, growth-stage chips | `src/pages/notes.astro` |
| Explainers | `/explainers/` | white, blue/red comparison colours | `src/pages/explainers/index.astro` |
| Canalization explainer | `/explainers/canalization/` | scroll-driven, GKL run in the background | `src/components/CanalizationExplainer.astro` |
| Schelling explainer | `/explainers/schelling/` | scroll-driven, a town segregating in the background | `src/components/SchellingExplainer.astro` |

The home page and each section page use the same building blocks, in `src/components/sections/` (the home page just shows fewer items). Each section picks its look with `data-theme="research"`, `"art"`, `"film"`, `"notes"` or `"explainers"`; the colours for each are defined in `src/styles/collective.css`.

### The six early design directions

The six directions explored before settling on Collective are kept for comparison at `/directions/` (files in `src/pages/directions/`). They are not linked from the main navigation and can be deleted later.

## Where your content lives

All the text comes from small data files in `src/data/`. Edit these, not the pages:

| File | What it holds |
| --- | --- |
| `profile.json` | Name, bio, roles, education, award highlight, "Now" list, email, links, photo |
| `research.json` | Research projects (title, summary, authors, venues, code link) |
| `talks.json` | Talks and posters |
| `news.json` | Dated news items (may contain simple HTML like `<b>`) |
| `film.json` | Film, writing and advertising credits |
| `art.json` | TouchDesigner pieces |
| `notes.json` | Notes and their growth stage (`seedling`, `budding`, `evergreen`) |
| `explainers.json` | The explainers listed on the Explainers page and the home page |

A `.json` file is plain text with a strict format: text goes inside double quotes, items are separated by commas, and the last item in a list has **no** comma after it. If the site stops building after an edit, a missing or extra comma is the usual cause.

### Adding your photo

1. Put the image in the `public/` folder, for example `public/portrait.jpg`.
2. In `src/data/profile.json`, change `"photo": null` to `"photo": "/portrait.jpg"`.

### Adding your CV as a PDF

1. Put it at `public/cv.pdf`.
2. In `src/data/profile.json`, change `"cv": null` to `"cv": "/cv.pdf"`.

## Working on the site on your computer

You need [Node.js](https://nodejs.org) (version 22 or newer). In a terminal, inside this folder:

```bash
npm install        # downloads Astro, the tool that builds the site (only needed once)
npm run dev        # starts a local preview at http://localhost:4321 that updates as you edit
npm run build      # builds the final site into the dist/ folder, to check for errors
```

## Publishing

The file `.github/workflows/deploy.yml` builds and publishes the site automatically every time the `main` branch changes.

One-time setup on GitHub: open this repository's **Settings → Pages**, and under **Source** choose **GitHub Actions**.

## Other files

- `src/styles/collective.css`: the Collective design system (shared fonts and spacing, plus the five section colour sets).
- `src/layouts/Site.astro`: the header, navigation and footer shared by every page.
- `src/components/CellRule.astro`: the strip of automaton cells between sections.
- `src/scripts/automaton.js`: the live cellular automaton on the home page (GKL rule, local majority, noise).
- `src/layouts/Base.astro`: the page shell, including search-engine and social-preview tags and structured data about you.
- `public/llms.txt`: a plain-text summary of you and your work for AI tools that read websites.
