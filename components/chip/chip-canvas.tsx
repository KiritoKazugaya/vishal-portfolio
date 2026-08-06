"use client"

import { Suspense, useEffect, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import Image from "next/image"

import { chipState } from "@/lib/scroll-store"
import { useCoarsePointer, useMounted, useReducedMotion } from "@/hooks/use-reduced-motion"
import { ChipScene } from "./chip-scene"

/**
 * Stable prop objects.
 *
 * These MUST be module constants, not inline literals. This component
 * re-renders several times during mount (reduced-motion and pointer probes each
 * set state), and a fresh `resize`/`gl`/`camera` object on every render churns
 * R3F's container measurement so it never settles — the symptom is a canvas
 * stuck at its 300x150 default with a correctly-sized parent.
 */
const GL = { antialias: true, powerPreference: "high-performance", alpha: false } as const
const GL_LITE = { antialias: false, powerPreference: "default", alpha: false } as const
const CAMERA = { fov: 38, near: 0.1, far: 100, position: [0, 12.6, 0.02] } as const

function hasWebGL() {
  try {
    const probe = document.createElement("canvas")
    return !!(probe.getContext("webgl2") || probe.getContext("webgl"))
  } catch {
    return false
  }
}

/**
 * Fixed full-viewport stage that the page content scrolls over.
 *
 * The canvas never scrolls; scroll position reaches it through the chip store
 * instead. One WebGL context serves the whole page rather than one per section.
 */
export function ChipCanvas() {
  const reduced = useReducedMotion()
  const coarse = useCoarsePointer()
  const mounted = useMounted()

  const dpr = useMemo<[number, number]>(() => [1, coarse ? 1.5 : 2], [coarse])

  // Probe once on the client. Some machines and locked-down browsers have no
  // WebGL at all, and they should get the static plate rather than a black box.
  const webgl = useMemo(() => (mounted ? hasWebGL() : true), [mounted])

  // Pointer parallax, desktop only.
  useEffect(() => {
    if (coarse || reduced) {
      chipState.pointerX = 0
      chipState.pointerY = 0
      return
    }
    const onMove = (e: PointerEvent) => {
      chipState.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      chipState.pointerY = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [coarse, reduced])

  // Stop burning frames on a tab nobody is looking at.
  useEffect(() => {
    const onVis = () => {
      chipState.paused = document.hidden
    }
    document.addEventListener("visibilitychange", onVis)
    return () => document.removeEventListener("visibilitychange", onVis)
  }, [])

  // Known R3F race: the container measurement can settle at 0x0 inside a
  // `fixed` parent, and because the box never changes afterwards nothing
  // re-triggers it — the canvas would stay at its 300x150 default forever.
  // Verified by hand: a window resize event corrects it. Forward one once the
  // renderer has had a chance to mount.
  useEffect(() => {
    if (!mounted || reduced || !webgl) return
    const id = window.setTimeout(() => window.dispatchEvent(new Event("resize")), 260)
    return () => window.clearTimeout(id)
  }, [mounted, reduced, webgl])

  if (!mounted) {
    return <div className="fixed inset-0 -z-10 bg-[#050507]" aria-hidden />
  }

  if (reduced || !webgl) {
    return (
      <div className="fixed inset-0 -z-10 flex items-center justify-center overflow-hidden bg-[#050507]">
        <Image
          src="/assets/chip/fallback-exploded.webp"
          alt="Exploded view of a GPU package: heat spreader, silicon die, interposer, package substrate, and BGA contact array, separated along a vertical axis."
          width={1400}
          height={1400}
          priority
          className="h-auto w-[min(78vw,620px)] opacity-70"
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 -z-10 bg-[#050507]" aria-hidden>
      <Canvas
        dpr={dpr}
        gl={coarse ? GL_LITE : GL}
        camera={CAMERA}
        onCreated={({ gl }) => gl.setClearColor("#050507")}
        fallback={null}
      >
        <Suspense fallback={null}>
          <ChipScene density={coarse ? 3 : 5} />
        </Suspense>
      </Canvas>
    </div>
  )
}
