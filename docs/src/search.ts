import { registry } from './registry'
import { buildNavTree, docPath, type Locale, SOURCE_LOCALE } from './registry-core'

/** A single search hit, after resolving Pagefind's lazy `data()`. */
export type SearchHit = {
  url: string
  title: string
  excerpt: string
}

type PagefindDoc = { url: string; meta: { title?: string }; excerpt: string }
type PagefindResult = { id: string; data: () => Promise<PagefindDoc> }
type Pagefind = {
  search: (
    query: string,
    options?: { filters?: Record<string, string> }
  ) => Promise<{ results: PagefindResult[] }>
}

let pagefindPromise: Promise<Pagefind> | null = null

/**
 * Load the Pagefind runtime that the post-build step writes to /pagefind/.
 * @vite-ignore keeps Vite from trying to bundle this build-time-only asset.
 */
export function loadPagefind(): Promise<Pagefind> {
  if (!pagefindPromise) {
    const url = `${import.meta.env.BASE_URL}pagefind/pagefind.js`
    pagefindPromise = import(/* @vite-ignore */ url) as Promise<Pagefind>
  }
  return pagefindPromise
}

const base = import.meta.env.BASE_URL.replace(/\/$/, '') // e.g. "/docs"

/** Normalize a Pagefind result URL to a clean, base-prefixed href. */
export function toHref(url: string): string {
  let path = url.replace(/index\.html$/, '').replace(/\.html$/, '')
  if (path !== base && !path.startsWith(`${base}/`)) {
    path = base + (path.startsWith('/') ? path : `/${path}`)
  }
  return path
}

/** Base-prefixed href for an app route (docPath is base-relative). */
function pageHref(locale: Locale, slug: string): string {
  return `${base}${docPath(locale, slug)}`
}

/**
 * Lightweight metadata search over the registry (title / summary / group).
 * Used in dev — where Pagefind's static index doesn't exist — and as a fallback
 * if the Pagefind runtime ever fails to load in production.
 */
function fallbackSearch(query: string, locale: Locale, limit: number): SearchHit[] {
  const q = query.toLowerCase()
  return buildNavTree(registry.all, locale, SOURCE_LOCALE)
    .flatMap(group => group.items.map(item => ({ ...item, group: group.group })))
    .filter(item => `${item.title} ${item.summary} ${item.group}`.toLowerCase().includes(q))
    .slice(0, limit)
    .map(item => ({ url: pageHref(locale, item.slug), title: item.title, excerpt: item.summary }))
}

/** Query the index for a locale, returning the top resolved hits. */
export async function searchDocs(query: string, locale: Locale, limit = 8): Promise<SearchHit[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  // Pagefind only exists in a built site; in dev, search metadata instead.
  if (import.meta.env.DEV) return fallbackSearch(trimmed, locale, limit)

  try {
    const pagefind = await loadPagefind()
    const { results } = await pagefind.search(trimmed, { filters: { lang: locale } })
    const docs = await Promise.all(results.slice(0, limit).map(result => result.data()))
    return docs.map(doc => ({
      url: toHref(doc.url),
      title: doc.meta.title ?? doc.url,
      excerpt: doc.excerpt,
    }))
  } catch {
    return fallbackSearch(trimmed, locale, limit)
  }
}
