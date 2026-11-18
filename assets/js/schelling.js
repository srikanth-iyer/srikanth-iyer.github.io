// A small, live version of the classic Schelling segregation model.
// Two groups of residents live on a grid with some empty homes. A resident is unhappy when
// fewer than `want` of their neighbours belong to their own group, and unhappy residents move
// to a random empty home. Even mild preferences end in strongly sorted neighbourhoods.
// Usage: const s = makeSchelling(canvas, { size: 40, want: 0.3, onStats: (st) => ..., loop: false });

window.makeSchelling = function (canvas, opts = {}) {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const g = canvas.getContext("2d");
  let S = opts.size || 40;                     // the grid is S x S homes
  let want = opts.want ?? 0.3;                 // share of like neighbours a resident wants
  let empty = opts.empty ?? 0.1;               // share of homes left empty
  let grid, round = 0, calm = 0, playing = !still;

  function reset() {                           // fill the grid at random
    grid = new Int8Array(S * S).map(() => {
      const r = Math.random();
      return r < empty ? -1 : r < empty + (1 - empty) / 2 ? 0 : 1;   // -1 empty, 0 group A, 1 group B
    });
    round = 0; calm = 0;
    report();
  }

  // Count like and total neighbours of home i (the 8 around it, wrapping at the edges)
  function neighbours(i) {
    const x = i % S, y = (i / S) | 0, me = grid[i];
    let same = 0, all = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const v = grid[((y + dy + S) % S) * S + ((x + dx + S) % S)];
      if (v >= 0) { all++; if (v === me) same++; }
    }
    return [same, all];
  }
  const unhappy = (i) => { const [s, a] = neighbours(i); return a > 0 && s / a < want; };

  function step() {                            // one round: every unhappy resident moves once
    const movers = [], empties = [];
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] < 0) empties.push(i); else if (unhappy(i)) movers.push(i);
    }
    for (let k = movers.length - 1; k > 0; k--) {   // shuffle so nobody always moves first
      const j = (Math.random() * (k + 1)) | 0; [movers[k], movers[j]] = [movers[j], movers[k]];
    }
    for (const i of movers) {
      const e = (Math.random() * empties.length) | 0, to = empties[e];
      grid[to] = grid[i]; grid[i] = -1; empties[e] = i;
    }
    round++;
    calm = movers.length === 0 ? calm + 1 : 0;
    report();
    return movers.length;
  }

  function report() {                          // numbers shown beside the board
    if (!opts.onStats) return;
    let people = 0, sad = 0, simSum = 0;
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] < 0) continue;
      const [s, a] = neighbours(i);
      people++; if (a > 0 && s / a < want) sad++; if (a > 0) simSum += s / a;
    }
    opts.onStats({ round, unhappy: sad / people, similar: simSum / people, settled: calm > 0 });
  }

  function draw() {
    const dpr = devicePixelRatio || 1, w = canvas.clientWidth, h = canvas.clientHeight || w;
    if (!w) return;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    // the grid fills the canvas; on a wide canvas extra columns are just cropped
    const cell = Math.max(w, h) / S, A = cssVar("--group-a"), B = cssVar("--group-b"), E = cssVar("--cell-off");
    for (let i = 0; i < grid.length; i++) {
      const x = (i % S) * cell, y = ((i / S) | 0) * cell;
      if (y > h) break;
      if (grid[i] < 0) { g.fillStyle = E; g.globalAlpha = 0.35; g.fillRect(x + cell * 0.38, y + cell * 0.38, cell * 0.24, cell * 0.24); g.globalAlpha = 1; continue; }
      g.fillStyle = grid[i] ? B : A;
      g.beginPath(); g.arc(x + cell / 2, y + cell / 2, cell * 0.38, 0, 7); g.fill();
    }
  }

  let visible = true, last = 0, wait = 0;
  if ("IntersectionObserver" in window) new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(canvas);
  function loop(ms) {
    if (visible && playing && ms - last > (opts.speed || 140)) {
      last = ms;
      if (calm > 0 && opts.loop) { if (++wait > 18) { wait = 0; reset(); } }   // tile mode: rest, then start over
      else if (calm === 0) step();
      else if (opts.onSettle) { playing = false; opts.onSettle(); }
      draw();
    }
    requestAnimationFrame(loop);
  }

  reset();
  if (still) { for (let k = 0; k < 60 && step() > 0; k++); }   // reduced motion: show the sorted result
  draw();
  addEventListener("themechange", draw);
  addEventListener("resize", draw);
  requestAnimationFrame(loop);

  return {
    play() { playing = true; }, pause() { playing = false; draw(); },
    get playing() { return playing; },
    step() { step(); draw(); },
    reset() { reset(); draw(); },
    setWant(v) { want = v; calm = 0; report(); },
    setEmpty(v) { empty = v; reset(); draw(); },
    setSize(v) { S = v; reset(); canvas.width = 0; draw(); }
  };
};
