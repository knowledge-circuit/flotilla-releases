import { type ReactNode, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { t } from '../i18n'
import { getPreferredLocale } from '../locale-preference'
import { docPath, type Locale, type NavGroup } from '../registry-core'
import type { TocEntry } from '../toc'
import Brand from './Brand'
import LanguageSwitcher from './LanguageSwitcher'
import SearchHost from './SearchHost'
import Sidebar from './Sidebar'
import TableOfContents from './TableOfContents'
import ThemeToggle from './ThemeToggle'
import TopbarSearch from './TopbarSearch'

const RELEASES_URL = 'https://github.com/knowledge-circuit/flotilla-releases/releases'

type DocLayoutProps = {
  locale: Locale
  /** Current page slug — used to keep the language switcher on the same page. */
  slug?: string
  tree: NavGroup[]
  /** "On this page" outline. Omit to drop the right-hand rail (landing page). */
  toc?: TocEntry[]
  children: ReactNode
}

export default function DocLayout({ locale, slug, tree, toc, children }: DocLayoutProps) {
  const [navOpen, setNavOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  // SPA navigation keeps the scroll position; a new page must start at the top.
  // Keyed on pathname only, so same-page anchor (#hash) jumps are unaffected.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname is the trigger, not a body dependency
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  // Land readers in their language: explicit choice (stored by the switcher)
  // first, then browser language, defaulting to English. Client-side only.
  useEffect(() => {
    const preferred = getPreferredLocale()
    if (preferred !== locale) navigate(docPath(preferred, slug), { replace: true })
  }, [locale, slug, navigate])

  return (
    <SearchHost locale={locale}>
      <div className="doc-root">
        {/* Pinned to the viewport's left edge, full height, own separator. */}
        <Sidebar tree={tree} locale={locale} open={navOpen} onNavigate={() => setNavOpen(false)} />
        {/* Scrim closes the mobile drawer when tapping outside it. */}
        {navOpen && (
          <button
            type="button"
            className="doc-scrim"
            aria-label={t(locale, 'closeNav')}
            onClick={() => setNavOpen(false)}
          />
        )}

        <div className="doc-frame">
          <header className="doc-topbar">
            <button
              type="button"
              className="doc-nav-toggle"
              aria-label={t(locale, 'toggleNav')}
              aria-expanded={navOpen}
              onClick={() => setNavOpen(o => !o)}
            >
              <span className="doc-nav-toggle-bar" />
            </button>
            {/* Mobile only — on desktop the brand lives in the sidebar. */}
            <span className="doc-topbar-brand">
              <Brand locale={locale} />
            </span>
            <div className="doc-topbar-spacer" />
            {/* Release notes live with the downloads, on GitHub. */}
            <a className="doc-topbar-link" href={RELEASES_URL}>
              {t(locale, 'changelog')}
            </a>
            <TopbarSearch locale={locale} />
            <ThemeToggle locale={locale} />
            <LanguageSwitcher locale={locale} slug={slug} />
          </header>

          <div className={toc ? 'doc-body' : 'doc-body no-toc'}>
            <main className="doc-main">{children}</main>
            {toc && <TableOfContents toc={toc} locale={locale} />}
          </div>
        </div>
      </div>
    </SearchHost>
  )
}
