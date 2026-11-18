// DCT project page only: the story ring and the ring you control.
// ---------- The story ring: the chapter on screen sets the rule and the noise ----------
const MODES = { 1: { rule: "GKL", noise: 0 }, 2: { rule: "majority", noise: 0.01 }, 3: { rule: "GKL", noise: 0.01 } };
const ruleName = (r) => (r === "GKL" ? "GKL" : "Local majority");
const story = makeRing(document.getElementById("ring"), {
  interactive: true,
  onDensity: (p) => (document.getElementById("r-dens").textContent = p + "%")
});
let chapter = 1;
function setChapter(n) {
  if (n === chapter) return;
  chapter = n;
  story.setMode(MODES[n]);
  document.getElementById("r-rule").textContent = ruleName(MODES[n].rule);
  document.getElementById("r-noise").textContent = MODES[n].noise * 100 + "%";
  if (n !== 3) story.reseed();                  // chapters 1 and 2 start from a fresh mix
}
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("on"); setChapter(+en.target.dataset.ch); } });
}, { rootMargin: "-40% 0px -40% 0px" });        // a chapter counts once it reaches the middle of the screen
document.querySelectorAll(".chapter").forEach((ch) => io.observe(ch));
document.querySelector(".chapter").classList.add("on");

// ---------- The ring you control ----------
let mode = { rule: "GKL", noise: 0.01 };
const mine = makeRing(document.getElementById("ring2"), {
  interactive: true,
  onDensity: (p) => (document.getElementById("g-dens").textContent = p + "%")
});
mine.setMode(mode);
function show() {                               // update the labels to match the settings
  document.getElementById("g-rule").textContent = mode.rule === "GKL" ? "GKL" : "Majority";
  document.getElementById("g-noise").textContent = document.getElementById("n-val").textContent = +(mode.noise * 100).toFixed(1) + "%";
  document.querySelectorAll("[data-rule]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.rule === mode.rule));
}
document.querySelectorAll("[data-rule]").forEach((b) => b.addEventListener("click", () => {
  mode = { ...mode, rule: b.dataset.rule }; mine.setMode(mode); mine.reseed(); show();
}));
document.getElementById("noise").addEventListener("input", (e) => { mode = { ...mode, noise: e.target.value / 100 }; mine.setMode(mode); show(); });
document.getElementById("fresh").addEventListener("click", () => mine.reseed());
document.getElementById("burst").addEventListener("click", () => mine.burst());
show();
