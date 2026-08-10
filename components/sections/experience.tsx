"use client"

import { useEffect, useId, useRef, useState, type CSSProperties } from "react"
import { motion, useScroll, useSpring } from "motion/react"
import { BarChart3, Briefcase, GraduationCap, Undo2 } from "lucide-react"

import { Chapter } from "@/components/ui/chapter"
import { experience } from "@/lib/data"
import { neonOf } from "@/lib/theme"
import type { ExperienceItem } from "@/lib/types"
import s from "./experience.module.css"

type Side = "left" | "right"

function Card({ item, side }: { item: ExperienceItem; side: Side }) {
  const [flipped, setFlipped] = useState(false)
  const frontBtn = useRef<HTMLButtonElement>(null)
  const backBtn = useRef<HTMLButtonElement>(null)
  const takeFocus = useRef(false)
  const backId = useId()

  const edu = item.kind === "education"
  const estimated = item.stats.some((m) => m.assumed)

  // Focus follows the face that turned toward the reader, so a keyboard user is
  // never left standing on the button that just went inert. The ref gate keeps
  // this to user-driven flips — without it StrictMode's second mount effect
  // would yank focus down the page on load.
  const flip = (next: boolean) => {
    takeFocus.current = true
    setFlipped(next)
  }

  useEffect(() => {
    if (!takeFocus.current) return
    takeFocus.current = false
    ;(flipped ? backBtn : frontBtn).current?.focus({ preventScroll: true })
  }, [flipped])

  return (
    <div
      className={s.card}
      data-flipped={flipped}
      data-side={side}
      style={
        {
          "--card-accent": `var(${item.accent})`,
          "--card-neon": `var(${neonOf(item.accent)})`,
        } as CSSProperties
      }
    >
      <div className={s.inner}>
        {/* --------------------------------------------------------- front */}
        <article className={`glass ${s.face} ${s.front}`} inert={flipped}>
          <p className={s.stamp}>
            <span className={s.dates}>
              {item.start} — {item.end}
            </span>
            <span className={s.kindTag}>{edu ? "education" : "work"}</span>
          </p>

          <h3 className={`inlay ${s.role}`}>{item.role}</h3>

          <p className={s.org}>
            <span className={s.orgName}>{item.org}</span>
            <span className={s.orgSep}> · </span>
            <span className={s.orgLoc}>{item.location}</span>
            {item.end === "Present" ? <span className={s.live} aria-hidden /> : null}
          </p>

          <p className={s.summary}>{item.summary}</p>

          <ul className={s.hl}>
            {item.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>

          <div className={s.tags}>
            {item.tags.map((t) => (
              <span key={t} className={s.tag}>
                {t}
              </span>
            ))}
          </div>

          {/* The button's ::after covers the card, so a click anywhere flips
              it — while the control itself stays a real, labelled button. */}
          <button
            ref={frontBtn}
            type="button"
            className={s.flip}
            aria-expanded={flipped}
            aria-controls={backId}
            onClick={() => flip(true)}
          >
            <BarChart3 className={s.flipIcon} aria-hidden />
            Click for metrics
            <span className="sr-only">
              {" "}
              for {item.role}, {item.org}
            </span>
          </button>
        </article>

        {/* ---------------------------------------------------------- back */}
        <article id={backId} className={`glass ${s.face} ${s.back}`} inert={!flipped}>
          <p className={s.stamp}>
            <span className={s.dates}>
              {edu ? "Programme readout" : "Performance readout"}
            </span>
            <span className={s.kindTag}>{item.org}</span>
          </p>

          <h4 className="sr-only">
            Metrics for {item.role}, {item.org}
          </h4>

          <dl className={s.statGrid}>
            {item.stats.map((m, i) => (
              <div key={m.label} className={s.stat} style={{ "--i": i } as CSSProperties}>
                <dt className={s.statLabel}>{m.label}</dt>
                <dd className={s.statVal}>
                  {m.value}
                  {m.suffix ? <span className={s.statSuffix}>{m.suffix}</span> : null}
                  {m.assumed ? (
                    <span className={s.est} aria-hidden>
                      *
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>

          <ul className={s.meters}>
            {item.bars.map((b, i) => (
              <li key={b.label} style={{ "--v": b.value / 100, "--i": i } as CSSProperties}>
                <p className={s.meterHead}>
                  <span className={s.meterLabel}>{b.label}</span>
                  <span className={s.meterVal}>{b.value}</span>
                </p>
                <span className={`${s.meterTrack} ${edu ? s.eduTrack : ""}`} aria-hidden>
                  <span className={s.meterFill} />
                </span>
              </li>
            ))}
          </ul>

          <p className={s.note}>
            Meters are self-assessed emphasis across the {edu ? "programme" : "role"}, 0–100.
            {estimated ? " * marks an estimate, not a measurement." : ""}
          </p>

          <button
            ref={backBtn}
            type="button"
            className={s.flip}
            aria-expanded={flipped}
            aria-controls={backId}
            onClick={() => flip(false)}
          >
            <Undo2 className={s.flipIcon} aria-hidden />
            Back to overview
            <span className="sr-only">
              {" "}
              for {item.role}, {item.org}
            </span>
          </button>
        </article>
      </div>
    </div>
  )
}

export function Experience() {
  const rail = useRef<HTMLDivElement>(null)

  /* The rail fills as the section passes through the viewport, so the spine
     reads as a progress bar down the career rather than static chrome. */
  const { scrollYProgress } = useScroll({
    target: rail,
    offset: ["start 70%", "end 60%"],
  })
  const fill = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 24,
    restDelta: 0.001,
  })

  return (
    <Chapter
      id="substrate"
      title="Experience & education"
      lead="Five years across financial services, healthcare, and retail, and the degrees that anchor it."
    >
      <p className={`eyebrow ${s.hint}`} data-reveal>
        <BarChart3 className={s.hintIcon} aria-hidden />
        Click a card to flip it for the numbers
      </p>

      <div ref={rail} className={s.rail}>
        <div className={s.line} aria-hidden>
          <motion.div style={{ scaleY: fill }} className={s.fill} />
        </div>

        <ol className={s.items}>
          {experience.map((item, i) => {
            const side: Side = i % 2 === 0 ? "left" : "right"
            const edu = item.kind === "education"
            const Icon = edu ? GraduationCap : Briefcase
            return (
              <li
                key={`${item.org}-${item.role}`}
                className={s.row}
                data-side={side}
                data-reveal
              >
                <span className={s.node} data-kind={item.kind} aria-hidden>
                  <Icon className={s.nodeIcon} />
                </span>

                <div className={s.col}>
                  <Card item={item} side={side} />
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </Chapter>
  )
}
