---
title: A model is a story you can run
description: On why modeling and storytelling are one job, and what cellular automata have to do with Discworld.
createdAt: 2026-06-01T12:00:00
tags:
  - complex systems
  - storytelling
  - emergence
authors:
  - srikanth
stage: budding
---

I came to research by way of narrative. In advertising I learned that people don't adopt ideas — they adopt stories that carry them. Later I wrote a feature film script good enough that someone paid for it, which remains one of my favorite empirical results.

So I've never quite believed the boundary between modeling and storytelling. A model is a story you can run; a story is a model you can feel. Both ask the same question: *what follows from how we choose to live together?*

## Emergence, formally

Take the simplest spatially extended system — a one-dimensional cellular automaton. Each cell updates from its neighbors by a local rule $\phi$:

$$
s_i(t+1) = \phi\bigl(s_{i-r}(t), \dots, s_{i}(t), \dots, s_{i+r}(t)\bigr)
$$

No cell sees the whole lattice, yet the lattice as a whole can compute global properties — like whether the majority of cells started "on." That's the density classification task, and it's a tiny, exact instance of the thing I find most interesting: computation with no one doing the computing.

```python
def step(state, rule, r=1):
    n = len(state)
    return [rule(tuple(state[(i + k) % n] for k in range(-r, r + 1)))
            for i in range(n)]
```

## Why Pratchett and Le Guin

My patron saints are **Terry Pratchett** and **Ursula K. Le Guin**. Pratchett, because Discworld is secretly a complex-systems textbook — cities, beliefs, and economies that emerge from the bottom up, observed with furious kindness. Le Guin, because she treated every society as a thought experiment and every thought experiment as a moral one.

Which is the whole point. If a model is a story you can run, then the question is never only *does it work* but *who is it good for* — including the people inside it who never get a vote.
