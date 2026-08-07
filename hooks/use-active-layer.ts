"use client"

import { useSyncExternalStore } from "react"
import {
  getActive,
  getHeroDone,
  getSceneReady,
  subscribeActive,
} from "@/lib/scroll-store"

/**
 * Reads the active layer from the chip store.
 *
 * The store pushes changes rather than being polled, so the navigation stays
 * correct even when rAF is throttled (backgrounded tab, non-compositing frame).
 */
export function useActiveLayer() {
  return useSyncExternalStore(subscribeActive, getActive, () => 0)
}

/**
 * False while the package is still assembling and separating.
 *
 * Server snapshot is `false` so the nav is absent in the initial HTML — it must
 * not flash over the hero before hydration decides where the reader is.
 */
export function useHeroDone() {
  return useSyncExternalStore(subscribeActive, getHeroDone, () => false)
}

/** True once the chip scene has mounted with its textures resolved. */
export function useSceneReady() {
  return useSyncExternalStore(subscribeActive, getSceneReady, () => false)
}
