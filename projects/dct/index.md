---
# Project page: density classification under noise.
# The words at the top, the three story chapters and the Details boxes are all below.
layout: project
nav: projects
title: How a ring of cells agrees on the truth
crumb: Density classification
eyebrow: Research · Collective intelligence under noise
lede: >-
  A ring of cells, each seeing only its neighbours, has to decide together what
  most of them were at the start. When we add noise, only some rules keep working,
  and evolution keeps finding the same kind: rules that can afford to ignore part
  of what they see.
chips:
  - CASCI lab, Binghamton
  - GPU simulation (CuPy)
  - 2B+ runs
  - CCS 2026 · 3rd place, Best Student Presentation
description: >-
  Density classification under noise: why evolution favours canalized rules that can
  ignore some of their inputs. Research by Srikanth Iyer and colleagues in the CASCI lab.
og_title: How a ring of cells agrees on the truth
og_description: 149 cells, no one in charge, and a lot of noise. Which rules still find the right answer?
og_type: article
scripts:
  - /assets/js/ring.js
  - /assets/js/pages/dct.js

# The story: three chapters scroll past while the ring stays in place.
# Each chapter's "text" is Markdown: leave an empty line between paragraphs.
# A paragraph followed by {: .quote} on its own line is shown as a big quote.
chapters:
  - numeral: I
    title: The task
    text: |
      Picture 149 cells sitting in a ring. Each one is black or white, and each can see only a few neighbours on either side.

      The question for the whole ring: were most cells black, or most white, at the start? If every cell can turn all black or all white to give the answer, the ring has computed something none of its cells could see.

      This is the density classification task. The rule shown here, called GKL, solves it surprisingly well.
  - numeral: II
    title: Add noise
    text: |
      Real systems are noisy. So we flip cells at random while the ring is still deciding, and watch what breaks.

      The ring now runs a plain local majority vote: each cell copies whatever most of its close neighbours are. It sounds sensible, but it freezes into stripes and never reaches one answer.

      With GPU simulation campaigns of more than two billion runs, we evolve rules for this task under noise and see which ones still work.
  - numeral: III
    title: Canalization
    text: |
      The rules that hold up are canalized: they have logical redundancy, so their decision rests on only some of their inputs. GKL is one of them. A white cell only looks one way, a black cell only the other.

      Back on GKL, with the same noise, the ring still finds the majority. Tap it to throw in a burst of noise and watch it recover.

      Under noise, evolution favours rules that can afford to ignore some of what they see.
      {: .quote}

# The boxes under "Details". A box has a "text" or a list of "items" (Markdown works in both).
details:
  - heading: Team
    text: Srikanth Iyer, Annajirao Challa, Duxiao Hao, Jordan C. Rozum and Luis M. Rocha, in the CASCI lab at Binghamton University.
  - heading: Talks
    items:
      - CCS 2026, Binghamton (Oct 2026). Best Student Presentation, 3rd place
      - CPIN2 at NetSci 2026, Boston (Jun 2026)
      - CBeRa Forum 2026, Lisbon (Jun 2026)
      - NERCCS 2026, Rochester (Mar 2026)
---

{% include dct-story.html %}

{% include dct-lab.html %}
