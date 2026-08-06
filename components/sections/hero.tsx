import { contact, profile } from "@/lib/data"

/**
 * The opening act.
 *
 * 400vh of scroll drives the sequence, and the inner panel is `sticky` rather
 * than GSAP-pinned — no pin spacer means no spacer/refresh feedback loop, and
 * scroll position keeps mapping honestly to page position.
 *
 * Copy sits at the edges: the chip owns the centre of the frame throughout, and
 * `data-hero-copy` is what the timeline fades as the package separates.
 */
export function Hero() {
  return (
    <section id="hero" aria-label="Introduction" className="relative h-[400vh]">
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden py-24 md:py-28">
      <div data-hero-copy className="shell">
        <p className="eyebrow mb-4">{profile.role} · {profile.location}</p>
        <h1 className="max-w-[16ch] text-[clamp(2.6rem,7vw,5.4rem)] font-semibold leading-[0.98] tracking-tight text-chalk">
          {profile.name}
        </h1>
      </div>

      <div data-hero-copy className="shell">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[42ch] text-lg leading-relaxed text-mute md:text-xl">
            {profile.headline}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#package"
              className="rounded-full bg-chalk px-5 py-2.5 text-sm font-medium text-void transition-transform hover:scale-[1.03]"
            >
              View work
            </a>
            <a
              href={contact.resume}
              download
              className="rounded-full border border-edge px-5 py-2.5 text-sm font-medium text-chalk transition-colors hover:border-cyan hover:text-cyan"
            >
              Download résumé
            </a>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-3 text-faint">
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">
            Scroll to power on
          </span>
          <span className="h-px w-16 bg-edge" aria-hidden />
        </div>
      </div>
      </div>
    </section>
  )
}
