import { Link } from 'react-router-dom'
import { t } from '../i18n'
import { docPath, type Locale } from '../registry-core'

type BreadcrumbsProps = {
  locale: Locale
  group: string
  title: string
}

export default function Breadcrumbs({ locale, group, title }: BreadcrumbsProps) {
  return (
    <nav className="doc-breadcrumbs" aria-label="Breadcrumb">
      <Link to={docPath(locale)}>{t(locale, 'docsHome')}</Link>
      <span aria-hidden="true">/</span>
      <span className="doc-breadcrumbs-group">{group}</span>
      <span aria-hidden="true">/</span>
      <span aria-current="page">{title}</span>
    </nav>
  )
}
