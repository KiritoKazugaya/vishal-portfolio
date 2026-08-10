"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"

import { Chapter } from "@/components/ui/chapter"
import { skillGroups } from "@/lib/data"
import type { Skill, SkillCategory } from "@/lib/types"
import { SkillTerminal } from "./skills-terminal"
import styles from "./skills.module.css"

/* -------------------------------------------------------------------------- */
/*  Geometry                                                                    */
/*                                                                              */
/*  One power rail per category, fanned out of a single core at the bottom of    */
/*  the stage. Nodes tap off their rail on fixed rows. Every position below is   */
/*  a percentage of the graph box, which is exactly how the beads are placed in  */
/*  CSS — so the SVG traces and the HTML beads can never drift apart, and the    */
/*  layout is identical on every load (no simulation, nothing to settle).        */
/* -------------------------------------------------------------------------- */

const COLS = skillGroups.length
/** One row for the hub chip, then one per skill in the tallest category. */
const ROWS = 1 + Math.max(...skillGroups.map((g) => g.skills.length))
const COL_W = 100 / COLS
/**
 * Reading order runs top-down: core, then the group heading, then its tools.
 * FAN is the vertical band the rows occupy; TOP is the strip above it where the
 * rails run horizontally out of the core before turning down.
 */
const FAN = 92
const TOP = 100 - FAN
const ROW_H = FAN / ROWS
/*
 * Rail sits at the left of its column, capsules hang off it to the right.
 * Widths are tuned so the widest capsule (column 5) stops just inside the box
 * and still clears the next column's rail: cap spans cx-7.8 .. cx+9.4, the
 * neighbouring rail is at cx+11. Any wider and the longest label truncates.
 */
const RAIL_DX = -0.45 * COL_W
const CAP_DX = 0.04 * COL_W
/*
 * The gap to the next column's rail is the "padding between sections".
 * 0.78 opened that gap nicely but clipped the three longest labels ("Prompt
 * Engineering", "Backend & MLOps", "Databases & Tools") once the stage narrowed
 * to ~944px. 0.84 fits all of them and still leaves ~27px between columns at a
 * wide stage, because widening the stage did most of the work already.
 */
const CAP_W = 0.84 * COL_W

const TOTAL = skillGroups.reduce((n, g) => n + g.skills.length, 0)
/** One full travel of the charge, in seconds. */
const DUR = 3.6

const colX = (i: number) => (i + 0.5) * COL_W
/** Row 0 is the group heading; rows 1+ are its tools, descending. */
const rowY = (r: number) => TOP + (r + 0.5) * ROW_H

const HUE: Record<SkillCategory, string> = {
  "AI/ML": "var(--accent-violet)",
  Data: "var(--accent-cyan)",
  Backend: "var(--accent-emerald)",
  Frontend: "var(--accent-blue)",
  Tools: "var(--accent-amber)",
}

const DEPTH: Record<Skill["weight"], string> = {
  1: "familiar",
  2: "solid",
  3: "core strength",
}

/** Weight only changes the bead's diameter — never its position. */
const BEAD_SCALE: Record<Skill["weight"], number> = { 1: 0.78, 2: 1, 3: 1.2 }

/** Core -> horizontal run -> rounded elbow -> straight down to the last node. */
function railPath(railPx: number, w: number, h: number, botPx: number) {
  const sx = w / 2
  const dx = railPx - sx
  if (Math.abs(dx) < 1) return `M ${sx.toFixed(1)} 0 L ${sx.toFixed(1)} ${botPx.toFixed(1)}`
  const dir = Math.sign(dx)
  const e = Math.min(30, Math.abs(dx), h * 0.07)
  return [
    `M ${sx.toFixed(1)} 0`,
    `L ${(railPx - dir * e).toFixed(1)} 0`,
    `Q ${railPx.toFixed(1)} 0 ${railPx.toFixed(1)} ${e.toFixed(1)}`,
    `L ${railPx.toFixed(1)} ${botPx.toFixed(1)}`,
  ].join(" ")
}

interface Placed {
  skill: Skill
  y: number
  /** When the travelling charge reaches this node, in seconds. */
  delay: number
}

export function Skills() {
  const [filter, setFilter] = useState<SkillCategory | null>(null)
  const [hovered, setHovered] = useState<Skill | null>(null)
  const [pinned, setPinned] = useState<Skill | null>(null)
  const [box, setBox] = useState({ w: 900, h: 640 })
  const graphRef = useRef<HTMLDivElement>(null)

  // The traces are drawn in real pixels so stroke width and the elbow radius
  // stay true at any stage size. Read once on mount — an observer's first
  // callback waits for a frame, and a throttled tab may not paint one — then
  // let the observer handle every later size change.
  useEffect(() => {
    const el = graphRef.current
    if (!el) return
    const read = () => {
      const { width, height } = el.getBoundingClientRect()
      if (width > 0 && height > 0) setBox({ w: Math.round(width), h: Math.round(height) })
    }
    read()
    const ro = new ResizeObserver(read)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const columns = useMemo(() => {
    const { w, h } = box

    return skillGroups.map((group, i) => {
      const cx = colX(i)
      const railX = cx + RAIL_DX
      const capX = cx + CAP_DX
      const count = group.skills.length
      // The rail stops at the last tool in the column.
      const botPx = (rowY(count) / 100) * h
      const railPx = (railX / 100) * w

      // Distance travelled before the rail turns vertical, so a node's flash
      // lines up with the charge instead of guessing from the row index.
      const fanLen = Math.abs(w / 2 - railPx)
      const span = Math.max(1, fanLen + botPx)
      const at = (y: number) => (fanLen + (y / 100) * h) / span
      const stagger = i * 0.55
      const timeOf = (y: number) => stagger + DUR * (0.06 + 0.88 * at(y))

      const hubY = rowY(0)
      const nodes: Placed[] = group.skills.map((skill, j) => {
        // Row 0 is the heading, so the first tool sits directly beneath it.
        const y = rowY(j + 1)
        return { skill, y, delay: timeOf(y) }
      })

      return {
        group,
        hue: HUE[group.category],
        railX,
        capX,
        hubY,
        hubDelay: timeOf(hubY),
        d: railPath(railPx, w, h, botPx),
        stagger,
        nodes,
      }
    })
  }, [box])

  const active = hovered ?? pinned
  const accent = active ? HUE[active.category] : "var(--accent-gold)"
  const isOff = (category: SkillCategory) => filter !== null && filter !== category
  const toggle = (category: SkillCategory) =>
    setFilter((f) => (f === category ? null : category))

  const stageStyle = {
    "--cap-w": `${CAP_W}cqi`,
    "--c": accent,
  } as CSSProperties

  return (
    <Chapter
      id="die"
      title="Skills"
      lead="Five rails off one core. Every bead is something that shipped, so trace one to see where."
    >
      <div data-reveal>
        {/* ------------------------------------------------------- filters */}
        <div className={styles.head}>
          <p className={styles.legend}>
            {TOTAL} tools · {COLS} groups · hover a bead to trace it
          </p>

          <div className={styles.pills}>
            <button
              type="button"
              onClick={() => setFilter(null)}
              aria-pressed={filter === null}
              className={`${styles.pill} ${filter === null ? styles.pillOn : ""}`}
              style={{ "--c": "var(--accent-gold)" } as CSSProperties}
            >
              All
            </button>
            {skillGroups.map((g) => (
              <button
                key={g.category}
                type="button"
                onClick={() => toggle(g.category)}
                aria-pressed={filter === g.category}
                className={`${styles.pill} ${filter === g.category ? styles.pillOn : ""}`}
                style={{ "--c": HUE[g.category] } as CSSProperties}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* --------------------------------------------------------- stage */}
        <div className={`glass ${styles.stage}`} style={stageStyle}>
          <div className={styles.graph} ref={graphRef}>
            <svg
              className={styles.traces}
              viewBox={`0 0 ${box.w} ${box.h}`}
              preserveAspectRatio="none"
              aria-hidden
              focusable="false"
            >
              {columns.map((col) => (
                <g
                  key={col.group.category}
                  className={`${styles.wires} ${
                    isOff(col.group.category) ? styles.dim : ""
                  } ${active?.category === col.group.category ? styles.live : ""}`}
                  style={{ "--c": col.hue } as CSSProperties}
                >
                  <path className={styles.trace} d={col.d} />
                  {[{ y: col.hubY }, ...col.nodes].map((n) => (
                    <line
                      key={n.y}
                      className={styles.tap}
                      x1={(col.railX / 100) * box.w}
                      y1={(n.y / 100) * box.h}
                      x2={((col.capX - CAP_W / 2) / 100) * box.w}
                      y2={(n.y / 100) * box.h}
                    />
                  ))}
                  <path
                    className={styles.charge}
                    d={col.d}
                    pathLength={100}
                    style={{ "--delay": `${col.stagger.toFixed(2)}s` } as CSSProperties}
                  />
                </g>
              ))}
            </svg>

            {columns.map((col) => {
              const off = isOff(col.group.category)
              return (
                <div
                  key={col.group.category}
                  className={`${styles.col} ${off ? styles.dim : ""}`}
                  /* A filtered-out column is 9% opaque — without this its
                     buttons are still in the tab order and a keyboard user
                     lands on something they cannot see. */
                  inert={off}
                  style={{ "--c": col.hue } as CSSProperties}
                >
                    {col.nodes.map((n) => {
                      const on = active?.name === n.skill.name
                      return (
                        <button
                          key={n.skill.name}
                          type="button"
                          className={`${styles.node} ${on ? styles.nodeOn : ""}`}
                          style={
                            {
                              left: `${col.capX}%`,
                              top: `${n.y}%`,
                              "--wf": BEAD_SCALE[n.skill.weight],
                              "--delay": `${n.delay.toFixed(2)}s`,
                            } as CSSProperties
                          }
                          aria-label={`${n.skill.name}. Shipped in ${n.skill.usedIn}. ${DEPTH[n.skill.weight]}.`}
                          aria-pressed={pinned?.name === n.skill.name}
                          onMouseEnter={() => setHovered(n.skill)}
                          onMouseLeave={() => setHovered(null)}
                          onFocus={() => setHovered(n.skill)}
                          onBlur={() => setHovered(null)}
                          onClick={() =>
                            setPinned((p) => (p?.name === n.skill.name ? null : n.skill))
                          }
                        >
                          <span className={styles.bead} aria-hidden />
                          <span className={styles.label}>{n.skill.name}</span>
                        </button>
                      )
                    })}

                    <button
                      type="button"
                      className={`${styles.node} ${styles.hub} ${
                        filter === col.group.category ? styles.hubOn : ""
                      }`}
                      style={
                        {
                          left: `${col.capX}%`,
                          top: `${col.hubY}%`,
                          "--wf": 1.35,
                          "--delay": `${col.hubDelay.toFixed(2)}s`,
                        } as CSSProperties
                      }
                      aria-pressed={filter === col.group.category}
                      aria-label={`${col.group.label}. ${col.group.blurb} Show only this group.`}
                      onClick={() => toggle(col.group.category)}
                    >
                      <span className={styles.bead} aria-hidden />
                      {/* The short category, not the full label: "Databases &
                          Tools" cannot fit a 150px capsule at heading size and
                          weight. The filter pill above still carries the long
                          form, and the aria-label below has it in full. */}
                      <span className={`${styles.hubLabel} inlay-soft`}>{col.group.category}</span>
                    </button>
                </div>
              )
            })}

            <span className={styles.core} aria-hidden />
          </div>

        </div>

        {/* Working shell over the index — sits outside the square so the graph
            keeps its full height and the log can grow without squeezing it. */}
        <div className={styles.console}>
          <SkillTerminal hovered={active} />
        </div>

        {/* Grouped list — the small-screen view, and the text alternative. */}
        <div className={styles.list}>
          {skillGroups
            .filter((g) => filter === null || g.category === filter)
            .map((group) => (
              <section
                key={group.category}
                style={{ "--c": HUE[group.category] } as CSSProperties}
              >
                <h3 className={styles.groupHead}>{group.label}</h3>
                <p className="mt-1 text-xs leading-relaxed text-faint">{group.blurb}</p>
                <ul className={styles.chips}>
                  {group.skills.map((skill) => (
                    <li key={skill.name} className={`glass ${styles.chip}`}>
                      <span className={styles.chipBead} aria-hidden />
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-xs text-chalk">
                          {skill.name}
                        </span>
                        <span className="block text-[0.68rem] leading-snug text-mute">
                          {skill.usedIn}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
        </div>
      </div>
    </Chapter>
  )
}
