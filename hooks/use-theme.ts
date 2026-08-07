"use client"

import { useSyncExternalStore } from "react"
import { getServerTheme, getTheme, subscribeTheme, type Theme } from "@/lib/theme"

/**
 * Server snapshot is always "dark" — the real value is only knowable on the
 * client, and the pre-paint script has already applied it to the document by
 * the time this hydrates.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribeTheme, getTheme, getServerTheme)
}
