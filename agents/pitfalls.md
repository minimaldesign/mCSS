# Pitfalls

## PurgeCSS

PurgeCSS is installed but **disabled** (commented out in `astro.config.mjs`). If you enable it, ensure that dynamically-used class names (from components, CMS content, or JS-generated classes) are safelisted so they aren't purged.

## Content Slugs = File Paths

URLs for blog posts, docs, and component pages are derived from their file paths. Renaming or moving a content file **will change its URL** with no automatic redirect.

## Theme Toggle

The light/dark toggle uses **`sessionStorage`** (not localStorage) — the choice resets when the browser closes. The inline script in `BaseLayout.astro` applies the class before paint to avoid FOUC. Don't introduce a second theme mechanism.
