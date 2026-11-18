// Home page only: the photo placeholder and the journey timeline.

// Photo placeholder: a soft grid of squares with initials, until a real photo is added
(function portrait() {
  const cv = document.getElementById("portrait");
  if (!cv) return;                                   // a real photo replaced the placeholder
  const g = cv.getContext("2d");
  function draw() {
    const dpr = devicePixelRatio || 1, w = cv.clientWidth, h = cv.clientHeight;
    if (!w) return;
    cv.width = w * dpr; cv.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const accent = cssVar("--accent-bright"), fg = cssVar("--fg"), S = 12;
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;   // same pattern every visit
    for (let x = 0; x < w; x += S) for (let y = 0; y < h; y += S) {
      const d = Math.hypot(x - w * 0.5, y - h * 0.5) / Math.max(w, h);   // brighter near the middle
      g.globalAlpha = Math.max(0, 0.32 - d * 0.6) * rnd();
      g.fillStyle = accent; g.fillRect(x + 1, y + 1, S - 2, S - 2);
    }
    g.globalAlpha = 1; g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `${Math.round(w * 0.28)}px "Libre Baskerville", Georgia, serif`;
    g.fillText("SI", w / 2, h * 0.5);
  }
  document.fonts.ready.then(draw); addEventListener("resize", draw); addEventListener("themechange", draw);
})();

// Journey timeline: the line fills as you read, and the year you're on lights up
(function journey() {
  const line = document.getElementById("timeline");
  if (!line) return;
  const items = [...line.children];
  const years = [...document.querySelectorAll(".years a")];
  function update() {
    const r = line.getBoundingClientRect(), mid = innerHeight * 0.55;   // a reading line just below the middle
    const f = Math.min(1, Math.max(0, (mid - r.top) / r.height));      // how much of the timeline is above it
    line.style.setProperty("--fill", f);
    let on = 0; items.forEach((li, i) => { if (li.getBoundingClientRect().top < mid) on = i; });
    items.forEach((li, i) => li.classList.toggle("on", i <= on && f > 0));
    years.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + items[on].id && f > 0));
  }
  addEventListener("scroll", update, { passive: true }); addEventListener("resize", update); update();
})();
