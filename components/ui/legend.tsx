import s from "./legend.module.css"

/**
 * A key to the piece, placed where the question forms.
 *
 * The hero cannot carry this. All three of its blocks are `data-hero-copy` and
 * fade out as the package separates, so anything explanatory put there is gone
 * by the moment it would be needed. Here it sits still, immediately after the
 * chip has finished coming apart and immediately before the first chapter fills
 * the first gap.
 *
 * Deliberately not `.inlay`. This is a caption, so it reads in one flat colour
 * and lets the headings stay the only gold on the page.
 */
export function Legend() {
  return (
    <section aria-label="About this page" className={s.band}>
      <div className="shell">
        <div className={s.inner} data-reveal>
          <p className={`eyebrow ${s.eyebrow}`}>How to read this page</p>
          <p className={s.line}>
            The chip powers on, then separates as you scroll. Each gap it opens
            is a chapter, and the same current lights the rest of the page. Black
            and gold is the hardware itself: fibreglass substrate, gold-plated
            contacts.
          </p>
        </div>
      </div>
    </section>
  )
}
