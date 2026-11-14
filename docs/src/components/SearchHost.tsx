import { type ReactNode, useEffect, useState } from 'react'
import type { Locale } from '../registry-core'
import { SearchContext } from './SearchContext'
import SearchPalette from './SearchPalette'

/**
 * Provides the shared ⌘K search palette to a page. Each page shell (landing,
 * doc) wraps its content in one of these, so the SearchTrigger / topbar button
 * can open it via context. Mounted once per page — exactly one page renders at a
 * time, so the ⌘K listener never doubles up.
 */
export default function SearchHost({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <SearchContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <SearchPalette open={open} locale={locale} onClose={() => setOpen(false)} />
    </SearchContext.Provider>
  )
}
