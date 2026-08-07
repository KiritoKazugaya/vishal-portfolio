"use client"

import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/hooks/use-theme"
import { toggleTheme } from "@/lib/theme"
import s from "./nav.module.css"

/**
 * Two-state track with a sliding thumb rather than a single icon that swaps.
 *
 * A lone icon has to answer "is this the current state or the thing it will do",
 * and people read it both ways. Showing both destinations with the thumb parked
 * on the active one removes the question.
 */
export function ThemeToggle() {
  const theme = useTheme()
  const light = theme === "light"

  return (
    <button
      type="button"
      role="switch"
      aria-checked={light}
      aria-label={`Switch to ${light ? "dark" : "light"} theme`}
      onClick={toggleTheme}
      data-theme-state={theme}
      className={s.toggle}
    >
      <span className={s.toggleThumb} aria-hidden />
      <span className={s.toggleIcon} data-on={!light} aria-hidden>
        <Moon />
      </span>
      <span className={s.toggleIcon} data-on={light} aria-hidden>
        <Sun />
      </span>
    </button>
  )
}
