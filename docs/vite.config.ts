/// <reference types="vitest/config" />
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import mdx from '@mdx-js/rollup'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import rehypeSlug from 'rehype-slug'
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import { defineConfig, type Plugin } from 'vite'
import { extractToc } from './src/toc'

const root = dirname(fileURLToPath(import.meta.url))

/**
 * Build-time "On this page" outlines. @mdx-js/rollup strips the `?raw` query and
 * compiles every .mdx, so we can't read raw source through import.meta.glob.
 * Instead we read the content files here in Node and expose a slug-keyed map as
 * a virtual module. rehype-slug gives the rendered headings matching ids.
 */
function docTocPlugin(): Plugin {
  const virtualId = 'virtual:doc-toc'
  const resolvedId = `\0${virtualId}`
  const contentDir = join(root, 'content')

  return {
    name: 'doc-toc',
    resolveId(id) {
      if (id === virtualId) return resolvedId
    },
    load(id) {
      if (id !== resolvedId) return
      const map: Record<string, ReturnType<typeof extractToc>> = {}
      const files = readdirSync(contentDir, { recursive: true })
      for (const entry of files) {
        const rel = String(entry)
        if (!rel.endsWith('.mdx')) continue
        const [locale] = rel.split(/[/\\]/)
        const source = readFileSync(join(contentDir, rel), 'utf8')
        const slug = /(^|\n)slug:\s*(\S+)/.exec(source.split(/\n---/)[0] ?? '')?.[2]
        if (slug) map[`${locale}/${slug}`] = extractToc(source)
      }
      return `export default ${JSON.stringify(map)}`
    },
  }
}

// Where the site is served: GitHub Pages puts a project site under /<repo>/. Everything in
// src/ derives from import.meta.env.BASE_URL; this is the one place it is set.
const base = process.env.DOCS_BASE ?? '/flotilla-releases/'

/**
 * Content links and images are written as /docs/..., and moved under the real base here,
 * so one source fits every prefix the site is built for.
 */
function remarkBase() {
  type Node = { type: string; url?: string; children?: Node[] }
  const walk = (node: Node) => {
    if ((node.type === 'link' || node.type === 'image') && node.url?.startsWith('/docs/')) {
      node.url = base + node.url.slice('/docs/'.length)
    }
    node.children?.forEach(walk)
  }
  return (tree: Node) => walk(tree)
}

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        // Order matters: parse frontmatter, expose it as an export, then GFM.
        remarkPlugins: [
          remarkFrontmatter,
          remarkMdxFrontmatter,
          remarkGfm,
          remarkBase,
        ],
        // Add id attributes to headings so the "On this page" TOC can anchor-link.
        rehypePlugins: [rehypeSlug],
      }),
    },
    react(),
    tailwindcss(),
    docTocPlugin(),
  ],
  server: {
    host: '127.0.0.1',
    port: Number(process.env.DOCS_PORT) || 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    projects: [
      {
        // Pure-logic unit tests (node env) — the content/nav registry seam.
        extends: true,
        test: {
          name: 'unit',
          environment: 'node',
          include: ['src/**/*.test.{ts,tsx}'],
        },
      },
    ],
  },
})
