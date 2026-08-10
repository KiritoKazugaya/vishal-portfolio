"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { skillGroups } from "@/lib/data"
import { scrollToLayer } from "@/hooks/use-chip-timeline"
import type { LayerId, Skill } from "@/lib/types"
import s from "./skills-terminal.module.css"

/**
 * A working shell over the skill index.
 *
 * The previous version only mirrored whatever was hovered, which looked like a
 * terminal without being one. This accepts input and answers: `where`, `ls`,
 * `find`, `stats`, `open`, `help`, `clear`.
 *
 * Hover still works, but it renders as a transient peek pinned above the prompt
 * rather than being pushed into the log — so moving the mouse across the graph
 * cannot flood the history someone is reading.
 */

type Kind = "cmd" | "out" | "err" | "meta" | "head"
interface Line {
  kind: Kind
  text: string
}

const ALL: Skill[] = skillGroups.flatMap((g) => g.skills)

const BANNER: Line[] = [
  { kind: "meta", text: `where.sh · ${ALL.length} tools across ${skillGroups.length} groups` },
  { kind: "meta", text: "type `help` for commands, or hover a bead" },
]

const SECTIONS: Record<string, LayerId> = {
  about: "package",
  skills: "die",
  projects: "interposer",
  experience: "substrate",
  contact: "contacts",
}

const HELP: Line[] = [
  { kind: "head", text: "COMMANDS" },
  { kind: "out", text: "where <skill>    where a technology shipped" },
  { kind: "out", text: "ls [group]       list groups, or the tools in one" },
  { kind: "out", text: "find <text>      search names and provenance" },
  { kind: "out", text: "stats            index summary" },
  { kind: "out", text: "open <section>   jump to about|skills|projects|experience|contact" },
  { kind: "out", text: "clear            clear the log" },
  { kind: "meta", text: "↑/↓ recalls history · Tab completes a skill name" },
]

/** Exact, then prefix, then substring. Good enough for 43 entries. */
function matchSkill(q: string): Skill | Skill[] | null {
  const n = q.trim().toLowerCase()
  if (!n) return null
  const exact = ALL.find((k) => k.name.toLowerCase() === n)
  if (exact) return exact
  const near = ALL.filter((k) => k.name.toLowerCase().startsWith(n))
  if (near.length === 1) return near[0]
  if (near.length > 1) return near
  const loose = ALL.filter((k) => k.name.toLowerCase().includes(n))
  if (loose.length === 1) return loose[0]
  return loose.length ? loose : null
}

export function SkillTerminal({ hovered }: { hovered: Skill | null }) {
  const [lines, setLines] = useState<Line[]>(BANNER)
  const [value, setValue] = useState("")
  const [history, setHistory] = useState<string[]>([])
  const [cursor, setCursor] = useState(-1)

  const logRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Pin the log to the newest line whenever it grows.
  useEffect(() => {
    const el = logRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines])

  const push = useCallback((next: Line[]) => setLines((prev) => [...prev, ...next]), [])

  const run = useCallback(
    (raw: string) => {
      const input = raw.trim()
      if (!input) return

      setHistory((h) => [input, ...h].slice(0, 40))
      setCursor(-1)
      push([{ kind: "cmd", text: input }])

      const [cmd, ...rest] = input.split(/\s+/)
      const arg = rest.join(" ").replace(/^["']|["']$/g, "")
      const verb = cmd.toLowerCase()

      if (verb === "clear") {
        setLines([])
        return
      }

      if (verb === "help" || verb === "?") {
        push(HELP)
        return
      }

      if (verb === "stats") {
        push([
          { kind: "out", text: `${ALL.length} tools · ${skillGroups.length} groups` },
          ...skillGroups.map((g) => ({
            kind: "meta" as const,
            text: `  ${g.label.padEnd(20)} ${String(g.skills.length).padStart(2)}`,
          })),
        ])
        return
      }

      if (verb === "ls") {
        if (!arg) {
          push(skillGroups.map((g) => ({ kind: "out" as const, text: `${g.label} (${g.skills.length})` })))
          return
        }
        const group = skillGroups.find(
          (g) =>
            g.label.toLowerCase().includes(arg.toLowerCase()) ||
            g.category.toLowerCase().includes(arg.toLowerCase()),
        )
        if (!group) {
          push([{ kind: "err", text: `no group matching "${arg}"` }])
          return
        }
        push([
          { kind: "head", text: group.label.toUpperCase() },
          ...group.skills.map((k) => ({ kind: "out" as const, text: `  ${k.name}` })),
        ])
        return
      }

      if (verb === "find") {
        if (!arg) {
          push([{ kind: "err", text: "usage: find <text>" }])
          return
        }
        const q = arg.toLowerCase()
        const hits = ALL.filter(
          (k) => k.name.toLowerCase().includes(q) || k.usedIn.toLowerCase().includes(q),
        )
        push(
          hits.length
            ? [
                { kind: "meta", text: `${hits.length} match${hits.length === 1 ? "" : "es"}` },
                ...hits.map((k) => ({ kind: "out" as const, text: `  ${k.name}: ${k.usedIn}` })),
              ]
            : [{ kind: "err", text: `nothing matches "${arg}"` }],
        )
        return
      }

      if (verb === "open") {
        const target = SECTIONS[arg.toLowerCase()]
        if (!target) {
          push([{ kind: "err", text: `unknown section "${arg}", try ${Object.keys(SECTIONS).join(", ")}` }])
          return
        }
        push([{ kind: "meta", text: `jumping to ${arg.toLowerCase()}...` }])
        scrollToLayer(target)
        return
      }

      // `where X`, and a bare skill name is treated as `where X`.
      const query = verb === "where" ? arg.replace(/^--skill\s*/, "") : input
      const found = matchSkill(query)

      if (!found) {
        push([
          { kind: "err", text: `command not found: ${verb}` },
          { kind: "meta", text: "type `help` for commands" },
        ])
        return
      }

      if (Array.isArray(found)) {
        push([
          { kind: "meta", text: `${found.length} matches, be more specific` },
          ...found.slice(0, 8).map((k) => ({ kind: "out" as const, text: `  ${k.name}` })),
        ])
        return
      }

      push([
        { kind: "out", text: found.usedIn },
        { kind: "meta", text: `// ${found.category} · weight ${found.weight}/3` },
      ])
    },
    [push],
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value)
      setValue("")
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      const next = Math.min(cursor + 1, history.length - 1)
      if (next >= 0) {
        setCursor(next)
        setValue(history[next])
      }
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      const next = cursor - 1
      setCursor(next)
      setValue(next >= 0 ? history[next] : "")
      return
    }
    if (e.key === "Tab") {
      e.preventDefault()
      const parts = value.split(/\s+/)
      const last = parts[parts.length - 1]
      if (!last) return
      const hit = ALL.find((k) => k.name.toLowerCase().startsWith(last.toLowerCase()))
      if (hit) {
        parts[parts.length - 1] = hit.name
        setValue(parts.join(" "))
      }
    }
  }

  return (
    <div className={`terminal ${s.wrap}`}>
      <div className={`terminal-bar ${s.bar}`}>
        <span className={s.dots} aria-hidden>
          <i style={{ background: "#ff5f57" }} />
          <i style={{ background: "#febc2e" }} />
          <i style={{ background: "#28c840" }} />
        </span>
        <span className={s.title}>where.sh: skill provenance</span>
        <span className={s.meta}>{hovered ? hovered.category : "ready"}</span>
      </div>

      <div
        className={s.body}
        onClick={() => inputRef.current?.focus()}
        role="presentation"
      >
        <div className={s.log} ref={logRef} role="log" aria-live="polite" aria-label="Terminal output">
          {lines.map((l, i) => (
            <p key={i} className={`${s.line} ${s[l.kind]}`}>
              {l.kind === "cmd" ? <span className={s.prompt}>$</span> : null}
              {l.text}
            </p>
          ))}
        </div>

        {/* Transient hover peek — never enters the log. */}
        {hovered ? (
          <p className={`${s.line} ${s.peek}`}>
            <span className={s.prompt}>$</span>
            <span className={s.dim}>where </span>
            {hovered.name}
            <span className={s.arrow} aria-hidden> → </span>
            {hovered.usedIn}
          </p>
        ) : null}

        <label className={s.inputRow}>
          <span className={s.prompt} aria-hidden>
            $
          </span>
          <span className="sr-only">Terminal input: type help for commands</span>
          <input
            ref={inputRef}
            className={s.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="where pytorch"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            enterKeyHint="go"
          />
        </label>
      </div>
    </div>
  )
}
