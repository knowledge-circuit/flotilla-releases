# Flotilla docs

The user documentation for Flotilla: a Vite + React + MDX site, pre-rendered to static HTML and published
with GitHub Pages at <https://knowledge-circuit.github.io/flotilla-releases/>.

## Commands

```sh
pnpm install
pnpm dev          # local dev server on http://127.0.0.1:5173/docs/
pnpm build        # pre-render to dist/ and build the Pagefind search index
pnpm preview      # serve the built site under /flotilla-releases/
pnpm test:unit    # registry and nav logic
pnpm type-check   # tsc --noEmit
pnpm check        # Biome
```

## Writing a page

Pages are `.mdx` files under `content/en/`. Each one declares five frontmatter fields, and a page that
misses one fails the build.

| Field | Meaning |
|---|---|
| `title` | The page's heading and its sidebar label. |
| `slug` | The URL, flat and unique. The group is never part of it. |
| `group` | The sidebar section. |
| `order` | Position. Groups sort by their lowest page. |
| `summary` | One line, shown under the title and on the landing tile. |

The groups and their `order` ranges:

| Group | Range | What belongs there |
|---|---|---|
| Start here | 10 to 19 | What it is, why, and the first run. |
| Concepts | 20 to 29 | How one part works and why it works that way. |
| Install | 30 to 39 | Requirements, installing, updating. |
| Guides | 40 to 49 | One task, step by step. |
| Reference | 50 to 59 | Tables to look things up in. |

Quote a `title` or `summary` that contains a colon. `draft: true` hides a page from the built site.

Links and images are written from `/docs/`, as `/docs/<slug>` and `/docs/images/...`. The build moves
them under the real base path.

Two components need no import:

- `<Callout>` is the "Why it works this way" box. `title="..."` changes its heading.
- `<Flow>` draws a Mermaid flowchart from the template string inside it.

An icon for a page's tile and sidebar row is one entry in `src/components/DocIcon.tsx`, keyed by slug.
Without one the page gets the document icon.

## Screenshots

There are none yet. A screenshot must show made-up projects and threads, never a real fleet: this repo is
public.

## Publishing

`.github/workflows/docs.yml` builds and deploys the site on every push to `main` that touches `docs/`.
The repo's Pages source must be set to "GitHub Actions".

`DOCS_BASE` sets the path the site is served under. It defaults to `/flotilla-releases/`, which is where
GitHub Pages puts a project site. Set it to `/` for a custom domain.
