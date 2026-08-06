import type { LayerId } from "./types"

/**
 * Single source of truth for the chip stack.
 *
 * Both the R3F scene and the DOM content read this, so a layer and its
 * chapter can never drift apart. Order is top -> bottom, which is also
 * the reading order of the page.
 */
export interface LayerDef {
  id: LayerId
  /** Chapter title shown alongside the layer. */
  label: string
  /** Semiconductor name, shown as the technical caption. */
  technical: string
  texture: string
  /** Edge length in world units. Lower layers are wider, as in a real package. */
  size: number
  /** Slab thickness in world units. */
  thickness: number
  /** Resting Y offset once the stack is fully separated. */
  separatedY: number
  /** Accent colour used for this layer's energy and focus lighting. */
  accent: string
  /** Emissive tint of the slab itself when active. */
  emissive: string
}

/**
 * Assembled thickness is the sum of the slabs; separated positions are spread
 * wide enough that a chapter of copy fits *inside* each opening, which is where
 * the content actually sits. The interposer gap is widest because Projects
 * carries several times more content than any other chapter.
 */
export const LAYERS: LayerDef[] = [
  {
    id: "package",
    label: "About",
    technical: "Integrated heat spreader · package lid",
    texture: "/assets/chip/layer-top.webp",
    size: 4.0,
    thickness: 0.17,
    separatedY: 4.6,
    accent: "#7dd3fc",
    emissive: "#0e3b52",
  },
  {
    id: "die",
    label: "Skills",
    technical: "Silicon die · compute fabric",
    texture: "/assets/chip/layer-die.webp",
    size: 2.45,
    thickness: 0.1,
    separatedY: 1.8,
    accent: "#c7a24a",
    emissive: "#4a3a12",
  },
  {
    id: "interposer",
    label: "Projects",
    technical: "Silicon interposer · die-to-package routing",
    texture: "/assets/chip/layer-interposer.webp",
    size: 3.5,
    thickness: 0.12,
    separatedY: -1.2,
    accent: "#a78bfa",
    emissive: "#2b1f52",
  },
  {
    id: "substrate",
    label: "Experience",
    technical: "Package substrate · signal fan-out",
    texture: "/assets/chip/layer-substrate.webp",
    size: 4.0,
    thickness: 0.14,
    separatedY: -4.0,
    accent: "#34d399",
    emissive: "#0d3d2c",
  },
  {
    id: "contacts",
    label: "Contact",
    technical: "BGA solder-ball array · board interface",
    texture: "/assets/chip/layer-bga.webp",
    size: 4.15,
    thickness: 0.16,
    separatedY: -6.7,
    accent: "#f0b429",
    emissive: "#4a3208",
  },
]

export const LAYER_IDS = LAYERS.map((l) => l.id)

export function layerIndex(id: LayerId) {
  return LAYERS.findIndex((l) => l.id === id)
}

/** Y position of each slab when the chip is fully assembled. */
export function assembledY(index: number) {
  let y = 0
  for (let i = 0; i < index; i++) y -= LAYERS[i].thickness / 2 + LAYERS[i + 1].thickness / 2
  return y
}

/**
 * Scroll phases of the pinned hero act, as fractions of the pin duration.
 * Kept here so the 3D timeline and the DOM copy stay in step.
 */
export const PHASES = {
  /** Circuits draw, contacts illuminate, chip is flat and face-on. */
  power: [0.0, 0.2] as const,
  /** Chip tilts into a three-quarter view, camera dollies in. */
  rotate: [0.2, 0.46] as const,
  /** Slabs translate apart on the vertical axis. */
  separate: [0.46, 0.82] as const,
  /** Stack settles into its reading position at the side of the viewport. */
  settle: [0.82, 1.0] as const,
}
