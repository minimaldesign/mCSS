# mCSS architecture review

Reviewed 2026-07-16 against the local repo (v0.9, `main` @ 4b03cfb). Companion documents: [component-audit.md](component-audit.md) and [v1-component-mvp.md](v1-component-mvp.md).

## What mCSS gets right

Before the findings, the foundation is genuinely strong and worth preserving:

- **A coherent, differentiated philosophy.** "Real CSS, cascade as a feature, components not utility soup" is a clear position, and the codebase actually follows it. The three-tier token system (raw scales in `settings.tokens.css` → semantic theme tokens in `settings.theme.default.css` → per-component custom properties) is exactly how modern CSS theming should work.
- **`light-dark()` + `color-scheme` theming.** Clean, modern, and mostly applied consistently. The FOUC-free inline script in `BaseLayout.astro` is correct.
- **Modern CSS used with intent**: nesting, `:has()`, `@scope` in `global.prose.css`, scroll-driven animation with a JS fallback in ReadProgressBar. The framework demonstrates the techniques its blog teaches.
- **Accessibility baseline**: reduced-motion handling in `base.reset.css`, `.a11y-srOnly`, visually-hidden legend pattern, sensible element defaults.
- **Tooling hygiene where it matters**: generated helper files with generator scripts in `src/tools/`, `agents/*.md` documentation for AI-assisted work (rare and excellent), consistent file naming per layer.

The findings below are ordered by architectural impact, not severity. Effort: S (hours), M (days), L (week+).

---

## 1. Cascade: adopt native `@layer` (impact: high, effort: M)

The whole architecture rests on "import order in `_global.css` is load-bearing" (`agents/css.md` calls it out, CLAUDE.md warns about it). That was the only option when ITCSS was invented; it no longer is. CSS `@layer` is Baseline 2022 and models ITCSS natively:

```css
@layer settings, base, elements, global, atoms, components, pages, external, helpers;

@import url(./base.reset.css) layer(base);
@import url(./elements.text.css) layer(elements);
/* etc. */
```

What this buys:

- **Order stops being load-bearing.** A misplaced import can no longer silently break the cascade; the layer name, not file position, decides priority.
- **`!important` becomes unnecessary in helpers.** `help.*.css` currently sprays `!important` (inconsistently, see finding 4). In a layered world, unlayered consumer CSS beats all layers by default, and helpers beat other layers by declaration order. You get the "helpers win over components" guarantee without specificity hacks.
- **Consumer story improves dramatically.** Anything a user writes outside your layers wins over mCSS without fighting specificity. That is the strongest possible version of the "it gets out of the way" pitch.
- **It is on-brand.** mCSS markets itself as the framework that embraces platform CSS. Shipping a layered cascade is a marketing feature and a blog post, not just refactoring.

Migration note: keep the file structure and prefixes exactly as they are; only the import mechanism changes. Decide deliberately whether helpers stay `!important`-free inside a layer (recommended) since that changes behavior for consumers who also use `@layer`.

## 2. Distribution: the framework has no consumable artifact (impact: high, effort: M)

Today the "product" is a folder inside a docs site. `src/styles/` interleaves three different things with no boundary:

- Framework files (settings, base, elements, global, atoms, help, and the reusable component CSS)
- Docs-site-only files (`component.canIUse.css`, `component.colorPickerOklch.css`, `component.gridDemo.css`, `component.selectMask.css`, `component.copyButton.css`, `page.*.css`, `external.astro.css`, `devtools.css`)
- The site's `_global.css` that imports all of it, site files included

A consumer following "just import the CSS files you need" (what-is-mcss.md) must reverse-engineer which files are framework. Concrete problems:

- **No versioned artifact.** No dist bundle, no releases, no changelog. `package.json` says `0.9` and `src/scripts/globals.js` duplicates `VERSION = "0.9"` by hand.
- **The "no tooling" pitch is not currently true.** `settings.media-queries.css` uses `@custom-media`, which is not implemented in any browser and requires postcss-preset-env. The grid, wrap, layout, header, footer, and elements files all use `@media (--md)` internally. Copied raw, those queries silently never match: the responsive grid stops responding. The docs admit this for user code (media-queries.mdx notice) but the framework's own files have the same dependency.
- **Asset coupling.** `elements.form.css` (select chevron), `elements.text.css` (abbr help icon), and `elements.interactive.css` (details chevron) reference `../assets/icons/*.svg`. Copied CSS 404s on those. Inline the three or four required icons as `data:` URIs, or document the asset requirement.

Recommendation: create a real boundary and a build.

1. Split `src/styles/` into `framework/` and `site/` (site keeps its own `_global.css` that imports the framework plus site files). One-time move; the agents docs make the classification easy.
2. Add a small build script (the repo already runs PostCSS) that outputs `dist/mcss.css` and `dist/mcss.min.css` with custom media resolved, plus the individual layer files post-processing, so the drop-in files behave identically to mcss.dev.
3. Tag releases and keep a CHANGELOG. Single source the version (read `package.json` in `globals.js`).

This is also the prerequisite for any component-library distribution decision (see [v1-component-mvp.md](v1-component-mvp.md)).

## 3. License: GPLv3 will block adoption (impact: high, effort: S)

The repo is GPLv3 (LICENSE, advertised in `Footer.astro`). For a CSS framework whose code is copied into and shipped as part of the consumer's site, GPL raises exactly the question you never want a potential user's lawyer to ask: "is our site CSS a derivative work?" Practically every comparable project (Bootstrap, Tailwind, Open Props, Pico, shadcn/ui) is MIT. Most companies have policies that flat-out prohibit GPL in frontend deliverables.

If copyleft is a deliberate values choice, keep it, but state the intent explicitly (an FAQ answering "can I use this in a commercial site?"). Otherwise relicense to MIT before v1 while the contributor count is effectively one and relicensing is trivial.

## 4. Token integrity: one source of truth is leaking (impact: medium, effort: S)

Several places restate token values by hand and have already drifted:

| Where | Problem |
| --- | --- |
| `help.opacity.css` | Hard-codes `0.3 / 0.5 / 0.7` while `settings.tokens.css` defines `--o-2: 0.4`, `--o-3: 0.6`, `--o-4: 0.8`. The helper classes and the tokens they claim to expose disagree today. Docs (tokens.mdx and helpers.mdx) match the helper file, not the tokens. |
| `help.ratios.css` | Hard-codes `4/3`, `3/4`, etc. instead of `var(--ar-*)`. Same values for now, but a consumer overriding `--ar-golden` gets no effect from `.ar-golden`. |
| `docs/global.mdx` (wrap section) | Documents tokens `--wrap-padding` / `--wrap-md-padding` / `--wrap-lg-padding` and a "max width of 800px". The CSS defines `--wrap-spacing` / `--wrap-md-spacing` / `--wrap-lg-spacing` and `minmax(200px, 70ch)`. |
| `helpers.mdx` | Lists `.text-dm` (typo for `.text-md`). |
| `DESIGN.md` | Opacity and several component values drifted from CSS (it self-declares CSS wins, but stale agent context causes wrong generated code). |
| `component.toc.css:44`, `component.navDocs.css:17` | Reference `var(--opacity-5)`, which does not exist (`--o-5`). The active-state icon opacity silently resolves to nothing. |

Fixes are mechanical: make every helper consume `var()`, regenerate docs tables from the token files if possible (a tiny script like the existing `src/tools/generate.help.*.cjs` could emit the markdown tables), and fix the two `--opacity-5` references.

## 5. Dark mode gaps in the elements layer (impact: medium, effort: S)

The theme is `light-dark()`-first, and DESIGN.md explicitly forbids hard-coded single-mode colors, but a handful of element defaults violate it:

- `elements.interactive.css`: `dialog` and `details` hard-code `--base-200` borders and `--base-50` backgrounds. In dark mode you get a near-white panel with light text inside.
- `elements.text.css`: `ins` uses `--yes-200` background with inherited (light, in dark mode) text; `s` uses `--base-950` strikethrough (invisible on dark); `blockquote` handles it correctly via `light-dark()`, so the pattern is established, these files just predate it.
- `global.prose.css`: list markers use `--base-300` raw.
- `atom.toggle.css`: unchecked track is `--base-300` raw.

Sweep the elements/global/atom layers for raw `--base-*` / feedback colors and wrap them in `light-dark()` or promote them to theme tokens. This is a good "fix + blog post about auditing dark mode" opportunity.

## 6. Helper layer: naming collisions and inconsistent weaponry (impact: medium, effort: S-M)

- **Dangerously generic class names**: `help.layout.css` and `help.typography.css` claim `.hidden`, `.collapse`, `.static`, `.fixed`, `.absolute`, `.relative`, `.sticky`, `.visible`, `.text`, `.display`, `.mono`, `.book`, `.bold`, `.black`, `.light`. Two specific traps: `.hidden` means `visibility: hidden` here while nearly every other framework ever has trained developers to expect `display: none`; and single-word names like `.text` or `.black` are extremely likely to collide with consumer code or CMS-emitted markup. Recommend keeping only the prefixed long forms (`.of-*`, `.position-*`, `.font-*`, `.visibility-*`) and dropping or aliasing the bare short forms before v1, while breaking changes are cheap.
- **Inconsistent `!important`**: spacing, colors, overflow, position, font-family/weight/size use `!important`; opacity, ratios, tracking, text-transform, font-style do not. So some helpers "always win" and others lose to any component rule. Either is defensible; mixed is a bug factory. With `@layer` (finding 1) you can drop `!important` everywhere and rely on layer order.
- `help.spacing.css` header comment points to `/scripts/tools.help.spacing.cjs`; the generator actually lives at `src/tools/generate.help.spacing.cjs` (and the top-level `scripts/` directory is empty; delete it).

## 7. Browser-support baseline is implicit (impact: medium, effort: S)

The framework freely uses `:has()` (2023), nesting (2023), `light-dark()` (2024), `@scope` (`global.prose.css`, Baseline only since Firefox 128 / mid-2024), `text-wrap: balance`, `resize: block`, scroll-driven animations (with fallback), and relative color syntax `hsl(from ...)` in `elements.form.css` (2024). Individually fine; collectively they define a de facto floor of roughly "Baseline 2024" that is never stated anywhere.

Recommend a one-paragraph support statement in the docs ("mCSS targets Baseline 2024; here is what degrades and how") plus a per-feature note where degradation is not graceful. You already built the CanIUse/baseline component for the blog; reuse it in the docs. Also note `line-sizing: normal` in `elements.sectioning.css` is a draft property no browser implements (harmless, but it reads as if it does something), and `text-align-last: left` in `elements.table.css` looks like it was meant to be `text-align: left`.

## 8. Theming system: finish the started ideas (impact: medium, effort: M)

- **Theme switching persistence**: sessionStorage (per `agents/pitfalls.md`, deliberate) means returning visitors lose their choice every session. Unless there is a strong reason, localStorage is what users expect. If sessionStorage stays, document why.
- **Token naming conventions drift**: `--layout_content_aside-width` (underscore style), `--readProgressBar-height` (camelCase), `--toc-icon-size` (kebab), `--card-bg-color` vs `--notice-background-color` (abbreviation vs longhand). Pick one grammar (`--component-part-property`, longhand) and document it in the themes doc; this matters because theme tokens are the public API of every component.
- **The wireframe theme mixes concerns**: `settings.theme.wireframe.css` overrides raw tokens (fine, that is the documented purpose) but also contains an `h1` rule with a mixin. Element rules in a settings-layer file break the layer contract.
- **Feedback colors have no semantic tier**: components use `--yes-500` etc. directly. A `--success-*`/`--danger-*` semantic alias layer (or at least theme-level `--notice-confirm-*` style tokens, which Notice already half-does) would let themes restyle feedback without touching palettes. Note `astro.config.mjs:30` already references a `--success-500` that does not exist, which suggests the rename is half-planned.
- **Missing common theme hooks**: focus ring color/width (see audit: focus styles are mostly browser default), selection color, scrollbar styling.

## 9. Grid: love the API, reconsider the implementation size (impact: low-medium, effort: M)

`global.grid.css` is 367 lines of enumerated attribute selectors (24 columns × 4 breakpoints for `col`, plus `span` start/end/width triplets), Raster-style. It works and the HTML API is genuinely nice. Costs: ~9KB before compression, only `md/lg/xl` responsive tiers exist (docs example uses exactly those, but `sm`/`xxl` silently do nothing if guessed), and every new tier costs 90 lines.

Options, in increasing ambition:

1. Generate it with a `src/tools/generate.global.grid.cjs` script like the helpers (removes hand-maintenance risk, keeps output identical).
2. Use `attr()` with type coercion once Baseline (Chrome 133+ shipped `attr(col type(<integer>))`; not cross-browser yet), collapsing the file to a dozen lines. Track it; do not ship it yet.
3. Leave it, but document which breakpoint tiers exist for `col-*`/`span-*`.

Also: the custom `col`/`span` attributes fail HTML validation (documented and defended in global.mdx, fair), but consider supporting `data-col`/`data-span` selectors in parallel; the CSS cost is one extra selector per rule if generated.

## 10. Repo and delivery hygiene (impact: medium, effort: S)

- **No CI at all.** No `.github/workflows`. Minimum useful gate: `astro build` + `astro check` on PRs. `astro check` currently would fail (`Tags.astro` references `HTMLAttributes` and `Tag` types that are never imported/defined, see audit), which is exactly why the gate is worth having.
- **No stylelint.** For a project whose product is CSS conventions, a stylelint config encoding those conventions (property order per the mcss-structure blog post, naming patterns, no raw palette tokens in `component.*` files) would both guard the repo and be a shippable artifact for consumers ("here is the stylelint config that enforces mCSS style").
- **`astro-tunnel` is registered unconditionally** in `astro.config.mjs` integrations. It is a dev tool; gate it on `import.meta.env` or move it out of the default pipeline.
- **PurgeCSS installed but disabled** (known, `agents/pitfalls.md`). Either wire it with a safelist for the grid/helper attribute patterns or drop the dependency until it has an owner; a commented-out integration plus two packages in `dependencies` is standing debt.
- **AGENTS.md says "Astro 5"** while the site is on Astro 6; CLAUDE.md is correct. Stale agent docs actively mislead.
- **The flagship blog post contradicts the framework**: what-is-mcss.md line 30 shows `<button class="btn btn-primary">` but the atom is `.bt` / `.button`, and there is no `.btn` alias. First-contact code sample fails if pasted.

## 11. Site architecture (docs site itself)

Mostly healthy: content collections with Zod schemas, clean dynamic routes, layouts are thin. Smaller notes:

- `Header.astro` assigns `window.onscroll = ...` (clobbers any other scroll handler; use `addEventListener`) and both `ThemeToggle` instances render `id="js-theme"`, producing duplicate IDs on every page.
- Component doc slugs are file-path derived and mixed-case: `/components/ReadProgressBar` vs `/components/avatar`. Renaming later breaks URLs (pitfalls.md), so pick lowercase now while traffic is low.
- The docs pages themselves double as the component test suite (no other tests exist). That is fine for a solo project, but consider at least a Playwright smoke test that loads each docs page and checks for console errors once the component library grows; regressions like `var(--opacity-5)` (finding 4) currently have nothing to catch them.

---

## Prioritized improvement list

Quick wins (do before anything else):
1. Fix `var(--opacity-5)` in `component.toc.css` / `component.navDocs.css` (real bug).
2. Fix `.btn` in the what-is-mcss post, `.text-dm` in helpers.mdx, wrap token names in global.mdx.
3. Align `help.opacity.css` and `help.ratios.css` with tokens via `var()`.
4. Dark-mode sweep of `elements.interactive.css`, `ins`/`s` in `elements.text.css`, prose markers, toggle track.
5. Update AGENTS.md to Astro 6; delete empty `scripts/`; fix generator path comments.

Structural (the v1 blockers):
6. Adopt `@layer` across `_global.css` (finding 1).
7. Split framework vs site styles and ship a `dist/` build with custom media resolved (finding 2).
8. Decide the license question (finding 3).
9. Add CI: `astro build` + `astro check` + stylelint (finding 10).
10. Publish a browser-support statement (finding 7).

Nice to have:
11. Rationalize helper short names before v1 freezes them (finding 6).
12. Token naming convention + semantic feedback tier (finding 8).
13. Grid generator script (finding 9).
14. localStorage theme persistence (finding 8).
