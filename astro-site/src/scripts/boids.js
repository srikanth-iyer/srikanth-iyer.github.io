// Boids flocking simulation for the hero background.
// Each agent follows three local rules — separation, alignment, cohesion —
// and the flock emerges. No leader, no global plan.
//
// In the Astro build this module is imported by Boids.astro's <script>,
// so Astro bundles and ships it as the page's only client-side JavaScript.

(function () {
  const canvas = document.getElementById("boids");
  if (!canvas) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ctx = canvas.getContext("2d");

  const NUM_BOIDS = 90;
  const PERCEPTION = 60;     // how far a boid can "see" its neighbors
  const MAX_SPEED = 1.6;
  const MAX_FORCE = 0.04;

  let boids = [];
  let width, height;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function makeBoid() {
    const angle = Math.random() * Math.PI * 2;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      vx: Math.cos(angle) * MAX_SPEED,
      vy: Math.sin(angle) * MAX_SPEED,
    };
  }

  function limit(v, max) {
    const m = Math.hypot(v.x, v.y);
    if (m > max) {
      v.x = (v.x / m) * max;
      v.y = (v.y / m) * max;
    }
    return v;
  }

  function step() {
    for (const b of boids) {
      let sepX = 0, sepY = 0;
      let aliX = 0, aliY = 0;
      let cohX = 0, cohY = 0;
      let n = 0;

      for (const other of boids) {
        if (other === b) continue;
        const dx = other.x - b.x;
        const dy = other.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d > 0 && d < PERCEPTION) {
          // separation: steer away, weighted by closeness
          sepX -= dx / (d * d);
          sepY -= dy / (d * d);
          // alignment: average neighbor velocity
          aliX += other.vx;
          aliY += other.vy;
          // cohesion: average neighbor position
          cohX += other.x;
          cohY += other.y;
          n++;
        }
      }

      let ax = 0, ay = 0;
      if (n > 0) {
        const sep = limit({ x: sepX * 14, y: sepY * 14 }, MAX_FORCE);
        const ali = limit({ x: aliX / n - b.vx, y: aliY / n - b.vy }, MAX_FORCE);
        const coh = limit({ x: cohX / n - b.x, y: cohY / n - b.y }, MAX_FORCE);
        ax = sep.x * 1.5 + ali.x + coh.x * 0.9;
        ay = sep.y * 1.5 + ali.y + coh.y * 0.9;
      }

      b.vx += ax;
      b.vy += ay;
      const v = limit({ x: b.vx, y: b.vy }, MAX_SPEED);
      b.vx = v.x;
      b.vy = v.y;

      b.x += b.vx;
      b.y += b.vy;

      // wrap around edges
      if (b.x < -10) b.x = width + 10;
      if (b.x > width + 10) b.x = -10;
      if (b.y < -10) b.y = height + 10;
      if (b.y > height + 10) b.y = -10;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // faint connections between nearby boids
    ctx.lineWidth = 1;
    for (let i = 0; i < boids.length; i++) {
      for (let j = i + 1; j < boids.length; j++) {
        const a = boids[i], c = boids[j];
        const d = Math.hypot(a.x - c.x, a.y - c.y);
        if (d < PERCEPTION) {
          ctx.strokeStyle = `rgba(138, 90, 0, ${0.12 * (1 - d / PERCEPTION)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(c.x, c.y);
          ctx.stroke();
        }
      }
    }

    for (const b of boids) {
      const angle = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(angle);
      ctx.fillStyle = "rgba(45, 45, 45, 0.4)";
      ctx.beginPath();
      ctx.moveTo(5, 0);
      ctx.lineTo(-4, 3);
      ctx.lineTo(-4, -3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function loop() {
    step();
    draw();
    requestAnimationFrame(loop);
  }

  resize();
  boids = Array.from({ length: NUM_BOIDS }, makeBoid);
  window.addEventListener("resize", resize);

  if (reduceMotion) {
    // settle the flock into a static frame for motion-sensitive users
    for (let i = 0; i < 300; i++) step();
    draw();
  } else {
    loop();
  }
})();
