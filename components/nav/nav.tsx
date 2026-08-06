"use client"

import { LAYERS } from "@/lib/chip-config"
import { contact, navItems, profile } from "@/lib/data"
import { scrollToLayer } from "@/hooks/use-chip-timeline"
import { useActiveLayer } from "@/hooks/use-active-layer"

/**
 * Fixed navigation. The active item is whichever chip layer is currently
 * energised, so the nav and the 3D scene can never disagree.
 */
export function Nav() {
  const active = useActiveLayer()

  return (
    <header className="fixed inset-x-0 top-0 z-40">
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
                  aria-current={isActive ? "true" : undefined}
                  className="group relative px-3 py-2 text-sm text-mute transition-colors hover:text-chalk"
                  style={isActive ? { color: LAYERS[index].accent } : undefined}
                >
                  {item.label}
                  <span
                    className="absolute inset-x-3 -bottom-px h-px origin-left transition-transform duration-300"
                    style={{
                      background: LAYERS[index].accent,
                      transform: `scaleX(${isActive ? 1 : 0})`,
                    }}
                    aria-hidden
                  />
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
 * Vertical layer rail — a live read-out of which slab is energised. Doubles as
 * the mobile navigation, where the horizontal nav is hidden.
 */
export function LayerRail() {
  const active = useActiveLayer()

  return (
    <div className="fixed left-[max(1rem,env(safe-area-inset-left))] top-1/2 z-40 hidden -translate-y-1/2 lg:block">
      <ul className="flex flex-col gap-4">
        {LAYERS.map((layer, i) => {
          const isActive = i === active
          return (
            <li key={layer.id}>
              <button
                type="button"
                onClick={() => scrollToLayer(layer.id)}
                className="group flex items-center gap-3"
                aria-label={`Go to ${layer.label}`}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className="block h-px transition-all duration-500"
                  style={{
                    width: isActive ? 34 : 16,
                    background: isActive ? layer.accent : "#2a2a33",
                  }}
                  aria-hidden
                />
                <span
                  className="font-mono text-[0.65rem] uppercase tracking-[0.16em] transition-all duration-500"
                  style={{
                    color: isActive ? layer.accent : "#5a5d69",
                    opacity: isActive ? 1 : 0.55,
                  }}
                >
                  {layer.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
