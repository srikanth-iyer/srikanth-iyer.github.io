// Single source of truth for site metadata. Consumed by the layout for
// <head> tags and JSON-LD, and by pages/components for navigation.
// This is the data-driven half of the Astro architecture: content as data,
// markup as components.

export const site = {
  name: "Srikanth Iyer",
  title: "Srikanth Iyer — Complex Systems Researcher",
  description:
    "Srikanth Iyer is a complex systems researcher studying emergent computation and LLM agents in socio-economic models. Formerly in advertising; screenwriter with a sold feature film script.",
  url: "https://srikanth-iyer.github.io/",
  email: "shriek123@gmail.com",
  github: "https://github.com/srikanth-iyer",
  tagline: "Complex systems researcher · storyteller",
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

export const nav = [
  { href: "#research", label: "Research" },
  { href: "#stories", label: "Stories" },
  { href: "#ethos", label: "Ethos" },
  { href: "#contact", label: "Contact" },
];
