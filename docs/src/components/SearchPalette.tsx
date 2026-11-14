import { useEffect, useRef, useState } from 'react'
import { t } from '../i18n'
import type { Locale } from '../registry-core'
import { type SearchHit, searchDocs } from '../search'

type SearchPaletteProps = {
  open: boolean
  locale: Locale
  onClose: () => void
}

export default function SearchPalette({ open, locale, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus the input and reset state whenever the palette opens.
  useEffect(() => {
    if (open) {
      setQuery('')
      setHits([])
      inputRef.current?.focus()
    }
  }, [open])

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Debounced query. Pagefind isn't present during `vite dev`, so swallow errors.
  useEffect(() => {
    if (!open) return
    let active = true
    const id = setTimeout(() => {
      searchDocs(query, locale)
        .then(results => active && setHits(results))
        .catch(() => active && setHits([]))
    }, 150)
    return () => {
      active = false
      clearTimeout(id)
    }
  }, [query, locale, open])

  if (!open) return null

  return (
    <div className="doc-search-overlay">
      <button
        type="button"
        className="doc-search-backdrop"
        aria-label={t(locale, 'searchNoResults')}
        onClick={onClose}
        tabIndex={-1}
      />
      <div
        className="doc-search-modal"
        role="dialog"
        aria-modal="true"
        aria-label={t(locale, 'searchLabel')}
      >
        <input
          ref={inputRef}
          type="search"
          className="doc-search-input"
          placeholder={t(locale, 'searchPlaceholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {query.trim() !== '' && (
          <ul className="doc-search-results">
            {hits.length === 0 ? (
              <li className="doc-search-empty">{t(locale, 'searchNoResults')}</li>
            ) : (
              hits.map(hit => (
                <li key={hit.url}>
                  <a href={hit.url} className="doc-search-hit">
                    <span className="doc-search-hit-title">{hit.title}</span>
                    <span
                      className="doc-search-hit-excerpt"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: Pagefind returns its own escaped excerpt HTML with <mark> highlights
                      dangerouslySetInnerHTML={{ __html: hit.excerpt }}
                    />
                  </a>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
