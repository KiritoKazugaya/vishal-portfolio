import type { ReactNode } from "react"
import { LAYERS, layerIndex } from "@/lib/chip-config"
import type { LayerId } from "@/lib/types"

interface Props {
  id: LayerId
  title: string
  lead?: string
  children: ReactNode
  /** Full-bleed chapters (Projects) opt out of the narrow reading column. */
  wide?: boolean
}

/**
 * A chapter of the page, bound to one chip layer.
 *
 * `data-layer` is what the scroll timeline looks for — that attribute is the
 * only coupling between the copy and the 3D scene.
 */
export function Chapter({ id, title, lead, children, wide = false }: Props) {
  const def = LAYERS[layerIndex(id)]

  return (
    <section
      id={id}
      data-layer={id}
      aria-labelledby={`${id}-heading`}
      className="relative py-24 md:py-36"
    >
      <div className="shell">
        <div className={wide ? "" : "lg:ml-auto lg:w-[54%]"}>
          <div data-reveal className="mb-10">
            <div className="mb-4 flex items-center gap-3">
              <span
                className="h-px w-8 shrink-0"
                style={{ background: def.accent }}
                aria-hidden
              />
              <span className="eyebrow">{def.technical}</span>
            </div>

            <h2
              id={`${id}-heading`}
              className="text-4xl font-semibold tracking-tight text-chalk md:text-5xl"
            >
              {title}
            </h2>

            {lead ? (
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-mute md:text-lg">
                {lead}
              </p>
            ) : null}
          </div>

          {children}
        </div>
      </div>
    </section>
  )
}
