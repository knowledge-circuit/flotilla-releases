import Breadcrumbs from './components/Breadcrumbs'
import Callout from './components/Callout'
import DocLayout from './components/DocLayout'
import Flow from './components/Flow'
import PrevNext from './components/PrevNext'
import ZoomImage from './components/ZoomImage'
import { tGroup } from './i18n'
import { registry } from './registry'
import {
  buildNavTree,
  getAdjacent,
  type Locale,
  resolveWithFallback,
  SOURCE_LOCALE,
} from './registry-core'

/**
 * Renders a single feature doc within the docs chrome. `locale` is the requested
 * language; the content falls back to the source language when no translation exists. Nav/prev-next follow the source structure so the
 * sidebar is identical across languages.
 */
export default function DocPage({ locale, slug }: { locale: Locale; slug: string }) {
  const resolved = resolveWithFallback(registry, locale, slug)
  if (!resolved) return null

  const { entry } = resolved
  const Content = entry.Component
  const { frontmatter } = entry
  const tree = buildNavTree(registry.all, locale, SOURCE_LOCALE)
  const { prev, next } = getAdjacent(registry.all, locale, slug, SOURCE_LOCALE)

  return (
    <DocLayout locale={locale} slug={slug} tree={tree} toc={entry.toc}>
      <Breadcrumbs
        locale={locale}
        group={tGroup(locale, frontmatter.group)}
        title={frontmatter.title}
      />
      {/* Pagefind indexes only the article body, filtered by language. */}
      <article className="doc-content" data-pagefind-body data-pagefind-filter={`lang:${locale}`}>
        <p className="doc-eyebrow">{tGroup(locale, frontmatter.group)}</p>
        <h1>{frontmatter.title}</h1>
        <p className="doc-summary">{frontmatter.summary}</p>
        <Content components={{ img: ZoomImage, Callout, Flow }} />
      </article>
      <PrevNext locale={locale} prev={prev} next={next} />
    </DocLayout>
  )
}
