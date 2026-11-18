// Schelling project page only: the city you can play with.
// ---------- The classic Schelling model you can play with ----------
const $ = (id) => document.getElementById(id);
const pct = (x) => Math.round(x * 100) + "%";
const playBtn = $("play-btn");
const city = makeSchelling($("board"), {
  size: 40, want: 0.3, empty: 0.1,
  onStats: (s) => { $("g-sim").textContent = pct(s.similar); $("g-sad").textContent = pct(s.unhappy); $("g-round").textContent = s.round; },
  onSettle: () => { playBtn.textContent = "Play"; }      // everyone is content: stop
});
playBtn.textContent = city.playing ? "Pause" : "Play";
playBtn.addEventListener("click", () => {
  if (city.playing) city.pause(); else city.play();
  playBtn.textContent = city.playing ? "Pause" : "Play";
});
$("step-btn").addEventListener("click", () => { city.pause(); playBtn.textContent = "Play"; city.step(); });
$("reset-btn").addEventListener("click", () => { city.reset(); city.play(); playBtn.textContent = "Pause"; });
$("want").addEventListener("input", (e) => {
  const v = e.target.value / 100;
  $("want-val").textContent = pct(v);
  city.setWant(v); city.play(); playBtn.textContent = "Pause";
  $("note").textContent = v === 0 ? "Nobody minds who lives next door, so nobody moves."
    : v <= 0.35 ? "Even a mild wish like this ends with most residents living among their own group."
    : v <= 0.6 ? "Stronger wishes sort the city faster and more sharply."
    : "Ask for too much and some residents may never be content, so the city keeps churning.";
});
$("empty").addEventListener("input", (e) => {
  const v = e.target.value / 100;
  $("empty-val").textContent = pct(v);
  city.setEmpty(v); city.play(); playBtn.textContent = "Pause";
});
