"use client"

import { useMemo, useState } from "react"

import { Chapter } from "@/components/ui/chapter"
import { skillGroups } from "@/lib/data"
import type { Skill, SkillCategory } from "@/lib/types"

const W = 900
const H = 720
const CX = W / 2
const CY = H / 2
const HUB_R = 168

const HUE: Record<SkillCategory, string> = {
  "AI/ML": "#a78bfa",
  Data: "#7dd3fc",
  Backend: "#34d399",
  Frontend: "#60a5fa",
  Tools: "#f0b429",
}

interface Node {
  skill: Skill
  x: number
  y: number
  r: number
}

interface Hub {
  category: SkillCategory
  label: string
  x: number
  y: number
  nodes: Node[]
}

/**
 * Deterministic radial layout.
 *
 * A force simulation would settle differently on every load and jitter under
 * resize; this places every node from an angle and a radius, so the graph is
 * identical each time and costs nothing to render.
 */
function useLayout(): Hub[] {
  return useMemo(() => {
    const step = (Math.PI * 2) / skillGroups.length
    return skillGroups.map((group, gi) => {
      const angle = -Math.PI / 2 + step * gi
      const hx = CX + Math.cos(angle) * HUB_R
      const hy = CY + Math.sin(angle) * HUB_R

      const n = group.skills.length
      const spread = Math.PI * 0.86
      const start = angle - spread / 2

      const nodes = group.skills.map((skill, i) => {
        const t = n === 1 ? 0.5 : i / (n - 1)
        const a = start + spread * t
        // Two interleaved rings keep dense categories from colliding.
        const radius = 96 + (i % 2) * 52
        return {
          skill,
          x: hx + Math.cos(a) * radius,
          y: hy + Math.sin(a) * radius,
          r: 4.5 + skill.weight * 2.1,
        }
      })

      return { category: group.category, label: group.label, x: hx, y: hy, nodes }
    })
  }, [])
}

export function Skills() {
  const hubs = useLayout()
  const [filter, setFilter] = useState<SkillCategory | null>(null)
  const [hovered, setHovered] = useState<Skill | null>(null)

  const dim = (category: SkillCategory) =>
    filter !== null && filter !== category ? 0.1 : 1

  return (
    <Chapter
      id="die"
      title="Skills"
      lead="Every node is something that shipped. Hover one to see where."
      wide
    >
      <div data-reveal>
        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter(null)}
            aria-pressed={filter === null}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              filter === null
                ? "border-chalk bg-chalk text-void"
                : "border-edge text-mute hover:border-faint hover:text-chalk"
            }`}
          >
            All
          </button>
          {skillGroups.map((g) => (
            <button
              key={g.category}
              type="button"
              onClick={() => setFilter(filter === g.category ? null : g.category)}
              aria-pressed={filter === g.category}
              className="rounded-full border px-4 py-1.5 text-xs transition-colors"
              style={{
                borderColor: filter === g.category ? HUE[g.category] : "#1e1e26",
                color: filter === g.category ? HUE[g.category] : "#9a9daa",
              }}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Graph — md and up. Below that the nodes would be unreadable. */}
        <div className="relative hidden md:block">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-auto w-full"
            role="img"
            aria-label="Skill map grouped into five categories. A text version follows."
          >
            {/* hub spokes */}
            <g stroke="#2a2a33" strokeWidth="1">
              {hubs.map((hub) => (
                <line
                  key={hub.category}
                  x1={CX}
                  y1={CY}
                  x2={hub.x}
                  y2={hub.y}
                  opacity={dim(hub.category) * 0.8}
                />
              ))}
            </g>

            {/* leaf connectors */}
            {hubs.map((hub) => (
              <g
                key={`edges-${hub.category}`}
                stroke={HUE[hub.category]}
                strokeWidth="0.8"
                opacity={dim(hub.category) * 0.28}
              >
                {hub.nodes.map((node) => (
                  <line
                    key={node.skill.name}
                    x1={hub.x}
                    y1={hub.y}
                    x2={node.x}
                    y2={node.y}
                  />
                ))}
              </g>
            ))}

            {/* leaves */}
            {hubs.map((hub) => (
              <g key={`nodes-${hub.category}`} opacity={dim(hub.category)}>
                {hub.nodes.map((node) => {
                  const isOn = hovered?.name === node.skill.name
                  return (
                    <g
                      key={node.skill.name}
                      tabIndex={0}
                      role="button"
                      aria-label={`${node.skill.name}. Used in ${node.skill.usedIn}.`}
                      onMouseEnter={() => setHovered(node.skill)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(node.skill)}
                      onBlur={() => setHovered(null)}
                      className="cursor-pointer focus:outline-none"
                    >
                      {isOn ? (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.r + 7}
                          fill={HUE[hub.category]}
                          opacity="0.18"
                        />
                      ) : null}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.r}
                        fill={HUE[hub.category]}
                        opacity={isOn ? 1 : 0.82}
                      />
                      <text
                        x={node.x}
                        y={node.y - node.r - 7}
                        textAnchor="middle"
                        className="pointer-events-none"
                        fill={isOn ? "#eceef3" : "#9a9daa"}
                        fontSize="11.5"
                      >
                        {node.skill.name}
                      </text>
                    </g>
                  )
                })}
              </g>
            ))}

            {/* hubs */}
            {hubs.map((hub) => (
              <g key={`hub-${hub.category}`} opacity={dim(hub.category)}>
                <rect
                  x={hub.x - 62}
                  y={hub.y - 15}
                  width="124"
                  height="30"
                  rx="15"
                  fill="#0b0b0f"
                  stroke={HUE[hub.category]}
                  strokeWidth="1"
                />
                <text
                  x={hub.x}
                  y={hub.y + 4.5}
                  textAnchor="middle"
                  fill="#eceef3"
                  fontSize="12"
                  fontWeight="600"
                >
                  {hub.label}
                </text>
              </g>
            ))}

            {/* core */}
            <circle cx={CX} cy={CY} r="34" fill="#0b0b0f" stroke="#a78bfa" strokeWidth="1.4" />
            <text x={CX} y={CY + 5.5} textAnchor="middle" fill="#eceef3" fontSize="15" fontWeight="700">
              VA
            </text>
          </svg>

          {/* Read-out — fixed position so the graph never reflows on hover. */}
          <div className="panel pointer-events-none absolute bottom-2 left-2 max-w-xs px-4 py-3">
            {hovered ? (
              <>
                <p className="font-mono text-xs text-chalk">{hovered.name}</p>
                <p className="mt-1 text-xs leading-snug text-mute">{hovered.usedIn}</p>
              </>
            ) : (
              <p className="text-xs leading-snug text-faint">
                Hover a node to see where each skill shipped.
              </p>
            )}
          </div>
        </div>

        {/* Grouped list — the mobile view, and the accessible text alternative. */}
        <div className="space-y-8 md:sr-only">
          {skillGroups
            .filter((g) => filter === null || g.category === filter)
            .map((group) => (
              <div key={group.category}>
                <h3 className="mb-1 text-sm font-semibold" style={{ color: HUE[group.category] }}>
                  {group.label}
                </h3>
                <p className="mb-3 text-xs text-faint">{group.blurb}</p>
                <ul className="space-y-2">
                  {group.skills.map((skill) => (
                    <li key={skill.name} className="panel px-3 py-2">
                      <span className="font-mono text-xs text-chalk">{skill.name}</span>
                      <span className="mt-0.5 block text-xs text-mute">{skill.usedIn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      </div>
    </Chapter>
  )
}
