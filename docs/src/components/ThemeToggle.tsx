import { useEffect, useState } from 'react'
import { t } from '../i18n'
import type { Locale } from '../registry-core'
import { currentTheme, setTheme, type Theme } from '../theme'

/** Light/dark switch in the topbar. Shows the theme it switches to. */
export default function ThemeToggle({ locale }: { locale: Locale }) {
  // Unknown until mounted: the pre-rendered HTML cannot know the reader's theme.
  const [theme, setState] = useState<Theme | null>(null)
  useEffect(() => setState(currentTheme()), [])

  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const label = t(locale, next === 'dark' ? 'themeDark' : 'themeLight')

  return (
    <button
      type="button"
      className="doc-topbar-search"
      aria-label={label}
      title={label}
      onClick={() => {
        setTheme(next)
        setState(next)
      }}
    >
      <svg className="doc-search-icon" viewBox="0 0 20 20" aria-hidden="true">
        {next === 'dark' ? (
          <path
            d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        ) : (
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="10" cy="10" r="3.5" />
            <path d="M10 2v1.5M10 16.5V18M2 10h1.5M16.5 10H18M4.3 4.3l1.1 1.1M14.6 14.6l1.1 1.1M4.3 15.7l1.1-1.1M14.6 5.4l1.1-1.1" />
          </g>
        )}
      </svg>
    </button>
  )
}
