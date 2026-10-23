// automaton.js: draws a live one-dimensional cellular automaton on a <canvas>.
// Every design on the site uses this one file, with its own colours and settings.
//
// A cellular automaton is a row of cells, each black (1) or white (0).
// At every time step, each cell looks at a few nearby cells and follows a rule
// to decide its next colour. Drawing each new row under the last one gives a
// "space-time diagram": time runs from top to bottom.

// The two rules visitors can compare.
// GKL (Gacs-Kurdyumov-Levin): a white cell polls itself and the cells 1 and 3 to its left,
// a black cell polls itself and the cells 1 and 3 to its right; the majority of those three wins.
function gklStep(s) {
  const n = s.length;                      // number of cells in the row
  const out = new Uint8Array(n);           // the next row, all zeros to start
  for (let i = 0; i < n; i++) {
    const a = s[i];                        // this cell's own colour
    // pick the two neighbours on the left (if white) or right (if black); "% n" wraps around the ends
    const b = a === 0 ? s[(i - 1 + n) % n] : s[(i + 1) % n];
    const c = a === 0 ? s[(i - 3 + n) % n] : s[(i + 3) % n];
    out[i] = a + b + c >= 2 ? 1 : 0;       // majority of the three
  }
  return out;
}

// Naive local majority: each cell copies the majority of the 7 cells around it (3 on each side).
// It freezes into stripes and never reaches a group-wide decision, which is why GKL is clever.
function localMajorityStep(s) {
  const n = s.length;
  const out = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    let ones = 0;                                          // count black cells in the window
    for (let d = -3; d <= 3; d++) ones += s[(i + d + n) % n];
    out[i] = ones >= 4 ? 1 : 0;                            // 4 or more of 7 means black wins
  }
  return out;
}

const RULES = { gkl: gklStep, local: localMajorityStep };

// startAutomaton(canvas, options) begins drawing and returns a small "controller"
// object whose functions the page's buttons call.
export function startAutomaton(canvas, options = {}) {
  // Settings, with sensible defaults for anything the page doesn't specify.
  const o = {
    cells: 149,             // cells per row (149 is the classic size for this task)
    cellPx: 3,              // size of one cell in screen pixels
    rows: 110,              // how many time steps are visible at once
    on: '#141414',          // colour of a black (1) cell
    off: '#ffffff',         // colour of a white (0) cell
    mark: null,             // if set, a line in this colour marks each fresh random start
    rule: 'gkl',            // which rule to run: 'gkl' or 'local'
    noise: 0,               // chance that any cell flips by accident at each step
    stepMs: 55,             // milliseconds between steps (lower = faster)
    mode: 'scroll',         // 'scroll' = keep running; 'snapshot' = redraw a whole picture every few seconds
    snapshotMs: 3200,       // how often to redraw in snapshot mode
    ...options,             // anything the page passed in overrides the defaults above
  };

  const ctx = canvas.getContext('2d');      // the drawing surface
  canvas.width = o.cells * o.cellPx;        // set the canvas's real pixel size
  canvas.height = o.rows * o.cellPx;

  let state;          // the current row of cells
  let y = 0;          // which row we're drawing next while the picture fills up
  let settled = 0;    // how many steps the row has been (almost) all one colour
  let raf = 0;        // id of the animation loop, so it can be stopped

  // Fill a new random row. The density is kept away from exactly 50%,
  // so there is always a true majority for the rule to find.
  function seed() {
    const rho = Math.random() < 0.5 ? 0.38 + Math.random() * 0.1 : 0.52 + Math.random() * 0.1;
    state = new Uint8Array(o.cells);
    for (let i = 0; i < o.cells; i++) state[i] = Math.random() < rho ? 1 : 0;
    settled = 0;
  }

  // Advance one time step: apply the rule, then the noise.
  function step() {
    state = RULES[o.rule](state);
    if (o.noise > 0) {
      for (let i = 0; i < o.cells; i++) if (Math.random() < o.noise) state[i] ^= 1;   // ^= 1 flips 0↔1
    }
  }

  // Paint one row at vertical position "row". If "markRow" is true, paint a solid marker line instead.
  function paintRow(row, markRow) {
    ctx.fillStyle = markRow ? o.mark : o.off;
    ctx.fillRect(0, row * o.cellPx, canvas.width, o.cellPx);
    if (markRow) return;
    ctx.fillStyle = o.on;
    for (let i = 0; i < o.cells; i++) {
      if (state[i]) ctx.fillRect(i * o.cellPx, row * o.cellPx, o.cellPx, o.cellPx);
    }
  }

  // Add a row at the bottom; once the canvas is full, shift everything up by one row first.
  function push(markRow = false) {
    if (y < o.rows) { paintRow(y, markRow); y++; return; }
    ctx.drawImage(canvas, 0, -o.cellPx);    // copy the picture one row higher
    paintRow(o.rows - 1, markRow);
  }

  // One tick of the animation: step, draw, and restart once the group has decided.
  function tick() {
    step();
    push();
    let ones = 0;
    for (let i = 0; i < o.cells; i++) ones += state[i];
    const density = ones / o.cells;
    settled = density < 0.03 || density > 0.97 ? settled + 1 : 0;
    if (settled > 40) {                      // decided for 40 steps: start a fresh random row
      seed();
      if (o.mark) push(true);
    }
  }

  // Draw a complete picture from a fresh start (used by snapshot mode and rule changes).
  function snapshot() {
    seed();
    for (let r = 0; r < o.rows; r++) { paintRow(r, false); step(); }
  }

  // Start everything. Visitors who ask their device for reduced motion get a still picture.
  const still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ctx.fillStyle = o.off;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (o.mode === 'snapshot' || still) {
    snapshot();
  } else {
    seed();
    paintRow(y++, false);
    // Pre-draw a full screen of history, so visitors see a finished picture straight away.
    while (y < o.rows) tick();
  }
  if (!still) {
    let last = 0;
    const loop = (t) => {
      if (o.mode === 'snapshot') {
        if (t - last > o.snapshotMs) { snapshot(); last = t; }
      } else if (t - last > o.stepMs) {
        tick();
        last = t;
      }
      raf = requestAnimationFrame(loop);    // ask the browser to call loop again on the next frame
    };
    raf = requestAnimationFrame(loop);
  }

  // The controller: functions the page's buttons can call.
  return {
    setNoise(value) { o.noise = value; },
    setRule(name) { o.rule = name; snapshot(); },
    restart() { seed(); if (o.mark) push(true); },
    kick(fraction = 0.1) {                   // flip a share of cells at random, to show recovery
      for (let i = 0; i < o.cells; i++) if (Math.random() < fraction) state[i] ^= 1;
      settled = 0;
    },
    stop() { cancelAnimationFrame(raf); },
  };
}
