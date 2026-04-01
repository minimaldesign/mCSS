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
  assets/         Images, icons (assets/icons/), component assets (assets/ui/)
  scripts/        Shared JS utilities (globals.js, utilities.js)
  tools/          Build/tooling scripts (.cjs)
```

## Where to Put Things

| You're adding...      | Put it in...                      | Also do...                                                              |
| --------------------- | --------------------------------- | ----------------------------------------------------------------------- |
| New page route        | `src/pages/`                      | —                                                                       |
| New reusable UI       | `src/components/`                 | If it needs CSS: add `component.<name>.css` and import in `_global.css` |
| New atom style        | `src/styles/atom.<name>.css`      | Import in Atoms block of `_global.css`                                  |
| New component style   | `src/styles/component.<name>.css` | Import in Components block of `_global.css`                             |
| New blog post         | `src/content/blog/`               | Match schema (see agents/content.md)                                    |
| New doc page          | `src/content/docs/`               | Match schema (see agents/content.md)                                    |
| New component doc     | `src/content/components/`         | Match schema incl. `type` field                                         |
| New layout            | `src/layouts/`                    | Use from the relevant `pages/*` route                                   |
| New SVG icon          | `src/assets/icons/`               | Run `node src/tools/icons-cleanup.cjs` after                            |
| Config / integrations | `astro.config.mjs`                | —                                                                       |
