# AGENTS.md

mCSS is a CSS framework (ITCSS-based) with an Astro 5 documentation site, component library, and blog built on top of it.

## Build

| Command         | Purpose              |
| --------------- | -------------------- |
| `npm run dev`   | Astro dev server     |
| `npm run build` | Production build     |

Stack: Astro 5, Preact, MDX, PostCSS. No test runner.

## Critical Rule

CSS layer order in `src/styles/_global.css` is load-bearing. When adding any new CSS file, you **must** add its `@import` in the correct layer position in that file. See [agents/css.md](agents/css.md) for the full layer order.

## Formatting

- 2 spaces in `.astro` / `.js` / `.ts`; **4 spaces in CSS** (see `.editorconfig`).
- Relative imports for Astro components (e.g. `../components/Name.astro`).

## Detail Files

- [agents/css.md](agents/css.md) — CSS architecture, layer order, naming conventions, adding styles
- [agents/structure.md](agents/structure.md) — Directory map, where to put new files
- [agents/content.md](agents/content.md) — Content collections, schemas, slugs
- [agents/components.md](agents/components.md) — Astro vs Preact, naming, layouts
- [agents/pitfalls.md](agents/pitfalls.md) — PurgeCSS, URL slugs, theme persistence
