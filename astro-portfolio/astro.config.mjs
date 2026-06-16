import { defineConfig } from 'astro/config';

// https://astro.build/config
// nikhitasingh.com-inspired portfolio variant. Standalone Astro project:
// not auto-deployed by GitHub Pages (the root site ships the hand-written
// index.html). See README.md to run or deploy.
export default defineConfig({
  site: 'https://srikanth-iyer.github.io',
  // If this ever ships to a subpath (e.g. /astro-portfolio), set `base` here.
});
