import type { ReactNode } from 'react'

/**
 * The "Why it works this way" box: a decision explained at the moment the reader meets the thing
 * it explains. Deliberately the only callout kind: one box, one job, no severity ladder.
 * Available in MDX without an import (DocPage passes it through the components map).
 */
export default function Callout({
  title = 'Why it works this way',
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <aside className="doc-callout">
      <p className="doc-callout-title">{title}</p>
      <div className="doc-callout-body">{children}</div>
    </aside>
  )
}
