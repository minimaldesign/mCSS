# Pitfalls

## Cascade-layers polyfill

`postcss.config.cjs` sets `features: { "cascade-layers": false }` for postcss-preset-env. Without it, the polyfill **strips every `@layer` rule** from the build and replaces the cascade with `:not(#\#)` specificity hacks — the site still renders, but the layer semantics (and the "unlayered consumer CSS wins" guarantee) silently disappear. The browser floor lives in `.browserslistrc`.

## PurgeCSS

PurgeCSS runs on the built site via `astro-purgecss` (configured in `astro.config.mjs`). It was disabled from October 2024 to November 2026 because purgecss dropped selectors made only of pseudo-classes (`:is(h2, h3):hover`, `:where(:not(.x))`); purgecss 9 fixed that. `astro-purgecss` still pins purgecss 8 in its peer range, so `package.json` carries an `overrides` entry forcing 9. Two site-specific adjustments live in the config and must stay:

- A custom `defaultExtractor` that keeps `+` in tokens, otherwise `span="2+3"` on `.grid_item` loses its `[span$=\+3]` rules.
- A `safelist.standard` for classes only JavaScript adds (`is-*`, `theme-dark`/`theme-light`, `body-is-locked`). A new runtime-toggled class that doesn't start with `is-` must be added there, or it ships unstyled.

Purging is verified by diffing the selector inventory of a purged build against an unpurged one and testing every removed selector with `querySelector` across all built pages (last run 2026-11-07: 780 removed, 0 false positives). Known cosmetic quirk: `astro-purgecss` assumes an 8-character Vite hash when renaming, so the expressive-code stylesheet (5-character hash) lands at `/_astro.<hash>.css` instead of under `/_astro/`. It still loads.

## Content Slugs = File Paths

URLs for blog posts, docs, and component pages are derived from their file paths. Renaming or moving a content file **will change its URL** with no automatic redirect.

## Theme Toggle

The light/dark toggle persists in **`localStorage`** (key `theme`). The inline script in `BaseLayout.astro` applies the class before paint to avoid FOUC; the toggle behavior itself lives in `ThemeToggle.astro` (self-contained; rendered twice, its module script runs once). Don't introduce a second color-scheme mechanism. (Theme files, `theme.*.css`, are full themes and unrelated to the light/dark toggle.)
