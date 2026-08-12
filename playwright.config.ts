import { defineConfig, devices } from "@playwright/test"

/**
 * Smoke tests only.
 *
 * This is a static one-page portfolio with no backend and no data mutation, so
 * a broad suite would be cargo cult. What it does have is four scroll locks, a
 * native dialog, and a preloader that holds the page — state that is invisible
 * when it breaks, because a stranded lock looks exactly like a page that has
 * finished loading. Every test here encodes a bug that actually shipped.
 *
 * Runs against a production build rather than `next dev`: two of the three
 * regressions were CSS cascade and hydration-timing issues, and dev-mode
 * source order is not the order that ships.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],

  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    /*
     * Never reuse. `reuseExistingServer: !process.env.CI` is the usual default
     * and it silently defeats the point of this file: with a dev server already
     * on 3000, the whole suite runs against `next dev` while claiming to test a
     * production build. It cost a real debugging detour, where three tests
     * failed with "element is not attached to the DOM" because dev-mode
     * remounting was tearing the carousel out from under them.
     *
     * The cost is one build per run. If port 3000 is busy, Playwright now fails
     * loudly instead of testing the wrong thing.
     */
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
