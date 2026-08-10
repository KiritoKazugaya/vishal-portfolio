"use client"

import type { CSSProperties } from "react"
import { useEffect, useRef, useState } from "react"
import { Download } from "lucide-react"

import { LAYERS } from "@/lib/chip-config"
import { contact, navItems, profile } from "@/lib/data"
import type { LayerId } from "@/lib/types"
import { scrollToLayer, setScrollLock } from "@/hooks/use-chip-timeline"
import { useActiveLayer, useHeroDone } from "@/hooks/use-active-layer"
import { ThemeToggle } from "./theme-toggle"
import s from "./nav.module.css"

/**
 * The chapter list, drawn as a length of board trace.
 *
 * Extracted so the desktop rail and the mobile sheet render the same markup
 * rather than two lists that have to be kept in step. The energised run and the
 * travelling spark are positioned by (i + 0.5) / n, so anything that changes
 * the row rhythm has to change it for both — which is exactly why there is only
 * one copy of it.
 */
function TraceList({
  className,
  onPick,
}: {
  className?: string
  onPick?: (id: LayerId) => void
}) {
  const active = useActiveLayer()

  return (
    <ol
      className={`${s.list} ${className ?? ""}`}
      style={
        {
          "--i": active,
          "--n": LAYERS.length,
          "--lit": `var(${LAYERS[active]?.cssAccent ?? LAYERS[0].cssAccent})`,
        } as CSSProperties
      }
    >
      {/* Board trace: the dim run, the energised length, and the charge
          sitting where the current has reached. */}
      <span className={s.spine} aria-hidden />
      <span className={s.spineLive} aria-hidden />
      <span className={s.spark} aria-hidden />

      {LAYERS.map((layer, i) => {
        const isActive = i === active
        return (
          <li key={layer.id}>
            <button
              type="button"
              onClick={() => (onPick ?? scrollToLayer)(layer.id)}
              data-active={isActive}
              aria-current={isActive ? "true" : undefined}
              className={s.item}
              style={{ "--pin": `var(${layer.cssAccent})` } as CSSProperties}
            >
              <span className={s.padWrap} aria-hidden>
                <span className={s.pad} />
              </span>
              <span className={s.stub} aria-hidden />
              <span className={s.num} aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className={s.label}>{layer.label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * Fixed navigation, held back until the package has finished separating.
 *
 * During the hero act it has nothing to point at and simply sat over the chip
 * and the opening copy, so it stays out of the way and drops in when the first
 * chapter begins. `inert` while hidden keeps it out of the tab order too — a
 * keyboard user should not land on links to sections that are not on screen yet.
 *
 * Below 768px the bar keeps only the wordmark and the controls move out to a
 * fixed cluster that is a SIBLING of <header>, not a child. That placement is
 * the whole point: `inert` cannot reach a sibling, so a phone gets a way into
 * the page during the 400vh hero instead of four screens of scrolling with no
 * exit. On desktop that act has the rail alongside it; on a phone it had
 * nothing at all.
 */
export function Nav() {
  const active = useActiveLayer()
  const shown = useHeroDone()
  const [open, setOpen] = useState(false)
  const sheetRef = useRef<HTMLDialogElement>(null)

  /* The closed trigger is lit by the chapter you are in, so it reports position
     in that layer's own colour without spending any screen space on a label. */
  const pin = `var(${LAYERS[active]?.cssAccent ?? LAYERS[0].cssAccent})`

  /*
   * showModal() rather than the open attribute, deliberately.
   *
   * It is the only thing in the platform that supplies a focus trap, focus
   * restore, Escape, background inert-ing and top-layer painting together. This
   * codebase has none of those in one place — the case study modal focuses its
   * close button and listens for Escape but does not trap — and top layer also
   * retires the stacking question that put that modal under the nav once
   * already.
   */
  useEffect(() => {
    const d = sheetRef.current
    if (!d) return
    if (open && !d.open) d.showModal()
    else if (!open && d.open) d.close()
  }, [open])

  /*
   * Escape is intercepted, not observed.
   *
   * The obvious wiring is onClose -> setOpen(false), and it is a trap. `close`
   * is dispatched as a queued task and does not bubble, so it is the one signal
   * here that can arrive late or not at all — and the thing riding on it is
   * releasing the scroll lock. Miss it once and the page is frozen with nothing
   * on screen to explain why. Measured in a real engine: a native `close`
   * listener saw zero events for a dialog that had definitely closed.
   *
   * `cancel` fires synchronously on the Escape keydown and is cancelable, so
   * preventing it and routing through state keeps React the single source of
   * truth: state closes the dialog, never the other way round. The `close`
   * listener stays as a backstop for any dismissal the platform owns outright,
   * and is attached natively because neither event bubbles to React's root.
   */
  useEffect(() => {
    const d = sheetRef.current
    if (!d) return
    const cancel = (e: Event) => {
      e.preventDefault()
      setOpen(false)
    }
    const close = () => setOpen(false)
    d.addEventListener("cancel", cancel)
    d.addEventListener("close", close)
    return () => {
      d.removeEventListener("cancel", cancel)
      d.removeEventListener("close", close)
    }
  }, [])

  /*
   * Both locks, and neither is redundant.
   *
   * setScrollLock only calls scroller.stop(), and under prefers-reduced-motion
   * Lenis is never constructed at all — so for that visitor the body overflow
   * is the only lock there is. It is also the only one covering Space and
   * PageDown, which Lenis never listens for. Keyed on `open` with a cleanup so
   * the page cannot be stranded frozen; scrollbar-gutter: stable in globals.css
   * already handles the reflow.
   */
  useEffect(() => {
    /*
     * Only ever write the lock, never write the release.
     *
     * `overflow = open ? "hidden" : ""` looks equivalent and is not: on mount,
     * with the sheet closed, it wrote "" over whatever was already there. Three
     * components share this one property and the preloader sets it first, so
     * this line silently unlocked the page underneath the power-on plate for the
     * entire sequence. Found by a smoke test, not by reading the code.
     */
    if (!open) return
    setScrollLock(true)
    document.body.style.overflow = "hidden"
    return () => {
      setScrollLock(false)
      document.body.style.overflow = ""
    }
  }, [open])

  /*
   * Close on the way up past the breakpoint.
   *
   * The sheet deliberately has no media query. Hiding it with one would pull it
   * out of the top layer and un-inert the document while `open` stayed true,
   * leaving both locks applied and nothing on screen to explain the frozen
   * page. Closing it in JS keeps the lock and the UI on the same switch.
   */
  useEffect(() => {
    if (!open) return
    const m = window.matchMedia("(min-width: 64rem)")
    const sync = () => {
      if (m.matches) setOpen(false)
    }
    sync()
    m.addEventListener("change", sync)
    return () => m.removeEventListener("change", sync)
  }, [open])

  /*
   * Release the locks synchronously, THEN jump.
   *
   * lenis.scrollTo begins `if ((this.isStopped || this.isLocked) && !force)
   * return`, so a jump issued while the sheet still holds the lock is a silent
   * no-op — the sheet would close and the page would sit exactly where it was.
   * setOpen is async, so the effect above cannot be the thing that releases it
   * in time. The effect stays the authority and the cleanup; this is only the
   * ordering.
   */
  const pick = (id: LayerId) => {
    setScrollLock(false)
    document.body.style.overflow = ""
    setOpen(false)
    scrollToLayer(id)
  }

  return (
    <>
      <header
        className={`page-inset ${s.top}`}
        data-shown={shown}
        inert={!shown}
      >
        <nav
          aria-label="Primary"
          className={`shell ${s.topRow} flex items-center justify-between gap-6 py-3 md:py-5`}
        >
          <a
            href="#hero"
            className={`${s.wordmark} font-mono text-xs tracking-[0.2em] text-chalk transition-opacity hover:opacity-70`}
          >
            {profile.firstName.toUpperCase()}
            <span className="text-faint">.AKKALA</span>
          </a>

          {/*
            xl, not md. At 768px this row needed 720px of a 697px shell even
            before the toggle claimed a lane, and the résumé button was pushed
            out past the content edge as a result.

            1024 does not fix it either, and for a non-obvious reason: that is
            exactly where .page-inset starts reserving --rail-space (14rem) for
            the chapter rail, so the shell loses 224px at the same instant these
            links appear. 1280 is the first width where the wordmark, five
            links, the résumé button and the toggle's lane all fit beside the
            rail.

            Nothing is lost between 1024 and 1280: the rail is on screen there
            and lists the same five chapters with the same active state. Below
            1024 the sheet covers it.
          */}
          <ul className="hidden items-center gap-1 xl:flex">
            {navItems.map((item) => {
              const index = LAYERS.findIndex((l) => l.id === item.layer)
              const isActive = index === active
              return (
                <li key={item.layer}>
                  <button
                    type="button"
                    onClick={() => scrollToLayer(item.layer)}
                    data-active={isActive}
                    aria-current={isActive ? "true" : undefined}
                    className={s.topItem}
                    style={{ "--pin": `var(${LAYERS[index].cssAccent})` } as CSSProperties}
                  >
                    {item.label}
                    <span className={s.topRule} aria-hidden />
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Résumé only. The toggle used to sit at the edge of this row, which
              meant it did not exist until the hero act ended — this element is
              inert and transparent for all 400vh of it, so there was no way to
              change theme on the screen the site opens with. It now lives in
              the fixed cluster below at every width. Below md the résumé moves
              into the sheet as well; there is 5px of slack in this row at
              320px. */}
          <div className="hidden shrink-0 items-center gap-2.5 md:flex">
            <a
              href={contact.resume}
              download
              className="rounded-full border border-edge px-4 py-2 text-xs font-medium text-chalk transition-colors hover:border-cyan hover:text-cyan"
            >
              Résumé
            </a>
          </div>
        </nav>
      </header>

      {/* Outside <header> on purpose — see the note on Nav above. This is the
          one place the theme toggle lives, at every width: the only spot on the
          page that is neither inert nor hidden during the hero. */}
      <div className={s.cluster}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="nav-sheet"
          aria-label="Open navigation"
          className={s.trigger}
          style={{ "--pin": pin } as CSSProperties}
        >
          {/* Three runs with the middle one tapping off into a lit via — the
              rail's own idiom at glyph scale. There is no open/close morph:
              the document is inert while the sheet is up, so the second state
              could never be reached. */}
          <span className={s.glyph} aria-hidden>
            <span className={s.trace} />
            <span className={s.trace} />
            <span className={s.trace} />
            <span className={s.via} />
          </span>
        </button>

        <ThemeToggle />
      </div>

      <dialog
        id="nav-sheet"
        ref={sheetRef}
        aria-label="Navigation"
        className={s.sheet}
        /* A click on ::backdrop reports the dialog itself as the target. That
           only stays true because the dialog carries no padding — every pixel
           of it is .sheetInner, so nothing inside can report the dialog. */
        onClick={(e) => {
          if (e.target === sheetRef.current) setOpen(false)
        }}
      >
        <div
          className={s.sheetInner}
          data-lenis-prevent
          style={{ "--lit": pin } as CSSProperties}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className={s.grabber}
          >
            <span className={s.grabberBar} aria-hidden />
          </button>

          <p className={s.readout}>
            {String(active + 1).padStart(2, "0")} /{" "}
            {String(LAYERS.length).padStart(2, "0")} ·{" "}
            {(LAYERS[active] ?? LAYERS[0]).label}
          </p>

          <nav aria-label="Chapters">
            <TraceList className={s.sheetList} onPick={pick} />
          </nav>

          <div className="rule" />

          <a
            href={contact.resume}
            download
            className={s.sheetResume}
            onClick={() => setOpen(false)}
          >
            Résumé
            <span className={s.sheetResumeMeta}>
              PDF
              <Download aria-hidden />
            </span>
          </a>
        </div>
      </dialog>
    </>
  )
}

/**
 * Vertical chapter rail, styled as the package's pin rail: a spine with a
 * contact pad per chapter and a pin number beside it.
 *
 * The previous version drew inactive items at #5a5d69 over 55% opacity — about
 * 2:1 against the page, which is invisible rather than subtle. The resting
 * label now sits near 8:1, and the active chapter is carried by colour, a
 * filled pad, a glow and a lengthened lead-in rather than by contrast alone.
 */
export function LayerRail() {
  return (
    <nav aria-label="Chapters" className={s.rail}>
      <TraceList />
    </nav>
  )
}
