"use client"

import { useEffect } from "react"

import { CircuitField } from "@/components/circuit/circuit-field"
import { useChipTimeline } from "@/hooks/use-chip-timeline"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { ScrollTrigger } from "@/lib/gsap"

/**
 * Owns the scroll machinery. Renders nothing but the circuit overlay, and is
 * mounted last so every section it measures is already in the DOM.
 */
export function ScrollRuntime() {
  const reduced = useReducedMotion()
  useChipTimeline(!reduced)

  // Fonts and images settle after first paint and move things; re-measure once
  // everything has actually loaded or the pin lands in the wrong place.
  useEffect(() => {
    if (reduced) return
    const refresh = () => ScrollTrigger.refresh()
    const t = window.setTimeout(refresh, 400)
    window.addEventListener("load", refresh)
    document.fonts?.ready.then(refresh).catch(() => {})
    return () => {
      window.clearTimeout(t)
      window.removeEventListener("load", refresh)
    }
  }, [reduced])

  return <CircuitField enabled={!reduced} />
}
