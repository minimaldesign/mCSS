---
version: alpha
name: mCSS
description: ITCSS-based CSS framework and documentation site with compact tokens, light/dark themes, and pragmatic component defaults.
colors:
  primary: "#0284c7"
  on-primary: "#ffffff"
  primary-hover: "#0ea5e9"
  neutral-50: "#f6f7f9"
  neutral-100: "#edeef1"
  neutral-400: "#8897a8"
  neutral-500: "#697a8e"
  surface: "#ffffff"
  surface-subtle: "#edeef1"
  text: "#23282e"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.833rem
    fontWeight: 400
    lineHeight: 1.5
  body-xs:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.694rem
    fontWeight: 400
    lineHeight: 1.5
  heading:
    fontFamily: "Avenir, Montserrat, Corbel, URW Gothic, source-sans-pro, ui-sans-serif, sans-serif"
    fontSize: 2.074rem
    fontWeight: 900
    lineHeight: 1.15
  h1:
    fontFamily: "Avenir, Montserrat, Corbel, URW Gothic, source-sans-pro, ui-sans-serif, sans-serif"
    fontSize: 2.074rem
    fontWeight: 900
    lineHeight: 1.15
  h2:
    fontFamily: "Avenir, Montserrat, Corbel, URW Gothic, source-sans-pro, ui-sans-serif, sans-serif"
    fontSize: 1.728rem
    fontWeight: 900
    lineHeight: 1.15
  h3:
    fontFamily: "Avenir, Montserrat, Corbel, URW Gothic, source-sans-pro, ui-sans-serif, sans-serif"
    fontSize: 1.44rem
    fontWeight: 900
    lineHeight: 1.15
  button:
    fontFamily: "ui-sans-serif, system-ui, sans-serif"
    fontSize: 0.833rem
    fontWeight: 600
    lineHeight: 1.375
  code:
    fontFamily: "Dank Mono, Inconsolata, Fira Mono, SF Mono, Monaco, Droid Sans Mono, Source Code Pro, Cascadia Code, Menlo, Consolas, DejaVu Sans Mono, ui-monospace, monospace"
    fontSize: 0.9em
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 3px
  md: 5px
  lg: 8px
  xl: 12px
  xxl: 16px
  round: 100000px
spacing:
  xs1: 4px
  xs2: 8px
  xs3: 12px
  sm1: 16px
  sm2: 20px
  sm3: 24px
  md1: 28px
  md2: 32px
  md3: 36px
  lg1: 40px
  lg2: 44px
  lg3: 48px
  xl1: 56px
  xl2: 64px
  xl3: 80px
  xxl1: 96px
  xxl2: 112px
  xxl3: 128px
components:
  button:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xs3}"
    height: "{spacing.md3}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xs3}"
    height: "{spacing.md3}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
  card:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm3}"
  notice:
    backgroundColor: "{colors.neutral-50}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "{spacing.sm1}"
  tag:
    backgroundColor: "{colors.neutral-100}"
    textColor: "{colors.neutral-500}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "{spacing.xs2}"
  avatar:
    backgroundColor: "{colors.neutral-400}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.round}"
    size: "{spacing.xl1}"
  header:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    height: "{spacing.xl1}"
  footer:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
---

## Overview

mCSS is a utility-conscious CSS framework and documentation site with an ITCSS cascade, compact component classes, and design tokens stored as CSS custom properties. The visual identity is clean, technical, and documentation-first: blue interaction color, cool neutral surfaces, dense spacing, rounded-but-not-pill shapes, and system typography that keeps pages fast and readable.

The canonical token sources are `src/styles/framework/settings.tokens.css` for raw scales and `src/styles/framework/settings.theme.default.css` for semantic theme and component defaults. This file translates those tokens into the DESIGN.md format for coding agents. When the CSS and this file disagree, the CSS source files win.

## Colors

The palette has three jobs:

- **Primary blue:** `--primary-*` drives links, primary buttons, progress, selected states, and documentation highlights.
- **Base neutrals:** `--base-*` handles text, borders, surfaces, dark mode surfaces, disabled states, and secondary metadata.
- **Feedback colors:** `--yes-*`, `--no-*`, and `--maybe-*` are reserved for success, danger, and warning states.

The live theme uses `light-dark()` heavily. In light mode, pages sit on `--base-0` with `--base-950` text. In dark mode, the body shifts to `--base-950`, text softens to `--base-200`, and links use `--primary-400`. Agents should preserve this dual-mode behavior instead of hard-coding a single foreground/background pair.

Use blue sparingly but confidently for interaction. Avoid adding unrelated accent palettes unless a feature truly needs a new semantic color.

## Typography

Body copy uses a system sans stack: `ui-sans-serif, system-ui, sans-serif`. Headings use the display stack from `--display`, with heavy `900` weight and tight `1.15` line-height. Code uses the repo's long monospace stack and should retain the compact inline-code treatment from `elements.text.css`.

The type scale is modest and documentation-friendly:

- Small UI text: `--text-xs` through `--text-sm`.
- Body text: `--text-md`.
- Section and card headings: `--text-lg`, `--text-xl`, and `--display-sm`.
- Major headings: `--display-md` and above.

Headings should use balanced wrapping and avoid oversized marketing-style type unless the existing page already establishes that treatment.

## Layout

Spacing is based on a 4px stepping scale with an 8px baseline. Prefer existing spacing tokens over one-off values. Common content gaps are `--sm3` (`24px`) and `--md3` (`36px`); compact controls use `--xs2` (`8px`) and `--xs3` (`12px`).

Layouts lean on three primitives:

- `.wrap` for constrained horizontal rhythm.
- `.grid` for responsive column systems.
- `.layout-*` shells for centered and sidebar documentation pages.

Documentation content is usually constrained around `70ch` to `77ch`. Sidebar layouts expose navigation from the `--md` breakpoint upward and add a secondary TOC at `--lg`.

Breakpoints are hard-coded in `settings.media-queries.css` because CSS custom properties cannot be used inside media queries: `xxs 240px`, `xs 360px`, `sm 480px`, `md 768px`, `lg 1024px`, `xl 1440px`, `xxl 1920px`.

## Elevation & Depth

Depth is subtle and tokenized with `--shadow-sm` through `--shadow-xxl`. Shadows use `--theme-shadow-color`, which changes between light and dark mode. Cards can be plain, filled, or raised; raised cards increase shadow on hover.

Use shadows to distinguish actionable or layered surfaces, not as page-section decoration. Borders are often enough for quiet documentation UI.

## Shapes

The shape scale is intentionally small:

- `--radius-sm` (`3px`) for inline code, small loading bars, and small affordances.
- `--radius-md` (`5px`) for tags, inputs, tables, and blockquotes.
- `--radius-lg` (`8px`) for buttons, cards, and notices.
- `--radius-xl` (`12px`) for larger buttons and hero media.
- `--radius-round` for avatars and circular controls.

Default components should feel crisp and slightly rounded, not bubbly. Prefer `--radius-lg` for new component containers unless the surrounding component family suggests otherwise.

## Components

Buttons use `.button` or `.bt`, with variants such as `.bt-primary`, `.bt-outline`, `.bt-text`, `.bt-yes`, `.bt-no`, and `.bt-maybe`. They are inline-flex, semi-bold, minimum `36px` tall by default, and use a fast `100ms` transition. Active buttons scale to `0.97`.

Cards use `.card` with `.card-filled` and `.card-raised` variants. Keep internal spacing on `--card-spacing` and use `.card_header`, `.card_media`, `.card_content`, and `.card_actions` for composition.

Tags, notices, avatars, headers, footers, hero controls, and the read-progress bar all have semantic custom properties in `settings.theme.default.css`. When creating a new component, add semantic tokens there before using raw scale values inside component CSS.

Class naming is BEM-like with mCSS separators: `.block`, `.block_element`, `.block-modifier`, and `.is-*` state classes composed inside the block.

## Do's and Don'ts

Do preserve the native cascade-layer setup: framework files import into named layers (`settings, base, elements, global, components, helpers`) via `src/styles/framework/mcss.css`; site-only files import unlayered via `src/styles/_global.css`.

Do add new CSS files with the correct layer prefix, such as `component.name.css` or `help.name.css`, then import them with `layer(<name>)` in `framework/mcss.css` (framework) or plainly in `_global.css` (site).

Do use semantic theme tokens when they exist. Raw palette tokens are fine for new semantic roles, but component CSS should converge on named component properties.

Do keep all formatting at 2 spaces (CSS, Astro, JS, TS), per `.editorconfig`.

Don't use page-specific CSS when a reusable component is the better fit.

Don't bypass dark mode by hard-coding light-only text, border, or surface colors.

Don't add helper utilities casually; the helper layer has high specificity and should remain a last resort.
