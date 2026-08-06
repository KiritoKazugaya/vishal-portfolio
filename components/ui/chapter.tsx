import type { CSSProperties, ReactNode } from "react"
import { LAYERS, layerIndex } from "@/lib/chip-config"
import type { LayerId } from "@/lib/types"

interface Props {
  id: LayerId
  title: string
  lead?: ReactNode
  children: ReactNode
  /** Skip the scrim + heading chrome (Skills builds its own full-bleed stage). */
  bare?: boolean
}

/**
 * A chapter of the page, bound to one chip layer.
 *
 * `data-layer` is the only coupling between the copy and the 3D scene, and the
 * content sits in `.shell` — the same width the nav uses — so a chapter's left
 * and right edges line up exactly with the wordmark and the résumé button.
 */
export function Chapter({ id, title, lead, children, bare = false }: Props) {
  const def = LAYERS[layerIndex(id)]
  const style = { "--card-accent": def.accent } as CSSProperties

  return (
    <section
      id={id}
      data-layer={id}
      aria-labelledby={`${id}-heading`}
      className="relative py-24 md:py-36"
      style={style}
    >
      <div className="shell">
        <div className={bare ? "" : "chapter-scrim"}>
          <div data-reveal className="mb-10 md:mb-14">
            <div className="mb-4 flex items-center gap-3">
              <span
                className="h-px w-10 shrink-0"
                style={{ background: def.accent }}
                aria-hidden
              />
              <span className="eyebrow">{def.label}</span>
            </div>

            <h2 id={`${id}-heading`} className="h-chapter inlay">
              {title}
            </h2>

            {lead ? <p className="body-lead mt-5 max-w-3xl">{lead}</p> : null}
          </div>

          {children}
        </div>
      </div>
    </section>
  )
}
