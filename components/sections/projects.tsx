"use client"

import type { CSSProperties } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import { ArrowLeft, ArrowRight, ExternalLink, GitBranch, Lock } from "lucide-react"

import { Chapter } from "@/components/ui/chapter"
import { setScrollLock } from "@/hooks/use-chip-timeline"
import { projectCategories, projects } from "@/lib/data"
import { neonOf } from "@/lib/theme"
import type { Project, ProjectCategory } from "@/lib/types"
import s from "./projects.module.css"

const AUTOPLAY_MS = 2000
/** Cards further out than this are not rendered — they are behind the stack. */
const VISIBLE_DEPTH = 3

export function Projects() {
  /** Index into `visible`, so the modal can step through without closing. */
  const [open, setOpen] = useState<number | null>(null)
  const [filter, setFilter] = useState<ProjectCategory | null>(null)
  const [active, setActive] = useState(0)
  const [held, setHeld] = useState(false)
  const reduced = useReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDialogElement>(null)

  /* Lags `open` by one close, so the dialog still has a case study to render
     while it transitions out. Recorded when opening rather than derived in an
     effect - an effect would set state from state, which is a render the user
     pays for and React rightly flags. */
  const [lastOpen, setLastOpen] = useState(0)
  const openAt = useCallback((i: number) => {
    setOpen(i)
    setLastOpen(i)
  }, [])

  const visible = useMemo(
    () => (filter ? projects.filter((p) => p.category === filter) : projects),
    [filter],
  )

  const counts = useMemo(() => {
    const m = new Map<ProjectCategory, number>()
    for (const p of projects) m.set(p.category, (m.get(p.category) ?? 0) + 1)
    return m
  }, [])

  const n = visible.length

  /* What the dialog renders: the open project, or the last one while it closes.
     Indexed into `visible`, so a filter change that shortens the list resolves
     to null rather than to the wrong case study. */
  const shownIndex = open ?? lastOpen
  const shownProject = visible[shownIndex] ?? null

  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + n) % n),
    [n],
  )

  /**
   * Signed distance from the active card, wrapped.
   *
   * This is what makes it an actual carousel rather than a strip with ends:
   * the card three past the last one is the third from the front, so the arc
   * never runs out on either side.
   */
  const offsetOf = useCallback(
    (i: number) => {
      let d = i - active
      if (d > n / 2) d -= n
      if (d < -n / 2) d += n
      return d
    },
    [active, n],
  )

  /*
   * The page freeze lives here, not in the modal.
   *
   * The dialog stays mounted across its exit transition, so tying the lock to
   * the modal's own unmount would make releasing it depend on that transition
   * completing. If it ever did not, the page would stay frozen with nothing on
   * screen to explain why. Keyed on `open`, it cannot be stranded.
   */
  useEffect(() => {
    const locked = open !== null
    setScrollLock(locked)
    document.body.style.overflow = locked ? "hidden" : ""
    return () => {
      setScrollLock(false)
      document.body.style.overflow = ""
    }
  }, [open])

  useEffect(() => {
    const d = sheetRef.current
    if (!d) return
    if (open !== null && !d.open) d.showModal()
    else if (open === null && d.open) d.close()
  }, [open])

  /*
   * Escape is intercepted at `cancel`, not observed at `close`.
   *
   * `close` does not bubble and is dispatched as a queued task, so state derived
   * from it can arrive late or not at all — and what rides on it here is the
   * scroll lock, which would leave the page frozen with nothing on screen.
   * `cancel` fires synchronously on the keydown and is cancelable, so preventing
   * it and routing through state keeps React the single writer. Both listeners
   * are native because neither event reaches React's delegated root.
   */
  useEffect(() => {
    const d = sheetRef.current
    if (!d) return
    const cancel = (e: Event) => {
      e.preventDefault()
      setOpen(null)
    }
    const close = () => setOpen(null)
    d.addEventListener("cancel", cancel)
    d.addEventListener("close", close)
    return () => {
      d.removeEventListener("cancel", cancel)
      d.removeEventListener("close", close)
    }
  }, [])

  /* Stepping to another case study starts it at the top. The dialog is the
     scroller now, so this moved up here with it. */
  useEffect(() => {
    if (open !== null) sheetRef.current?.scrollTo({ top: 0 })
  }, [open])

  const paused = held || open !== null || !!reduced
  useEffect(() => {
    if (paused || n < 2) return
    const id = window.setInterval(() => go(1), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [paused, go, n])

  /** A new filter renders a different set, so bring it back to the front. */
  const changeFilter = useCallback((next: ProjectCategory | null) => {
    setFilter(next)
    setActive(0)
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      go(1)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      go(-1)
    }
  }

  return (
    <Chapter
      id="interposer"
      title="Projects"
      lead="Systems that reached real users, with the engineering decisions that got them there."
    >
      <div data-reveal>
        {/*
          Filter rail — a bracketed, monospace terminal rail with a sliding gold
          rule. Skills already owns the rounded-pill filter, so repeating that
          shape here would make the page read as one component twice. Same
          behaviour, deliberately different instrument.
        */}
        <div className={s.rail} role="group" aria-label="Filter projects by category">
          <Tab
            on={filter === null}
            label="all"
            count={projects.length}
            onClick={() => changeFilter(null)}
          />
          {projectCategories.map((c) => (
            <Tab
              key={c}
              on={filter === c}
              label={c.toLowerCase()}
              count={counts.get(c) ?? 0}
              onClick={() => changeFilter(filter === c ? null : c)}
            />
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          {visible[active]?.title}. Card {active + 1} of {n}
          {filter ? ` in ${filter}` : ""}.
        </p>

        <div
          className="relative"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={() => setHeld(false)}
          onTouchStart={() => setHeld(true)}
          onTouchEnd={() => setHeld(false)}
          onTouchCancel={() => setHeld(false)}
        >
          {/* The arc. Perspective lives on the stage; every card is placed by
              its signed distance from centre, so nothing has to be measured. */}
          <div
            ref={stageRef}
            className={s.stage}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Projects — use the left and right arrow keys"
            onKeyDown={onKeyDown}
          >
            <div className={s.arc}>
              {visible.map((p, i) => {
                const d = offsetOf(i)
                const far = Math.abs(d) > VISIBLE_DEPTH
                const centre = d === 0
                return (
                  <div
                    key={p.slug}
                    className={s.slot}
                    data-centre={centre}
                    aria-hidden={far || undefined}
                    style={
                      {
                        "--d": d,
                        "--ad": Math.abs(d),
                        zIndex: 50 - Math.abs(d),
                        visibility: far ? "hidden" : "visible",
                      } as CSSProperties
                    }
                  >
                    <Card
                      project={p}
                      centre={centre}
                      onActivate={() => (centre ? openAt(i) : setActive(i))}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="font-mono text-[0.68rem] text-faint">
              {reduced ? "auto-advance off" : paused ? "paused" : "auto-advancing"}
              <span className="text-faint"> · </span>
              {active + 1}/{n}
            </p>
            <div className="flex gap-2">
              <Arrow label="Previous project" onClick={() => go(-1)}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Arrow>
              <Arrow label="Next project" onClick={() => go(1)}>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Arrow>
            </div>
          </div>
        </div>
      </div>

      {/*
        A native <dialog>, opened with showModal().

        It replaces a hand-rolled overlay that had the dialog semantics right and
        the behaviour wrong: nothing intercepted Tab, so Shift+Tab from Close
        walked out into the page behind, and on close focus fell to <body> — a
        keyboard reader who opened the seventh case study was returned to the top
        of a five-chapter page. showModal() supplies the focus trap, focus
        restore, Escape and background inert-ing in one move, and the top layer
        retires the stacking problem that needed createPortal here before.

        Always mounted, and it keeps rendering the last project after close, so
        the exit transition has something to fade rather than emptying first. A
        closed dialog is display:none, so that content is out of the tab order
        and the accessibility tree.
      */}
      <dialog
        ref={sheetRef}
        aria-labelledby="case-title"
        className={s.caseDialog}
        data-lenis-prevent
        /* Every pixel of the dialog outside the card is backdrop. The card and
           the steppers are children, so they report themselves as the target and
           never reach this. */
        onClick={(e) => {
          if (e.target === sheetRef.current) setOpen(null)
        }}
      >
        {shownProject ? (
          <Detail
            project={shownProject}
            index={shownIndex}
            total={n}
            onClose={() => setOpen(null)}
            /* Stepping in the modal also moves the arc, so closing lands the
               reader on the project they were last reading. */
            onStep={(dir) => {
              const next = (shownIndex + dir + n) % n
              openAt(next)
              setActive(next)
            }}
          />
        ) : null}
      </dialog>
    </Chapter>
  )
}

/* -------------------------------------------------------------------------- */

function Tab({
  on,
  label,
  count,
  onClick,
}: {
  on: boolean
  label: string
  count: number
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`${s.tab} ${on ? s.tabOn : ""}`}
    >
      <span className={s.bracket} aria-hidden>
        [
      </span>
      {label}
      <span className={s.count}>{count}</span>
      <span className={s.bracket} aria-hidden>
        ]
      </span>
    </button>
  )
}

function Arrow({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-edge text-mute transition-colors hover:border-gold hover:text-gold"
    >
      {children}
    </button>
  )
}

/* -------------------------------------------------------------------------- */

function repoPath(project: Project) {
  return project.repo
    ? project.repo.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\/$/, "")
    : project.slug
}

function Card({
  project,
  centre,
  onActivate,
}: {
  project: Project
  centre: boolean
  onActivate: () => void
}) {
  const accent = `var(${project.accent})`
  const style = {
    "--card-accent": accent,
    "--card-neon": `var(${neonOf(project.accent)})`,
  } as CSSProperties
  const langs = project.languages

  return (
    <button
      type="button"
      onClick={onActivate}
      aria-haspopup={centre ? "dialog" : undefined}
      aria-label={
        centre
          ? `${project.title} — open case study`
          : `Bring ${project.title} to the front`
      }
      /* Only the front card takes tab focus; the arrows and arrow keys are the
         keyboard path through the rest, so Tab does not walk ten cards. */
      tabIndex={centre ? 0 : -1}
      style={style}
      className={`glass ${s.card}`}
    >
      <header className="flex items-center justify-between gap-3">
        <span className="eyebrow truncate" style={{ color: accent }}>
          {project.domain}
        </span>
        <span className="shrink-0 font-mono text-[0.68rem] text-faint">{project.year}</span>
      </header>

      <h3 className={`inlay ${s.title}`}>{project.title}</h3>
      <p className={s.tagline}>{project.tagline}</p>

      <div className={s.hr} aria-hidden />

      <section>
        <p className="eyebrow">The problem</p>
        <p className={`${s.body} ${s.clamp2}`}>{project.problem}</p>
      </section>

      {project.metrics.length ? (
        <dl className={s.metrics}>
          {project.metrics.slice(0, 3).map((m) => (
            <div key={m.label} className={s.metric}>
              <dd className={s.metricVal}>
                {m.value}
                {m.suffix ?? ""}
                {m.assumed ? <span className={s.est}>*</span> : null}
              </dd>
              <dt className={s.metricLabel}>{m.label}</dt>
            </div>
          ))}
        </dl>
      ) : null}

      {project.decisions.length ? (
        <section className={s.decision}>
          <p className="eyebrow">Key decision</p>
          <p className={`${s.body} ${s.clamp2}`}>{project.decisions[0]}</p>
        </section>
      ) : null}

      {project.architecture.length ? (
        <section className={s.pipeSection}>
          <p className="eyebrow">Pipeline</p>
          {/* Four stages, then a count. Five names wrap to a third line on the
              longest cards and push the footer out of the card. */}
          <ol className={s.pipeline}>
            {project.architecture.slice(0, 4).map((step, i) => (
              <li key={step.title}>
                {i > 0 ? (
                  <span className={s.arrow} aria-hidden>
                    →
                  </span>
                ) : null}
                <span className={s.stage_}>{step.title}</span>
              </li>
            ))}
            {project.architecture.length > 4 ? (
              <li>
                <span className={s.arrow} aria-hidden>
                  →
                </span>
                <span className={s.stage_}>+{project.architecture.length - 4}</span>
              </li>
            ) : null}
          </ol>
        </section>
      ) : null}

      <div className={s.chips}>
        {project.tech.slice(0, 6).map((t) => (
          <span key={t} className={s.chip}>
            {t}
          </span>
        ))}
        {project.tech.length > 6 ? (
          <span className={s.chipMore}>+{project.tech.length - 6}</span>
        ) : null}
      </div>

      {/* Pinned to the bottom so footers line up across every card. */}
      <footer className={s.footer}>
        {langs.length ? (
          <>
            <div className={s.langBar} role="img" aria-label={langLabel(langs)}>
              {langs.map((l) => (
                <span
                  key={l.name}
                  className={s.langSeg}
                  style={{ width: `${l.pct}%`, background: l.color }}
                />
              ))}
            </div>
            <ul className={s.legend} aria-hidden>
              {langs.map((l) => (
                <li key={l.name}>
                  <span className={s.dot} style={{ background: l.color, color: l.color }} />
                  <span className={s.legendName}>{l.name}</span>
                  <span className={s.legendPct}>{l.pct}%</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <div className={s.footRow}>
          <span className={s.repo}>
            {project.repo ? (
              <GitBranch className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
            ) : (
              <Lock className="h-3.5 w-3.5 shrink-0 text-faint" aria-hidden />
            )}
            <span className="truncate">{repoPath(project)}</span>
          </span>

          <span className={s.cta} style={{ color: accent }}>
            {project.demo ? "live · case study" : "case study"}
            <span aria-hidden>→</span>
          </span>
        </div>
      </footer>
    </button>
  )
}

function langLabel(langs: Project["languages"]) {
  return `Language mix: ${langs.map((l) => `${l.name} ${l.pct} percent`).join(", ")}`
}

/* -------------------------------------------------------------------------- */

function Detail({
  project,
  index,
  total,
  onClose,
  onStep,
}: {
  project: Project
  index: number
  total: number
  onClose: () => void
  onStep: (dir: 1 | -1) => void
}) {
  const accent = `var(${project.accent})`
  const style = {
    "--card-accent": accent,
    "--card-neon": `var(${neonOf(project.accent)})`,
  } as CSSProperties
  const hasAssumed = project.metrics.some((m) => m.assumed)

  /*
   * No portal, no overlay div, no keydown listener, no focus call.
   *
   * All four were standing in for a modal dialog and doing it partially. The
   * parent's <dialog> owns them now: the top layer replaces createPortal, the
   * ::backdrop replaces the scrim, showModal() replaces the Escape handler and
   * the manual focus, and it adds the two things this never had — a focus trap
   * and focus restore.
   */
  return (
    <>
      {/* Lightbox-style steppers, so a reader moves through the case studies
          without returning to the carousel between each one. */}
      <button
        type="button"
        onClick={() => onStep(-1)}
        aria-label="Previous case study"
        className={s.sideArrow}
        data-side="left"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onStep(1)}
        aria-label="Next case study"
        className={s.sideArrow}
        data-side="right"
      >
        <ArrowRight className="h-5 w-5" aria-hidden />
      </button>

      <article
        style={style}
        className={`glass relative my-auto w-full max-w-3xl px-5 pb-5 sm:px-6 sm:pb-6 md:px-10 md:pb-10 ${s.caseCard}`}
      >
        {/* Sticky, so stepping and closing stay reachable however far down the
            case study the reader has scrolled. */}
        <div className={s.bar}>
          <span className={s.pos}>
            {String(index + 1).padStart(2, "0")}
            <span className={s.posOf}> / {String(total).padStart(2, "0")}</span>
          </span>

          <div className={s.barBtns}>
            <button
              type="button"
              onClick={() => onStep(-1)}
              aria-label="Previous case study"
              className={s.barBtn}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => onStep(1)}
              aria-label="Next case study"
              className={s.barBtn}
            >
              <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onClose}
              className={s.barClose}
            >
              Close
            </button>
          </div>
        </div>

        <span className="eyebrow" style={{ color: accent }}>
          {project.domain} · {project.year} · {project.category}
        </span>
        <h3 id="case-title" className="inlay mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
          {project.title}
        </h3>
        <p className="mt-2 text-base text-mute">{project.tagline}</p>

        {project.languages.length ? (
          <div className="mt-5">
            <div className={s.langBar} role="img" aria-label={langLabel(project.languages)}>
              {project.languages.map((l) => (
                <span
                  key={l.name}
                  className={s.langSeg}
                  style={{ width: `${l.pct}%`, background: l.color }}
                />
              ))}
            </div>
            <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1" aria-hidden>
              {project.languages.map((l) => (
                <li key={l.name} className="flex items-center gap-1.5">
                  <span className={s.dot} style={{ background: l.color, color: l.color }} />
                  <span className="text-xs text-mute">{l.name}</span>
                  <span className="font-mono text-[0.66rem] text-faint">{l.pct}%</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {project.note ? (
          <p
            className="mt-5 border-l-2 py-1 pl-4 text-sm leading-relaxed text-mute"
            style={{ borderColor: accent }}
          >
            {project.note}
          </p>
        ) : null}

        {project.metrics.length ? (
          <>
            <dl className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {project.metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-edge bg-white/[0.015] px-3 py-3 text-center"
                >
                  <dd className="font-mono text-xl text-chalk">
                    {m.value}
                    {m.suffix ?? ""}
                    {m.assumed ? (
                      <span className="align-super text-[0.6rem] text-faint">*</span>
                    ) : null}
                  </dd>
                  <dt className="mt-1 text-[0.7rem] leading-tight text-faint">{m.label}</dt>
                </div>
              ))}
            </dl>
            {hasAssumed ? (
              <p className="mt-2 text-[0.68rem] text-faint">* estimated, not measured.</p>
            ) : null}
          </>
        ) : null}

        <Block title="Problem">{project.problem}</Block>
        <Block title="Goal">{project.goal}</Block>

        <section className="mt-7">
          <p className="eyebrow mb-4">Architecture</p>
          <ol className="space-y-0">
            {project.architecture.map((step, i) => (
              <li key={step.title} className="flex gap-4 pb-5 last:pb-0">
                <div className="flex flex-col items-center">
                  <span
                    className="mt-1 h-2 w-2 shrink-0 rounded-full"
                    style={{ background: accent }}
                    aria-hidden
                  />
                  {i < project.architecture.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-edge" aria-hidden />
                  ) : null}
                </div>
                <div className="pb-1">
                  <p className="text-sm font-medium text-chalk">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-mute">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-7">
          <p className="eyebrow mb-3">Key decisions</p>
          <ul className="space-y-2.5">
            {project.decisions.map((d) => (
              <li key={d} className="flex gap-3 text-sm leading-relaxed text-mute">
                <span
                  className="mt-2 h-px w-4 shrink-0"
                  style={{ background: accent }}
                  aria-hidden
                />
                {d}
              </li>
            ))}
          </ul>
        </section>

        <Block title="Hardest part">{project.challenges}</Block>
        <Block title="Result">{project.result}</Block>
        <Block title="What I learned">{project.learned}</Block>

        <section className="mt-7">
          <p className="eyebrow mb-3">Stack</p>
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-[4px] border border-edge px-2 py-1 font-mono text-[0.68rem] text-mute"
              >
                {t}
              </span>
            ))}
          </div>
        </section>

        {project.repo || project.demo ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {project.demo ? (
              <a
                href={project.demo}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full bg-chalk px-5 py-2 text-sm font-medium text-void transition-transform hover:scale-[1.03]"
              >
                Visit live site
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            ) : null}
            {project.repo ? (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full border border-edge px-5 py-2 text-sm font-medium text-chalk transition-colors hover:border-gold hover:text-gold"
              >
                View source
                <GitBranch className="h-3.5 w-3.5" aria-hidden />
              </a>
            ) : null}
          </div>
        ) : null}
      </article>
    </>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <p className="eyebrow mb-2">{title}</p>
      <p className="text-sm leading-relaxed text-mute">{children}</p>
    </section>
  )
}
