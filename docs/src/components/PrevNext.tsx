import { Link } from 'react-router-dom'
import { t } from '../i18n'
import { docPath, type Locale, type NavItem } from '../registry-core'

type PrevNextProps = {
  locale: Locale
  prev: NavItem | null
  next: NavItem | null
}

export default function PrevNext({ locale, prev, next }: PrevNextProps) {
  if (!prev && !next) return null

  return (
    <nav className="doc-prevnext" aria-label="Pagination">
      {prev ? (
        <Link to={docPath(locale, prev.slug)} className="doc-prevnext-link is-prev">
          <span className="doc-prevnext-label">{t(locale, 'previous')}</span>
          <span className="doc-prevnext-title">{prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link to={docPath(locale, next.slug)} className="doc-prevnext-link is-next">
          <span className="doc-prevnext-label">{t(locale, 'next')}</span>
          <span className="doc-prevnext-title">{next.title}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
