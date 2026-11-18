---
# Project page: language-model agents in the Schelling segregation model.
layout: project
nav: projects
title: AI agents in a segregation model
crumb: Schelling and AI agents
eyebrow: Research · AI agents and society
lede: >-
  In 1971 Thomas Schelling showed that a city can sort itself into separate
  neighbourhoods even when nobody wants that, if each resident only wants a few
  neighbours like them. We rebuilt the model so that every resident is a language
  model with a social identity, and asked whether the cities they make look like real ones.
chips:
  - Binghamton Center of Complex Systems
  - Python · Ollama · AutoGen · Mesa
  - Compared with U.S. census data
description: >-
  The Sakoda-Schelling segregation model, rebuilt so every resident is a language-model
  agent with a social identity, and compared with U.S. census data.
og_title: AI agents in a segregation model
og_description: What happens to a classic model of how cities sort themselves when each resident is a language model?
og_type: article
scripts:
  - /assets/js/schelling.js
  - /assets/js/pages/schelling.js

details:
  - heading: Team
    text: Srikanth Iyer, Andreas Pape, Yixin Ren, Nency Dhameja, Christopher Zosh, Mohammad Mahinur Alam and Carl Lipo, at the Binghamton Center of Complex Systems.
  - heading: Talks
    items:
      - CCS 2026, Binghamton (Oct 2026), presented by Andreas Pape
      - NERCCS 2026, Rochester (Mar 2026), presented by Andreas Pape
---

{% include schelling-lab.html %}

<!-- The study -->
<section class="block" id="study">
  <div class="eyebrow">The study</div>
  <h2>Swap the rule for a language model</h2>
  <div class="about" style="margin-top:20px">
    <div>
      <ul class="facts">
        <li><span><b>Residents:</b> language-model agents, each given a racial, ethnic, income or political identity</span></li>
        <li><span><b>Decision:</b> move or stay, asked of the model at every turn</span></li>
        <li><span><b>Check:</b> the patterns are compared with U.S. census data</span></li>
      </ul>
    </div>
<div class="prose" markdown="1">

In the classic model the choice to move comes from a fixed threshold, like the slider above. In ours, each resident is a language model. It is told who it is, sees its neighbourhood, and decides whether to move or stay.

Some models partially reproduce the segregation patterns found in real U.S. census data, and they behave differently depending on the social context they are given. That is evidence of the predispositions these AI agents carry, which matters as more of them begin to act in the online world.

I built the simulation framework: the protocol and its stopping rules, the agents and their prompts, an interface that makes every agent answer in a fixed format so its reply can be read reliably, and a way to read each agent's chance of moving directly from the model.

</div>
  </div>
</section>
