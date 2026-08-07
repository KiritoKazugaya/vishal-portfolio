import { contact, profile } from "@/lib/data"
import s from "./hero.module.css"

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
      {/* Bottom padding is tighter than the top so the scroll cue sits low in frame.

          svh, not vh. On a phone `100vh` is the viewport with the URL bar
          retracted, so the panel is taller than what is actually on screen and
          the scroll cue at its bottom edge sits under the browser chrome on
          first paint. svh is the small — always-visible — viewport, which is
          the one the cue has to fit inside. Skills already uses it. */}
      <div className="sticky top-0 flex h-svh w-full flex-col justify-between overflow-hidden pt-[7rem] pb-[clamp(1.5rem,4vh,2.75rem)] md:pt-[9rem]">
      {/*
        Actions sit where the navigation will be: same vertical offset (py-5),
        same .shell, centred like the nav's own link row. Absolutely positioned
        so it does not join the panel's justify-between distribution — the name
        and the closing block keep the top and bottom of the frame to themselves.
      */}
      <div data-hero-copy className="absolute inset-x-0 top-0 z-10">
        <div className="shell flex flex-wrap items-center justify-center gap-3 py-5">
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

      <div data-hero-copy className="shell">
        <p className="eyebrow mb-[clamp(0.75rem,1.4vw,1.25rem)]">
          {profile.role} · {profile.location}
        </p>
        {/* Gold inlay clips at the glyph baseline, so the line box gets room to
            spare. Back to 7.6vw now the actions have left this row. */}
        <h1 className="inlay max-w-[15ch] pb-[0.08em] text-[clamp(2.35rem,7.6vw,6rem)] font-bold leading-[0.95] tracking-[-0.03em]">
          {profile.name}
        </h1>
      </div>

      <div data-hero-copy className="shell">
        <p className="max-w-[24ch] text-[clamp(1.25rem,2.6vw,2.35rem)] font-semibold leading-[1.15] tracking-[-0.02em] text-chalk">
          {profile.headline}
        </p>

        {/* Recessed pill on near-black: the travelling spark is what makes it
            findable, and the chevrons below say which way to go. */}
        {/* Nudged back to the viewport centre. Everything else aligns to the
            content column, but this cue points at the chip, and the chip is
            centred on the viewport — the rail reservation would otherwise push
            it ~110px off its own subject. Collapses to 0 below 1024px. */}
        <div className="mt-[clamp(1.75rem,3.5vh,3rem)] flex translate-x-[calc(var(--rail-space)/-2)] justify-center">
          <a href="#package" aria-label="Scroll down to power on the chip" className={s.cue}>
            <span className={`spark-frame ${s.pill}`}>
              <span className={`inlay-soft ${s.label}`}>Scroll to power on</span>
            </span>

            <svg viewBox="0 0 40 38" className={s.chevrons} aria-hidden focusable="false">
              <defs>
                {/*
                  One gradient in user space across the whole stack, so the three
                  chevrons read as a single machined piece catching one light
                  source — the same alternating specular/dark banding the gold
                  headings use.
                */}
                <linearGradient id="cue-gold" x1="0" y1="0" x2="0" y2="38" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#7d5f25" />
                  <stop offset="11%" stopColor="#f6e6ba" />
                  <stop offset="22%" stopColor="#c9a24d" />
                  <stop offset="38%" stopColor="#fffbe8" />
                  <stop offset="52%" stopColor="#96742a" />
                  <stop offset="68%" stopColor="#f8ecbb" />
                  <stop offset="84%" stopColor="#cda751" />
                  <stop offset="100%" stopColor="#7d5f25" />
                </linearGradient>
              </defs>

              <g
                className={s.stack}
                fill="none"
                stroke="url(#cue-gold)"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path className={s.chev} d="M5 4 L20 15 L35 4" />
                <path className={s.chev} d="M5 15 L20 26 L35 15" />
                <path className={s.chev} d="M5 26 L20 37 L35 26" />
              </g>
            </svg>
          </a>
        </div>
      </div>
      </div>
    </section>
  )
}
