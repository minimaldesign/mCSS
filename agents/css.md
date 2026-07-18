# CSS Architecture

mCSS uses **native CSS cascade layers** (`@layer`) on top of an ITCSS-inspired file structure. The framework and the docs site are split:

- **`src/styles/framework/`** — the mCSS framework. Entry point `framework/mcss.css` declares the layer order and imports every framework file into its named layer. **The layer name, not import order, decides cascade priority.**
- **`src/styles/site/`** — docs-site-only CSS (site chrome, internal components, page styles, third-party overrides). Imported **unlayered** by `src/styles/_global.css`, after the framework.
- **`src/styles/_global.css`** — the site entry point (imported by `BaseLayout`/`DemoLayout`): framework first, then unlayered site files.

## Cascade rules (load-bearing)

1. Framework layers, in priority order (later wins):
   `settings, base, elements, global, atoms, components, pages, helpers`
2. **Unlayered CSS beats every layer.** That's the consumer guarantee ("your CSS wins") and why site CSS is unlayered. It also means unlayered site CSS beats helper classes.
3. To write site CSS that helpers should still override, put the rule in a lower layer, e.g. `@layer pages { .docs_box { … } }` (see `site/page.docs.css`).
4. `!important` is banned in helpers (layer order replaces it). The only exception is targeting third-party injected styles (see `site/external.astro.css`).
5. `postcss.config.cjs` disables preset-env's `cascade-layers` polyfill. **Never remove that option** — the polyfill strips every `@layer` rule and silently replaces the cascade with specificity hacks. The browser floor is set in `.browserslistrc` (`defaults and supports css-cascade-layers`).

## Layer table

| Layer      | Prefix        | Purpose                                                     |
| ---------- | ------------- | ----------------------------------------------------------- |
| settings   | `settings.*`  | Tokens, themes (media queries + mixins import unlayered: build-time only) |
| base       | `base.*`      | Reset only (`base.reset.css`)                               |
| elements   | `elements.*`  | Bare HTML element styles (text, form, media)                |
| global     | `global.*`    | Structural patterns (a11y, grid, layout, prose, wrap)       |
| atoms      | `atom.*`      | Small single-purpose UI (button, toggle)                    |
| components | `component.*` | Library components (card, hero, notice, …)                  |
| pages      | `page.*`      | Page-specific styles that helpers may override              |
| helpers    | `help.*`      | Utility overrides (colors, spacing, typography) — last layer, beats all other framework layers |

Site-only files keep the same prefixes but live in `src/styles/site/` and import unlayered (`component.header.css`, `page.docs.css`, `external.astro.css`, `devtools.css`, …).

## Class Naming (BEM-like, different separators)

- **Block**: `.componentName`
- **Element**: `.componentName_element` (single underscore)
- **Modifier**: `.componentName-modifier` (single hyphen)
- **State**: `.is-*` composed inside the block (`&.is-disabled { ... }`)

### States vs modifiers (CC-5)

- `.is-*` for anything that can change at **runtime** (`.is-active`, `.is-open`, `.is-online`), always scoped inside the block.
- Block modifiers (`.card-filled`, `.bt-primary`) for **build-time variants** chosen by props/markup.
- Prefer styling an ARIA attribute when one exists: `[aria-current="true"]`, `[aria-expanded="true"]`, `[aria-disabled="true"]` beat inventing a parallel class.
- Nested states compile to two-class selectors (`.avatar.is-online`) that out-specify single-class modifiers (`.avatar-xl`). So declare custom-property **defaults on the block**, let modifiers override them, and only **consume** the properties inside state blocks — never declare defaults there (that's how the avatar status-dot regression happened).
- Element chains may go as deep as the block's own structure needs (`.home_morph_static_arrow` = arrow inside the morph's static state). The underscore marks hierarchy **within one block**; multi-word single names stay camelCase (`.home_themer_formRow`). A nested *component* always starts its own block (`.themeToggle_text`, never `.header_navMobile_themeToggle_text`).

### Never couple classes from different components (CRITICAL)

A selector must only contain classes from its own block. Never write a descendant/nesting selector that reaches into another component's classes: not its block (`.home .section`), not its elements (`.home_pillar .featureItem_title`). Cross-component cascade is what keeps CSS systems from scaling; mCSS bans it outright.

To style a component from outside:

- **Its root**: mix your own class onto the element in markup (`<Section class="home_section …">`) and style that class.
- **Its internals**: use the component's `<part>Class` props (`headerClass`, `titleClass`, …) to mix a class onto the part, or set the component's theme tokens on your own hook class. If neither exists yet, add the prop or token to the component. Do not reach in with a selector.
- **Bare HTML tags** (`.home_themer_formRow > button`), `.is-*` states, and ARIA attribute selectors are fine inside your own block.
- **Context blocks are not components**: a component may reference the environment it sits in (`@scope (.prose) to (.not-prose)` in `component.notice.css`, `:root.theme-dark`), but the context's own file must never name specific components (that's why `global.prose.css` lists only bare tags).

### Token naming grammar

Theme tokens are the public API of every component; they follow `--component-part-property`, longhand, kebab-case:

- `--bt-background-color-hover`, `--notice-border-width`, `--avatar-status-dot-color-online`
- No abbreviations (`--card-bg-color` is legacy; new tokens spell out `background-color`), no camelCase, no underscores.
- Feedback colors: prefer the semantic aliases `--success-*` / `--danger-*` / `--warning-*` over the raw `--yes/no/maybe-*` scales.

### Transitions

Never `transition: all` — it also transitions layout properties, so any late-arriving style change (dev-server style injection, HMR) animates on page load instead of just applying. List the properties the state change actually animates (`transition: color var(--transition)`).

## Adding Styles

- **One block per file.** Every block gets its own file named after it (`.featureItem` lives in `component.featureItem.css`, never inside `component.featureGrid.css`), even for small companion blocks (`component.fieldRow.css`, site `component.webring.css`).
- Framework file: create `src/styles/framework/<prefix>.<name>.css` and add `@import url(./<file>) layer(<layer>);` in the matching block of `framework/mcss.css`.
- Site file: create `src/styles/site/<prefix>.<name>.css` and add a plain `@import` in `_global.css` (unlayered).
- Framework CSS must never reference site-only selectors (e.g. `.expressive-code`); the site file mirrors any shared pattern itself.

## PostCSS

The project uses `postcss-mixins` and `postcss-preset-env` (stage 2). Config is in `postcss.config.cjs`. `help.colors.css`, `help.spacing.css`, and `global.grid.css` are generated by `src/tools/generate.*.cjs` — edit the generator, then re-run it, never the output.

The committed `dist/` artifact rebuilds automatically: a pre-commit hook (`.githooks/`, activated by `npm install`) reruns `npm run build:css` and stages `dist/` whenever a commit touches `src/styles/framework/`. CI fails if `dist/` is ever stale anyway.
