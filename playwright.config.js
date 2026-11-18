// Settings for the browser tests in tests/browser/ (run by: python tests/run_tests.py full)
// They open the built site (_site) in a real browser at phone and laptop sizes.
const { defineConfig, devices } = require("@playwright/test");

// The command that serves _site on this computer while the tests run
const python = process.platform === "win32" ? "python" : "python3";

module.exports = defineConfig({
  testDir: "tests/browser",
  outputDir: "test-results/browser",           // failure screenshots and traces land here
  fullyParallel: true,
  retries: 0,
  reporter: [["list"], ["html", { outputFolder: "test-results/report", open: "never" }]],
  use: { baseURL: "http://127.0.0.1:4000", trace: "retain-on-failure" },
  webServer: {
    command: `${python} -m http.server 4000 --bind 127.0.0.1 --directory _site`,
    url: "http://127.0.0.1:4000/",
    reuseExistingServer: true,
    timeout: 30000,
  },
  projects: [
    // A typical phone (390 x 844, touch) and a typical laptop screen (1280 x 800)
    { name: "phone", use: { ...devices["iPhone 13"], browserName: "chromium" } },
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 800 } } },
  ],
});
