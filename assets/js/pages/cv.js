// CV page only: highlights the side-menu item for the part you're reading.
// Highlight the side-menu item for the section being read
const links = [...document.querySelectorAll(".toc a")];
const byId = Object.fromEntries(links.map((a) => [a.getAttribute("href").slice(1), a]));
const seen = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (!en.isIntersecting) return;
    links.forEach((a) => a.classList.remove("active"));
    byId[en.target.id]?.classList.add("active");
  });
}, { rootMargin: "-20% 0px -70% 0px" });
document.querySelectorAll(".cv section").forEach((s) => seen.observe(s));
