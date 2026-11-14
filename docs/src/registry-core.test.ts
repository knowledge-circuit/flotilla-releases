import { describe, expect, it } from 'vitest'
import {
  buildNavTree,
  buildRegistry,
  type DocEntry,
  docPath,
  filterDrafts,
  getAdjacent,
  resolveWithFallback,
} from './registry-core'

const Dummy = () => null

function entry(overrides: Partial<DocEntry['frontmatter']> & { locale?: DocEntry['locale'] } = {}) {
  const { locale = 'en', ...fm } = overrides
  return {
    locale,
    Component: Dummy,
    toc: [],
    frontmatter: {
      title: 'Welcome',
      slug: 'welcome',
      group: 'Getting started',
      order: 1,
      summary: 'Intro',
      ...fm,
    },
  } satisfies DocEntry
}

describe('buildRegistry', () => {
  it('resolves a doc by locale + slug', () => {
    const reg = buildRegistry([entry({ slug: 'welcome' })])
    expect(reg.resolve('en', 'welcome')?.frontmatter.title).toBe('Welcome')
  })

  it('returns null for an unknown slug', () => {
    const reg = buildRegistry([entry({ slug: 'welcome' })])
    expect(reg.resolve('en', 'nope')).toBeNull()
  })

  it('allows the same slug across different locales', () => {
    const reg = buildRegistry([
      entry({ slug: 'welcome', locale: 'en' }),
      entry({ slug: 'welcome', locale: 'cs', title: 'Vítejte' }),
    ])
    expect(reg.resolve('cs', 'welcome')?.frontmatter.title).toBe('Vítejte')
  })

  it('throws on a duplicate slug within the same locale', () => {
    expect(() => buildRegistry([entry({ slug: 'welcome' }), entry({ slug: 'welcome' })])).toThrow(
      /duplicate doc slug/i
    )
  })

  it('throws when a required frontmatter field is missing', () => {
    expect(() => buildRegistry([entry({ summary: '' })])).toThrow(/missing required frontmatter/i)
  })
})

const docs = [
  entry({ slug: 'b-page', group: 'Investigations', order: 2, title: 'B' }),
  entry({ slug: 'a-page', group: 'Investigations', order: 1, title: 'A' }),
  entry({ slug: 'intro', group: 'Getting started', order: 1, title: 'Intro' }),
  entry({ slug: 'cs-only', group: 'Investigations', order: 9, title: 'CZ', locale: 'cs' }),
]

describe('buildNavTree', () => {
  it('groups pages and orders pages within a group by order', () => {
    const tree = buildNavTree(docs, 'en')
    const investigations = tree.find(g => g.group === 'Investigations')
    expect(investigations?.items.map(i => i.slug)).toEqual(['a-page', 'b-page'])
  })

  it('orders groups by their lowest page order', () => {
    // Getting started (order 1) and Investigations (min order 1) tie on min
    // order, so the group name breaks the tie alphabetically.
    const tree = buildNavTree(docs, 'en')
    expect(tree.map(g => g.group)).toEqual(['Getting started', 'Investigations'])
  })

  it('only includes pages from the requested locale', () => {
    const tree = buildNavTree(docs, 'en')
    const slugs = tree.flatMap(g => g.items.map(i => i.slug))
    expect(slugs).not.toContain('cs-only')
    expect(buildNavTree(docs, 'cs').flatMap(g => g.items.map(i => i.slug))).toEqual(['cs-only'])
  })
})

describe('getAdjacent', () => {
  it('returns prev/next within the same group', () => {
    expect(getAdjacent(docs, 'en', 'a-page')).toEqual({
      prev: null,
      next: { slug: 'b-page', title: 'B', order: 2, summary: 'Intro' },
    })
    expect(getAdjacent(docs, 'en', 'b-page').prev?.slug).toBe('a-page')
  })

  it('does not cross group boundaries', () => {
    // intro is alone in "Getting started"
    expect(getAdjacent(docs, 'en', 'intro')).toEqual({ prev: null, next: null })
  })

  it('returns nulls for an unknown slug', () => {
    expect(getAdjacent(docs, 'en', 'missing')).toEqual({ prev: null, next: null })
  })
})

describe('resolveWithFallback', () => {
  // Czech is the source language; English is the translation that may be missing.
  const reg = buildRegistry([
    entry({ slug: 'welcome', locale: 'en', title: 'Vítejte' }),
    entry({ slug: 'welcome', locale: 'cs', title: 'Welcome' }),
    entry({ slug: 'quickstart', locale: 'en', title: 'První kroky' }),
  ])

  it('serves the translation when it exists', () => {
    const r = resolveWithFallback(reg, 'cs', 'welcome')
    expect(r?.entry.frontmatter.title).toBe('Welcome')
    expect(r?.notTranslated).toBe(false)
  })

  it('falls back to the source language and flags it', () => {
    const r = resolveWithFallback(reg, 'cs', 'quickstart')
    expect(r?.entry.frontmatter.title).toBe('První kroky')
    expect(r?.notTranslated).toBe(true)
  })

  it('returns null when the slug exists in no locale', () => {
    expect(resolveWithFallback(reg, 'cs', 'missing')).toBeNull()
  })

  it('does not flag the source language itself', () => {
    expect(resolveWithFallback(reg, 'en', 'quickstart')?.notTranslated).toBe(false)
  })
})

describe('docPath', () => {
  it('leaves the source language unprefixed', () => {
    expect(docPath('en')).toBe('/')
    expect(docPath('en', 'welcome')).toBe('/welcome')
  })

  it('prefixes non-source languages', () => {
    expect(docPath('cs')).toBe('/cs')
    expect(docPath('cs', 'welcome')).toBe('/cs/welcome')
  })
})

describe('buildNavTree with source fallback', () => {
  const mixed = [
    entry({ slug: 'welcome', group: 'Getting started', order: 1, title: 'Welcome', locale: 'en' }),
    entry({ slug: 'welcome', group: 'Getting started', order: 1, title: 'Vítejte', locale: 'cs' }),
    entry({ slug: 'quickstart', group: 'Getting started', order: 2, title: 'Quickstart' }),
  ]

  it('builds the cs nav from the en structure, including untranslated pages', () => {
    const tree = buildNavTree(mixed, 'cs', 'en')
    const items = tree.flatMap(g => g.items)
    expect(items.map(i => i.slug)).toEqual(['welcome', 'quickstart'])
  })

  it('uses the translated title when present, else the source title', () => {
    const tree = buildNavTree(mixed, 'cs', 'en')
    const bySlug = Object.fromEntries(tree.flatMap(g => g.items).map(i => [i.slug, i.title]))
    expect(bySlug.welcome).toBe('Vítejte')
    expect(bySlug.quickstart).toBe('Quickstart')
  })
})

describe('filterDrafts', () => {
  const docs = [
    entry({ slug: 'live', locale: 'en' }),
    entry({ slug: 'live', locale: 'cs' }),
    entry({ slug: 'wip', locale: 'en', draft: true }),
    entry({ slug: 'wip', locale: 'cs' }), // translation of a draft source
  ]

  it('keeps everything in dev', () => {
    expect(filterDrafts(docs, false)).toHaveLength(4)
  })

  it('drops drafts and their translations in production', () => {
    const kept = filterDrafts(docs, true)
    expect(kept.map(e => `${e.locale}:${e.frontmatter.slug}`)).toEqual(['en:live', 'cs:live'])
  })

  it('drops a draft translation of a live source page', () => {
    const kept = filterDrafts(
      [entry({ slug: 'live', locale: 'en' }), entry({ slug: 'live', locale: 'cs', draft: true })],
      true
    )
    expect(kept.map(e => e.locale)).toEqual(['en'])
  })
})
