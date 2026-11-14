declare module 'virtual:doc-toc' {
  import type { TocEntry } from './toc'

  /** Map of `${locale}/${slug}` -> page outline, built at compile time. */
  const docToc: Record<string, TocEntry[]>
  export default docToc
}
