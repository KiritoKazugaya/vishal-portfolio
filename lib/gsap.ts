import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

/**
 * Single registration point. Importing gsap from here guarantees ScrollTrigger
 * is registered exactly once, and never during SSR.
 */
let registered = false

if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger)
  registered = true
}

export { gsap, ScrollTrigger }
