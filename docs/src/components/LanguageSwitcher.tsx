import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LOCALE_NAMES, LOCALE_SHORT, t } from '../i18n'
import { storeLocalePreference } from '../locale-preference'
import { docPath, LOCALES, type Locale } from '../registry-core'

type LanguageSwitcherProps = {
  locale: Locale
  /** Slug to keep the reader on the same page; omit on the landing page. */
  slug?: string
}

/** Compact dropdown: shows the current language, opens a menu with all of them. */
export default function LanguageSwitcher({ locale, slug }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)

  // A switcher with one entry is a promise the site cannot keep.
  const single = LOCALES.length < 2

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (single) return null

  return (
    <nav className="doc-langswitch" aria-label={t(locale, 'languageLabel')} ref={rootRef}>
      <button
        type="button"
        className="doc-lang-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        <svg className="doc-lang-globe" viewBox="0 0 20 20" aria-hidden="true">
          <path
            d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 1.5c.9 0 1.9 1.1 2.5 3h-5c.6-1.9 1.6-3 2.5-3Zm-3 4.5h6a13 13 0 0 1 0 4H7a13 13 0 0 1 0-4Zm-1.53 0a14.6 14.6 0 0 0 0 4H4.06a6.5 6.5 0 0 1 0-4h1.4Zm9.06 0h1.41a6.5 6.5 0 0 1 0 4h-1.4a14.6 14.6 0 0 0 0-4ZM7.5 13.5h5c-.6 1.9-1.6 3-2.5 3-.9 0-1.9-1.1-2.5-3Zm-2.55 0c.36 1 .84 1.87 1.42 2.53a6.53 6.53 0 0 1-2.62-2.53h1.2Zm8.9 0h1.2a6.53 6.53 0 0 1-2.62 2.53c.58-.66 1.06-1.52 1.42-2.53ZM6.37 3.97c-.58.66-1.06 1.52-1.42 2.53h-1.2a6.53 6.53 0 0 1 2.62-2.53Zm7.26 0a6.53 6.53 0 0 1 2.62 2.53h-1.2c-.36-1-.84-1.87-1.42-2.53Z"
            fill="currentColor"
          />
        </svg>
        {LOCALE_SHORT[locale]}
        <svg className="doc-lang-caret" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M4 6l4 4 4-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="doc-lang-menu" role="menu">
          {LOCALES.map(target => (
            <Link
              key={target}
              role="menuitem"
              to={docPath(target, slug)}
              className={target === locale ? 'doc-lang-item is-active' : 'doc-lang-item'}
              aria-current={target === locale ? 'true' : undefined}
              onClick={() => {
                storeLocalePreference(target)
                setOpen(false)
              }}
            >
              {LOCALE_NAMES[target]}
              {target === locale && (
                <svg className="doc-lang-check" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="M3.5 8.5l3 3 6-6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
