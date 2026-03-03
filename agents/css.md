# CSS Architecture

mCSS follows an ITCSS-inspired layer system. All styles are imported through a single entry point: `src/styles/_global.css`. Layer order is strict — it determines specificity and cascade behavior.

## Layer Order

When adding a new CSS file, place its `@import` in the correct layer block in `_global.css`.

| #   | Layer      | Prefix        | Purpose                                                          |
| --- | ---------- | ------------- | ---------------------------------------------------------------- |
| 1   | Settings   | `settings.*`  | Tokens, media queries, mixins, themes                            |
| 2   | Base       | `base.*`      | Reset only (`base.reset.css`)                                    |
| 3   | Elements   | `elements.*`  | Bare HTML element styles (text, form, media)                     |
| 4   | Global     | `global.*`    | Structural patterns (a11y, grid, layout, prose, wrap)            |
| 5   | Atoms      | `atom.*`      | Small single-purpose UI (button, toggle)                         |
| 6   | Components | `component.*` | Complex UI blocks (card, header, hero, etc.)                     |
| 7   | Pages      | `page.*`      | Page-specific overrides (use sparingly)                          |
| 8   | External   | `external.*`  | Third-party/plugin styles                                        |
| 9   | Helpers    | `help.*`      | High-specificity utility overrides (colors, spacing, typography) |
| 10  | Devtools   | `devtools.*`  | Development-only tooling styles                                  |

## Class Naming (BEM-like, different separators)

- **Block**: `.componentName`
- **Element**: `.componentName_element` (single underscore)
- **Modifier**: `.componentName-modifier` (single hyphen)
- **State**: `.is-*` composed inside the block (`&.is-disabled { ... }`)

## Adding Styles

Create `src/styles/<prefix>.<name>.css` using the prefix from the layer table above, then add its `@import` in the matching layer block of `_global.css`.

## PostCSS

The project uses `postcss-mixins` and `postcss-preset-env` (stage 2). Config is in `postcss.config.cjs`.
