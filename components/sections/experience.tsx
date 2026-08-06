import { Chapter } from "@/components/ui/chapter"
import { experience } from "@/lib/data"

export function Experience() {
  return (
    <Chapter
      id="substrate"
      title="Experience"
      lead="Five years of shipping models and the systems that keep them running — alongside a Master's, which is why the dates overlap."
    >
      <ol className="relative space-y-8 border-l border-edge pl-6">
        {experience.map((item) => (
          <li key={`${item.org}-${item.role}`} data-reveal className="relative">
            <span
              className="absolute -left-[1.655rem] top-2 h-2.5 w-2.5 rounded-full ring-4 ring-void"
              style={{ background: item.kind === "work" ? "var(--accent-emerald)" : "var(--accent-cyan)" }}
              aria-hidden
            />

            <div className="panel p-5 md:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-lg font-semibold text-chalk">{item.role}</h3>
                <span className="font-mono text-[0.7rem] text-faint">
                  {item.start} — {item.end}
                </span>
              </div>

              <p className="mt-1 text-sm text-mute">
                {item.org} · {item.location}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-mute">{item.summary}</p>

              <ul className="mt-4 space-y-2">
                {item.highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-sm leading-relaxed text-mute">
                    <span className="mt-2 h-px w-3 shrink-0 bg-faint" aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded border border-edge px-2 py-0.5 font-mono text-[0.65rem] text-faint"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Chapter>
  )
}
