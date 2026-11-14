import { t } from '../i18n'
import type { Locale } from '../registry-core'
import type { TocEntry } from '../toc'

export default function TableOfContents({ toc, locale }: { toc: TocEntry[]; locale: Locale }) {
  if (toc.length === 0) return <aside className="doc-toc" aria-hidden="true" />

  return (
    <aside className="doc-toc" aria-label={t(locale, 'onThisPage')}>
      <p className="doc-toc-title">{t(locale, 'onThisPage')}</p>
      <ul>
        {toc.map(entry => (
          <li key={entry.id} className={`doc-toc-item depth-${entry.depth}`}>
            <a href={`#${entry.id}`}>{entry.text}</a>
          </li>
        ))}
      </ul>
    </aside>
  )
}
