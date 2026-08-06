import Image from "next/image"

import { Chapter } from "@/components/ui/chapter"
import { profile } from "@/lib/data"

export function About() {
  return (
    <Chapter id="package" title="About" lead={profile.identity}>
      <div data-reveal className="panel overflow-hidden p-6 md:p-8">
        <div className="flex flex-col gap-7 sm:flex-row sm:items-start">
          <Image
            src={profile.photo}
            alt={profile.photoAlt}
            width={132}
            height={132}
            className="h-28 w-28 shrink-0 rounded-xl object-cover object-top ring-1 ring-edge"
          />
          <div className="space-y-4">
            <p className="text-base leading-relaxed text-mute">{profile.summary}</p>
            <p className="text-base leading-relaxed text-mute">{profile.philosophy}</p>
          </div>
        </div>
      </div>

      <dl data-reveal className="mt-6 grid grid-cols-3 gap-3">
        {profile.stats.map((s) => (
          <div key={s.label} className="panel px-4 py-5 text-center">
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <span className="block font-mono text-2xl text-chalk md:text-3xl">
                {s.value}
                {"suffix" in s && s.suffix ? s.suffix : ""}
              </span>
              <span className="mt-1.5 block text-xs leading-snug text-faint">
                {s.label}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <div data-reveal className="mt-6">
        <p className="eyebrow mb-3">Currently thinking about</p>
        <ul className="space-y-2">
          {profile.interests.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-mute">
              <span className="mt-2 h-px w-4 shrink-0 bg-cyan/60" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Chapter>
  )
}
