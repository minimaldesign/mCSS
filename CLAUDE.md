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
- **`src/styles/`** — All CSS. `framework/` (the mCSS framework, in native `@layer` cascade layers, entry `framework/mcss.css`) and `site/` (docs-site-only CSS, imported unlayered). Site entry: `src/styles/_global.css`.
- **`src/scripts/`** — Shared JS utilities (`utilities.js`) and the theme toggle (`globals.js`).

## CSS cascade layers are load-bearing

The framework uses native `@layer`; the layer name (declared in `src/styles/framework/mcss.css`) decides priority, and unlayered site CSS beats every layer. Import new framework files with `layer(<name>)`, except `theme.*.css` files: those wrap themselves in `@layer theme` and are activated from the consumer entry (`_global.css`), never imported by `mcss.css`. Never re-enable preset-env's `cascade-layers` polyfill in `postcss.config.cjs`. Always consult [agents/css.md](agents/css.md) before adding or moving CSS files.

## Detailed reference docs

All architectural detail is in the `agents/` directory — read these before making structural changes:

- [agents/css.md](agents/css.md) — Layer order, BEM-like naming (`.block_element-modifier`, `.is-*` states)
- [agents/structure.md](agents/structure.md) — Directory map, where to place new files
- [agents/content.md](agents/content.md) — Content collection schemas, slug/URL behaviour
- [agents/components.md](agents/components.md) — Astro vs Preact choice, hydration directives, naming conventions
- [agents/pitfalls.md](agents/pitfalls.md) — PurgeCSS (installed but disabled), URL slug changes, theme storage (sessionStorage, not localStorage)

## Formatting

- No em/en dashes in sentence construction (site copy, docs, comments, commit messages): when a period, comma, colon, or parentheses would work, use that instead. Legitimately correct typographic uses are fine: ranges (`h1`–`h6`, ideally a closed-up en dash), the dash introducing the name or source of a quote, table-cell placeholders for "no default".
- 2 spaces everywhere, including `.css` (enforced by `.editorconfig`).
- Relative imports for all local Astro components.
- JSX targets Preact (`jsxImportSource: "preact"` in `tsconfig.json`) — do not import from React.

## Instructions

When compacting, always preserve the full list of modified files
