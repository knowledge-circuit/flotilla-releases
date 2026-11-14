import type { ReactNode } from 'react'

/**
 * Minimal inline icon set for the landing tiles (Linear-style media block).
 * Keyed by doc slug; unknown slugs fall back to the document icon, so a new page
 * needs no icon to render. Add one here when a page earns it.
 */
const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const ICONS: Record<string, ReactNode> = {
  welcome: <path d="M12 3v11M12 4l6 9h-6M12 7l-4 6h4M4 17h16l-2.5 4h-11L4 17Z" {...STROKE} />,
  'why-flotilla': (
    <path
      d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 16.5v.5"
      {...STROKE}
    />
  ),
  quickstart: <path d="M13 3 5 13.5h5L10 21l8-10.5h-5L13 3Z" {...STROKE} />,
  threads: <path d="M4 5h11v8H9l-3 3v-3H4V5ZM15 9h5v8h-2v3l-3-3h-4v-1" {...STROKE} />,
  projects: <path d="M3 6h6l2 2.5h10V19H3V6Z" {...STROKE} />,
  'plan-and-notes': (
    <path
      d="M5 4h14v16H5V4ZM8.5 9l1.5 1.5L12.5 8M8.5 15l1.5 1.5 2.5-2.5M15 9.5h1.5M15 15.5h1.5"
      {...STROKE}
    />
  ),
  utilizator: <path d="M3 12h4l2.5-6 4 12 2.5-6h5" {...STROKE} />,
  autonomy: <path d="M4 13 6.5 5h11L20 13v6H4v-6ZM4 13h5a3 3 0 0 0 6 0h5" {...STROKE} />,
  'servers-and-devices': <path d="M4 4h16v6H4V4ZM4 14h16v6H4v-6ZM7.5 7h.5M7.5 17h.5" {...STROKE} />,
  requirements: <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM8 12.5l3 3 5-6" {...STROKE} />,
  installation: <path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" {...STROKE} />,
  updating: (
    <path
      d="M20 12a8 8 0 0 1-14.3 4.9M4 12a8 8 0 0 1 14.3-4.9M18.5 3.5v4h-4M5.5 20.5v-4h4"
      {...STROKE}
    />
  ),
  'add-a-project': <path d="M3 6h6l2 2.5h10V19H3V6ZM12 11v5M9.5 13.5h5" {...STROKE} />,
  'first-task': (
    <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM10 8.5v7l6-3.5-6-3.5Z" {...STROKE} />
  ),
  'turn-on-autonomy': (
    <path
      d="M8 7h8a5 5 0 0 1 0 10H8A5 5 0 0 1 8 7ZM16 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
      {...STROKE}
    />
  ),
  'remote-access': <path d="M8 3h8v18H8V3ZM11 18h2" {...STROKE} />,
  'desktop-app': <path d="M3 5h18v11H3V5ZM9 20h6M12 16v4" {...STROKE} />,
  'move-a-thread': (
    <path d="M4 8h13M13.5 4.5 17 8l-3.5 3.5M20 16H7M10.5 12.5 7 16l3.5 3.5" {...STROKE} />
  ),
  providers: (
    <path
      d="M7 7h10v10H7V7ZM10 10h4v4h-4v-4ZM10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4"
      {...STROKE}
    />
  ),
  cli: <path d="M3 5h18v14H3V5ZM7 10l3 2.5L7 15M12.5 15H16" {...STROKE} />,
  'project-settings': (
    <path
      d="M4 7h9M17 7h3M4 17h3M11 17h9M15 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM9 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
      {...STROKE}
    />
  ),
  'files-and-environment': <path d="M7 3h7l4 4v14H7V3ZM14 3v4h4M10 12h6M10 16h6" {...STROKE} />,
  keyboard: (
    <path d="M3 7h18v10H3V7ZM7 10.5h.5M10.5 10.5h.5M14 10.5h.5M17 10.5h.5M8 13.5h8" {...STROKE} />
  ),
  limits: <path d="M12 4 3 19h18L12 4ZM12 10v4.5M12 17v.3" {...STROKE} />,
  glossary: (
    <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4ZM5 17a3 3 0 0 1 3-3h11M9 8h6" {...STROKE} />
  ),
  document: (
    <g {...STROKE}>
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v4h4M10 12h6M10 16h6" />
    </g>
  ),
}

export default function DocIcon({
  slug,
  className = 'doc-tile-icon',
}: {
  slug: string
  className?: string
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      {ICONS[slug] ?? ICONS.document}
    </svg>
  )
}
