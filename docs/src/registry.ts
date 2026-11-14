import docToc from 'virtual:doc-toc'
import type { ComponentType } from 'react'
import {
  buildRegistry,
  type DocEntry,
  type DocFrontmatter,
  filterDrafts,
  type Locale,
} from './registry-core'

/** Shape of an eagerly-imported MDX module (component + exported frontmatter). */
type MdxModule = {
  default: ComponentType
  frontmatter?: Partial<DocFrontmatter>
}

// Eagerly import every doc from the app-root content tree (../content from src/).
// Path looks like "../content/en/welcome.mdx"; the locale is the directory
// segment right after "content/".
const modules = import.meta.glob<MdxModule>('../content/**/*.mdx', { eager: true })

function localeFromPath(filePath: string): Locale {
  const match = filePath.match(/\/content\/([^/]+)\//)
  const locale = match?.[1]
  if (locale !== 'en' && locale !== 'cs') {
    throw new Error(`Doc "${filePath}" is not under a supported locale folder (en|cs).`)
  }
  return locale
}

const entries: DocEntry[] = Object.entries(modules).map(([filePath, mod]) => {
  const locale = localeFromPath(filePath)
  const frontmatter = (mod.frontmatter ?? {}) as DocFrontmatter
  return {
    locale,
    frontmatter,
    Component: mod.default,
    toc: docToc[`${locale}/${frontmatter.slug}`] ?? [],
  }
})

// Draft pages are hidden everywhere unless asked for: `VITE_SHOW_DRAFTS=1 pnpm dev` shows
// the whole sidebar contract while working on it; a production build never includes them.
const showDrafts = !import.meta.env.PROD && import.meta.env.VITE_SHOW_DRAFTS === '1'
export const registry = buildRegistry(filterDrafts(entries, !showDrafts))
