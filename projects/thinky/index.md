---
# Project page: thinky, the outliner app.
layout: project
nav: projects
title: thinky, an outliner for notes you own
heading: "thinky: an outliner for notes you own"
crumb: thinky
icon: /assets/img/thinky/icon.svg
eyebrow: Software · Notes app
lede: >-
  A small, fast outliner for linked notes, on Windows and Android. Daily journals,
  pages, <code>[[links]]</code>, tags and to-dos, all kept as plain Markdown files
  in a folder you choose. No accounts, no servers, no tracking.
chips:
  - Windows · Android
  - Rust · Tauri
  - Edge and Chrome extension
  - Free software, AGPL-3.0
buttons:
  - text: Visit the thinky website
    url: https://srikanth-iyer.github.io/thinky/
    primary: true
  - text: Download for Windows
    url: https://github.com/srikanth-iyer/thinky/releases/latest/download/thinky-setup.exe
  - text: Download for Android
    url: https://github.com/srikanth-iyer/thinky/releases/latest/download/thinky.apk
  - text: Source on GitHub
    url: https://github.com/srikanth-iyer/thinky
  # Google Play: add a button here once the listing is public
description: >-
  thinky is a small, fast outliner for plain Markdown notes on Windows and Android,
  inspired by Obsidian and Logseq, with a browser extension for highlights.
og_title: "thinky: an outliner for notes you own"
og_description: Linked notes in plain Markdown files, on Windows and Android. No accounts, no lock-in.
og_type: article

details_heading: Get it and follow along
details:
  - heading: Download
    items:
      - "[Windows installer](https://github.com/srikanth-iyer/thinky/releases/latest/download/thinky-setup.exe), about 3 MB"
      - "[Windows portable](https://github.com/srikanth-iyer/thinky/releases/latest/download/thinky-portable.exe), no installing"
      - "[Android app](https://github.com/srikanth-iyer/thinky/releases/latest/download/thinky.apk)"
  - heading: Follow along
    items:
      - "[Changelog](https://srikanth-iyer.github.io/thinky/changelog.html), built in public releases"
      - "[Every release](https://github.com/srikanth-iyer/thinky/releases)"
      - "[Ideas and problems](https://github.com/srikanth-iyer/thinky/issues)"
  - heading: Works with
    text: Logseq's Markdown folders (Logseq 0.10 and its file-based graphs). Logseq can keep using the same folder, on the desktop or the phone, even while thinky has it open.
---

<figure class="shot hero-shot">
  <img src="/assets/img/thinky/journals.png" alt="thinky on a laptop: today's journal with notes, a to-do, links to pages and the notes that link back to this day." width="1280" height="800">
  <figcaption>Today's journal on a laptop. The notes are made up.</figcaption>
</figure>

<!-- Why it exists -->
<section class="block" id="why">
  <div class="eyebrow">Why I built it</div>
  <h2>Notes that outlive any one app</h2>
  <div class="about" style="margin-top:20px">
    <div>
      <ul class="facts">
        <li><span><b>Inspired by</b> Obsidian and Logseq</span></li>
        <li><span><b>No lock-in:</b> every note is a plain Markdown file</span></li>
        <li><span><b>Links</b> keep out-of-sight ideas in reach</span></li>
        <li><span><b>Works well with AI</b>, which reads and writes the same files</span></li>
      </ul>
    </div>
<div class="prose" markdown="1">

thinky grew out of years of using Obsidian and Logseq, two apps that taught me to write in small linked notes instead of long documents. I wanted that way of working in something lean that starts in a moment, on my laptop and my phone.

I also didn't want to be locked in. Markdown doesn't belong to any one program: it's plain text that any editor can open, today or in twenty years. thinky works on the same files Logseq uses, so you can switch between the two, or stop using both, and your notes stay yours.

Links are the heart of it. Out of sight is out of mind, and a link is how a note I wrote months ago comes back when it matters. Each page shows every note that points to it, so the context travels with the idea.

Plain linked files also work very well with AI. An assistant can read the same folder, follow the links to gather context, and write notes back in the same format, with no export and no special plug-in.

</div>
  </div>
</section>

<!-- What it does -->
<section class="block" id="features">
  <div class="eyebrow">What it does</div>
  <h2>Small, fast and safe with sync</h2>
  <div class="info">
    <div class="box">
      <h3>Write and link</h3>
      <p>Journals and pages, with links, tags, properties, linked and unlinked references, to-dos and fast search that forgives typos in page names.</p>
    </div>
    <div class="box">
      <h3>Safe with sync</h3>
      <p>Keep the folder in Google Drive or Syncthing. If a page changed on another device, thinky merges the two, and nothing is ever silently overwritten.</p>
    </div>
    <div class="box">
      <h3>Quick capture</h3>
      <p>A shortcut key on Windows, home-screen widgets and the share sheet on Android, and highlights from your browser.</p>
    </div>
  </div>
  <div class="shots">
    <figure class="shot">
      <img src="/assets/img/thinky/night.png" alt="A page called Garden plan in the dark Plain night look, with headings, to-dos and its linked references." width="1280" height="800" loading="lazy">
      <figcaption>A page in the Plain night look, with the notes that link back to it.</figcaption>
    </figure>
    <figure class="shot phone">
      <img src="/assets/img/thinky/phone.png" alt="thinky on a phone: today's journal in the Calm look, with a round plus button for a new note." width="390" height="780" loading="lazy">
      <figcaption>On a phone.</figcaption>
    </figure>
  </div>
</section>

<!-- Browser extension -->
<section class="block" id="highlights">
  <div class="eyebrow">Browser extension</div>
  <h2>thinky highlights</h2>
  <p class="lede">Mark passages as you read in Edge or Chrome and send them to your notes, each with a link back to its spot in the article. Come back to the page later and the passages you kept are marked again.</p>
  <div class="link-row">
    <a class="btn primary" href="https://chromewebstore.google.com/detail/ggainimehhgjmblabbjkiemfhhlhcgnk" rel="noopener">Get it for Chrome</a>
    <a class="btn" href="https://microsoftedge.microsoft.com/addons/detail/cpdmmmcipjfebaemgdnbamipolboaokn" rel="noopener">Get it for Edge</a>
    <a class="btn" href="https://srikanth-iyer.github.io/thinky/highlights.html" rel="noopener">How highlights work</a>
  </div>
  <div class="shots ext">
    <div class="stack">
      <figure class="shot">
        <img src="/assets/img/thinky/highlights-new.png" alt="An article with three passages marked in yellow" width="560" height="140" loading="lazy">
        <figcaption>New highlights, not sent yet.</figcaption>
      </figure>
      <figure class="shot">
        <img src="/assets/img/thinky/highlights-page.png" alt="The article with two passages in a pale yellow, underlined" width="560" height="140" loading="lazy">
        <figcaption>Back on the article: passages already in your notes.</figcaption>
      </figure>
    </div>
    <figure class="shot">
      <img src="/assets/img/thinky/highlights-box.png" alt="The extension's box listing three highlights already in How Bread Rises" width="340" height="520" loading="lazy">
      <figcaption>The extension's box lists them too.</figcaption>
    </figure>
  </div>
</section>
