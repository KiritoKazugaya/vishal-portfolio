import { Chapter } from "@/components/ui/chapter"
import { contact, profile, socials } from "@/lib/data"

/**
 * The bottom layer is the board interface, so the closing chapter is styled as
 * an output stage — the point where the package connects to something else.
 */
export function Contact() {
  return (
    <Chapter
      id="contacts"
      title="Contact"
      lead={profile.available}
    >
      <div data-reveal className="panel p-6 md:p-8">
        <p className="text-base leading-relaxed text-mute">
          If you are building something where the model is the easy part, I would like
          to hear about it.
        </p>

        <ul className="mt-7 space-y-2">
          {socials.map(({ label, href, handle, icon: Icon }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                className="group flex items-center gap-4 rounded-lg border border-transparent px-3 py-3 transition-colors hover:border-edge"
              >
                <Icon className="h-4 w-4 shrink-0 text-faint transition-colors group-hover:text-cyan" />
                <span className="w-20 shrink-0 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-faint">
                  {label}
                </span>
                <span className="truncate text-sm text-mute transition-colors group-hover:text-chalk">
                  {handle}
                </span>
                <span
                  aria-hidden
                  className="ml-auto text-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-cyan"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={`mailto:${contact.email}`}
            className="rounded-full bg-chalk px-5 py-2.5 text-sm font-medium text-void transition-transform hover:scale-[1.03]"
          >
            Start a conversation
          </a>
          <a
            href={contact.resume}
            download
            className="rounded-full border border-edge px-5 py-2.5 text-sm font-medium text-chalk transition-colors hover:border-cyan hover:text-cyan"
          >
            Download résumé
          </a>
        </div>
      </div>

      <footer data-reveal className="mt-10">
        <div className="rule mb-5" />
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-faint">
          <span>
            © {new Date().getFullYear()} {profile.name}
          </span>
          <span className="font-mono">Built with Next.js, Three.js & GSAP</span>
        </div>
      </footer>
    </Chapter>
  )
}
