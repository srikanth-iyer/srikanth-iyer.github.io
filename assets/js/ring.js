// The 149-cell ring for the density classification project.
// Each cell is black or white and sees only a few neighbours. Each new time step is drawn
// as the outermost ring, so time grows outward and older steps sit further in.
// Usage: const ring = makeRing(canvasElement, { onDensity: (pct) => ..., interactive: true });
//        ring.setMode({ rule: "GKL" | "majority", noise: 0.01 }); ring.reseed();

window.makeRing = function (canvas, opts = {}) {
  const N = 149;                               // cells in the ring
  const HIST = opts.history || 46;             // how many past steps to show as inner rings
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const g = canvas.getContext("2d");
  let cells, history, settled = 0;
  let mode = { rule: "GKL", noise: 0 };
  const flash = new Float32Array(N);           // cells flipped by noise glow for a moment

  function reseed() {                          // random start, a little off 50% so there is a right answer
    const rho = Math.random() < 0.5 ? 0.42 : 0.58;
    cells = new Uint8Array(N).map(() => (Math.random() < rho ? 1 : 0));
    history = [cells.slice()];
    settled = 0;
  }

  function step() {
    const a = cells, o = new Uint8Array(N), at = (i) => a[(i + N) % N];
    for (let i = 0; i < N; i++) {
      if (mode.rule === "GKL") {
        // GKL: a white cell looks left (i-1, i-3), a black cell looks right (i+1, i+3); majority of three
        const s = a[i] ? a[i] + at(i + 1) + at(i + 3) : a[i] + at(i - 1) + at(i - 3);
        o[i] = s >= 2 ? 1 : 0;
      } else {
        // plain majority vote of the 7 cells around and including i
        let s = 0; for (let k = -3; k <= 3; k++) s += at(i + k);
        o[i] = s >= 4 ? 1 : 0;
      }
      if (Math.random() < mode.noise) { o[i] ^= 1; flash[i] = 1; }   // noise: flip at random
    }
    cells = o;
    history.unshift(cells.slice());
    if (history.length > HIST) history.pop();
    const ones = cells.reduce((s, v) => s + v, 0);
    settled = ones < 4 || ones > N - 4 ? settled + 1 : 0;
    if (settled > 40) reseed();                // once the ring has agreed for a while, start again
  }

  function draw() {
    const dpr = devicePixelRatio || 1, w = canvas.clientWidth, h = canvas.clientHeight || w;
    if (!w) return;
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const m = Math.min(w, h) * (opts.scale || 1);   // the ring fits the shorter side, centred
    const cx = w / 2, cy = h / 2, rIn = m * 0.12, rOut = m * 0.48, band = (rOut - rIn) / HIST;
    const on = cssVar("--cell-on"), off = cssVar("--cell-off"), hot = cssVar("--accent-bright");
    const da = (Math.PI * 2) / N;
    for (let h = 0; h < history.length; h++) {   // history[0] is now, drawn outermost
      const row = history[h], r0 = rOut - (h + 1) * band, r1 = r0 + band * 0.9;
      g.globalAlpha = h === 0 ? 1 : 0.25 + 0.75 * (1 - h / HIST);
      for (let i = 0; i < N; i++) {
        const a0 = i * da - Math.PI / 2, a1 = a0 + da * 0.86;
        g.beginPath(); g.arc(cx, cy, r1, a0, a1); g.arc(cx, cy, r0, a1, a0, true); g.closePath();
        g.fillStyle = h === 0 && flash[i] > 0.05 ? hot : row[i] ? on : off;
        g.fill();
      }
    }
    g.globalAlpha = 1;
    for (let i = 0; i < N; i++) flash[i] *= 0.9;
    if (opts.onDensity) opts.onDensity(Math.round((100 * cells.reduce((s, v) => s + v, 0)) / N));
  }

  // Tap the ring: flip the 13 cells nearest the tap (a burst of noise)
  if (opts.interactive) {
    canvas.addEventListener("pointerdown", (e) => {
      const b = canvas.getBoundingClientRect();
      const ang = Math.atan2(e.clientY - b.top - b.height / 2, e.clientX - b.left - b.width / 2) + Math.PI / 2;   // angle of the tap around the centre
      const i0 = Math.round(((ang + Math.PI * 2) % (Math.PI * 2)) / ((Math.PI * 2) / N));
      for (let k = -6; k <= 6; k++) { const j = (((i0 + k) % N) + N) % N; cells[j] ^= 1; flash[j] = 1; }
      history[0] = cells.slice();
      if (still) draw();
    });
  }

  // Only animate while the ring is on screen, to save battery
  let visible = true, last = 0;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(canvas);
  }
  function loop(ms) {
    if (visible) {
      if (!still && ms - last > (opts.speed || 110)) { step(); last = ms; }
      draw();
    }
    requestAnimationFrame(loop);
  }

  reseed();
  if (still) { for (let k = 0; k < HIST; k++) step(); }   // reduced motion: show a finished picture
  addEventListener("themechange", draw);
  addEventListener("resize", draw);
  requestAnimationFrame(loop);

  return {
    setMode(m) { mode = m; },
    reseed() { reseed(); if (still) { for (let k = 0; k < HIST; k++) step(); } },
    burst() { for (let k = 0; k < 20; k++) { const j = Math.floor(Math.random() * N); cells[j] ^= 1; flash[j] = 1; } }
  };
};
