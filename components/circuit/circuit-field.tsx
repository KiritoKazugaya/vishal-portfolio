"use client"

import { useEffect, useRef } from "react"
import { gsap } from "@/lib/gsap"

/**
 * PCB traces feeding the chip during the power-on phase.
 *
 * Pure SVG rather than more WebGL: stroke-dashoffset draws the paths crisply at
 * any resolution for a fraction of the cost, and the pulses are one CSS
 * animation instead of another render target.
 */
export function CircuitField({ enabled }: { enabled: boolean }) {
  const root = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!enabled || !root.current) return

    const ctx = gsap.context(() => {
      const paths = gsap.utils.toArray<SVGPathElement>("[data-trace]")

      paths.forEach((p) => {
        const len = p.getTotalLength()
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
      })

      gsap.to(paths, {
        strokeDashoffset: 0,
        ease: "none",
        stagger: { amount: 0.6, from: "random" },
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "20% top",
          scrub: true,
        },
      })

      // Traces recede as the chip lifts into its three-quarter view.
      gsap.to(root.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: "#hero",
          start: "25% top",
          end: "50% top",
          scrub: true,
        },
      })
    }, root)

    return () => ctx.revert()
  }, [enabled])

  return (
    <svg
      ref={root}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none fixed inset-0 -z-[9] h-full w-full"
      aria-hidden
    >
      <defs>
        {/* Stops read the theme tokens rather than fixed hex, so the board
            re-inks itself with the rest of the page — neon cyan at 55% is
            invisible on white. */}
        <linearGradient id="trace-fade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0" />
          <stop offset="45%" stopColor="var(--accent-cyan)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="trace-fade-r" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--accent-violet)" stopOpacity="0" />
          <stop offset="45%" stopColor="var(--accent-violet)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <g fill="none" strokeWidth="1.1" strokeLinecap="square">
        {LEFT_TRACES.map((d, i) => (
          <path key={`l${i}`} data-trace d={d} stroke="url(#trace-fade)" />
        ))}
        {RIGHT_TRACES.map((d, i) => (
          <path key={`r${i}`} data-trace d={d} stroke="url(#trace-fade-r)" />
        ))}
      </g>

      {/* Vias — the small pads where a trace changes layer. */}
      <g fill="var(--accent-cyan)" opacity="0.35">
        {VIAS.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="2.4" />
        ))}
      </g>
    </svg>
  )
}

/* Orthogonal routing, as a real board would run it: straight segments with
   45-degree turns, converging on the package in the centre of the viewport. */
const LEFT_TRACES = [
  "M0 120 H180 L240 180 H520",
  "M0 210 H140 L200 270 H505",
  "M0 300 H250 L300 350 H500",
  "M0 400 H300 L340 440 H495",
  "M0 500 H260 L320 560 H500",
  "M0 610 H180 L250 540 H505",
  "M0 700 H220 L300 620 H510",
  "M0 790 H150 L260 680 H520",
]

const RIGHT_TRACES = [
  "M1440 140 H1260 L1200 200 H940",
  "M1440 230 H1300 L1230 300 H945",
  "M1440 330 H1200 L1150 380 H950",
  "M1440 430 H1160 L1110 470 H955",
  "M1440 530 H1210 L1140 590 H950",
  "M1440 630 H1270 L1190 560 H945",
  "M1440 720 H1230 L1150 640 H940",
  "M1440 810 H1290 L1180 700 H930",
]

const VIAS: Array<[number, number]> = [
  [240, 180], [200, 270], [300, 350], [340, 440],
  [320, 560], [250, 540], [300, 620], [260, 680],
  [1200, 200], [1230, 300], [1150, 380], [1110, 470],
  [1140, 590], [1190, 560], [1150, 640], [1180, 700],
]
