import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"

import { profile } from "@/lib/data"
import { THEME_SCRIPT } from "@/lib/theme"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-face",
  display: "swap",
})

export const metadata: Metadata = {
  /* The deployed host is vishal-akkala — with the hyphen. Without it every
     absolute URL Next derives from this (the opengraph-image src below, above
     all) points at a domain that 404s, which is worse for a scraper than
     declaring nothing at all. */
  metadataBase: new URL("https://vishal-akkala.vercel.app"),
  title: {
    default: `${profile.name} | ${profile.role}`,
    template: `%s | ${profile.name}`,
  },
  description: profile.summary,
  keywords: [
    "AI Engineer",
    "Machine Learning Engineer",
    "RAG",
    "MLOps",
    "Data Engineering",
    profile.name,
  ],
  authors: [{ name: profile.name }],
  openGraph: {
    title: `${profile.name} | ${profile.role}`,
    description: profile.headline,
    type: "profile",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} | ${profile.role}`,
    description: profile.headline,
  },
  robots: { index: true, follow: true },
}

/*
 * No themeColor or colorScheme here.
 *
 * Both are static at build time, so they would pin a phone's browser chrome to
 * the dark theme forever — a light-theme visitor got a black status bar above a
 * white page. The meta tag is emitted in <head> below and rewritten by the
 * theme module instead, pre-paint and on every toggle.
 */
export const viewport: Viewport = {}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="dark" className={`${inter.variable} ${mono.variable}`}>
      <head>
        {/* Must be parsed before the script below, which rewrites its content
            to match the resolved theme. */}
        <meta name="theme-color" content="#050507" />
        {/*
          Resolves the theme before the first paint. It has to be inline and
          synchronous — a bundled module would run a frame late and the page
          would flash the wrong theme on every load.
        */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-cyan focus:px-4 focus:py-2 focus:font-medium focus:text-void"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  )
}
