"use client"

import type { CSSProperties } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowLeft, ArrowRight, ExternalLink, GitBranch, Lock } from "lucide-react"

import { Chapter } from "@/components/ui/chapter"
import { projectCategories, projects } from "@/lib/data"
import type { Project, ProjectCategory } from "@/lib/types"
import s from "./projects.module.css"

const AUTOPLAY_MS = 2000

export function Projects() {
  const [open, setOpen] = useState<Project | null>(null)
  const [filter, setFilter] = useState<ProjectCategory | null>(null)

  const trackRef = useRef<HTMLDivElement>(null)
  const [held, setHeld] = useState(false)
  const reduced = useReducedMotion()

  const visible = useMemo(
    () => (filter ? projects.filter((p) => p.category === filter) : projects),
    [filter],
  )

  const counts = useMemo(() => {
    const m = new Map<ProjectCategory, number>()
    for (const p of projects) m.set(p.category, (m.get(p.category) ?? 0) + 1)
    return m
  }, [])

  /** Advance exactly one card, wrapping at either end. */
  const nudge = useCallback(
    (dir: 1 | -1) => {
      const el = trackRef.current
      if (!el) return
      const kids = el.children
      // Distance between two card origins already includes the gap — no maths on it.
      const step =
        kids.length > 1
          ? (kids[1] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft
          : el.clientWidth
      const max = el.scrollWidth - el.clientWidth
      if (max <= 2) return

      let next = el.scrollLeft + dir * step
      if (dir > 0 && el.scrollLeft >= max - 2) next = 0
      if (dir < 0 && el.scrollLeft <= 2) next = max

      el.scrollTo({ left: next, behavior: reduced ? "auto" : "smooth" })
    },
    [reduced],
  )

  // Autoplay. Stops for reduced motion, hover, focus-within, touch drag and the modal.
  const paused = held || open !== null || !!reduced
  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => nudge(1), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [paused, nudge, filter])

  // A new filter renders a new set — start it at the beginning.
  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 })
  }, [filter])

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
            onClick={() => setFilter(null)}
          />
          {projectCategories.map((c) => (
            <Tab
              key={c}
              on={filter === c}
              label={c.toLowerCase()}
              count={counts.get(c) ?? 0}
              onClick={() => setFilter(filter === c ? null : c)}
            />
          ))}
        </div>

        <p className="sr-only" aria-live="polite">
          {visible.length} project{visible.length === 1 ? "" : "s"} shown
          {filter ? ` in ${filter}` : ""}.
        </p>

        <div
          className="relative mt-6"
          onMouseEnter={() => setHeld(true)}
          onMouseLeave={() => setHeld(false)}
          onFocusCapture={() => setHeld(true)}
          onBlurCapture={() => setHeld(false)}
          onTouchStart={() => setHeld(true)}
          onTouchEnd={() => setHeld(false)}
          onTouchCancel={() => setHeld(false)}
        >
          <div className={s.viewport}>
            <div
              ref={trackRef}
              className={`${s.track} no-bar`}
              tabIndex={0}
              role="region"
              aria-roledescription="carousel"
              aria-label="Project cards — scroll or use the previous and next buttons"
            >
              {visible.map((p) => (
                <Card key={p.slug} project={p} onOpen={() => setOpen(p)} />
              ))}
            </div>
          </div>

          <div className="mt-1 flex items-center justify-between gap-4">
            <p className="font-mono text-[0.68rem] text-faint">
              {paused && !reduced ? "paused" : reduced ? "auto-scroll off" : "auto-scrolling"}
              <span className="text-edge"> · </span>
              drag, scroll or use the arrows
            </p>
            <div className="flex gap-2">
              <Arrow label="Previous project" onClick={() => nudge(-1)}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
              </Arrow>
              <Arrow label="Next project" onClick={() => nudge(1)}>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Arrow>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open ? <Detail project={open} onClose={() => setOpen(null)} /> : null}
      </AnimatePresence>
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

function Card({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const accent = `var(${project.accent})`
  const style = { "--card-accent": accent } as CSSProperties
  const langs = project.languages

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      aria-label={`${project.title} — open case study`}
      style={style}
      className={`glass glass-lift ${s.card}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow truncate" style={{ color: accent }}>
          {project.domain}
        </span>
        <span className="shrink-0 font-mono text-[0.65rem] text-faint">{project.year}</span>
      </div>

      <h3 className="inlay mt-3 text-[1.05rem] font-semibold leading-snug">{project.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-mute">{project.tagline}</p>

      {/* Topic chips, GitHub-style — squared, not the pill shape Skills uses. */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.tech.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-[4px] border border-edge px-1.5 py-0.5 font-mono text-[0.62rem] text-faint"
          >
            {t}
          </span>
        ))}
        {project.tech.length > 3 ? (
          <span className="py-0.5 font-mono text-[0.62rem] text-faint">
            +{project.tech.length - 3}
          </span>
        ) : null}
      </div>

      {/* Everything below is pinned to the bottom so footers align across cards. */}
      <div className="mt-auto w-full pt-5">
        <div className="mb-3 flex items-center gap-2 font-mono text-[0.66rem]">
          {project.repo ? (
            <GitBranch className="h-3 w-3 shrink-0 text-faint" aria-hidden />
          ) : (
            <Lock className="h-3 w-3 shrink-0 text-faint" aria-hidden />
          )}
          <span className="truncate text-mute">{repoPath(project)}</span>
          <span className="ml-auto shrink-0 text-faint">
            {project.repo ? "public" : "source not public"}
          </span>
        </div>

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

            <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1" aria-hidden>
              {langs.map((l) => (
                <li key={l.name} className="flex items-center gap-1.5">
                  <span className={s.dot} style={{ background: l.color, color: l.color }} />
                  <span className="text-[0.68rem] text-mute">{l.name}</span>
                  <span className="font-mono text-[0.62rem] text-faint">{l.pct}%</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-edge pt-3">
          {/* Ticks are the real architecture stages from the case study. */}
          <span className="flex items-center gap-2">
            <span className={s.ticks} aria-hidden>
              {project.architecture.map((step, i) => (
                <span
                  key={step.title}
                  className={s.tick}
                  style={{ height: `${5 + ((i * 3) % 7)}px` }}
                />
              ))}
            </span>
            <span className="font-mono text-[0.62rem] text-faint">
              {project.architecture.length} stages
            </span>
          </span>

          <span
            className="inline-flex items-center gap-1 text-[0.72rem] font-medium"
            style={{ color: accent }}
          >
            case study
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </button>
  )
}

function langLabel(langs: Project["languages"]) {
  return `Language mix: ${langs.map((l) => `${l.name} ${l.pct} percent`).join(", ")}`
}

/* -------------------------------------------------------------------------- */

function Detail({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const accent = `var(${project.accent})`
  const style = { "--card-accent": accent } as CSSProperties
  const hasAssumed = project.metrics.some((m) => m.assumed)

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose],
  )

  useEffect(() => {
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    closeRef.current?.focus()
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [onKey])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-void/85 p-4 backdrop-blur-sm md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      role="presentation"
    >
      <motion.article
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        style={style}
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.99 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="glass relative my-auto w-full max-w-3xl p-5 sm:p-6 md:p-10"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full border border-edge bg-carbon/70 px-3 py-1 text-xs text-mute transition-colors hover:border-gold hover:text-gold md:right-5 md:top-5"
        >
          Close
        </button>

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
      </motion.article>
    </motion.div>
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
