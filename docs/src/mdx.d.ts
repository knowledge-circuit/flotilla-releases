declare module '*.mdx' {
  import type { MdxProps } from './registry-core'

  export const frontmatter: Record<string, unknown>
  const MDXComponent: (props: MdxProps) => JSX.Element
  export default MDXComponent
}
