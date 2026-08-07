import { LAYERS } from "./chip-config"
import type { LayerId } from "./types"

/**
 * Mutable bridge between GSAP and the R3F render loop.
 *
 * GSAP writes here from ScrollTrigger; useFrame reads here every frame. It is
 * deliberately a plain object rather than React state — routing 60fps scroll
 * updates through a setState would re-render the tree on every frame.
 */
export interface ChipState {
  /** 0..1 through the pinned hero act (power -> rotate -> separate -> settle). */
  hero: number
  /** 0..1 through the content chapters that follow the hero. */
  content: number
  /** Index of the layer currently being read. */
  active: number
  /** +1 scrolling down, -1 scrolling up. Drives current direction. */
  direction: 1 | -1
  /** Normalised pointer, -1..1 on both axes. Zeroed on touch devices. */
  pointerX: number
  pointerY: number
  /** Set true when the tab is hidden so the loop can idle. */
  paused: boolean
  /** Honours prefers-reduced-motion; the scene renders a static pose. */
  reduced: boolean
  /**
   * Per-layer focus, 0..1, keyed by layer id.
   *
   * Deliberately an object and NOT an array: GSAP treats an array target as a
   * list of targets to animate individually, so tweening an array of plain
   * numbers silently does nothing.
   */
  focus: Record<LayerId, number>
}

export const chipState: ChipState = {
  hero: 0,
  content: 0,
  active: 0,
  direction: 1,
  pointerX: 0,
  pointerY: 0,
  paused: false,
  reduced: false,
  focus: LAYERS.reduce(
    (acc, layer, i) => {
      acc[layer.id] = i === 0 ? 1 : 0
      return acc
    },
    {} as Record<LayerId, number>,
  ),
}

/* -------------------------------------------------------------------------- */
/*  Active-layer subscription                                                  */
/* -------------------------------------------------------------------------- */

const listeners = new Set<() => void>()

/** Subscribe to chapter/phase changes. Used by useSyncExternalStore. */
export function subscribeActive(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const getActive = () => chipState.active

/** True once the package has finished separating and the chapters begin. */
let heroDone = false
export const getHeroDone = () => heroDone

/**
 * True once the 3D scene has mounted with its textures resolved.
 *
 * Measured: the textures themselves take 6-10ms to fetch, but nothing requests
 * them until ~1.7s in, because the request only happens once React has
 * hydrated and the Canvas has initialised. That gap is the visible wait, so the
 * preloader has to hold until this flips rather than guess at a duration.
 */
let sceneReady = false
export const getSceneReady = () => sceneReady

export function setSceneReady(ready: boolean) {
  if (sceneReady === ready) return
  sceneReady = ready
  listeners.forEach((cb) => cb())
}

/**
 * Set the active layer and notify React.
 *
 * Pushing the change is deliberate — an rAF poll would be simpler but stops
 * entirely in a backgrounded or non-compositing tab, leaving the navigation
 * showing a stale chapter.
 */
export function setActiveLayer(index: number) {
  if (chipState.active === index) return false
  chipState.active = index
  listeners.forEach((cb) => cb())
  return true
}

/** Flip the hero phase. Called from the scrubbed hero trigger. */
export function setHeroDone(done: boolean) {
  if (heroDone === done) return
  heroDone = done
  listeners.forEach((cb) => cb())
}

/** Linear interpolation. */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** Remap `v` from [inMin,inMax] to 0..1, clamped. */
export function range(v: number, inMin: number, inMax: number) {
  if (inMax === inMin) return 0
  return Math.min(1, Math.max(0, (v - inMin) / (inMax - inMin)))
}

/** Smoothstep easing — used for anything that should feel mechanical. */
export const smooth = (t: number) => t * t * (3 - 2 * t)

/**
 * Frame-rate independent damping. `lambda` is roughly "how fast", and the
 * result is stable whether the display is 60Hz or 144Hz.
 */
export function damp(current: number, target: number, lambda: number, dt: number) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}
