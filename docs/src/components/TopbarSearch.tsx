import { t } from '../i18n'
import type { Locale } from '../registry-core'
import { useSearch } from './SearchContext'

/** Icon-only search button for the doc topbar — opens the shared ⌘K palette. */
export default function TopbarSearch({ locale }: { locale: Locale }) {
  const { open } = useSearch()
  return (
    <button
      type="button"
      className="doc-topbar-search"
      aria-label={t(locale, 'searchLabel')}
      title={`${t(locale, 'searchLabel')} (⌘K)`}
      onClick={open}
    >
      <svg className="doc-search-icon" viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M8.5 3a5.5 5.5 0 1 0 3.4 9.82l3.64 3.63 1.06-1.06-3.63-3.64A5.5 5.5 0 0 0 8.5 3Zm0 1.5a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}
