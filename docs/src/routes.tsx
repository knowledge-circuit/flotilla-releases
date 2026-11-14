import type { RouteObject } from 'react-router-dom'
import DocPage from './DocPage'
import Home from './Home'
import { registry } from './registry'
import { docPath, LOCALES, resolveWithFallback } from './registry-core'

// Every slug that exists in any locale (the source set drives the structure).
const slugs = [...new Set(registry.all.map(doc => doc.frontmatter.slug))]

// One explicit static route per (locale, slug) that resolves — directly or via
// source fallback. The source language is unprefixed (/slug).
const docRoutes: RouteObject[] = LOCALES.flatMap(locale =>
  slugs
    .filter(slug => resolveWithFallback(registry, locale, slug) !== null)
    .map(slug => ({
      path: docPath(locale, slug),
      element: <DocPage locale={locale} slug={slug} />,
    }))
)

// Landing page per locale.
const homeRoutes: RouteObject[] = LOCALES.map(locale => ({
  path: docPath(locale),
  element: <Home locale={locale} />,
}))

export const routes: RouteObject[] = [...homeRoutes, ...docRoutes]
