"use client"

import { useSyncExternalStore } from "react"

/**
 * Media queries as external stores.
 *
 * useSyncExternalStore rather than useState + useEffect: it is SSR-safe by
 * construction (getServerSnapshot), and it avoids the cascading render that
 * setState-inside-an-effect causes.
 */
function makeMediaStore(query: string) {
  let mql: MediaQueryList | null = null
  const ensure = () => (mql ??= window.matchMedia(query))

  return {
    subscribe: (onChange: () => void) => {
      const m = ensure()
      m.addEventListener("change", onChange)
      return () => m.removeEventListener("change", onChange)
    },
    getSnapshot: () => ensure().matches,
    getServerSnapshot: () => false,
  }
}

const reducedStore = makeMediaStore("(prefers-reduced-motion: reduce)")
const coarseStore = makeMediaStore("(pointer: coarse)")

/** True when the visitor has asked for reduced motion. */
export function useReducedMotion() {
  return useSyncExternalStore(
    reducedStore.subscribe,
    reducedStore.getSnapshot,
    reducedStore.getServerSnapshot,
  )
}

/** Coarse pointer (touch) — drops tilt and thins out effects. */
export function useCoarsePointer() {
  return useSyncExternalStore(
    coarseStore.subscribe,
    coarseStore.getSnapshot,
    coarseStore.getServerSnapshot,
  )
}

const neverChanges = () => () => {}

/** False during SSR and the first client render, true afterwards. */
export function useMounted() {
  return useSyncExternalStore(
    neverChanges,
    () => true,
    () => false,
  )
}
