"use client"

import { useEffect } from "react"
import Lenis from "lenis"

import { gsap, ScrollTrigger } from "@/lib/gsap"
import { LAYERS, PHASES, layerIndex } from "@/lib/chip-config"
import { chipState, setActiveLayer, setHeroDone } from "@/lib/scroll-store"
import type { LayerId } from "@/lib/types"

interface Bound {
  index: number
  top: number
  bottom: number
}

/**
 * The live Lenis instance, so navigation can scroll through it.
 * Calling window.scrollTo while Lenis is running makes the two fight.
 */
let scroller: Lenis | null = null

/**
 * Wires scroll position to the chip.
 *
 * Two independent mechanisms, deliberately:
 *   1. The hero act is scrubbed across its own 400vh — the chip powers on,
 *      rotates, and separates in lockstep with the scrollbar. The panel is
 *      `sticky`, so there is no pin spacer to run away.
 *   2. Everything after is normal page flow. The stack stays on screen as a
 *      fixed backdrop and each chapter lights its own layer.
 *
 * Keeping the hero out of a pin matters: pinning the whole document would break
 * deep links, in-page find, and scroll restoration, and would bury the projects
 * several viewport-heights deep.
 */
export function useChipTimeline(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      // Reduced motion: present the stack already separated and static.
      chipState.hero = 1
      chipState.reduced = true
      LAYERS.forEach((l) => {
        chipState.focus[l.id] = 0.6
      })
      // No scrubbed hero to pass through, so the nav is available immediately.
      setHeroDone(true)
      return
    }

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    })
    scroller = lenis

    lenis.on("scroll", ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    if (process.env.NODE_ENV !== "production") {
      ;(window as unknown as Record<string, unknown>).__chip = {
        state: chipState,
        triggers: () => ScrollTrigger.getAll().length,
        lenis,
      }
    }

    let bounds: Bound[] = []

    const ctx = gsap.context(() => {
      const sections = gsap.utils.toArray<HTMLElement>("[data-layer]")

      /** Cache chapter offsets so the scroll handler never reads layout. */
      const measure = () => {
        bounds = sections.map((section) => {
          const rect = section.getBoundingClientRect()
          const top = rect.top + window.scrollY
          return {
            index: layerIndex(section.dataset.layer as LayerId),
            top,
            bottom: top + rect.height,
          }
        })
      }

      measure()
      ScrollTrigger.addEventListener("refresh", measure)

      /**
       * Pick the chapter whose midpoint is nearest the viewport midpoint.
       *
       * A ScrollTrigger per section with onToggle looked simpler but produced a
       * non-deterministic winner wherever two chapters overlapped — whichever
       * fired last won. Distance to centre has exactly one answer.
       */
      const pickChapter = () => {
        const focal = window.scrollY + window.innerHeight / 2
        let best = -1
        let bestDist = Infinity
        for (const b of bounds) {
          const dist = Math.abs((b.top + b.bottom) / 2 - focal)
          if (dist < bestDist) {
            bestDist = dist
            best = b.index
          }
        }
        if (best >= 0 && setActiveLayer(best)) applyFocus(best)
      }

      /* ---------------------------------------------------------- hero act */
      ScrollTrigger.create({
        trigger: "#hero",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        // Also on refresh, so a reload part-way down the page (or a deep link)
        // resolves the phase instead of waiting for the first scroll event.
        onRefresh: (self) => setHeroDone(self.progress >= 0.995),
        onUpdate: (self) => {
          chipState.hero = self.progress
          chipState.direction = self.direction >= 0 ? 1 : -1
          setHeroDone(self.progress >= 0.995)

          // Past the hero, the chapters own focus. Writing (and killing tweens)
          // unconditionally here would clobber the chapter cross-fade on every
          // single scroll frame and freeze every layer at the same value.
          if (self.progress >= 0.999) return

          gsap.killTweensOf(chipState.focus)

          if (self.progress < PHASES.separate[0]) {
            LAYERS.forEach((l, i) => {
              chipState.focus[l.id] = i === 0 ? 1 : 0.04
            })
          } else {
            const t = Math.min(
              1,
              (self.progress - PHASES.separate[0]) /
                (PHASES.separate[1] - PHASES.separate[0]),
            )
            LAYERS.forEach((l) => {
              chipState.focus[l.id] = 0.08 + t * 0.5
            })
          }
        },
      })

      /* ------------------------------------------------------ hero copy out */
      gsap.to("[data-hero-copy]", {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "35% top",
          scrub: true,
        },
      })

      /* --------------------------------------------------------- chapters */
      ScrollTrigger.create({
        trigger: "#chapters",
        start: "top bottom",
        end: "bottom bottom",
        onUpdate: (self) => {
          chipState.content = self.progress
          chipState.direction = self.direction >= 0 ? 1 : -1
          pickChapter()
        },
        onRefresh: pickChapter,
      })

      /* ------------------------------------------------------------ reveals */
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 26,
          duration: 0.75,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        })
      })

      return () => ScrollTrigger.removeEventListener("refresh", measure)
    })

    // No manual resize->refresh here: ScrollTrigger already listens for resize,
    // and adding a second path was enough to make measurements compound.

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      if (scroller === lenis) scroller = null
      ctx.revert()
    }
  }, [enabled])
}

/** Cross-fade layer focus toward `index`. One tween, so nothing fights. */
function applyFocus(index: number) {
  const vars: Record<string, number> = {}
  LAYERS.forEach((layer, i) => {
    vars[layer.id] = i === index ? 1 : 0.07
  })
  gsap.to(chipState.focus, {
    ...vars,
    duration: 0.65,
    ease: "power2.out",
    overwrite: true,
  })
}

/** Jump to a chapter from the navigation without desyncing the timeline. */
export function scrollToLayer(id: LayerId) {
  const el = document.querySelector<HTMLElement>(`[data-layer="${id}"]`)
  if (!el) return

  if (scroller) {
    scroller.scrollTo(el, { offset: -80, duration: 1.1 })
    return
  }

  // Reduced motion, or before the timeline mounts.
  const top = el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top })
}
