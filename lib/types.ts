import type { ComponentType } from "react"

/** The five chip layers double as the site's five chapters. */
export type LayerId = "package" | "die" | "interposer" | "substrate" | "contacts"

export type SkillCategory =
  | "AI/ML"
  | "Data"
  | "Backend"
  | "Frontend"
  | "Tools"

export interface Skill {
  name: string
  category: SkillCategory
  /** Where this skill actually shipped — shown on hover. */
  usedIn: string
  /** 1 = familiar, 2 = solid, 3 = core strength. Drives node size only. */
  weight: 1 | 2 | 3
}

export interface SkillGroup {
  category: SkillCategory
  label: string
  blurb: string
  skills: Skill[]
}

export interface Metric {
  label: string
  value: number
  suffix?: string
  /** True when the number is a placeholder, not a measurement. */
  assumed?: boolean
}

export interface ArchitectureStep {
  title: string
  detail: string
}

export interface Project {
  slug: string
  title: string
  tagline: string
  /** Featured projects render large in the bento grid. */
  featured?: boolean
  domain: string
  year: string
  /** CSS custom property name for this project's accent. */
  accent: string
  tech: string[]
  problem: string
  goal: string
  architecture: ArchitectureStep[]
  decisions: string[]
  challenges: string
  result: string
  learned: string
  metrics: Metric[]
  repo: string | null
  demo: string | null
  /** Shown verbatim on the card when the work needs framing. */
  note?: string
}

export interface ExperienceItem {
  kind: "work" | "education"
  role: string
  org: string
  location: string
  start: string
  end: string
  summary: string
  highlights: string[]
  tags: string[]
}

export interface SocialLink {
  label: string
  href: string
  handle: string
  icon: ComponentType<{ className?: string }>
}

export interface NavItem {
  label: string
  layer: LayerId
}
