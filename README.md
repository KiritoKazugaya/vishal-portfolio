# vishal-portfolio

A personal portfolio built as a single scroll-driven scene. A GPU package powers
on, rotates, and separates into five slabs, and each slab is a chapter of the
site.

**Live site:** [vishal-akkala.vercel.app](https://vishal-akkala.vercel.app)

---

## The idea

Most engineering portfolios are a list of sections stacked vertically. This one
is a single object taken apart, because a GPU package is already a five-layer
stack and the site already had five things to say. Scrolling does not move you
past sections. It disassembles the chip, and each layer's gap is where a chapter
lives.

| Layer | Chapter |
| --- | --- |
| `package`, the heat spreader | About |
| `die`, the silicon | Skills |
| `interposer` | Projects |
| `substrate` | Experience and education |
| `contacts`, the BGA array | Contact |

The chip is one WebGL context fixed behind the whole page. It never scrolls. The
page scrolls over it, and scroll position reaches the scene through a store
rather than through React state, because a re-render per frame would be a
re-render per frame.

---

## Stack

| | |
| --- | --- |
| **Framework** | Next.js 16 (App Router, Turbopack), React 19, TypeScript 5 |
| **3D** | three.js, React Three Fiber, drei |
| **Motion** | GSAP with ScrollTrigger for the chip timeline, Motion for component transitions, Lenis for smooth scroll |
| **Styling** | Tailwind CSS v4 (`@theme`, CSS-variable driven), plus CSS Modules for anything stateful |
| **Icons** | lucide-react |
| **Testing** | Playwright |
| **Hosting** | Vercel |

Everything renders statically. There is no backend, no database and no client
data fetching. The entire site is one prerendered route plus a WebGL scene.

---

## Architecture

```
app/
  layout.tsx            root shell, metadata, pre-paint theme script
  page.tsx              the single route, assembling preloader, canvas, nav, chapters
  opengraph-image.png   1200x630 social card
  error.tsx             route error boundary, keeping the resume reachable

components/
  chip/                 WebGL: canvas host, scene, per-layer slabs
  circuit/              SVG conductors drawn behind the hero
  nav/                  top bar, chapter rail, mobile sheet, theme toggle
  preloader/            power-on sequence, gated on real scene readiness
  sections/             the five chapters
  ui/                   Chapter, the one wrapper every section shares

hooks/
  use-chip-timeline.ts  GSAP and Lenis wiring, scroll lock, scrollToLayer
  use-active-layer.ts   subscriptions to the chip store
  use-reduced-motion.ts motion, pointer and mount probes
  use-theme.ts          theme subscription

lib/
  chip-config.ts        the five layers, their geometry, their accents
  scroll-store.ts       mutable bridge between GSAP and the render loop
  theme.ts              the single writer for light and dark
  data.ts               all copy, projects, experience, skills
```

### The scroll timeline

The hero owns 400vh of scroll and is deliberately not pinned. Pinning the
document would break deep links, in-page find, and scroll restoration, so the
hero is instead a 400vh section with a `sticky` inner panel, scrubbed across four
phases:

| Phase | Range | What happens |
| --- | --- | --- |
| `power` | 0.00 to 0.20 | Circuits draw, contacts illuminate, chip flat and face-on |
| `rotate` | 0.20 to 0.46 | Chip tilts to three-quarter view, camera dollies in |
| `separate` | 0.46 to 0.82 | Slabs translate apart on the vertical axis |
| `settle` | 0.82 to 1.00 | Stack settles into its reading position |

After that the stack stays on screen as a fixed backdrop, and each chapter lights
its own layer as it passes the viewport centre.

### The store

`lib/scroll-store.ts` is a plain mutable object rather than React state. GSAP
writes to it every frame and the render loop reads it every frame. React
subscribes only to the few values that actually change the DOM (active chapter,
hero done, scene ready) through `useSyncExternalStore`. This is the single
decision that the whole animation layer rests on.

### Theme

`data-theme` on `<html>` is the source of truth, and exactly one function writes
it. A pre-paint inline script resolves the theme before first render, so the page
never flashes. Two accent tiers exist, because one cannot do both jobs on a light
ground: `--accent-*` carries text and clears 4.5:1, while `--neon-*` is display
type and card rims at the 3:1 bar.

---

## How it was built

Roughly the order the work happened in.

**1. Content before pixels.** The resume, the project inventory, and an honest
triage of what was worth showing. Metrics that are estimates are marked as
estimates on the page, with an asterisk and a footnote, rather than quietly
presented as measurements.

**2. The scene.** One WebGL context, five textured slabs, the scroll timeline,
and the store that connects them. This is where the pinning approach was thrown
out and rebuilt.

**3. The chapters.** Five sections sharing one `Chapter` wrapper, each bound to
its layer by a single `data-layer` attribute. That attribute is the only coupling
between the copy and the 3D scene.

**4. Interaction passes.** The projects coverflow and case-study modal, the
skills graph with a working shell, the experience timeline with flip-in-place
cards, and the live map in the contact section.

**5. The power-on sequence.** A preloader covering the roughly 1.7 second gap
between hydration and the first WebGL frame. It ends on a real signal, namely the
scene reporting its textures resolved, with a floor so the animation reads and a
ceiling so that a failure can never leave the page covered.

**6. Light theme.** Not an inversion. Engraved gold is a dark-ground effect and
reads as brown on white, so light mode uses neon display type and solid neon card
rims instead.

**7. Mobile.** Below 768px there was no navigation at all, because the desktop
links and the chapter rail both hide. A native `<dialog>` bottom sheet now
carries the same board-trace markup as the rail, and the controls sit in a fixed
cluster outside `<header>`, which is `inert` for the whole hero act.

**8. Hardening.** Accessibility and performance passes, then the smoke tests.

---

## Testing

```bash
npm test
```

Three Playwright tests, one for each bug that actually shipped. This is not a
full suite. The site is a static page with no backend, and broad coverage would
be theatre. What it does have is three scroll locks, two native dialogs, and a
preloader that holds the page, and none of those fail visibly. A stranded scroll
lock looks exactly like a page that has finished loading.

1. A reduced-motion visitor is released before the preloader's ceiling.
2. Escape closes the mobile sheet and gives the page back.
3. The case-study dialog is `display: none` when closed, and restores focus.

Each test was verified to fail with its bug reintroduced before being kept. They
run against a production build rather than `next dev`, because two of the three
regressions were CSS cascade and hydration-timing issues, and dev-mode source
order is not the order that ships.

---

## Accessibility

Not an afterthought, and not a claim without a number behind it.

* Every text node was measured in both themes. Zero WCAG AA failures, with a
  contrast floor of 5.07 in dark and 4.68 in light across 505 nodes.
* `prefers-reduced-motion` replaces the WebGL scene with a static plate and
  disables the scrubbed timeline entirely.
* The site is fully keyboard operable. The skills graph is a set of buttons over
  a text list that is the default view, and both dialogs trap and restore focus
  through `showModal()`.
* Touch targets meet the 44px floor.
* The site works without WebGL, so locked-down browsers get the static plate.

---

## Running locally

```bash
npm install
npm run dev
```

```bash
npm run build && npm start   # production build
npm run lint                 # eslint
npm test                     # playwright smoke tests
```

Node 20 or later. No environment variables are required, because there is nothing
to configure.

---

## Licence

The code is free to read and learn from. The written content, the resume, the
project write-ups and the photography are mine, so please do not reuse those.
