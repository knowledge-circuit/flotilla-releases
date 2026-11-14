import { describe, expect, it } from 'vitest'
import { extractToc } from './toc'

describe('extractToc', () => {
  it('extracts h2/h3 headings by default with slugged ids', () => {
    const src = ['## What you can do', 'text', '### Sub section', '## Where next'].join('\n')
    expect(extractToc(src)).toEqual([
      { depth: 2, text: 'What you can do', id: 'what-you-can-do' },
      { depth: 3, text: 'Sub section', id: 'sub-section' },
      { depth: 2, text: 'Where next', id: 'where-next' },
    ])
  })

  it('ignores the h1 and anything outside the depth range', () => {
    const src = ['# Title', '## Kept', '#### Too deep'].join('\n')
    expect(extractToc(src).map(e => e.text)).toEqual(['Kept'])
  })

  it('skips frontmatter and fenced code blocks', () => {
    const src = [
      '---',
      'title: Demo',
      '## not a heading in frontmatter',
      '---',
      '## Real heading',
      '```bash',
      '## not a heading in code',
      '```',
      '## Second heading',
    ].join('\n')
    expect(extractToc(src).map(e => e.text)).toEqual(['Real heading', 'Second heading'])
  })

  it('disambiguates duplicate headings like rehype-slug does', () => {
    const src = ['## Setup', '## Setup'].join('\n')
    expect(extractToc(src).map(e => e.id)).toEqual(['setup', 'setup-1'])
  })
})
