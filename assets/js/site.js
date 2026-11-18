// Shared script for every page: the light/dark toggle, the scroll line and the tap ripple of square pixels.
// Loaded at the end of <body>. A tiny inline script in each page's <head> applies a saved
// theme before the page draws, so there is no flash of the wrong colours.

(function () {
  const root = document.documentElement;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;   // visitor asked for less motion
  const darkQuery = matchMedia("(prefers-color-scheme: dark)");

  // ---------- 1. Light / dark toggle ----------
  // The theme the page shows right now: a saved choice wins, otherwise the device's preference.
  const current = () => root.dataset.theme || (darkQuery.matches ? "dark" : "light");

  function label(btn) {                         // say what the button will do, for screen readers
    btn.setAttribute("aria-label", current() === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
  document.querySelectorAll(".theme-toggle").forEach((btn) => {
    label(btn);
    btn.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) { /* private window: just don't remember */ }
      label(btn);
      dispatchEvent(new Event("themechange")); // canvases listen for this and redraw in the new colours
    });
  });
  darkQuery.addEventListener?.("change", () => { if (!root.dataset.theme) dispatchEvent(new Event("themechange")); });

  // Read a colour from the stylesheet, so drawings match the theme.
  window.cssVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();

  // ---------- Scroll progress: a thin line at the very top that fills as you read down ----------
  const bar = document.createElement("div");
  bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
  document.body.prepend(bar);
  function progress() {
    const max = document.documentElement.scrollHeight - innerHeight;   // how far the page can scroll
    bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  }
  addEventListener("scroll", progress, { passive: true }); addEventListener("resize", progress); progress();

  // ---------- 2. Tap ripple of square pixels (after coderluii.dev) ----------
  // Brightness of a square = (1 - |d - r| / B) * fade, where the ring's radius r slows as it spreads and fade dies away.
  const rip = document.getElementById("ripple");
  if (!rip || still) return;                   // no ripple when motion is reduced
  const ctx = rip.getContext("2d");
  const SQ = 12, REACH = 170, B = 18, T = 1.1;   // square size (px), how far it spreads (px), band width (px), lifetime (s)
  // Taps on text, links, pictures and controls make no ripple: only the empty background does.
  const CONTENT = "a, button, input, textarea, select, label, canvas, img, svg, p, li, h1, h2, h3, h4, small, code, figure, " +
                  ".eyebrow, .crumbs, .tile, .card, .box, .stat, .chip, .pill, .lab, .band, .write, .toc, .entry, .cv, .top";
  let taps = [], running = false;

  function size() {
    const dpr = devicePixelRatio || 1;
    rip.width = innerWidth * dpr; rip.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); addEventListener("resize", size);

  addEventListener("pointerdown", (e) => {     // only listens, so links and buttons still work
    if (e.target.closest && e.target.closest(CONTENT)) return;   // tapped on content, not background
    const touch = e.pointerType === "touch";   // fingers on a phone: fainter and smaller than a mouse click
    taps.push({ x: e.clientX, y: e.clientY, t0: performance.now() / 1000, a: touch ? 0.09 : 0.13, reach: touch ? 110 : REACH, life: T });
    if (!running) { running = true; requestAnimationFrame(draw); }
  });

  function draw(ms) {
    const now = ms / 1000;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    taps = taps.filter((p) => now - p.t0 < p.life); // drop finished ripples
    if (!taps.length) { running = false; return; }   // stop the loop until the next tap
    const color = cssVar("--accent-bright");
    const off = window.scrollY % SQ;           // keep squares lined up with the page's grid
    for (const p of taps) {
      const t = now - p.t0;
      const r = p.reach * (1 - Math.exp(-3.2 * t));          // fast at first, then slows down like a damped wave
      const fade = Math.exp(-3 * t) * (1 - t / p.life);        // dies away smoothly
      const x0 = Math.floor((p.x - r - B) / SQ), x1 = Math.ceil((p.x + r + B) / SQ);
      const y0 = Math.floor((p.y + off - r - B) / SQ), y1 = Math.ceil((p.y + off + r + B) / SQ);
      for (let gx = x0; gx <= x1; gx++) for (let gy = y0; gy <= y1; gy++) {
        const cx = gx * SQ + SQ / 2, cy = gy * SQ + SQ / 2 - off;
        const k = 1 - Math.abs(Math.hypot(cx - p.x, cy - p.y) - r) / B;
        if (k <= 0) continue;
        ctx.globalAlpha = p.a * k * fade;             // kept faint on purpose
        ctx.fillStyle = color;
        ctx.fillRect(gx * SQ + 0.5, gy * SQ + 0.5 - off, SQ - 1, SQ - 1);
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
})();

// ---------- 3. Every page: this year in the footer's copyright line ----------
document.querySelectorAll(".year").forEach((y) => (y.textContent = new Date().getFullYear()));
