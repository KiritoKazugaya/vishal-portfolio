"use client"

import { useEffect } from "react"

/**
 * Route-level error boundary.
 *
 * Everything visually load-bearing on this page is a client component — WebGL
 * through R3F, a GSAP timeline, a smooth scroller, and Framer transitions — and
 * any of them can throw on an exotic GPU driver or an older browser. Without
 * this file that throw takes the whole page to Next's default error screen,
 * which is a stack trace in development and a bare "something went wrong" in
 * production. Neither is what a recruiter should see.
 *
 * The résumé link is the point of the fallback: if the experience fails, the
 * one thing the visitor actually came for still has to be reachable.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-void px-6 text-center">
      <p className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-faint">
        Something broke
      </p>

      <h1 className="max-w-[22ch] text-[clamp(1.5rem,4vw,2.25rem)] font-semibold leading-tight text-chalk">
        This page didn&rsquo;t load properly.
      </h1>

      <p className="max-w-[46ch] text-sm text-mute">
        It renders a live WebGL scene, which some browsers and locked-down
        machines refuse. Reloading usually fixes it, and the résumé below works
        either way.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-chalk px-5 py-2.5 text-sm font-semibold text-void transition-transform hover:scale-[1.03]"
        >
          Try again
        </button>
        <a
          href="/assets/Vishal-Naveen-Akkala-Resume.pdf"
          download
          className="rounded-full border border-edge px-5 py-2.5 text-sm font-medium text-chalk transition-colors hover:border-cyan hover:text-cyan"
        >
          Download résumé
        </a>
        <a
          href="mailto:vishalakkala203@gmail.com"
          className="rounded-full border border-edge px-5 py-2.5 text-sm font-medium text-chalk transition-colors hover:border-cyan hover:text-cyan"
        >
          Email me
        </a>
      </div>

      {error.digest ? (
        <p className="font-mono text-[0.65rem] text-faint">ref {error.digest}</p>
      ) : null}
    </main>
  )
}
