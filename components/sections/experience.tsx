"use client"

import { useEffect, useId, useRef, useState, type CSSProperties } from "react"
import { BarChart3, Briefcase, GraduationCap, Undo2 } from "lucide-react"

import { Chapter } from "@/components/ui/chapter"
import { experience } from "@/lib/data"
import type { ExperienceItem } from "@/lib/types"
import s from "./experience.module.css"

const SKIP = new Set(["of", "the", "and", "&"])

/** "University of Florida" -> "UF", "Accenture" -> "AC". */
function monogram(org: string) {
  const words = org.split(/\s+/).filter((w) => w && !SKIP.has(w.toLowerCase()))
  const initials = words.length > 1 ? words[0][0] + words[1][0] : org.slice(0, 2)
  return initials.toUpperCase()
}

function Card({ item }: { item: ExperienceItem }) {
  const [flipped, setFlipped] = useState(false)
  const frontBtn = useRef<HTMLButtonElement>(null)
  const backBtn = useRef<HTMLButtonElement>(null)
  const takeFocus = useRef(false)
  const backId = useId()

  const edu = item.kind === "education"
  const KindIcon = edu ? GraduationCap : Briefcase
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

  const badge = (
    <span
      className={`${s.mono} ${edu ? s.monoEdu : s.monoWork}`}
      aria-hidden
    >
      {monogram(item.org)}
    </span>
  )

  return (
    <li data-reveal>
      <div
        className={s.card}
        data-flipped={flipped}
        style={{ "--card-accent": item.accent } as CSSProperties}
      >
        <div className={s.inner}>
          {/* ------------------------------------------------------- front */}
          <article className={`glass ${s.face} ${s.front}`} inert={flipped}>
            <header className={s.head}>
              {badge}
              <div>
                <p className={s.kind}>
                  <KindIcon className={s.kindIcon} aria-hidden />
                  {edu ? "Education" : "Experience"}
                </p>
                <p className={s.org}>{item.org}</p>
              </div>
            </header>

            <h3 className={`inlay ${s.role}`}>{item.role}</h3>

            <p className={s.meta}>
              <span>
                {item.start} — {item.end}
              </span>
              <span aria-hidden>·</span>
              <span>{item.location}</span>
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

          {/* -------------------------------------------------------- back */}
          <article
            id={backId}
            className={`glass ${s.face} ${s.back}`}
            inert={!flipped}
          >
            <header className={s.backHead}>
              {badge}
              <div>
                <p className={s.kind}>{edu ? "Programme readout" : "Performance readout"}</p>
                <p className={s.org}>{item.org}</p>
              </div>
            </header>

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
    </li>
  )
}

export function Experience() {
  return (
    <Chapter
      id="substrate"
      title="Experience"
      lead="Five years of shipping models and the systems that keep them running — alongside a Master's, which is why the dates overlap."
    >
      <p className={`eyebrow ${s.hint}`} data-reveal>
        <BarChart3 className={s.hintIcon} aria-hidden />
        Click a card to flip it for the numbers
      </p>

      <ol className={s.grid}>
        {experience.map((item) => (
          <Card key={`${item.org}-${item.role}`} item={item} />
        ))}
      </ol>
    </Chapter>
  )
}
