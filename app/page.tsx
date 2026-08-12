import { ChipCanvas } from "@/components/chip/chip-canvas"
import { Preloader } from "@/components/preloader/preloader"
import { LayerRail, Nav } from "@/components/nav/nav"
import { ScrollRuntime } from "@/components/scroll-runtime"
import { About } from "@/components/sections/about"
import { Contact } from "@/components/sections/contact"
import { Experience } from "@/components/sections/experience"
import { Hero } from "@/components/sections/hero"
import { Legend } from "@/components/ui/legend"
import { Projects } from "@/components/sections/projects"
import { Skills } from "@/components/sections/skills"

export default function Home() {
  return (
    <>
      {/* Covers the gap until the WebGL chip is ready, then hands off to it.
          Rendered server-side so it is painted before anything else; the
          noscript rule removes it for anyone without JS, who would otherwise
          be left staring at a loader that can never finish. */}
      <noscript>
        <style>{`[data-preloader]{display:none!important}`}</style>
      </noscript>
      <Preloader />

      {/* Fixed WebGL stage. Everything below scrolls over it. */}
      <ChipCanvas />

      <Nav />
      <LayerRail />

      <main id="main" className="page-inset">
        <Hero />

        {/* The key to the piece, at the one moment it is needed: the package has
            just finished separating, and the first chapter has not yet filled
            the first gap. */}
        <Legend />

        {/* Chapters begin once the package has separated. Each maps to a slab. */}
        <div id="chapters" className="relative">
          <About />
          <Skills />
          <Projects />
          <Experience />
          <Contact />
        </div>
      </main>

      <ScrollRuntime />
    </>
  )
}
