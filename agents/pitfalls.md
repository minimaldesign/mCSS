# Pitfalls

## Cascade-layers polyfill

`postcss.config.cjs` sets `features: { "cascade-layers": false }` for postcss-preset-env. Without it, the polyfill **strips every `@layer` rule** from the build and replaces the cascade with `:not(#\#)` specificity hacks — the site still renders, but the layer semantics (and the "unlayered consumer CSS wins" guarantee) silently disappear. The browser floor lives in `.browserslistrc`.

## PurgeCSS

PurgeCSS was removed from dependencies (it was installed but disabled). If it ever comes back, dynamically-used class names (helpers in MDX, grid `col`/`span` attribute selectors, JS-toggled `is-*` classes) must be safelisted so they aren't purged.

## Content Slugs = File Paths

URLs for blog posts, docs, and component pages are derived from their file paths. Renaming or moving a content file **will change its URL** with no automatic redirect.

## Theme Toggle

The light/dark toggle persists in **`localStorage`** (key `theme`). The inline script in `BaseLayout.astro` applies the class before paint to avoid FOUC; the toggle behavior itself lives in `ThemeToggle.astro` (self-contained; rendered twice, its module script runs once). Don't introduce a second theme mechanism.
