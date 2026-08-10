import { expect, test, type Page } from "@playwright/test"

/**
 * Three tests, three shipped bugs.
 *
 * Each one is here because it already broke in production, and because none of
 * them are visible in a screenshot: a stranded scroll lock looks exactly like a
 * page that finished loading, and a dialog that is merely invisible looks
 * exactly like one that is properly closed.
 */

/** Is the page actually released, or only painted as if it were? */
const locked = (page: Page) =>
  page.evaluate(
    () =>
      document.body.style.overflow === "hidden" ||
      document.documentElement.classList.contains("lenis-stopped"),
  )

/** Waits out the power-on sequence, which holds the page while it runs. */
async function settled(page: Page) {
  await expect.poll(() => locked(page), { timeout: 15_000 }).toBe(false)
}

test.describe("the page lets go of the visitor", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } })

  test("reduced motion is not held behind the preloader's ceiling", async ({ page }) => {
    await page.goto("/")

    // Proves the emulation actually reached the page. Without this the whole
    // test can pass by exercising the WebGL path, which was never broken.
    await expect(page.locator('img[src*="fallback"]')).toBeAttached()

    /*
     * Wait for the lock to go ON before timing it coming off.
     *
     * Polling straight for `false` is a false negative: it succeeds on the first
     * sample, and the first sample lands before hydration has applied the lock
     * at all. Verified — with the bug reintroduced this test passed in 1.4s.
     */
    await expect.poll(() => locked(page), { timeout: 10_000 }).toBe(true)
    const lockedAt = Date.now()

    /*
     * ChipScene is the only caller of setSceneReady, and the reduced-motion
     * branch of ChipCanvas returns before it mounts — so the flag never flipped,
     * the preloader fell through to its 6s ceiling, and the page sat scroll-
     * locked the whole time. Measured end to end: 6759ms before the fix,
     * 2705ms after.
     *
     * MIN_MS is 1400 and MAX_MS is 6000, so 4s sits cleanly between the floor
     * this should hit and the ceiling it used to. If this starts failing, check
     * that the fallback branch still signals before reaching for a bigger
     * number — the number is the assertion.
     */
    await expect.poll(() => locked(page), { timeout: 4_000 }).toBe(false)
    expect(Date.now() - lockedAt).toBeLessThan(4_000)
  })
})

test.describe("mobile navigation", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } })
  test.skip(({ isMobile }) => !isMobile, "the sheet is phone-only, below 1024px")

  test("escape closes the sheet and gives the page back", async ({ page }) => {
    await page.goto("/")
    await settled(page)

    const trigger = page.getByRole("button", { name: "Open navigation" })
    await trigger.click()

    const sheet = page.locator("#nav-sheet")
    await expect(sheet).toBeVisible()
    expect(await locked(page)).toBe(true)

    /*
     * The bug this exists for: `close` does not bubble and is queued, so state
     * derived from it can arrive late or never. The lock stayed on over a
     * dialog that had already gone — a frozen page with nothing on screen to
     * explain it. Escape is intercepted at `cancel` now.
     */
    await page.keyboard.press("Escape")

    await expect(sheet).toBeHidden()
    await expect.poll(() => locked(page)).toBe(false)

    // Released for real, not just in the style attribute.
    const moved = await page.evaluate(async () => {
      const before = window.scrollY
      window.scrollBy(0, 400)
      await new Promise((r) => setTimeout(r, 100))
      return window.scrollY > before
    })
    expect(moved).toBe(true)
  })
})

test.describe("case study dialog", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } }) // also pauses the carousel's autoplay

  test("stays out of the layout when closed, and returns focus when dismissed", async ({
    page,
  }) => {
    await page.goto("/")
    await settled(page)

    const dialog = page.locator("#interposer dialog")

    /*
     * `display: flex` on the dialog beat the UA's
     * `dialog:not([open]) { display: none }` — the only declaration keeping a
     * closed dialog off the page — so it laid out over the section while
     * "closed". Invisible in a screenshot, obvious in a computed style.
     */
    await expect(dialog).toBeHidden()
    expect(await dialog.evaluate((d) => getComputedStyle(d).display)).toBe("none")

    const card = page.locator('#interposer [data-centre="true"] button').first()
    await card.scrollIntoViewIfNeeded()
    await card.click()

    await expect(dialog).toBeVisible()
    expect(await locked(page)).toBe(true)

    await page.keyboard.press("Escape")

    await expect(dialog).toBeHidden()
    await expect.poll(() => locked(page)).toBe(false)

    /*
     * Focus used to fall to <body>, so a keyboard reader who opened the seventh
     * case study restarted at the top of a five-chapter page. showModal()
     * restores it to whatever opened the dialog.
     */
    await expect(card).toBeFocused()
  })
})
