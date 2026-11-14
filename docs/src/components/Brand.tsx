import { Link } from 'react-router-dom'
import { t } from '../i18n'
import { docPath, type Locale } from '../registry-core'

/** "Flotilla | Docs" brand link: sidebar top on desktop, topbar on mobile. */
export default function Brand({ locale }: { locale: Locale }) {
  return (
    <Link to={docPath(locale)} className="doc-brand">
      <svg className="doc-brand-mark" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3v11M12 4l6 9h-6M12 7l-4 6h4M4 17h16l-2.5 4h-11L4 17Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Flotilla
      <span className="doc-brand-divider" aria-hidden="true" />
      <span className="doc-brand-docs">{t(locale, 'docsHome')}</span>
    </Link>
  )
}
