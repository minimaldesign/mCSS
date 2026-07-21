# Codebase Structure

## Directory Map

```
src/
  pages/          File-based routing (dynamic: blog/[...slug], docs/[...slug],
                  components/[...slug], tags/[tag])
  content/        MDX/MD content collections (see agents/content.md)
    blog/         Blog posts
    docs/         Documentation pages
    components/   Component documentation
  components/     Astro (.astro) and Preact (.jsx) components
  layouts/        Page wrappers (BaseLayout, BlogPostLayout, DocsPostLayout,
                  DocsComponentsLayout, DemoLayout)
  styles/         All CSS (see agents/css.md)
    framework/    The mCSS framework (cascade layers, entry: mcss.css)
    site/         Docs-site-only CSS (unlayered)
  assets/         Images, icons (assets/icons/), component assets (assets/ui/)
  scripts/        Shared JS utilities (globals.js, utilities.js)
  tools/          Build/tooling scripts (.cjs)
```

## Where to Put Things

| You're adding...      | Put it in...                      | Also do...                                                              |
| --------------------- | --------------------------------- | ----------------------------------------------------------------------- |
| New page route        | `src/pages/`                      | —                                                                       |
| New reusable UI       | `src/components/`                 | If it needs CSS: add `component.<name>.css` (see rows below)            |
| New library component style | `src/styles/framework/component.<name>.css` | Import with `layer(components)` in `framework/mcss.css` |
| New site-only style   | `src/styles/site/<prefix>.<name>.css` | Import (unlayered) in `_global.css`                                 |
| New blog post         | `src/content/blog/`               | Match schema (see agents/content.md)                                    |
| New doc page          | `src/content/docs/`               | Match schema (see agents/content.md)                                    |
| New component doc     | `src/content/components/`         | Match schema incl. `type` field                                         |
| New layout            | `src/layouts/`                    | Use from the relevant `pages/*` route                                   |
| New SVG icon          | `src/assets/icons/`               | Run `node src/tools/icons-cleanup.cjs` after                            |
| Config / integrations | `astro.config.mjs`                | —                                                                       |
