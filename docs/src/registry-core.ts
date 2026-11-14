import type { ComponentType } from 'react'
import type { TocEntry } from './toc'

/** Props MDX components accept — lets callers swap intrinsic elements (e.g. img). */
export type MdxProps = {
  // biome-ignore lint/suspicious/noExplicitAny: MDX's own components-map typing
  components?: Record<string, ComponentType<any>>
}

/**
 * Frontmatter every doc must declare. Group/order drive the sidebar
 * and never appear in the URL; the slug is the flat, per-locale-unique URL key.
 */
export type DocFrontmatter = {
  title: string
  slug: string
  group: string
  order: number
  summary: string
  /** Draft pages build in dev but are excluded from production entirely. */
  draft?: boolean
}

/**
 * Drop draft pages in production builds. A CS translation of a non-draft
 * source page keeps working; a draft source page takes its translations with
 * it (no orphaned routes).
 */
export function filterDrafts(entries: DocEntry[], isProduction: boolean): DocEntry[] {
  if (!isProduction) return entries
  const draftSourceSlugs = new Set(
    entries
      .filter(e => e.locale === SOURCE_LOCALE && e.frontmatter.draft)
      .map(e => e.frontmatter.slug)
  )
  return entries.filter(e => !e.frontmatter.draft && !draftSourceSlugs.has(e.frontmatter.slug))
}

export type Locale = 'en' | 'cs'

/**
 * Languages the site ships, in display order. English only for now. A second
 * language is a folder under content/ and its code here.
 */
export const LOCALES: Locale[] = ['en']

/**
 * Source language. Other locales fall back to this when a page isn't translated.
 * Whichever locale is source owns the unprefixed URLs.
 */
export const SOURCE_LOCALE: Locale = 'en'

/**
 * Build a docs URL path. The source language is unprefixed (`/`, `/<slug>`);
 * other locales are prefixed (`/cs`, `/cs/<slug>`). The single place URL shape is
 * decided, so links and routes can't drift apart.
 */
export function docPath(locale: Locale, slug?: string): string {
  const prefix = locale === SOURCE_LOCALE ? '' : `/${locale}`
  if (!slug) return prefix || '/'
  return `${prefix}/${slug}`
}

/** A single doc, in a single language, plus its rendered MDX component. */
export type DocEntry = {
  locale: Locale
  frontmatter: DocFrontmatter
  Component: ComponentType<MdxProps>
  /** "On this page" outline, extracted from the MDX source at build time. */
  toc: TocEntry[]
}

/** A page as it appears in the sidebar / prev-next navigation. */
export type NavItem = {
  slug: string
  title: string
  order: number
  /** One-line description, used on landing cards. */
  summary: string
}

/** One sidebar group: a labelled, ordered list of pages. */
export type NavGroup = {
  group: string
  items: NavItem[]
}

/** The navigation/lookup model the rest of the app reads from. */
export type Registry = {
  all: DocEntry[]
  /** Resolve a doc by language + slug, or null when it doesn't exist. */
  resolve: (locale: Locale, slug: string) => DocEntry | null
}

const REQUIRED_FIELDS: (keyof DocFrontmatter)[] = ['title', 'slug', 'group', 'order', 'summary']

/**
 * Build the registry from already-collected doc entries. Pure on purpose: it
 * takes plain data so it can be unit-tested without the MDX/Vite pipeline.
 *
 * Throws when two docs in the same locale share a slug — a slug collision would
 * make `/docs/<lang>/<slug>` ambiguous, so we fail the build rather than ship it.
 */
export function buildRegistry(entries: DocEntry[]): Registry {
  const byKey = new Map<string, DocEntry>()

  for (const entry of entries) {
    for (const field of REQUIRED_FIELDS) {
      if (entry.frontmatter[field] === undefined || entry.frontmatter[field] === '') {
        throw new Error(
          `Doc "${entry.frontmatter.slug ?? '(unknown)'}" (${entry.locale}) is missing required frontmatter field "${field}".`
        )
      }
    }

    const key = `${entry.locale}:${entry.frontmatter.slug}`
    if (byKey.has(key)) {
      throw new Error(`Duplicate doc slug "${entry.frontmatter.slug}" in locale "${entry.locale}".`)
    }
    byKey.set(key, entry)
  }

  return {
    all: [...byKey.values()],
    resolve: (locale, slug) => byKey.get(`${locale}:${slug}`) ?? null,
  }
}

/** A doc resolved for a requested locale, noting whether it fell back to source. */
export type ResolvedDoc = {
  entry: DocEntry
  /** True when the requested locale had no translation and we served the source. */
  notTranslated: boolean
}

/**
 * Resolve a doc for the requested locale, falling back to the source language
 * when there's no translation yet. Returns null only when the slug doesn't
 * exist in the requested locale OR the source.
 */
export function resolveWithFallback(
  registry: Registry,
  locale: Locale,
  slug: string,
  sourceLocale: Locale = SOURCE_LOCALE
): ResolvedDoc | null {
  const direct = registry.resolve(locale, slug)
  if (direct) return { entry: direct, notTranslated: false }

  if (locale !== sourceLocale) {
    const fallback = registry.resolve(sourceLocale, slug)
    if (fallback) return { entry: fallback, notTranslated: true }
  }
  return null
}

/**
 * Build the single-level sidebar tree. The structure (groups, order, slugs)
 * comes from `sourceLocale` so the nav is identical across languages; each
 * item's title uses the `locale` translation when one exists, else the source
 * title. Pages are ordered by `order` (title tie-break); groups by their lowest
 * page order (group name tie-break).
 *
 * With `sourceLocale === locale` (the default) this is a plain single-locale
 * tree.
 */
export function buildNavTree(
  entries: DocEntry[],
  locale: Locale,
  sourceLocale: Locale = locale
): NavGroup[] {
  const translated = new Map(
    entries.filter(e => e.locale === locale).map(e => [e.frontmatter.slug, e.frontmatter])
  )
  const groups = new Map<string, NavItem[]>()

  for (const entry of entries) {
    if (entry.locale !== sourceLocale) continue
    const { slug, title, order, group, summary } = entry.frontmatter
    const tr = translated.get(slug)
    const items = groups.get(group) ?? []
    items.push({ slug, order, title: tr?.title ?? title, summary: tr?.summary ?? summary })
    groups.set(group, items)
  }

  const tree: NavGroup[] = [...groups.entries()].map(([group, items]) => ({
    group,
    items: items.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)),
  }))

  const minOrder = (g: NavGroup) => Math.min(...g.items.map(i => i.order))
  return tree.sort((a, b) => minOrder(a) - minOrder(b) || a.group.localeCompare(b.group))
}

/**
 * Previous/next page within the same group, following the sidebar order.
 * Either side is null at a group boundary or when the slug isn't found.
 */
export function getAdjacent(
  entries: DocEntry[],
  locale: Locale,
  slug: string,
  sourceLocale: Locale = locale
): { prev: NavItem | null; next: NavItem | null } {
  for (const { items } of buildNavTree(entries, locale, sourceLocale)) {
    const i = items.findIndex(item => item.slug === slug)
    if (i !== -1) {
      return { prev: items[i - 1] ?? null, next: items[i + 1] ?? null }
    }
  }
  return { prev: null, next: null }
}
