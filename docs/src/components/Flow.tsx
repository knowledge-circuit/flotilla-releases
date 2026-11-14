import { useEffect, useId, useRef, useState } from 'react'
import { currentTheme, THEME_EVENT } from '../theme'

/**
 * A flowchart in a doc page, written as Mermaid source in the MDX body:
 *
 *   <Flow>{`flowchart LR
 *     A[you] --> B[orchestrator]`}</Flow>
 *
 * Mermaid is bundled and loaded only on a page
 * that draws something, because it is the heaviest thing on the site by far. The
 * pre-rendered HTML carries the source in a <pre>; the browser replaces it with the SVG
 * after hydration, and a reader with scripts off still gets a readable step list.
 * Available in MDX without an import (DocPage passes it through the components map).
 */
export default function Flow({ children }: { children: string }) {
  const source = String(children).trim()
  const id = useId().replace(/[^a-zA-Z0-9]/g, '')
  const host = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string | null>(null)
  // Bumped when the reader switches theme, so the diagram redraws in the new colours.
  const [themeTick, setThemeTick] = useState(0)

  useEffect(() => {
    const bump = () => setThemeTick(n => n + 1)
    window.addEventListener(THEME_EVENT, bump)
    return () => window.removeEventListener(THEME_EVENT, bump)
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: themeTick is the redraw trigger
  useEffect(() => {
    let cancelled = false
    async function draw() {
      const { default: mermaid } = await import('mermaid')
      const dark = currentTheme() === 'dark'
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        fontFamily: 'inherit',
        themeVariables: dark
          ? {
              darkMode: true,
              background: '#0f0f11',
              primaryColor: '#1a1a1e',
              primaryTextColor: '#ededf0',
              primaryBorderColor: '#4fb0f0',
              lineColor: '#9a9aa3',
              secondaryColor: '#1a1a1e',
              tertiaryColor: '#1a1a1e',
              clusterBkg: 'rgba(79,176,240,.08)',
              clusterBorder: '#4fb0f0',
              edgeLabelBackground: '#0f0f11',
            }
          : {
              background: '#ffffff',
              primaryColor: '#f6f6f8',
              primaryTextColor: '#1c1c1f',
              primaryBorderColor: '#007acc',
              lineColor: '#6b6b73',
              secondaryColor: '#f6f6f8',
              tertiaryColor: '#f6f6f8',
              clusterBkg: 'rgba(0,122,204,.07)',
              clusterBorder: '#007acc',
              edgeLabelBackground: '#ffffff',
            },
        flowchart: { htmlLabels: true, curve: 'basis', padding: 12, useMaxWidth: true },
      })
      try {
        const out = await mermaid.render(`flow-${id}`, source)
        if (!cancelled) setSvg(out.svg)
      } catch {
        // Leave the source visible; a broken diagram is a doc bug, not a page failure.
      }
    }
    draw()
    return () => {
      cancelled = true
    }
  }, [source, id, themeTick])

  if (svg) {
    // biome-ignore lint/security/noDangerouslySetInnerHtml: SVG produced by mermaid in strict mode from our own source
    return <div ref={host} className="doc-flow" dangerouslySetInnerHTML={{ __html: svg }} />
  }
  return (
    <div ref={host} className="doc-flow doc-flow-source">
      <pre>{source}</pre>
    </div>
  )
}
