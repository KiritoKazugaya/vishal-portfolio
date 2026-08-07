"use client"

/**
 * CONTACT — the chip's output stage.
 *
 * Researched first (awwwards portfolio winners, awwwards "contact section /
 * creative developer" inspiration, Muzli's 2026 contact-page roundup,
 * PatternFly's clipboard-copy guidelines). Five ideas were taken:
 *
 * 1. BIG-TYPE ADDRESS AS THE FOCAL POINT. The awwwards contact-section entries
 *    are tagged "bigfont / text / creative" — the address *is* the headline
 *    rather than the last item of a list. Here it renders in gold `.inlay`, so
 *    the page's engraved-metal language carries the most important line.
 * 2. ONE FOCAL POINT, NOT A MENU. The 2026 roundups all converge on a single
 *    primary channel with everything else demoted. So: email up top, the other
 *    routes below as small secondary pads.
 * 3. COPY-TO-CLIPBOARD WITH A CONFIRMATION. PatternFly's pattern is content +
 *    button + explicit feedback. `mailto:` silently fails for anyone on webmail,
 *    so every route is also copyable, and the icon swaps to a check.
 * 4. A LIVE SIGNAL — status and local time. Award portfolios sell "a person is
 *    actually here" with a breathing availability dot and their real clock. It
 *    also sets an honest expectation about reply latency.
 * 5. PLACE AS A TRUST CUE. A map grounds a remote-hiring conversation. Kept
 *    neighbourhood-level and colour-matched so it reads as a component, not an
 *    embed someone forgot to style.
 *
 * The theme fit is that this is the BGA layer — the bottom of the package,
 * where the die finally talks to the board. So the section is literally an
 * output stage: an energised status pad, a pad array of channels with their
 * grid designators, and signal traces flowing out of the section into the
 * footer.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { Chapter } from "@/components/ui/chapter"
import { contact, profile, socials } from "@/lib/data"
import s from "./contact.module.css"

/*
 * Gainesville, Florida — neighbourhood level, deliberately. The bbox is a few
 * kilometres across so the pin reads as "this city", which is all a recruiter
 * needs. No street and no unit appears anywhere in this file.
 */
const LAT = 29.6206
const LON = -82.38
const PLACE = "Gainesville, Florida"
const TZ = "America/New_York"

const BBOX = [LON - 0.055, LAT - 0.036, LON + 0.055, LAT + 0.036]
  .map((n) => n.toFixed(4))
  .join(",")
const MAP_SRC =
  "https://www.openstreetmap.org/export/embed.html" +
  `?bbox=${encodeURIComponent(BBOX)}&layer=mapnik&marker=${LAT}%2C${LON}`
const MAP_LINK = `https://www.openstreetmap.org/?mlat=${LAT}&mlon=${LON}#map=12/${LAT}/${LON}`

const SUBJECT = encodeURIComponent("Hello Vishal — from your portfolio")

/** What the clipboard button hands over for a given route. */
function copyableFor(href: string) {
  if (href.startsWith("mailto:")) return contact.email
  if (href.startsWith("tel:")) return contact.phoneDisplay
  return href
}

/** BGA-style designator for pad n: A1, A2, B1, B2, … */
function designator(i: number) {
  return `${String.fromCharCode(65 + Math.floor(i / 2))}${(i % 2) + 1}`
}

export function Contact() {
  const [copied, setCopied] = useState<string | null>(null)
  const [localTime, setLocalTime] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* Clock is client-only so the server and the first paint cannot disagree. */
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hour: "numeric",
      minute: "2-digit",
    })
    const tick = () => setLocalTime(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const copy = useCallback(async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(key)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(null), 1900)
    } catch {
      /* Clipboard blocked (insecure context, denied permission). The link and
         the visible text both still work, so there is nothing to recover. */
    }
  }, [])

  return (
    <Chapter
      id="contacts"
      title="Contact"
      lead="If you are building something where the model is the easy part, I would like to hear about it."
    >
      <div className="grid gap-[clamp(0.85rem,1.6vw,1.25rem)] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* ------------------------------------------------ output stage */}
        <div
          data-reveal
          className="glass relative overflow-hidden p-[clamp(1.15rem,2.4vw,2.25rem)]"
        >
          <div
            aria-hidden
            className={`${s.bga} pointer-events-none absolute inset-x-0 bottom-0 h-28`}
          />

          {/* Availability — the loudest small thing in the section. */}
          <div className="relative flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-emerald/30 bg-emerald/[0.07] px-3 py-1.5">
              <span className={s.pulse} aria-hidden />
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-emerald">
                Open to work
              </span>
            </span>
            <p className="text-sm text-mute">{profile.available}</p>
          </div>

          {/* Primary channel, in big gold inlay. */}
          <div className="relative mt-[clamp(1.5rem,3vw,2.5rem)]">
            <p className="eyebrow">Primary channel</p>
            <a
              href={`mailto:${contact.email}?subject=${SUBJECT}`}
              className="inlay mt-2 block pb-[0.06em] font-mono text-[clamp(0.95rem,4.2vw,2.35rem)] font-semibold leading-[1.15] tracking-[-0.01em] transition-opacity [overflow-wrap:anywhere] hover:opacity-80"
            >
              {contact.email}
            </a>

            <button
              type="button"
              onClick={() => copy("Email address", contact.email)}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-edge px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-faint transition-colors hover:border-amber/60 hover:text-amber"
            >
              {copied === "Email address" ? (
                <>
                  <Check aria-hidden className="h-3.5 w-3.5 text-emerald" />
                  Copied
                </>
              ) : (
                <>
                  <Copy aria-hidden className="h-3.5 w-3.5" />
                  Copy address
                </>
              )}
            </button>
          </div>

          {/* Pad array — every other route out of the package. */}
          <ul className="relative mt-[clamp(1.5rem,3vw,2.25rem)] grid gap-2.5 sm:grid-cols-2">
            {socials.map(({ label, href, handle, icon: Icon }, i) => {
              const external = href.startsWith("http")
              return (
                <li key={label} className={`${s.pad} flex items-center`}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer noopener" : undefined}
                    className="group flex min-w-0 flex-1 items-center gap-3 rounded-[11px] py-3 pl-3 pr-1"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-amber" />
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-[0.58rem] uppercase tracking-[0.18em] text-faint">
                        {designator(i)} · {label}
                      </span>
                      <span className="mt-0.5 block truncate text-sm text-mute transition-colors group-hover:text-chalk">
                        {handle}
                      </span>
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() => copy(label, copyableFor(href))}
                    aria-label={
                      copied === label ? `${label} copied` : `Copy ${label}`
                    }
                    className="mr-2.5 shrink-0 rounded-md border border-white/10 p-2 text-faint transition-colors hover:border-amber/60 hover:text-amber"
                  >
                    {copied === label ? (
                      <Check aria-hidden className="h-3.5 w-3.5 text-emerald" />
                    ) : (
                      <Copy aria-hidden className="h-3.5 w-3.5" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="relative mt-[clamp(1.5rem,3vw,2.25rem)] flex flex-wrap gap-3">
            <a
              href={`mailto:${contact.email}?subject=${SUBJECT}`}
              className="rounded-full bg-chalk px-5 py-2.5 text-sm font-semibold text-void transition-transform hover:scale-[1.03]"
            >
              Start a conversation
            </a>
            <a
              href={contact.resume}
              download
              className="rounded-full border border-edge px-5 py-2.5 text-sm font-semibold text-chalk transition-colors hover:border-amber hover:text-amber"
            >
              Download résumé
            </a>
          </div>

          <span role="status" aria-live="polite" className="sr-only">
            {copied ? `${copied} copied to clipboard` : ""}
          </span>
        </div>

        {/* ------------------------------------------------------ location */}
        <div
          data-reveal
          className="glass flex flex-col p-[clamp(1.15rem,2.4vw,1.75rem)]"
        >
          <p className="eyebrow">Based in</p>
          <h3 className="inlay mt-2 pb-[0.06em] text-[clamp(1.2rem,2.2vw,1.7rem)] font-semibold leading-tight">
            {PLACE}
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-faint">
            <span>Local time</span>
            <span className="tabular-nums text-mute">{localTime ?? "--:--"}</span>
            <span>ET</span>
          </p>

          {/*
            The embed ships its own footer bar — "Report a problem", "Make a
            Donation", "Website and API terms" — which is chrome, not content,
            and cannot be styled from out here because the iframe is
            cross-origin. So the iframe is grown past the bottom of its frame
            and the frame clips it.

            The attribution in that bar is NOT optional: OSM data is ODbL, which
            requires visible credit. It is reinstated below in our own type, the
            same way Leaflet renders its own attribution control rather than
            relying on the tile server's.
          */}
          <div
            className={`${s.mapFrame} relative mt-4 min-h-[clamp(190px,24vh,240px)] flex-1 overflow-hidden rounded-xl border border-white/10`}
          >
            <iframe
              title={`Map showing ${PLACE}`}
              src={MAP_SRC}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              /* 3rem, not the bar's ~20px single-line height: on a narrow card
                 that bar wraps to two lines, and a half-cropped footer looks
                 worse than no crop at all. */
              className={`${s.map} absolute inset-x-0 top-0 h-[calc(100%+3rem)] w-full border-0`}
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
            <a
              href={MAP_LINK}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-xs text-mute transition-colors hover:text-amber"
            >
              Open {PLACE} in OpenStreetMap
              <ExternalLink aria-hidden className="h-3 w-3 shrink-0" />
            </a>

            <p className="text-[0.66rem] text-faint">
              ©{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer noopener"
                className="underline decoration-dotted underline-offset-2 transition-colors hover:text-amber"
              >
                OpenStreetMap
              </a>{" "}
              contributors
            </p>
          </div>
        </div>
      </div>

      {/* Traces leaving the package, on their way off the board. */}
      <div
        aria-hidden
        data-reveal
        className="mt-[clamp(1.75rem,3.5vw,3rem)] space-y-2"
      >
        {[100, 74, 52].map((w, i) => (
          <div
            key={w}
            className={s.lane}
            style={{ width: `${w}%`, animationDelay: `${i * -0.5}s` }}
          />
        ))}
      </div>

      <footer data-reveal className="mt-[clamp(1.25rem,2.5vw,2rem)]">
        <div className="rule mb-5" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-faint">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span className="font-mono">Built with Next.js, Three.js &amp; GSAP</span>
        </div>
      </footer>
    </Chapter>
  )
}
