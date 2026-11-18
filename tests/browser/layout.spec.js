// Browser tests: each page, at phone and laptop size, in light and dark.
// They look for the layout problems a person would notice: sideways scrolling,
// things sticking off the screen, text running into other text or getting cut off,
// pictures that don't load, buttons too small to tap, errors, and accessibility problems.
// A full-page screenshot of every combination is saved in test-results/screens/ to look at.

const fs = require("fs");
const path = require("path");
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

// Every built page, found in _site (so new pages are tested without editing this file)
const SITE = path.join(__dirname, "..", "..", "_site");
function findPages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === "assets" ? [] : findPages(full);
    return entry.name.endsWith(".html") ? [full] : [];
  });
}
const PAGES = findPages(SITE).map((f) => "/" + path.relative(SITE, f).split(path.sep).join("/").replace(/index\.html$/, ""));

// Open a page in light or dark, with every lazy picture loaded and fonts ready
async function open(page, url, theme) {
  await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });           // calm: no animations to wait for
  await page.addInitScript((t) => { try { localStorage.setItem("theme", t); } catch (e) {} }, theme);
  const problems = [];
  page.on("pageerror", (err) => problems.push(`script error: ${err.message}`));
  page.on("console", (msg) => { if (msg.type() === "error") problems.push(`console error: ${msg.text()}`); });
  page.on("response", (res) => {                                                         // our own files that fail to load
    if (res.url().startsWith("http://127.0.0.1") && res.status() >= 400) problems.push(`${res.status()} for ${res.url()}`);
  });
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(async () => {
    document.querySelectorAll("img[loading=lazy]").forEach((img) => (img.loading = "eager"));
    await document.fonts.ready;
  });
  await page.waitForLoadState("networkidle").catch(() => {});
  return problems;
}

for (const url of PAGES) {
  for (const theme of ["light", "dark"]) {
    test(`${url} in ${theme}`, async ({ page }, info) => {
      const problems = await open(page, url, theme);
      const where = `${url} (${info.project.name}, ${theme})`;

      // 1. The page really is in the theme we asked for
      expect(await page.evaluate(() => document.documentElement.dataset.theme), `${where}: theme`).toBe(theme);

      // 2. Nothing makes the page scroll sideways
      const widths = await page.evaluate(() => ({ page: document.documentElement.scrollWidth, screen: innerWidth }));
      expect(widths.page, `${where}: the page is wider than the screen, so it scrolls sideways`).toBeLessThanOrEqual(widths.screen + 1);

      // 3-7: measured inside the page (expect.soft keeps going after a problem, so every problem is listed)
      const report = await page.evaluate(() => {
        const out = { offscreen: [], clipped: [], overlaps: [], small: [], tiny: [], images: [] };
        const visible = (el) => {
          const s = getComputedStyle(el), r = el.getBoundingClientRect();
          return s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0 && r.width > 0 && r.height > 0 &&
            !el.closest("[aria-hidden=true], .skip, .trap");
        };
        const label = (el) => `<${el.tagName.toLowerCase()}${el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).join(".") : ""}> "${(el.textContent || el.alt || "").trim().slice(0, 40)}"`;
        const scrollsSideways = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { if (/(auto|scroll)/.test(getComputedStyle(p).overflowX)) return true; } return false; };

        // 3. Nothing sticks out past the left or right edge of the screen
        document.querySelectorAll("main *, header *, footer *").forEach((el) => {
          if (!visible(el) || scrollsSideways(el)) return;
          const r = el.getBoundingClientRect();
          if (r.right > innerWidth + 1 || r.left < -1) out.offscreen.push(label(el));
        });

        // 4. Text isn't cut off by its box
        document.querySelectorAll("main h1, main h2, main h3, main p, main li, main a, main button, main label, main span, footer a").forEach((el) => {
          if (!visible(el) || el.closest(".trap")) return;
          const s = getComputedStyle(el);
          if (/(hidden|clip)/.test(s.overflowX + s.overflowY) && s.textOverflow !== "ellipsis" &&
              (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2)) out.clipped.push(label(el));
        });

        // 5. Blocks of text don't run into each other
        const blocks = [...document.querySelectorAll("main h1, main h2, main h3, main p, main li, main .btn, main .chip, main .tag, main label, main figcaption, header a, header button, footer a")]
          .filter((el) => visible(el) && !el.closest(".pin"));          // the DCT ring is meant to stay pinned while text scrolls by
        const boxes = blocks.map((el) => el.getBoundingClientRect());
        for (let i = 0; i < blocks.length; i++) for (let j = i + 1; j < blocks.length; j++) {
          const a = blocks[i], b = blocks[j];
          if (a.contains(b) || b.contains(a)) continue;                  // one inside the other is fine
          const A = boxes[i], B = boxes[j];
          const w = Math.min(A.right, B.right) - Math.max(A.left, B.left), h = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top);
          if (w > 3 && h > 3) out.overlaps.push(`${label(a)} and ${label(b)}`);
        }

        // 6. Buttons and menu links are big enough to tap (24 px is the accessibility minimum),
        //    and running text isn't too small to read
        document.querySelectorAll(".btn, button, header nav a, input, textarea, select").forEach((el) => {
          if (!visible(el)) return;
          const r = el.getBoundingClientRect();
          if (r.width < 24 || r.height < 24) out.small.push(`${label(el)} is ${Math.round(r.width)}x${Math.round(r.height)}`);
        });
        document.querySelectorAll("main p, main li").forEach((el) => {
          if (visible(el) && parseFloat(getComputedStyle(el).fontSize) < 12) out.tiny.push(label(el));
        });

        // 7. Every picture loaded
        document.querySelectorAll("img").forEach((img) => { if (!img.complete || img.naturalWidth === 0) out.images.push(img.getAttribute("src")); });
        return out;
      });

      expect.soft(report.offscreen, `${where}: these stick out past the edge of the screen`).toEqual([]);
      expect.soft(report.clipped, `${where}: this text is cut off`).toEqual([]);
      expect.soft(report.overlaps, `${where}: these run into each other`).toEqual([]);
      expect.soft(report.small, `${where}: too small to tap`).toEqual([]);
      expect.soft(report.tiny, `${where}: text smaller than 12px`).toEqual([]);
      expect.soft(report.images, `${where}: pictures that didn't load`).toEqual([]);

      // 8. Accessibility: contrast, labels, names, structure (the WCAG 2.1 AA rules axe can check)
      const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      const issues = axe.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length}x, e.g. ${v.nodes[0].target.join(" ")})`);
      expect.soft(issues, `${where}: accessibility problems`).toEqual([]);

      // 9. No errors while the page loaded
      expect.soft(problems, `${where}: errors`).toEqual([]);

      // A full-page picture to look at, kept even when everything passes
      const file = `${info.project.name}-${theme}-${url.replace(/\//g, "_").replace(/^_|_$/g, "") || "home"}.png`;
      await page.screenshot({ path: path.join("test-results", "screens", file), fullPage: true });
    });
  }
}

// The light/dark button switches the theme and the colours change with it
test("the theme button switches light and dark", async ({ page }) => {
  await open(page, "/", "light");
  const before = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await page.locator(".theme-toggle").first().click();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  // the colours fade for a moment, so keep looking for up to 2 seconds
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor),
    { message: "the background colour should change", timeout: 2000 }).not.toBe(before);
});

// The contact form says what's missing instead of sending an empty message
test("the contact form asks for missing details", async ({ page }) => {
  let sent = false;
  await page.route("https://script.google.com/**", (route) => { sent = true; route.abort(); });   // never really send
  await open(page, "/contact/", "light");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.locator("#status")).toContainText("Please add your name");
  expect(sent, "an empty form must not be sent").toBe(false);
});
