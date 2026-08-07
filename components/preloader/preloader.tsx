"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

import { useSceneReady } from "@/hooks/use-active-layer"
import s from "./preloader.module.css"

/**
 * Power-on sequence.
 *
 * The visible wait on first load is not network — the five chip textures take
 * 6-10ms each. Nothing *requests* them until roughly 1.7s in, because that
 * request only happens once React has hydrated and the WebGL canvas has
 * initialised. This covers that gap with the thing the gap is for: the chip
 * energising and pushing a surge out through the board.
 *
 * It ends on a real signal (`sceneReady`, set when the scene mounts with its
 * textures resolved), not a guessed duration — with a floor so the animation
 * has time to read, and a hard ceiling so a failure can never leave the page
 * covered.
 */

/** Long enough for the surge to land; short enough not to feel padded. */
const MIN_MS = 1400
/**
 * Absolute backstop. If the scene never signals, the page opens anyway.
 * Must stay comfortably above MIN_MS, or it pre-empts the floor it is
 * supposed to be protecting.
 */
const MAX_MS = 6000
/* Covers the staged exit: settle 0.75s, then a 1.8s dissolve starting at 0.75s.
   Only the first ~0.85s of this is a wait — the page is revealed and usable
   underneath while the plate finishes fading. */
const EXIT_MS = 2650

const C = 500
const HALF = 180

/** Eight traces off one edge, mirrored to four sides for a radiating board. */
function buildTraces() {
  const offsets = [-152, -112, -72, -26, 26, 72, 112, 152]
  return offsets.map((o, i) => {
    const spread = o * 2.35
    const elbow = C - HALF - 55 - Math.abs(spread - o) * 0.55
    return {
      d: [
        `M ${C + o} ${C - HALF}`,
        `L ${C + o} ${C - HALF - 55}`,
        `L ${C + spread} ${elbow}`,
        `L ${C + spread} -60`,
      ].join(" "),
      gold: i === 1 || i === 6,
      delay: (Math.abs(o) / 152) * 0.22,
    }
  })
}

/* Geometry is fixed, so it is built once at module scope rather than memoised
   per mount — there is nothing for it to depend on. */
const TRACES = buildTraces()

export function Preloader() {
  const sceneReady = useSceneReady()
  const [pct, setPct] = useState(0)
  const [done, setDone] = useState(false)
  const [gone, setGone] = useState(false)
  const start = useRef(0)

  // Mirrored into a ref so the interval can read the latest value without
  // being torn down and restarted every time the flag moves.
  const sceneReadyRef = useRef(sceneReady)
  useEffect(() => {
    sceneReadyRef.current = sceneReady
  }, [sceneReady])

  /* Held only while the sequence is actually running. Released the moment the
     hand-off starts, so the page is scrollable during the dissolve rather than
     locked behind a plate that is already 90% transparent. */
  useEffect(() => {
    if (done) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.scrollTo(0, 0)
    return () => {
      document.body.style.overflow = prev
    }
  }, [done])

  /*
   * setInterval, not requestAnimationFrame. A counter does not need 60fps, and
   * rAF is throttled to nothing in a background tab — which would strand
   * someone who opened the site in a tab they had not looked at yet.
   */
  useEffect(() => {
    if (gone) return
    start.current = performance.now()
    let shown = 0

    const id = window.setInterval(() => {
      const elapsed = performance.now() - start.current
      const timed = elapsed / MIN_MS
      const finished = sceneReadyRef.current && elapsed >= MIN_MS
      // Creeps to 94 while waiting, so the bar never sits still, and never
      // claims 100 before the scene has actually signalled.
      const target = finished ? 100 : Math.min(94, timed * 94)

      shown += (target - shown) * 0.22
      if (finished && target - shown < 0.6) shown = 100
      setPct(Math.round(shown))

      if (shown >= 99.5 || elapsed >= MAX_MS) {
        window.clearInterval(id)
        setPct(100)
        setDone(true)
        window.setTimeout(() => setGone(true), EXIT_MS)
      }
    }, 40)

    return () => window.clearInterval(id)
  }, [gone])

  if (gone) return null

  return (
    <div
      data-preloader
      data-done={done}
      className={s.root}
      role="status"
      aria-live="polite"
      aria-label={done ? "Loaded" : `Loading, ${pct} percent`}
    >
      {/* Its own layer so it can clear before the plate does. */}
      <div className={s.backdrop} aria-hidden />

      <div className={s.stage}>
        <svg className={s.board} viewBox="0 0 1000 1000" aria-hidden focusable="false">
          {[0, 90, 180, 270].map((rot) => (
            <g key={rot} transform={`rotate(${rot} ${C} ${C})`}>
              {TRACES.map((t, i) => (
                <path key={`b${i}`} d={t.d} className={s.trace} data-gold={t.gold} />
              ))}
              {TRACES.map((t, i) => (
                <path
                  key={`p${i}`}
                  d={t.d}
                  className={s.pulse}
                  data-gold={t.gold}
                  style={{ animationDelay: `${t.delay + rot / 900}s` }}
                />
              ))}
            </g>
          ))}
        </svg>

        <div className={s.chip}>
          <Image
            src="/assets/chip/layer-top.webp"
            alt=""
            width={512}
            height={512}
            priority
            className={s.chipImg}
          />
          <span className={s.core} aria-hidden />
        </div>
      </div>

      <div className={s.readout}>
        <p className={s.pct}>
          <span className={s.pctNum}>{String(pct).padStart(3, "0")}</span>
          <span className={s.pctSign}>%</span>
        </p>
        <div className={s.rail} aria-hidden>
          <span className={s.railFill} style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <p className={s.caption}>{done ? "Power good" : "Energising package"}</p>
      </div>
    </div>
  )
}
