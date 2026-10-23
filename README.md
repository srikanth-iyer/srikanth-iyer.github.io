# srikanth-iyer.github.io

Personal website of Srikanth Iyer, built with [Astro](https://astro.build) and published on GitHub Pages.

Right now the home page is a **direction picker**: six design directions, all built from the same content, so you can compare them before choosing one.

| Letter | Direction | Page |
| --- | --- | --- |
| A | Research Talks (your CCS 2026 deck's design system) | `src/pages/directions/talks.astro` |
| B | Living specimen (dark, live automaton behind your name) | `src/pages/directions/specimen.astro` |
| C | Academic folio (classic academic layout, light/dark) | `src/pages/directions/folio.astro` |
| D | Editorial notebook (filterable work list, notebooks) | `src/pages/directions/notebook.astro` |
| E | Illustrated garden (explainers and growing notes) | `src/pages/directions/garden.astro` |
| F | Monospace lab (black-and-white, rule comparison) | `src/pages/directions/lab.astro` |

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
| `notes.json` | Garden notes and their growth stage (`seedling`, `budding`, `evergreen`) |

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

## Choosing a direction

When you've picked one, the chosen page replaces the picker on the home page (`src/pages/index.astro`), and the others can be deleted or kept as archived experiments.

## Other files

- `src/scripts/automaton.js`: the live cellular automaton used by several designs (GKL rule, local majority, noise).
- `src/layouts/Base.astro`: the page shell, including search-engine and social-preview tags and structured data about you.
- `public/llms.txt`: a plain-text summary of you and your work for AI tools that read websites.
