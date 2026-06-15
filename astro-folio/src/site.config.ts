import type {
  FooterConfig,
  LinkConfig,
  ProfileConfig,
  PublicationConfig,
  SiteConfig
} from "@/types"

export const SITE: SiteConfig = {
  title: "Srikanth Iyer",
  description:
    "Complex systems researcher studying emergent computation and LLM agents in socio-economic models — and a storyteller.",
  href: "https://srikanth-iyer.github.io",
  author: "Srikanth Iyer",

  locale: {
    lang: "en-US",
    options: {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC"
    }
  },

  // Blog settings
  blog: {
    featuredPostCount: 3,
    postsPerPage: 8,
    tocMaxDepth: 3,
    shareActions: ["x"]
  },

  // Theme settings
  favicon: "/favicon.ico",
  prerender: true,
  npmCDN: "https://cdn.jsdelivr.net/npm",

  // Content license
  license: {
    label: "CC-BY-4.0",
    href: "https://creativecommons.org/licenses/by/4.0/"
  }
}

export const PROFILE: ProfileConfig = {
  name: SITE.author,
  tagline: "Complex systems researcher · storyteller",
  email: "shriek123@gmail.com",
  // location: "TODO: add your city",
  // hover or click on "links" to see all profile links supported. or search
  // PROFILE_ICON_MAP in icon.config.ts; the keys are what's used here.
  links: {
    github: "https://github.com/srikanth-iyer"
    // TODO: add these when you have them:
    // googleScholar: "https://scholar.google.com/citations?user=...",
    // orcid: "https://orcid.org/...",
    // x: "https://x.com/...",
  },
  highlightLinks: ["github"]
}

export const NAV_LINKS: LinkConfig[] = [
  {
    href: "/projects",
    label: "Research"
  },
  {
    href: "/publications",
    label: "Publications"
  },
  {
    href: "/blog",
    label: "Writing"
  },
  {
    href: "/search",
    label: "Search"
  }
]

export const PUB_CONFIG: PublicationConfig = {
  maxFirstAuthors: 4,
  maxLastAuthors: 4,
  highlightAuthor: {
    firstName: "Srikanth",
    lastName: "Iyer",
    aliases: ["S. Iyer", "Srikanth Iyer"]
  },
  equalSymbols: {
    first: "*",
    second: "†",
    third: "‡",
    last: "§"
  }
}

export const FOOTER: FooterConfig = {
  credits: true,
  sourceCode: "https://github.com/srikanth-iyer/srikanth-iyer.github.io",
  sourceContent:
    "https://github.com/srikanth-iyer/srikanth-iyer.github.io/tree/main/astro-folio/src/content",
  footerLinks: []
}

if (import.meta.env.DEV && typeof window === "undefined") {
  const { FooterConfigSchema, ProfileConfigSchema, PublicationConfigSchema, SiteConfigSchema } =
    await import("@/schemas")
  SiteConfigSchema.parse(SITE)
  ProfileConfigSchema.parse(PROFILE)
  FooterConfigSchema.parse(FOOTER)
  PublicationConfigSchema.parse(PUB_CONFIG)
}
