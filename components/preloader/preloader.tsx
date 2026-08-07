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
/* Covers the staged exit: settle 0.75s, then a 2s dissolve starting at 0.75s.
   Only the first ~0.85s of this is a wait — the page is revealed and usable
   underneath while the plate finishes fading. */
const EXIT_MS = 2850

const C = 500
/** Runs begin under the plate, so they read as leaving the package itself. */
const START = 58

/*
 * Board layout.
 *
 * Sixteen lanes off one edge, each carrying a pair of parallel runs, mirrored
 * to four sides — a bundled fan rather than single wires, which is what makes
 * it read as a board instead of a starburst. Every run doglegs at 45 degrees at
 * its own distance out, so the bends stagger into diagonal ranks the way they
 * do on a real substrate.
 *
 * Only a subset carry energy. The static runs are drawn once and never touched;
 * animating all of them would repaint the whole field every frame for no extra
 * legibility.
 */
const LANES = [-196, -170, -146, -124, -104, -86, -70, -56, -44, -34, 34, 44, 56, 70, 86, 104]
/** Second run of each pair, offset by this much. */
const PAIR_GAP = 9

export interface Run {
  d: string
  pad: { x: number; y: number }
  stub: string | null
  gold: boolean
  live: boolean
  delay: number
}

function buildBoard(): Run[] {
  const runs: Run[] = []

  LANES.forEach((o, i) => {
    const dir = Math.sign(o)
    const spread = o * 2.55
    const diag = Math.abs(spread - o)

    for (let k = 0; k < 2; k++) {
      const lat = o + k * PAIR_GAP * dir
      const out = spread + k * PAIR_GAP * dir
      const bend = C - START - 62 - Math.abs(o) * 0.7 - k * 16

      runs.push({
        d: [
          `M ${C + lat} ${C - START}`,
          `L ${C + lat} ${bend}`,
          `L ${C + out} ${bend - diag}`,
          `L ${C + out} -700`,
        ].join(" "),
        pad: { x: C + lat, y: bend },
        // A short spur off the straight section, capped with a pad — the small
        // dead-end stubs that give a real board its texture.
        stub:
          k === 0 && i % 3 === 0
            ? `M ${C + lat} ${bend - diag - 90} L ${C + out + 26 * dir} ${bend - diag - 90}`
            : null,
        gold: i % 3 === 1,
        // Every third lane, outer run only: 10 charges a side rather than 32.
        live: k === 1 && i % 3 === 0,
        delay: (Math.abs(o) / 196) * 0.9,
      })
    }
  })

  return runs
}

/* Geometry is fixed, so it is built once at module scope rather than memoised
   per mount — there is nothing for it to depend on. */
const RUNS = buildBoard()
const LIVE = RUNS.filter((r) => r.live)

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

      {/* Page-wide, so the surge crosses the whole viewport. `slice` keeps the
          angles true and lets the runs leave the frame on every side. */}
      <svg
        className={s.board}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
        focusable="false"
      >
        {[0, 90, 180, 270].map((rot) => (
          <g key={rot} transform={`rotate(${rot} ${C} ${C})`}>
            {RUNS.map((r, i) => (
              <path key={`b${i}`} d={r.d} className={s.trace} data-gold={r.gold} />
            ))}
            {RUNS.map((r, i) =>
              r.stub ? <path key={`s${i}`} d={r.stub} className={s.stub} /> : null,
            )}
            {RUNS.map((r, i) => (
              <rect
                key={`p${i}`}
                x={r.pad.x - 3.6}
                y={r.pad.y - 3.6}
                width="7.2"
                height="7.2"
                rx="1.4"
                className={s.pad}
                data-gold={r.gold}
              />
            ))}
            {LIVE.map((r, i) => (
              <path
                key={`e${i}`}
                d={r.d}
                className={s.energy}
                data-gold={r.gold}
                style={{ animationDelay: `${r.delay + rot * 0.12}s` }}
              />
            ))}
          </g>
        ))}
      </svg>

      <div className={s.stage}>
        <div className={s.chip}>
          <Image
            src="/assets/chip/layer-top.webp"
            alt=""
            width={512}
            height={512}
            priority
            className={s.chipImg}
          />
          <span className={s.chipGlow} aria-hidden />
          <span className={s.core} aria-hidden />
        </div>
      </div>

      <div className={s.readout}>
        <p className={s.caption}>{done ? "Power good" : "Powering page"}</p>
        <p className={s.pct}>
          <span className={s.pctNum}>{String(pct).padStart(3, "0")}</span>
          <span className={s.pctSign}>%</span>
        </p>
        <div className={s.rail} aria-hidden>
          <span className={s.railFill} style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
      </div>
    </div>
  )
}
