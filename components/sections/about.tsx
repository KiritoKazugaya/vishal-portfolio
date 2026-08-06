import Image from "next/image"

import { Chapter } from "@/components/ui/chapter"
import { profile } from "@/lib/data"

export function About() {
  return (
    <Chapter id="package" title="About" lead={profile.identity}>
      <div
        data-reveal
        className="glass overflow-hidden p-[clamp(1.25rem,2.4vw,2.25rem)]"
      >
        <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
          <Image
            src={profile.photo}
            alt={profile.photoAlt}
            width={168}
            height={168}
            className="h-[clamp(5.5rem,9vw,9rem)] w-[clamp(5.5rem,9vw,9rem)] shrink-0 rounded-2xl object-cover object-top ring-1 ring-white/10"
          />
          <div className="space-y-4">
            <p className="body-lead">{profile.summary}</p>
            <p className="body-lead">{profile.philosophy}</p>
          </div>
        </div>
      </div>

      <dl
        data-reveal
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 md:mt-5"
      >
        {profile.stats.map((s) => (
          <div
            key={s.label}
            className="glass glass-lift px-4 py-[clamp(1rem,1.8vw,1.6rem)] text-center"
          >
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <span className="inlay block font-mono text-[clamp(1.6rem,2.8vw,2.6rem)] font-semibold leading-none">
                {s.value}
                {"suffix" in s && s.suffix ? s.suffix : ""}
              </span>
              <span className="mt-2 block text-[clamp(0.68rem,0.85vw,0.8rem)] leading-snug text-faint">
                {s.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div data-reveal className="glass mt-4 p-[clamp(1.25rem,2.2vw,2rem)] md:mt-5">
        <p className="eyebrow mb-4">Currently thinking about</p>
        <ul className="grid gap-3 md:grid-cols-3">
          {profile.interests.map((item) => (
            <li
              key={item}
              className="group flex gap-3 text-[clamp(0.85rem,1vw,0.95rem)] leading-relaxed text-mute"
            >
              <span
                className="mt-2 h-px w-5 shrink-0 bg-cyan/50 transition-all duration-300 group-hover:w-8 group-hover:bg-cyan"
                aria-hidden
              />
              <span className="mark">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </Chapter>
  )
}
