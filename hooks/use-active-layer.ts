"use client"

import { useSyncExternalStore } from "react"
import { getActive, subscribeActive } from "@/lib/scroll-store"

/**
 * Reads the active layer from the chip store.
 *
 * The store pushes changes rather than being polled, so the navigation stays
 * correct even when rAF is throttled (backgrounded tab, non-compositing frame).
 */
export function useActiveLayer() {
  return useSyncExternalStore(subscribeActive, getActive, () => 0)
}
