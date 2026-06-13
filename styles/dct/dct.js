/* Density Classification Task — GKL cellular automaton spacetime diagrams.
 *
 * The Gacs-Kurdyumov-Levin rule is the classic hand-designed CA that
 * approximately solves the density task: from a random binary string it
 * should relax to all-1s if the initial density of 1s exceeds 1/2, and to
 * all-0s otherwise — using only local interactions, no global view.
 *
 *   s_i(t+1) = majority(s_i, s_{i-1}, s_{i-3})   if s_i = 0
 *   s_i(t+1) = majority(s_i, s_{i+1}, s_{i+3})   if s_i = 1   (periodic boundary)
 *
 * Time flows downward. Domains of 0 and 1 compete; their boundaries are the
 * "particles" whose collisions carry out the computation.
 */

(function () {
  "use strict";

  var ZERO = [11, 13, 16];      // dark cell
  var ONE  = [232, 234, 236];   // live cell
  var reduce = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function maj3(a, b, c) { return (a + b + c) >= 2 ? 1 : 0; }

  function step(state) {
    var n = state.length;
    var next = new Uint8Array(n);
    for (var i = 0; i < n; i++) {
      var s = state[i];
      if (s === 0) {
        next[i] = maj3(s, state[(i - 1 + n) % n], state[(i - 3 + n) % n]);
      } else {
        next[i] = maj3(s, state[(i + 1) % n], state[(i + 3) % n]);
      }
    }
    return next;
  }

  function randomLattice(n, p) {
    var s = new Uint8Array(n);
    var ones = 0;
    for (var i = 0; i < n; i++) { if (Math.random() < p) { s[i] = 1; ones++; } }
    return { state: s, density: ones / n };
  }

  function uniform(state) {
    var first = state[0];
    for (var i = 1; i < state.length; i++) { if (state[i] !== first) return -1; }
    return first; // 0 or 1
  }

  // Render a buffer of rows (array of Uint8Array, oldest first) into ctx.
  function paint(ctx, rows, cols, history) {
    var img = ctx.createImageData(cols, rows);
    var d = img.data;
    for (var y = 0; y < rows; y++) {
      var row = history[y];
      var base = y * cols * 4;
      for (var x = 0; x < cols; x++) {
        var c = row && row[x] ? ONE : ZERO;
        var o = base + x * 4;
        d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  /* ---------- live hero diagram ---------- */

  var canvas = document.getElementById("spacetime");
  var readout = document.getElementById("readout");

  if (canvas) {
    var ctx = canvas.getContext("2d");
    var cols, rows, history, state, gen, maxGen, run, p0, settleHold;

    function reseed() {
      var p = 0.30 + Math.random() * 0.40;        // initial density in [.30,.70]
      var seeded = randomLattice(cols, p);
      state = seeded.state;
      p0 = seeded.density;
      gen = 0;
      settleHold = 0;
      run = (run || 0) + 1;
      maxGen = 2 * cols;
      // fill history with the initial condition repeated so the screen is full
      for (var y = 0; y < rows; y++) history[y] = state;
    }

    function setVerdict(text) {
      if (!readout) return;
      readout.innerHTML = text;
    }

    function liveReadout(verdict) {
      var target = p0 > 0.5 ? "1" : "0";
      var line = "run " + String(run).padStart(3, "0") +
        "   ρ₀ = " + p0.toFixed(3) +
        "   target → <b>" + target + "</b>";
      if (verdict === undefined) {
        setVerdict(line + "   t = " + gen);
      } else if (verdict === -1) {
        setVerdict(line + "   no consensus (cap)   reseeding…");
      } else {
        var correct = (verdict === (p0 > 0.5 ? 1 : 0));
        setVerdict(line + "   consensus = <b>" + verdict + "</b>   " +
          (correct ? "✓ classified" : "✗ misclassified"));
      }
    }

    function configure() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      var cell = 4;
      cols = Math.max(80, Math.round(w / cell));
      rows = Math.max(80, Math.round(h / cell));
      canvas.width = cols;
      canvas.height = rows;
      history = new Array(rows);
      run = 0;
      reseed();
    }

    function tick() {
      // detect settled state and hold briefly before reseeding
      var u = uniform(state);
      if (u !== -1) {
        if (settleHold === 0) liveReadout(u);
        settleHold++;
        if (settleHold > 36) { reseed(); }
      } else if (gen >= maxGen) {
        liveReadout(-1);
        settleHold++;
        if (settleHold > 24) { reseed(); }
      } else {
        state = step(state);
        gen++;
        if (gen % 3 === 0) liveReadout();
      }

      // scroll history up by one, append current row at bottom
      for (var y = 0; y < rows - 1; y++) history[y] = history[y + 1];
      history[rows - 1] = state;

      paint(ctx, rows, cols, history);
    }

    configure();

    if (reduce) {
      // static: evolve enough to fill the screen once, no animation
      for (var k = 0; k < rows; k++) {
        if (uniform(state) === -1 && gen < maxGen) { state = step(state); gen++; }
        for (var y = 0; y < rows - 1; y++) history[y] = history[y + 1];
        history[rows - 1] = state;
      }
      paint(ctx, rows, cols, history);
      liveReadout(uniform(state) === -1 ? -1 : uniform(state));
    } else {
      var acc = 0, last = 0;
      var interval = 1000 / 26; // generations per second
      (function loop(now) {
        if (!last) last = now;
        acc += now - last; last = now;
        while (acc >= interval) { tick(); acc -= interval; }
        requestAnimationFrame(loop);
      })(0);
    }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(configure, 200);
    });
  }

  /* ---------- static divider strips ---------- */

  function renderStrip(el) {
    var sctx = el.getContext("2d");
    var cell = 3;
    var cols = Math.max(60, Math.round((el.clientWidth || 800) / cell));
    var rows = Math.max(12, Math.round((el.clientHeight || 64) / cell));
    el.width = cols;
    el.height = rows;
    var seeded = randomLattice(cols, 0.35 + Math.random() * 0.30);
    var s = seeded.state;
    var history = new Array(rows);
    history[0] = s;
    for (var y = 1; y < rows; y++) {
      if (uniform(s) === -1) s = step(s);
      history[y] = s;
    }
    paint(sctx, rows, cols, history);
  }

  var strips = document.querySelectorAll(".strip");
  function renderStrips() { strips.forEach(renderStrip); }
  renderStrips();
  if (!reduce) {
    var st;
    window.addEventListener("resize", function () {
      clearTimeout(st);
      st = setTimeout(renderStrips, 200);
    });
  }
})();
