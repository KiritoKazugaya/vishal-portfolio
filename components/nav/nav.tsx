"use client"

import type { CSSProperties } from "react"

import { LAYERS } from "@/lib/chip-config"
import { contact, navItems, profile } from "@/lib/data"
import { scrollToLayer } from "@/hooks/use-chip-timeline"
import { useActiveLayer } from "@/hooks/use-active-layer"
import s from "./nav.module.css"

/**
 * Fixed navigation. The active item is whichever chip layer is currently
 * energised, so the nav and the 3D scene can never disagree.
 */
export function Nav() {
  const active = useActiveLayer()

  return (
    <header className="page-inset fixed inset-x-0 top-0 z-40">
      <nav
        aria-label="Primary"
        className="shell flex items-center justify-between gap-6 py-5"
      >
        <a
          href="#hero"
          className="font-mono text-xs tracking-[0.2em] text-chalk transition-opacity hover:opacity-70"
        >
          {profile.firstName.toUpperCase()}
          <span className="text-faint">.AKKALA</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
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
                  style={{ "--pin": LAYERS[index].accent } as CSSProperties}
                >
                  {item.label}
                  <span className={s.topRule} aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>

        <a
          href={contact.resume}
          download
          className="rounded-full border border-edge px-4 py-2 text-xs font-medium text-chalk transition-colors hover:border-cyan hover:text-cyan"
        >
          Résumé
        </a>
      </nav>
    </header>
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
  const active = useActiveLayer()

  return (
    <nav aria-label="Chapters" className={s.rail}>
      <div className="glass px-2.5 py-3">
        <ol className={s.list}>
          <span className={s.spine} aria-hidden />

          {LAYERS.map((layer, i) => {
            const isActive = i === active
            return (
              <li key={layer.id}>
                <button
                  type="button"
                  onClick={() => scrollToLayer(layer.id)}
                  data-active={isActive}
                  aria-current={isActive ? "true" : undefined}
                  className={s.item}
                  style={{ "--pin": layer.accent } as CSSProperties}
                >
                  <span className={s.padWrap} aria-hidden>
                    <span className={s.pad} />
                  </span>
                  <span className={s.num} aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={s.label}>{layer.label}</span>
                  <span className={s.lead} aria-hidden />
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
