# srikanth-iyer.github.io

Srikanth Iyer's personal website. GitHub Pages builds it with **Jekyll** every time
something is pushed: Jekyll takes the words in the text files below, puts them into
the site's design, and publishes the pages.

You never need to touch HTML to change what the site says. The words live in two
kinds of plain-text files:

- **YAML files** (`.yml`) in `_data/`, for lists: projects, the timeline, news, contact details.
- **Markdown files** (`.md`), for pages of writing, like each project page.

## What's where

```
_data/home.yml            Home page words: the big heading, the About intro, section titles
_data/timeline.yml        The journey timeline on the home page
_data/news.yml            "Recent news" on the home page
_data/projects.yml        Project tiles (home and Projects page) and the "More work" cards
_data/contact.yml         Email addresses, links, the Contact box's address (used on every page)
_data/navigation.yml      The links in the header

projects/dct/index.md     A project page: settings and short texts at the top (between the
                          --- lines), the page's own writing below
projects/schelling/...    Another project page
projects/thinky/...       Another project page
contact/index.html        The Contact page's heading and intro
cv/index.html             The CV, made from your private CV repo (see "Updating the CV")
404.html                  The "page not found" page

_layouts/                 Page designs (home, project page, plain page). Rarely needs editing.
_includes/                Reusable pieces: header, footer, tiles, the DCT and Schelling labs
_includes/effects/        Background effects a page can switch on (the ripple lives here)
assets/css/site.css       Every style, including light and dark
assets/js/                Scripts: site.js (every page), ring.js and schelling.js (simulations),
                          tiles.js (live tiles), pages/*.js (one page each)
_config.yml               Site-wide settings
tests/                    The automatic checks (see "Checks")
tools/                    The CV page maker and the Contact box's Google script
```

## Changing words

Open the file, change the words, save. A few YAML habits keep it working:

- Keep the **indentation** (the spaces at the start of a line) exactly as it is. Use spaces, never tabs.
- If a text contains a colon followed by a space (`: `), put the whole text in quotes:
  `title: "thinky: an outliner"`.
- For a long text, `>-` at the end of the first line lets you carry on over the next lines, indented.
- Markdown works in most texts: `*italics*`, `**bold**`, `[link words](https://…)`.

**Add a news item:** copy an item in `_data/news.yml`, paste it at the top, change it.

**Add a timeline step:** copy a step in `_data/timeline.yml`. Keep the steps oldest first,
and give the new one an `id` like `j-2027` and a `year`.

**Add a project:**
1. Add a tile to `_data/projects.yml` (copy an existing one). Its `url` is the new page's address.
2. Copy a folder in `projects/` (for example `projects/thinky/`), rename it to match the `url`,
   and change the words between the `---` lines and below them.
3. The Previous and Next links at the bottom of each project page follow the tile order.

In a Markdown page, lines in `<angle brackets>` are layout: leave them as they are and change
the words between them.

## Seeing your changes before they go live

On your laptop, in this folder:

```
bundle exec jekyll serve
```

Then open http://127.0.0.1:4000 in your browser. It rebuilds the page each time you save.
Stop it with Ctrl+C.

## Public and private (WEBSITE-RULES.md)

This repo is public, so only finished, public things go in it:

1. **No phone number,** anywhere on the site or the CV it links to.
2. **Nothing private.** Drafts, notes and private records stay in private places (your
   private CV repo, your notes), never in this repo, not even marked as drafts. Anything
   committed here stays in its history even after you delete it.

The flow is one-way: you write in a private place, and copy a piece here only when it's
ready to go live. The checks block a commit that looks private (see "Checks").

## Updating the CV

The CV's facts live in your private CV repository (`data/cv.yaml`). A script copies only the
public, finished parts into this site: it never reads the phone number, leaves out entries
marked `submitted` or `tentative`, private records (`in: []`) and the whole list of papers in
preparation (`manuscripts`), and stops with an error if the phone number shows up anyway. With both repos side by side:

```
python tools/build_cv_page.py ../CV/data/cv.yaml
```

That rewrites `cv/index.html`. Never copy `cv.yaml` itself into this repo (the checks stop it).

**No downloadable CV:** the CV lives only on the CV page, in one version. There is no PDF
and no Print or Download link (your choice, 18 Nov 2026), and the checks stop a commit that adds a PDF.

## Graphics, backgrounds and animations

The design can grow as rich as you like:

- **Site-wide look:** `assets/css/site.css` (styles) and `assets/js/site.js` (scripts on every page).
- **One page only:** list extra files in that page's front matter (the part between the `---` lines):

  ```yaml
  scripts:
    - /assets/js/my-animation.js
  styles:
    - /assets/css/my-page.css
  ```

- **Background effects:** each file in `_includes/effects/` is one effect. A page picks its
  effects with `effects: [ripple]` (the default for every page is set in `_config.yml`).
  To add one, make `_includes/effects/stars.html` with a `<canvas>` and a `<script src=…>`,
  then write `effects: [ripple, stars]` on the pages that should have it, or `effects: []`
  for none.
- Big libraries (three.js for 3D, GSAP for animation and so on) go in `assets/js/` or load
  from a CDN inside an effect file, so only the pages that use them load them.

## The Contact box

GitHub Pages can't send email, so the box hands each message to a small Google
Apps Script (`tools/contact-form.gs`) that runs in your own Google account and
emails it to you. To set it up again:

1. Signed in as tosrikanthiyer@gmail.com, open script.google.com and make a new project.
2. Paste in `tools/contact-form.gs` and save.
3. Deploy › New deployment › Web app. Execute as: Me. Who has access: Anyone.
4. Approve the access Google asks for (it's your own script).
5. Copy the web app address (it ends in `/exec`) into `form_endpoint` in `_data/contact.yml`.

## Checks

The checks catch mistakes before anyone sees them. Once set up, they run by themselves:

- **Before each commit** (a few seconds): the quick checks.
- **Before each push** (a minute or two): everything, including real browser tests.

### Set up once (Windows)

Install these, then run the setup command in this folder:

1. **Python 3** from https://www.python.org (tick "Add python.exe to PATH").
2. **Ruby+Devkit 3.3** from https://rubyinstaller.org (for Jekyll; let it run `ridk install` at the end).
3. **Node.js LTS** from https://nodejs.org (for the browser tests).
4. Optional: **Java** from https://adoptium.net (for the W3C HTML checker; skipped without it).

```
python tests/run_tests.py setup
```

That installs the tools and switches on the automatic checks (`git config core.hooksPath .githooks`).
GitHub doesn't officially support Jekyll on Windows, but it works with RubyInstaller.
If it ever gives trouble, the same commands work inside WSL (Linux on Windows).

### Run them yourself

```
python tests/run_tests.py quick    fast checks
python tests/run_tests.py full     everything
python tests/run_tests.py links    also try every link to other websites (a report; needs internet)
```

To skip the checks once (for example, to save unfinished work): `git commit --no-verify`.

### What each check looks at

Quick checks (before each commit):

- **YAML is tidy:** each file in `_data/` reads cleanly (indentation, no tabs, no repeated names).
- **Nothing missing:** every news item, timeline step, project tile and page has the parts it
  needs (a title, a date, a description for search engines), and every address in those files
  points to a page or file that exists.
- **Privacy:** no phone number, no email address other than your public ones, no draft or
  private files, no `cv.yaml`, and `WEBSITE-RULES.md` stays uncommitted.
- **Unpublished papers:** no Manuscripts section and none of the words that mark a paper in
  preparation ("manuscript", "in preparation", "preprint", "under review" and the like), on the
  pages or in the built site.
- **Scripts and styles:** no typing mistakes in the JavaScript or CSS.
- **The build:** Jekyll builds the site with no warnings.
- **Built pages:** every page has a title, one main heading, working links (including links to
  parts of pages, like `#j-2026`), pictures with descriptions, and no leftover Markdown or
  template code showing as text (like `**` or `{{`).

Full checks (before each push) add:

- **W3C HTML checker:** the pages follow the HTML standard (headings in order, labels right).
- **html-proofer:** a second, independent check of links, pictures and scripts.
- **Browser tests:** every page opens in a real browser at phone size (390 px) and laptop size
  (1280 px), in light and dark. They check that the page doesn't scroll sideways, nothing sticks
  off the screen, text doesn't run into other text or get cut off, buttons are big enough to tap,
  text isn't too small, pictures load, nothing shows an error, the theme button works, the Contact
  form asks for missing details, and the accessibility rules axe can check (WCAG 2.1 AA: colour
  contrast, labels, names) pass. A full-page screenshot of each one is saved in
  `test-results/screens/` for you to look at.

### Titles of unpublished papers

To make the checks also look for the exact titles of papers you haven't published, put one
title per line in `tests/private-titles.txt`. Like the phone file, it's ignored by git and
stays on your laptop.

### Your phone number

The privacy check already looks for anything shaped like a phone number. To make it look for
yours exactly, put your number in `tests/private-phone.txt`. That file is ignored by git, so it
never leaves your laptop.

### On GitHub

Two small workflows in `.github/workflows/` run on GitHub, for commits that never pass through
your laptop (such as Claude's from the cloud):

- **Safety check:** the quick checks on every push.
- **Full check of cloud commits:** the full checks on branches whose names start with `claude/`,
  with the screenshots attached to the run.
