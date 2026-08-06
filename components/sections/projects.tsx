"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { Chapter } from "@/components/ui/chapter"
import { projects } from "@/lib/data"
import type { Project } from "@/lib/types"

export function Projects() {
  const [open, setOpen] = useState<Project | null>(null)

  return (
    <Chapter
      id="interposer"
      title="Projects"
      lead="Systems that reached real users, with the engineering decisions that got them there."
      wide
    >
      <div
        data-reveal
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.map((project) => (
          <Card key={project.slug} project={project} onOpen={() => setOpen(project)} />
        ))}
      </div>

      <AnimatePresence>
        {open ? <Detail project={open} onClose={() => setOpen(null)} /> : null}
      </AnimatePresence>
    </Chapter>
  )
}

function Card({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const accent = `var(${project.accent})`

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className={`panel group relative overflow-hidden p-5 text-left transition-transform duration-300 hover:-translate-y-1 ${
        project.featured ? "sm:col-span-2 lg:col-span-1 lg:row-span-1" : ""
      }`}
    >
      <span
        className="absolute inset-x-0 top-0 h-px opacity-45 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: accent }}
        aria-hidden
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="eyebrow" style={{ color: accent }}>
          {project.domain}
        </span>
        <span className="font-mono text-[0.65rem] text-faint">{project.year}</span>
      </div>

      <h3 className="text-lg font-semibold leading-snug text-chalk">{project.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-mute">{project.tagline}</p>

      {project.metrics.length ? (
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {project.metrics.slice(0, 3).map((m) => (
            <div key={m.label}>
              <span className="font-mono text-base text-chalk">
                {m.value}
                {m.suffix ?? ""}
              </span>
              <span className="ml-1.5 text-[0.7rem] text-faint">{m.label}</span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.tech.slice(0, 4).map((t) => (
          <span
            key={t}
            className="rounded border border-edge px-2 py-0.5 font-mono text-[0.65rem] text-faint"
          >
            {t}
          </span>
        ))}
        {project.tech.length > 4 ? (
          <span className="px-1 py-0.5 font-mono text-[0.65rem] text-faint">
            +{project.tech.length - 4}
          </span>
        ) : null}
      </div>

      <span
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
        style={{ color: accent }}
      >
        Read the case study
        <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </span>
    </button>
  )
}

function Detail({ project, onClose }: { project: Project; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const accent = `var(${project.accent})`

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
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.99 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="panel relative my-auto w-full max-w-3xl p-6 md:p-10"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-edge px-3 py-1 text-xs text-mute transition-colors hover:border-faint hover:text-chalk"
        >
          Close
        </button>

        <span className="eyebrow" style={{ color: accent }}>
          {project.domain} · {project.year}
        </span>
        <h3 id="case-title" className="mt-3 text-3xl font-semibold tracking-tight text-chalk">
          {project.title}
        </h3>
        <p className="mt-2 text-base text-mute">{project.tagline}</p>

        {project.note ? (
          <p
            className="mt-5 border-l-2 py-1 pl-4 text-sm leading-relaxed text-mute"
            style={{ borderColor: accent }}
          >
            {project.note}
          </p>
        ) : null}

        {project.metrics.length ? (
          <dl className="mt-7 grid grid-cols-3 gap-3">
            {project.metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-edge px-3 py-3 text-center">
                <dd className="font-mono text-xl text-chalk">
                  {m.value}
                  {m.suffix ?? ""}
                </dd>
                <dt className="mt-1 text-[0.7rem] leading-tight text-faint">{m.label}</dt>
              </div>
            ))}
          </dl>
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
                className="rounded border border-edge px-2 py-1 font-mono text-[0.68rem] text-mute"
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
                className="rounded-full bg-chalk px-5 py-2 text-sm font-medium text-void transition-transform hover:scale-[1.03]"
              >
                Visit live site
              </a>
            ) : null}
            {project.repo ? (
              <a
                href={project.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="rounded-full border border-edge px-5 py-2 text-sm font-medium text-chalk transition-colors hover:border-cyan hover:text-cyan"
              >
                View source
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
