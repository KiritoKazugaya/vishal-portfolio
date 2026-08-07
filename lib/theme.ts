export type Theme = "dark" | "light"

/**
 * `--accent-*` -> `--neon-*`.
 *
 * Two tiers exist because one cannot do both jobs on a light ground: the accent
 * is tuned to clear AA when it carries small text, and the neon is tuned to look
 * like neon. Display type and card rims take the neon, everything functional
 * keeps the accent. Deriving the name here means no data file has to carry both.
 */
export function neonOf(accentToken: string) {
  return accentToken.replace("--accent-", "--neon-")
}

const KEY = "theme"
const listeners = new Set<() => void>()

/** Mirrors whatever the pre-paint script in the document head already applied. */
function read(): Theme {
  if (typeof document === "undefined") return "dark"
  return document.documentElement.dataset.theme === "light" ? "light" : "dark"
}

let current: Theme = read()

export const getTheme = () => current
export const getServerTheme = (): Theme => "dark"

export function subscribeTheme(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

/**
 * The single writer.
 *
 * `data-theme` on the root element is the source of truth — every stylesheet
 * keys off it, and the 3D scene reads it through this store, so there is no way
 * for the page and the canvas to disagree about which theme is on.
 */
export function setTheme(next: Theme) {
  if (typeof document === "undefined") return
  current = next
  document.documentElement.dataset.theme = next
  /* The pre-paint script writes color-scheme as an inline style, which outranks
     any stylesheet rule — so it has to be updated here too, or native scrollbars
     and form controls stay in the old theme after a toggle. */
  document.documentElement.style.colorScheme = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    /* Private mode or storage disabled — the theme still applies for this
       session, it just will not be remembered. Nothing to recover. */
  }
  listeners.forEach((cb) => cb())
}

export function toggleTheme() {
  setTheme(current === "dark" ? "light" : "dark")
}

/**
 * Runs before first paint, inlined in <head>.
 *
 * Kept as a string rather than a module because it has to execute before the
 * document renders — anything bundled would arrive a frame too late and the
 * page would flash the wrong theme.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('${KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t}catch(e){document.documentElement.dataset.theme='dark'}})()`
