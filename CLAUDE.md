# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

mCSS is a CSS framework (ITCSS-based) paired with an Astro documentation site, component library, and blog. Stack: Astro 6, Preact, MDX, PostCSS (mixins + preset-env stage 2). No test runner.

## Commands

| Command             | Purpose                          |
| ------------------- | -------------------------------- |
| `npm run dev`       | Start Astro dev server           |
| `npm run build`     | Production static build          |
| `npm run preview`   | Preview the production build     |

## Architecture overview

- **`src/pages/`** — File-based routing. Dynamic routes: `docs/[...slug].astro`, `blog/[...slug].astro`, `components/[...slug].astro`.
- **`src/content/`** — MDX collections (`blog`, `docs`, `components`) with Zod schemas in `src/content.config.ts`. Files prefixed with `_` are excluded from collections.
- **`src/components/`** — Astro components (`.astro`) for static rendering; Preact components (`.jsx`) for interactive islands. Private/internal components are prefixed with `_`.
- **`src/layouts/`** — Five wrappers: `BaseLayout` (applies global CSS, theme toggle, OG meta), plus blog, docs, component, and demo variants.
- **`src/styles/`** — All CSS, imported in strict ITCSS layer order via `src/styles/_global.css`.
- **`src/scripts/`** — Shared JS utilities (`utilities.js`) and the theme toggle (`globals.js`).

## CSS layer order is load-bearing

Adding a CSS file without placing its `@import` in the correct position in `src/styles/_global.css` will silently break cascade specificity. Always consult [agents/css.md](agents/css.md) before adding or moving CSS files.

## Detailed reference docs

All architectural detail is in the `agents/` directory — read these before making structural changes:

- [agents/css.md](agents/css.md) — Layer order, BEM-like naming (`.block_element-modifier`, `.is-*` states)
- [agents/structure.md](agents/structure.md) — Directory map, where to place new files
- [agents/content.md](agents/content.md) — Content collection schemas, slug/URL behaviour
- [agents/components.md](agents/components.md) — Astro vs Preact choice, hydration directives, naming conventions
- [agents/pitfalls.md](agents/pitfalls.md) — PurgeCSS (installed but disabled), URL slug changes, theme storage (sessionStorage, not localStorage)

## Formatting

- 2 spaces everywhere, including `.css` (enforced by `.editorconfig`).
- Relative imports for all local Astro components.
- JSX targets Preact (`jsxImportSource: "preact"` in `tsconfig.json`) — do not import from React.

## Instructions

When compacting, always preserve the full list of modified files
