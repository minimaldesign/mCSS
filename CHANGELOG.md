# Changelog

All notable changes to mCSS. The framework follows the copy-it-you-own-it model: there is no package to update, so version numbers mark states of the repository you can copy from (each release is also a git tag).

## 1.0.0 (2026-07-21)

The official launch. Everything from the 0.9 beta reviewed, restructured, and built out into a full component framework for websites.

### Added

- **Component library**: 23 documented components, from atoms (button, badge, toggle) through content patterns (card, hero, FAQ, testimonial, pricing, pagination) to full page chrome (header with mobile menu, footer, banner). Every one is dogfooded on mcss.dev itself.
- **Theme system**: themes are swappable skins, one CSS file that reskins the whole site. New `theme` cascade layer, `theme.default.css` as a copyable starting point, and `theme.wireframe.css`, a hand-drawn wireframe skin, as the worked example. See the [themes docs](https://mcss.dev/docs/themes).
- **Marketing template**: a complete one-pager built only from the framework and library components, with a runtime theme switcher. [Live demo](https://mcss.dev/templates/marketing).
- **`dist/` build**: the whole framework pre-processed as a drop-in `mcss.css` / `mcss.min.css`, plus per-file copies in `dist/css/`. Committed to the repo and kept fresh by CI.
- **MIT license.**
- Machine-readable docs for AI agents, fluid heading scale, responsive grid gaps, themeable text selection color.

### Changed

- The framework now uses **native CSS cascade layers**: `settings, base, elements, global, components, theme, helpers`. Layer order, not import order or specificity, decides priority, and your own unlayered CSS beats the framework by default.
- Framework and docs-site CSS fully split (`src/styles/framework/` vs `src/styles/site/`).
- Docs site upgraded to Astro 7.

### Breaking

- Helper class short forms removed; use the full names.
- Component `extraClass` props renamed to `class`.
- The `atoms` layer collapsed into `components`; `atom.*` files are gone.
- The unused `pages` layer removed from the layer order.
- `settings.theme.default.css` renamed to `settings.ui.css`; "theme tokens" are now "interface tokens", and themes live in `theme.*.css` files instead.
- `--theme-border-color` and `--theme-shadow-color` renamed to `--ui-border-color` and `--ui-shadow-color`.
- Docs URLs lowercased on mcss.dev.

The last pre-1.0 state of the old file tree is preserved under the `v0.9.0` tag.

## 0.9.0 (2024-09-20)

Initial public beta: the framework (tokens, reset, elements, global styles, helpers) plus the first few components. Announced in [mCSS v.0.9](https://mcss.dev/blog/mcss-v.0.9).
