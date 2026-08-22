# Changelog

All notable changes to mCSS. The framework follows the copy-it-you-own-it model: there is no package to update, so version numbers mark states of the repository you can copy from (each release is also a git tag).

## 1.4.1 (2026-08-22)

A one-bug release: the `.layout` scaffold grew a horizontal scrollbar on PC ([#72](https://github.com/minimaldesign/mCSS/pull/72)).

### Fixed

- **`100vw` removed from layout.** Where the vertical scrollbar takes layout space (Windows, Linux, and macOS set to "Always show scroll bars"), its gutter sits inside `100vw` but outside the width the page actually has to fill. `.layout` put that on the `<body>`, so every scaffolded page overflowed by the scrollbar's width, and the browser added a horizontal scrollbar along the bottom.
- **Header menu and read progress bar size set to `width: 100%`.** Both are `position: fixed`, so a percentage resolves against the initial containing block, without the gutter `100vw` counts. It's more consistent and removes the precedent of using `100vw` anywhere.

## 1.4.0 (2026-08-16)

The default theme: the framework now ships as structure plus one swappable file holding every design value, a new `external` layer makes third-party CSS easy to override, and the docs got a full restructure ([#65](https://github.com/minimaldesign/mCSS/issues/65)).

### Breaking

- **The `settings.*` design files become the default theme.** `settings.tokens.css` and `settings.ui.css` are now `theme.default.tokens.css` and `theme.default.ui.css`, imported by the new `theme.default.css` entry. `mcss.css` no longer carries any design values: your entry must activate the default theme right after it (`@import url(./framework/theme.default.css);`), and nothing paints without it.
- **The `theme` layer splits into `theme.default` and `theme.user`.** The default theme's parts land in `theme.default`; your own theme self-layers into `theme.user`, so your overrides beat the default no matter the import order. The full layer statement is now `base, elements, global, components, theme.default, theme.user, external, helpers`.
- **`theme.wireframe.css` is a composed entry**: it imports the default theme itself and holds only its deviations. Activate it INSTEAD of `theme.default.css`.
- **The feedback alias tier is gone.** The `--success-*` / `--danger-*` / `--warning-*` aliases are removed; components and themes use the `--yes-*` / `--no-*` / `--maybe-*` palettes directly.
- **`dist/mcss.css` bakes the default theme in**, so the single-file drop-in keeps painting on its own. `dist/css/mcss.css` (the per-file `@import` index) ships with the default theme import active and is now ordered by cascade layer.
- **Docs URLs restructured**: tokens + themes → `/docs/default-theme`, reset + elements → `/docs/default-html`, global + media queries → `/docs/layout`, Installation and Browser Support split out of Getting Started, and the marketing template lives on the new `/docs/components`. Every old URL (including the `.md` twins) 301s.

### Added

- **`external` cascade layer**, empty by default, between `theme.user` and `helpers`: import third-party CSS with `@import url(…) layer(external);` and it beats the framework but loses to all your unlayered CSS, at any specificity. Companion convention: `patch.*.css` files (like this site's `patch.astro.css`) hold your fixes to vendor styles.
- **`theme.starter.css`**: the starting point for writing your own theme.
- **`check-layers.mjs`** (`npm run check:layers`, wired into pre-commit and CI): the layer statement is deliberately duplicated (theme pins, docs code blocks, dist), so the build now derives it from `mcss.css` and the check fails when any copy drifts. `--fix` rewrites stale copies.
- Docs: dedicated Installation, Browser Support (with a version floor table), and Components pages; anchor scrolling clears the sticky header on mcss.dev.

### Fixed

- The marketing template imports `mcss.components.css` and `theme.default.css` (it rendered unstyled after the restructure).
- All redirects are real Netlify 301s in `public/_redirects`. Astro's config redirects emit meta-refresh HTML stubs, which broke `.md` twin fetchers (a 200 with HTML where agents expect markdown) and shadowed the edge rules.

## 1.3.0 (2026-07-31)

The compile floor now matches the docs: mCSS targets Baseline 2024, and the build stops polyfilling the features the framework was always meant to use natively ([#56](https://github.com/minimaldesign/mCSS/issues/56)).

### Breaking

- **Browser support floor raised to Baseline 2024** (`.browserslistrc` is now `baseline 2024`: Chrome/Edge 130, Firefox 132, Safari 18.2 or newer). The old floor (`defaults and supports css-cascade-layers`, ~2022) admitted browsers without `light-dark()`, so postcss-preset-env was polyfilling it, against the docs' "no polyfills" promise, and the polyfill's `@supports not (…) { :root * }` rules could beat component token overrides across cascade layers. Browsers from the 2022 to 2024 window are no longer supported; in them, `light-dark()` tokens now compute to unset colors, not the light palette (the old fallback claim in the docs was wrong for tokens either way, and has been corrected).

### Fixed

- **`dist/` is now genuinely polyfill-free.** `dist/mcss.css` drops 403 `--csstools-*` scratch declarations and ships `light-dark()`, nesting, and relative color syntax as written: 130 kB raw (was 159), 94 kB minified (was 121), 15.9 kB min+gzip (was 17.8). Nesting was previously being silently flattened by the same too-broad floor.
- The [PostCSS setup post](https://mcss.dev/blog/postcss-setup-for-mcss) documents the new floor, the browserslist 4.25 requirement for the `baseline` query, a `grep -c "csstools"` output check, and a troubleshooting entry for the `light-dark()` polyfill firing.

## 1.2.0 (2026-07-27)

Core and components split: the drop-in framework file no longer bundles the component library, so sites that build their own components stop paying for it.

### Added

- **`mcss.components.css`**: the component library now has its own entry file. All 25 `component.*.css` files import there (wrapped in `@layer components`), and `dist/` gains the matching drop-ins `mcss.components.css` / `mcss.components.min.css` (~5 KB min+gzip). Import it alongside `mcss.css`, in either order: the layer statement in `mcss.css` decides priority, exactly like the existing `theme` slot.

### Breaking

- **`dist/mcss.css` / `dist/mcss.min.css` are now the framework core only** (~17 KB min+gzip): settings, base, elements, global, and helpers, plus the empty `components` and `theme` layer slots. If you use the component library, add `dist/mcss.components.min.css` next to it. Source consumers: `framework/mcss.css` no longer imports `component.*.css`; import `framework/mcss.components.css` from your entry too (see `_global.css`).

## 1.1.0 (2026-07-24)

Tiles: one container-responsive list component replacing CardList and FeatureGrid.

### Added

- **[Tiles](https://mcss.dev/components/tiles)** (`component.tiles.css`, `Tiles.astro`): CardList and FeatureGrid consolidated into one **container-responsive** list component, built on container queries. Columns appear as the nearest size container crosses the size's thresholds, so the count answers the width of the column the list sits in, not the viewport: the same markup is 2-up in a docs column and 4-up in a wide one at the same window size. Sizes name the tile, and each is its own threshold set: bare `.tiles` / `.tiles-md` fits card-sized tiles (2 columns from a `36rem` container, then every `20rem`), `.tiles-sm` fits icon + blurb items (2 from `28rem`, then every `16rem`). No column cap: the column's width is the cap, and columns keep coming (up to 6 enumerated) as the container allows. To pin a count, set `--tiles-columns` on a hook class of your own.
- Every `.layout` scaffold declares its main column as a named size container (`container: main / inline-size`); that is what Tiles responds to inside the scaffolds, and your own rules can use it too (`@container main (width >= …)`). Outside a scaffold, wrap a tiles list in `.tiles_container` (required: without a container ancestor the queries never match and the list stays single-column).
- The mcss.dev blog index goes 4-up on a laptop purely through a page-scoped `--layout-content-width` override (`.blog-index` in `page.blog.css`): the pattern to copy for wide listing pages.

### Changed

- mcss.dev page classes (`.blog`, `.docs`) moved from `<main>` to the `<body>`, next to the scaffold classes, so a page class can override layout tokens (they are consumed by `.layout_content`, which sits between the two).

### Breaking

- `.cardList` and `.featureGrid` are gone, replaced by [Tiles](https://mcss.dev/components/tiles): `<ul class="cardList grid" col="1" col-md="2" col-lg="3">` is now `<ul class="tiles">`, and `<ul class="featureGrid grid" …>` is `<ul class="tiles tiles-sm">` (`.featureItem` markup is unchanged). The lists no longer ride on the `.grid` attribute system (which is unchanged for your own grids); instead of picking column counts per viewport breakpoint, you pick the tile size and the container's width decides. `CardList.astro` / `FeatureGrid.astro` are replaced by `Tiles.astro` (`size="sm"` for the former FeatureGrid), and the `cols` prop is gone.

### Fixed

- `getInitials` (the Avatar byline helper in `src/scripts/utilities.js`) doubled the first letter of a single-word name, so "Yann" rendered as "YY". Single-word names now yield one initial; pre-computed initials like "SR" still pass through untouched.
- The wireframe theme's per-element sketch tilt is live again: postcss-preset-env's `random-function` polyfill is now disabled (alongside the existing `cascade-layers`), so native `random()` passes through instead of being frozen into a single source-length-seeded value that also churned `dist/` on every edit.

## 1.0.0 (2026-07-21)

The official launch. Everything from the 0.9 beta reviewed, restructured, and built out into a full component framework for websites.

### Added

- **Component library**: 26 documented components, from atoms (button, badge, toggle) through content patterns (card, hero, FAQ, testimonial, pricing, pagination) to full page chrome (header with mobile menu, footer, banner). Every one is dogfooded on mcss.dev itself.
- **Theme system**: themes are swappable skins, one CSS file that reskins the whole site. New `theme` cascade layer, `theme.default.css` as a copyable starting point, and `theme.wireframe.css`, a hand-drawn wireframe skin, as the worked example. See the [themes docs](https://mcss.dev/docs/themes).
- **Layout library**: `global.layout.css` rebuilt from mcss.dev-specific styles into six page-level scaffolds: the `.layout` app shell (sticky footer) plus `.layout-centered`, `.layout-sidebar` (with a `.layout-sidebar-end` composition), `.layout-docs` (nav + main + TOC), `.layout-split`, and `.layout-cover`. Column widths come from the new `--layout-content-width` and `--layout-toc-width` tokens alongside `--layout-aside-width`. Every page on mcss.dev runs on them, with full-page demos under `/demos/layout/` and thumbnail diagrams in the [layouts docs](https://mcss.dev/docs/global#layouts).
- **Marketing template**: a complete one-pager built only from the framework and library components, with a runtime theme switcher. [Live demo](https://mcss.dev/templates/marketing).
- **`dist/` build**: the whole framework pre-processed as a drop-in `mcss.css` / `mcss.min.css`, plus per-file copies in `dist/css/`. Committed to the repo and kept fresh by CI.
- **MIT license.**
- Logical spacing helpers (`mis-*`, `mie-*`, `pis-*`, `pie-*`) and `.text-start` / `.text-end`: reading-direction-relative twins of the physical `ml/mr/pl/pr` and `.text-left/right` helpers, which stay for purely visual offsets.
- Machine-readable docs for AI agents, fluid heading scale, responsive grid gaps, themeable text selection color.
- `--highlight-500` token: the text marker color, consumed by the `--marker-color` interface token (what `<mark>` uses), so themes can restyle highlights from the palette.

### Changed

- The framework now uses **native CSS cascade layers**: `settings, base, elements, global, components, theme, helpers`. Layer order, not import order or specificity, decides priority, and your own unlayered CSS beats the framework by default.
- Framework and docs-site CSS fully split (`src/styles/framework/` vs `src/styles/site/`).
- Removed the `--layout-aside-background-color` interface token: no rule in the framework or the docs site ever consumed it. Style `.layout_content_aside` directly if you want an aside background.
- Removed the `--meter-color` token for the same reason: the `meter` element paints with `--meter-color-track/low/med/high`, and nothing ever consumed `--meter-color`.
- Docs site upgraded to Astro 7.

### Breaking

- Helper class short forms removed; use the full names.
- Component `extraClass` props renamed to `class`.
- The `atoms` layer collapsed into `components`; `atom.*` files are gone.
- The 0.9 `global.layout.css` internals (documented back then as mcss.dev examples, not templates) are gone: no more hidden mobile aside in `.layout-sidebar`, TOC `nth-of-type` slot, or hardcoded column widths. Docs-style pages use `.layout-docs` with an explicit `layout_content_aside-toc` class on the TOC aside.
- The unused `pages` layer removed from the layer order.
- `settings.theme.default.css` renamed to `settings.ui.css`; "theme tokens" are now "interface tokens", and themes live in `theme.*.css` files instead.
- `--theme-border-color` and `--theme-shadow-color` renamed to `--ui-border-color` and `--ui-shadow-color`.
- Docs URLs lowercased on mcss.dev.

The last pre-1.0 state of the old file tree is preserved under the `v0.9.0` tag.

## 0.9.0 (2024-09-20)

Initial public beta: the framework (tokens, reset, elements, global styles, helpers) plus the first few components. Announced in [mCSS v.0.9](https://mcss.dev/blog/mcss-v09).
