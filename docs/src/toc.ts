import GithubSlugger from 'github-slugger'

export type TocEntry = {
  depth: number
  text: string
  /** Anchor id — matches the id rehype-slug puts on the rendered heading. */
  id: string
}

type ExtractOptions = { minDepth?: number; maxDepth?: number }

/**
 * Pull the "On this page" outline out of raw MDX source. Pure and
 * node-testable: no MDX compilation, no DOM. Ids are computed with the same
 * github-slugger algorithm rehype-slug uses, so TOC links match heading anchors.
 *
 * Skips frontmatter and fenced code blocks so a `#comment` inside a snippet
 * isn't mistaken for a heading.
 */
export function extractToc(source: string, options: ExtractOptions = {}): TocEntry[] {
  if (typeof source !== 'string') return []
  const minDepth = options.minDepth ?? 2
  const maxDepth = options.maxDepth ?? 3

  const slugger = new GithubSlugger()
  const entries: TocEntry[] = []
  let inFence = false

  for (const rawLine of stripFrontmatter(source).split('\n')) {
    if (/^\s*(```|~~~)/.test(rawLine)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(rawLine)
    if (!match) continue

    const depth = match[1].length
    if (depth < minDepth || depth > maxDepth) continue

    const text = match[2].trim()
    entries.push({ depth, text, id: slugger.slug(text) })
  }

  return entries
}

/** Drop a leading `---` frontmatter block if present. */
function stripFrontmatter(source: string): string {
  if (!source.startsWith('---')) return source
  const end = source.indexOf('\n---', 3)
  if (end === -1) return source
  const after = source.indexOf('\n', end + 1)
  return after === -1 ? '' : source.slice(after + 1)
}
