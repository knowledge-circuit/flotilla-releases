import { Link } from 'react-router-dom'
import DocIcon from './components/DocIcon'
import DocLayout from './components/DocLayout'
import SearchTrigger from './components/SearchTrigger'
import { t, tGroup } from './i18n'
import { registry } from './registry'
import { buildNavTree, docPath, type Locale, SOURCE_LOCALE } from './registry-core'

/**
 * Docs landing page: hero, search entry point, and Linear-style tile sections
 * built from the registry groups (source structure, so it's complete in every
 * language). Uses the shared docs chrome — same sidebar as every doc page,
 * no "On this page" rail.
 */
export default function Home({ locale }: { locale: Locale }) {
  const tree = buildNavTree(registry.all, locale, SOURCE_LOCALE)

  return (
    <DocLayout locale={locale} tree={tree}>
      <div className="doc-landing">
        <section className="doc-hero">
          <h1>{t(locale, 'heroTitle')}</h1>
          <p>{t(locale, 'heroSubtitle')}</p>
          <SearchTrigger locale={locale} />
        </section>

        {tree.map(group => (
          <section key={group.group} className="doc-tile-section">
            <h2 className="doc-tile-section-title">{tGroup(locale, group.group)}</h2>
            <ul className="doc-tile-grid">
              {group.items.map(item => (
                <li key={item.slug}>
                  <Link to={docPath(locale, item.slug)} className="doc-tile">
                    <span className="doc-tile-media">
                      <DocIcon slug={item.slug} />
                    </span>
                    <span className="doc-tile-body">
                      <span className="doc-tile-title">{item.title}</span>
                      <span className="doc-tile-summary">{item.summary}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </DocLayout>
  )
}
