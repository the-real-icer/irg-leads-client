// playwright.config.js
// Place at the CRM client root: Apps/Backend/client/playwright.config.js
 
const { defineConfig, devices } = require("@playwright/test");
 
module.exports = defineConfig({
  // Where the visual specs live. If you add other Playwright tests later,
  // broaden this (or use multiple projects) so they aren't orphaned.
  testDir: "./tests/visual",
 
  // Determinism for visual diffs: run serially so nothing competes for the
  // server/DB and shifts render timing. Speed isn't the goal here.
  fullyParallel: false,
  workers: 1,
 
  expect: {
    toHaveScreenshot: {
      // START STRICT. "Pixel-identical" must mean a real count, not a vibe.
      // If sub-pixel font AA forces it, raise to a SMALL number deliberately
      // and write down why — never silently.
      maxDiffPixels: 0,
      animations: "disabled",
      scale: "css",
    },
  },
 
  use: {
    // Override per run: CRM_DEV_URL=http://localhost:3100 npx playwright test
    baseURL: process.env.CRM_DEV_URL ?? "http://localhost:3000",
 
    // Default to a logged-OUT session. Specs that need auth override this.
    storageState: { cookies: [], origins: [] },
 
    // Lock viewport + pixel ratio so layout is identical every run.
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  },
 
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
 