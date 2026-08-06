# Vishal Naveen Akkala — Portfolio

A scroll-driven portfolio built around a GPU package that powers on, rotates, and
separates into five layers. Each layer is a chapter of the site.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build + typecheck
npm run lint
```

## How the chip works

The chip is **real geometry**, not a sequence of images. Five `BoxGeometry`
slabs sit on one vertical axis; the source renders are mapped onto their top
faces (`material-2` — index 2 is `+Y` on a box).

That decision is the load-bearing one. The source art was nine renders from
three different cameras — face-on, three-quarter, and a low-angle exploded view
— and flat images cannot be interpolated between camera positions. With
geometry, the entire opening is a single continuous camera move: overhead
(which reads as the face-on plate), swinging down to three-quarter, then pulling
back as the slabs separate. Nothing has to cross-fade.

| File | Role |
| --- | --- |
| `lib/chip-config.ts` | The five layers: size, thickness, resting/separated Y, accent. Read by the 3D scene *and* the content. |
| `lib/scroll-store.ts` | Mutable bridge between GSAP and the render loop. Not React state — 60fps through `setState` would re-render the tree every frame. |
| `hooks/use-chip-timeline.ts` | Lenis + ScrollTrigger. Owns the hero scrub and chapter activation. |
| `components/chip/` | Scene, layers, camera rig, current flow. |
| `components/circuit/` | SVG PCB traces (`stroke-dashoffset`), drawn during power-on. |

### Scroll structure

The hero is a 400vh section with a **`sticky`** inner panel — not a GSAP pin.
Pinning the whole document breaks deep links, in-page find, and scroll
restoration, and buries the projects several viewport-heights deep. It also
produced a runaway pin-spacer (96,000px) during development. Sticky has no
spacer to run away.

After the hero, content is normal page flow. The canvas stays fixed behind it,
and the chapter nearest the viewport centre lights its layer.

## Editing content

**All copy lives in `lib/data.ts`.** Nothing in that file is imported by the 3D
scene, so copy edits cannot break the animation.

### Metrics

Numbers carrying `assumed: true` are **placeholders, not measurements**:

```ts
{ label: "ROC-AUC", value: 91, suffix: "%", assumed: true }
```

Search the file for `assumed` to find every one. Figures without the flag came
from the résumé or were measured from the project's own source — for example the
face classifier's 37.5% across 135 classes, which is read from its
`class_dictionary.json` rather than estimated.

## Accessibility

- `prefers-reduced-motion` swaps the canvas for a static exploded plate and
  skips Lenis entirely; all content stays reachable.
- No WebGL (older or locked-down browsers) falls back to the same plate.
- The skill graph is `md`-and-up only; below that, and for screen readers, the
  same data renders as a grouped list.
- Every skill node is focusable and announces where the skill shipped.

## Deploying

Free tier on Vercel:

```bash
npx vercel --prod
```

Or push to GitHub and import the repo at vercel.com — no environment variables
and no configuration are needed; it is a fully static build.

## Notes

- `components/chip/**` disables `react-hooks/immutability`. R3F's model *is*
  imperative mutation inside the render loop; routing it through React state
  would defeat the point.
- `ChipCanvas` dispatches one `resize` after mount. R3F's container measurement
  can settle at 0×0 inside a `fixed` parent and never re-fires, leaving the
  canvas at its 300×150 default.
