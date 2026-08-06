import { ChipCanvas } from "@/components/chip/chip-canvas"
import { LayerRail, Nav } from "@/components/nav/nav"
import { ScrollRuntime } from "@/components/scroll-runtime"
import { About } from "@/components/sections/about"
import { Contact } from "@/components/sections/contact"
import { Experience } from "@/components/sections/experience"
import { Hero } from "@/components/sections/hero"
import { Projects } from "@/components/sections/projects"
import { Skills } from "@/components/sections/skills"

export default function Home() {
  return (
    <>
      {/* Fixed WebGL stage. Everything below scrolls over it. */}
      <ChipCanvas />

      <Nav />
      <LayerRail />

      <main id="main">
        <Hero />

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
