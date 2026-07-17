# AGENTS.md

mCSS is a CSS framework (ITCSS-based) with an Astro 6 documentation site, component library, and blog built on top of it.

## Build

| Command         | Purpose              |
| --------------- | -------------------- |
| `npm run dev`   | Astro dev server     |
| `npm run build` | Production build     |

Stack: Astro 6, Preact, MDX, PostCSS. No test runner.

## Critical Rule

mCSS uses native CSS cascade layers. Framework files import with `layer(<name>)` in `src/styles/framework/mcss.css`; site-only files import unlayered in `src/styles/_global.css`. The layer name (not import order) decides priority, and the preset-env `cascade-layers` polyfill must stay disabled in `postcss.config.cjs`. See [agents/css.md](agents/css.md) for the full rules.

## Formatting

- 2 spaces in `.astro` / `.js` / `.ts`; **4 spaces in CSS** (see `.editorconfig`).
- Relative imports for Astro components (e.g. `../components/Name.astro`).

## Detail Files

- [agents/css.md](agents/css.md) — CSS architecture, layer order, naming conventions, adding styles
- [agents/structure.md](agents/structure.md) — Directory map, where to put new files
- [agents/content.md](agents/content.md) — Content collections, schemas, slugs
- [agents/components.md](agents/components.md) — Astro vs Preact, naming, layouts
- [agents/pitfalls.md](agents/pitfalls.md) — PurgeCSS, URL slugs, theme persistence
