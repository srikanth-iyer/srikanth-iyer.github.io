// Live pictures on the project tiles (home page and Projects page).
// A tile's canvas says which simulation it shows with data-sim="ring" or data-sim="schelling".
document.querySelectorAll('canvas[data-sim="ring"]').forEach((c) => makeRing(c, { history: 30, speed: 130 }));
document.querySelectorAll('canvas[data-sim="schelling"]').forEach((c) =>
  makeSchelling(c, { size: 36, want: 0.4, loop: true, speed: 260 }));
