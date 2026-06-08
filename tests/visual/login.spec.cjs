// tests/visual/login.spec.cjs
//
// First visual-regression gate for the SCSS -> Tailwind conversion.
// Target: the login page (pages/index.jsx + _login.scss).
//
// HOW TO RUN (production build, dedicated port):
//   1) yarn build
//   2) yarn start -p 3100
//   3) CRM_DEV_URL=http://localhost:3100 npx playwright test login.spec.cjs --config playwright.config.cjs

const { test, expect } = require("@playwright/test");

// Force a logged-OUT session, overriding any global storageState.
test.use({ storageState: { cookies: [], origins: [] } });

// Resolve the login root's background-image URL (keyed off the testid so it
// survives the Tailwind conversion).
async function getBackgroundUrl(page) {
  return page.evaluate(() => {
    const el = document.querySelector('[data-testid="login-page"]');
    if (!el) return null;
    const bg = getComputedStyle(el).backgroundImage;
    const match = bg.match(/url\(["']?(.*?)["']?\)/);
    return match ? match[1] : null;
  });
}

// Wait until fully painted AND fail loudly if the background never loads.
// The earlier version swallowed load errors and passed with no background —
// that made the gate lie. This one treats the background as a hard precondition.
async function waitForFullPaint(page) {
  // 1. Fonts settled.
  await page.evaluate(() => document.fonts.ready);

  // 2. All <img> elements (the local logo) decoded.
  await page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete && img.naturalWidth > 0
          ? Promise.resolve()
          : img.decode().catch(() => undefined)
      )
    );
  });

  // 3. The CSS background-image (remote S3 photo) MUST actually decode.
  const bgUrl = await getBackgroundUrl(page);
  expect(bgUrl, "login-page background-image URL should be present").toBeTruthy();

  const loaded = await page.evaluate(async (url) => {
    try {
      const img = new Image();
      img.src = url;
      // decode() rejects if the image fails to load — we WANT that signal.
      await img.decode();
      return true;
    } catch {
      return false;
    }
  }, bgUrl);

  expect(loaded, `background image should load: ${bgUrl}`).toBe(true);
}

test("login page renders pixel-identically", async ({ page }) => {
  // Wait for network to settle so the S3 background request has a chance to fire.
  await page.goto("/", { waitUntil: "networkidle" });

  await expect(page.getByTestId("login-card")).toBeVisible();

  await waitForFullPaint(page);

  await expect(page).toHaveScreenshot("login-page.png");
});
