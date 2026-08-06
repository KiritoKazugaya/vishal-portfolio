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
      {/* Bottom padding is tighter than the top so the scroll cue sits low in frame. */}
      <div className="sticky top-0 flex h-screen w-full flex-col justify-between overflow-hidden pt-24 pb-[clamp(1.5rem,4vh,2.75rem)] md:pt-28">
      <div data-hero-copy className="shell">
        <p className="eyebrow mb-[clamp(0.75rem,1.4vw,1.25rem)]">
          {profile.role} · {profile.location}
        </p>
        {/* Gold inlay clips at the glyph baseline, so the line box gets room to spare. */}
        <h1 className="inlay max-w-[15ch] pb-[0.08em] text-[clamp(2.35rem,7.6vw,6rem)] font-bold leading-[0.95] tracking-[-0.03em]">
          {profile.name}
        </h1>
      </div>

      <div data-hero-copy className="shell">
        <div className="flex flex-col gap-[clamp(1.5rem,3vw,2.5rem)] md:flex-row md:items-end md:justify-between">
          <p className="max-w-[24ch] text-[clamp(1.25rem,2.6vw,2.35rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-chalk">
            {profile.headline}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#package"
              className="rounded-full bg-chalk px-[clamp(1.1rem,1.6vw,1.6rem)] py-[clamp(0.6rem,0.9vw,0.8rem)] text-[clamp(0.82rem,0.95vw,0.95rem)] font-semibold text-void transition-transform hover:scale-[1.03]"
            >
              View work
            </a>
            <a
              href={contact.resume}
              download
              className="rounded-full border border-edge px-[clamp(1.1rem,1.6vw,1.6rem)] py-[clamp(0.6rem,0.9vw,0.8rem)] text-[clamp(0.82rem,0.95vw,0.95rem)] font-semibold text-chalk transition-colors hover:border-cyan hover:text-cyan"
            >
              Download résumé
            </a>
          </div>
        </div>

        {/* Recessed pill on near-black: the travelling spark is what makes it findable. */}
        <div className="mt-[clamp(2rem,4vh,3.5rem)] flex justify-center">
          <a
            href="#package"
            aria-label="Scroll down to power on the chip"
            className="spark-frame group inline-flex items-center gap-3 px-[clamp(1rem,2vw,1.5rem)] py-[clamp(0.5rem,0.9vw,0.7rem)] shadow-[0_0_0_1px_rgba(0,0,0,0.9),0_18px_36px_-20px_rgba(0,0,0,1)]"
          >
            <span className="font-mono text-[clamp(0.6rem,0.75vw,0.72rem)] uppercase tracking-[0.24em] text-faint transition-colors group-hover:text-chalk group-focus-visible:text-chalk">
              Scroll to power on
            </span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              className="cue-breathe h-4 w-4 shrink-0 text-gold"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </a>
        </div>
      </div>
      </div>
    </section>
  )
}
