// Single source of truth for the portfolio's content and metadata.
// Consumed by the layout (<head> + JSON-LD) and by index.astro / components.
// Content-as-data: edit prose here, never in markup.

export const site = {
  name: "Srikanth Iyer",
  title: "Srikanth Iyer — Complex Systems Researcher & Storyteller",
  description:
    "Srikanth Iyer is a complex systems researcher studying emergent computation and LLM agents in socio-economic models. Formerly in advertising; screenwriter with a sold feature film script.",
  url: "https://srikanth-iyer.github.io/",
  email: "shriek123@gmail.com",
  github: "https://github.com/srikanth-iyer",
  githubHandle: "srikanth-iyer",
  // Short role line under the name in the hero.
  role: "Complex systems researcher & storyteller",
  knowsAbout: [
    "complex systems",
    "emergent computation",
    "agent-based modeling",
    "LLM agents",
    "socio-economic models",
    "multi-agent simulation",
    "storytelling",
    "screenwriting",
    "advertising",
  ],
};

// In-page navigation. `id` must match a <section> id rendered on the page.
export const nav = [
  { id: "about", label: "About" },
  { id: "research", label: "Research" },
  { id: "writing", label: "Writing" },
  { id: "ethos", label: "Ethos" },
  { id: "contact", label: "Contact" },
];

// Hero — the large opening statement.
export const hero = {
  greeting: "Hi, I'm Srikanth.",
  lead:
    "I study emergent computation and what happens when LLM agents are let loose inside socio-economic models — how local interactions become global behavior, and what that teaches us about the systems we all live in.",
  // Two halves of the same job: scientist and storyteller.
  kicker: "A model is a story you can run; a story is a model you can feel.",
};

// About — the longer-form introduction.
export const about = {
  title: "About",
  paragraphs: [
    "I'm a researcher working on complex systems — the study of how many simple parts, interacting locally, produce behavior that none of them contains. Ant colonies, markets, cities, language: systems that compute without anyone doing the computing.",
    "My current work sits at the intersection of emergent computation and artificial agents: building socio-economic models populated by LLM-driven agents, and watching what institutions, norms, and failures emerge. It's part science, part world-building — which suits me, because before research I spent years in advertising learning how stories move people, and I've written (and sold) a feature film script.",
    "I believe the two halves are one job. A model is a story you can run; a story is a model you can feel. Both are ways of asking the same question: what follows from how we choose to live together?",
  ],
};

// Research — three threads, one rope.
export const research = {
  title: "Research",
  intro: "Three threads, one rope.",
  threads: [
    {
      title: "Emergent computation",
      body:
        "How do distributed systems with no central controller end up performing computation? I'm interested in the conditions under which collective behavior becomes information processing — in cellular automata, swarms, and economies alike.",
    },
    {
      title: "LLM agents in socio-economic models",
      body:
        "Agent-based models traditionally use simple, hand-coded agents. Replace them with language-model agents — agents that negotiate, deceive, cooperate, and rationalize — and the models become laboratories for studying institutions, markets, and norms before we live through them.",
    },
    {
      title: "Systems that deserve to exist",
      body:
        "Modeling isn't neutral. I care about using these tools to design mechanisms and policies that are a net positive for the people inside them — and about being honest regarding what models can and cannot tell us.",
    },
  ],
  // Publications / preprints / code land here later.
  note: "Publications, preprints, and code will live here.",
};

// Writing — the narrative half.
export const writing = {
  title: "Writing",
  paragraphs: [
    "I came to research by way of narrative. In advertising I learned that people don't adopt ideas — they adopt stories that carry them. Later I wrote a feature film script good enough that someone paid for it, which remains one of my favorite empirical results.",
    "My patron saints are Terry Pratchett and Ursula K. Le Guin. Pratchett, because Discworld is secretly a complex-systems textbook — cities, beliefs, and economies that emerge from the bottom up, observed with furious kindness. Le Guin, because she treated every society as a thought experiment and every thought experiment as a moral one.",
  ],
};

// Ethos — the constraints the work runs under.
export const ethos = {
  title: "Ethos",
  intro:
    "A strong moral framework isn't decoration on the work — it's a constraint on it, the way conservation laws are constraints on physics. The questions I try to ask of any project, model, or technology I touch:",
  principles: [
    {
      q: "Net positive?",
      a: "Does this leave the people affected by it better off, including the ones who never get a vote?",
    },
    {
      q: "Honest at the boundaries?",
      a: "Am I clear about what the model assumes and where it stops being trustworthy?",
    },
    {
      q: "Legible to the governed?",
      a: "Could the people inside this system understand the rules it runs on?",
    },
    {
      q: "Would Granny Weatherwax approve?",
      a: "Sin, she said, is treating people as things. That covers most of applied ethics.",
    },
  ],
};

// Contact.
export const contact = {
  title: "Contact",
  intro:
    "For research, collaboration, or arguments about whether Vimes or Shevek would make the better policy advisor:",
};
