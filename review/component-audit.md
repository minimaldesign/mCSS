# mCSS component audit

Reviewed 2026-07-16 (v0.9). Every component audited against the same criteria:

1. **Naming**: follows the documented mCSS syntax (`.block`, `.block_element`, `.block-modifier`, `.is-*` states)
2. **Tokens**: semantic theme tokens where they exist, no hard-coded values, no raw palette in component CSS without reason
3. **Variants**: uses the documented local-custom-property pattern (start.mdx "Modifiers and component variations")
4. **Dark mode**: no light-only colors
5. **A11y**: semantics, focus, reduced motion, labels
6. **Astro API**: props consistency, class pass-through, slots, site coupling
7. **Docs**: has an accurate mdx page

Cross-cutting findings (patterns broken by several components) are at the end; per-component sections reference them as CC-n.

---

## Atoms

### Button (`atom.button.css`, docs: button.mdx)

The flagship atom, and mostly good. Issues:

- **Modifier typo pair**: `.bt-tightIcon` (line 44) vs `.bt-lg &.bt-iconTight` (line 182). The large-button tight-icon adjustment can never apply since the docs (and the small variant) use `bt-tightIcon`. Real bug.
- **Preaches water, drinks wine**: start.mdx's headline component guidance is "use local custom properties for variants, don't override CSS directly", and the Notice component is cited as the reference implementation. The button's `bt-yes` / `bt-no` / `bt-maybe` / `bt-outline-white` variants override `color` / `background-color` / `border-color` directly with raw palette tokens. The default and primary variants do use the token pattern (`--bt-*`), so the file demonstrates both the recommended and the discouraged approach at once. Migrate the feedback variants to `--bt-*` custom-property overrides; it also fixes theming (a theme currently cannot restyle `.bt-yes`).
- **Magic numbers**: `min-width: 101px` / `123px` / `133px` are oddly specific hard-coded values in an otherwise tokenized file.
- **Naming**: `.bt-outline-white` is a modifier-of-a-modifier with a two-word name; convention would suggest `.bt-outlineWhite` (or making it a token-driven `.bt-inverse`).
- **Focus**: relies on the browser default outline. Fine in isolation, but `select` gets a custom `:focus-visible` ring in `elements.form.css`, so keyboard users see two different focus treatments in one form (CC-4).
- **Dual naming** `.button`/`.bt` doubles every selector. Consider documenting one as canonical and generating the alias, or dropping one before v1.
- Docs: good and thorough. Minor: the `<a>`-as-button examples have no `href`, so `tabindex="0"` in the example is required but real-world guidance should mention `href` links don't need it.

### Toggle (`atom.toggle.css`, docs: toggle.mdx)

- Solid local-custom-property sizing (`--toggle-w/h/bd`), but the values are hard-coded px with no theme tokens; every other atom/component has a theme block in `settings.theme.default.css`, toggle has none (CC-2).
- **Dark mode**: unchecked track is raw `--base-300`, no `light-dark()` (CC-3).
- **A11y**: no `:focus-visible` style at all; a keyboard user gets whatever the UA draws around an `appearance: none` checkbox, which in some browsers is nothing visible (CC-4). Checked state uses raw `--yes-400`.
- Docs page is skeletal: no custom-properties table (the other pages have one), no guidance about pairing with a `<label>`, which is an a11y requirement (the site's own ThemeToggle uses it unlabeled, see below).

---

## Components (public library)

### Avatar (`Avatar.astro` + `component.avatar.css`, docs: avatar.mdx)

- Nice implementation: initials derived from slot text, `role="img"` + `aria-label`, size variants via local custom properties (`--w`, `--fs`) exactly per the documented pattern.
- **API**: `online` and `offline` are two independent booleans that can both be true (renders `avatar-online avatar-offline`, offline dot wins by source order). A single `status?: 'online' | 'offline'` prop is cleaner. No TS Props interface (CC-1), no `class`/rest pass-through (CC-1), `extraClass` (CC-1).
- **Naming**: `.avatar-online`/`.avatar-offline` are states expressed as modifiers; the documented convention would be `.is-online` composed inside the block. Either is fine, but the library should pick one grammar for states (Card uses `.is-disabled`, Hero uses `.is-active`).
- Local custom property names `--w`/`--fs` are cryptic one-offs; other components spell things out (CC-2).
- Docs: accurate, includes px table matching the CSS.

### Card (`Card.astro` + `component.card.css`, docs: card.mdx)

The most "designed" API in the library and close to production quality. Issues:

- **A11y of the clickable card**: `role="link"` is placed on the `<article>` when `href` is set, but the article has no keyboard behavior; the actual link is the stretched `.card_link` child, which already announces as a link. The article role is redundant at best and confusing at worst. Also the generated `aria-label` "(actions in footer are separate)" gets read out verbatim to screen-reader users; that parenthetical is authoring guidance, not a label. Recommend: drop `role`, label the stretched link with just the title.
- `is-loading` is applied as a class but no `.is-loading` rule exists; loading is fully handled by conditional rendering. Harmless, but dead API surface.
- `badges` accepts any CSS color string injected into inline `style` (`background: ${badge.color}`); fine for trusted content, but the docs example uses hex values while everything else in the system pushes tokens. Offer token-name support (`color: "--yes-500"`) like Hero's `overlayColor` for consistency.
- `--card-aspect-ratio` is set inline from a prop and consumed in CSS, good pattern, but it is not declared in the theme file with the other `--card-*` tokens, so it is invisible to theme authors (CC-2).
- Has a TS Props interface and `...rest` spread (the only component with both, this is the model the others should copy, CC-1).
- Docs: excellent, matches implementation.

### Hero (`Hero.astro` + `component.hero.css`, docs: hero.mdx)

Ambitious (3 variants, 4 media types, parallax, slideshow) and the CSS side is clean, but it is the least consistent with the system and has several real bugs:

- **Docs/code default mismatch**: hero.mdx says `ratio` defaults to `62/38`; the component defaults to `'38/62'` (Hero.astro line 42). One of them is wrong.
- **Invalid CSS when `textColor` is unset**: every variant renders `style="color: var(undefined);"` because the template string does not guard the prop (lines 91, 101, 110, 125). Browsers discard the declaration so it happens to work, but it ships broken CSS on the default path. The overlay does guard (`overlayOpacity > 0 &&`); apply the same treatment.
- **Unitless transition fallback**: `component.hero.css` line 133, `transition-duration: var(--slideshow-transition, 220)`; the fallback is invalid without units (the inline style always sets it today, so latent).
- **Invalid media attributes**: `<video ... alt={media.alt} loading="lazy">`; `alt` and `loading` are not valid on `<video>` (lines 82, 107, 122). Use `aria-label` or a track/caption strategy, and `preload="none"` for laziness.
- **A11y**: slideshow autoplays with no pause control (WCAG 2.2.2 requires one for content that auto-advances) and ignores `prefers-reduced-motion` (the global reset kills the CSS transition but the JS keeps swapping slides; parallax likewise keeps translating). Pagination dots are `--sm1` (16px), below the 24px target-size minimum. Dot clicks stop autoplay (good).
- **Scoped-JS-by-id pattern**: `define:vars` scripts target `#${id}`; two heroes without manual unique ids silently cross-wire (documented in a warning notice, but a generated unique id would remove the footgun entirely; Astro provides stable unique ids server-side).
- `.hero-split` needs `grid-template-columns: 1fr !important` to beat its own inline style on mobile; moving the ratio to a custom property (`--hero-ratio-left/right`, consumed in a media query) removes both the inline style and the `!important`.
- API size: 18 props across variants. Fine for a showcase, but see the MVP doc; the split/full/slideshow trio might be happier as three components sharing CSS.
- Docs: extensive and good, apart from the ratio default.

### Notice (`Notice.astro` + `component.notice.css`, docs: notice.mdx)

- The reference implementation for the variant pattern and it shows: local custom properties, variants only swap them. Good.
- **Semantics**: `role="alert"` (danger/warning) / `role="status"` (rest) on statically rendered content is wrong; those are live-region roles that announce dynamic changes, and some screen readers re-announce alert content on load. For static callouts the right role is `note` (or nothing; `<aside>` already maps to `complementary`). Keep `alert` only for a documented dynamic-injection use case.
- Variant text color is hard-coded `color: var(--base-950)` per variant rather than a swapped custom property (the one place the file breaks its own pattern), and the pastel `--bg-color` values are single-mode by design; in dark mode you get light pastel boxes. Deliberate look, but it contradicts DESIGN.md's "don't bypass dark mode" rule; consider dark pastel equivalents via `light-dark()`.
- No TS interface, no rest spread, `extraClass` (CC-1). `type` is a free string; typo in `type` silently renders the info icon with no variant class.
- Docs: good; includes plain-HTML usage, which is the promise of the library.

### SocialMedia (`SocialMedia.astro` + `component.socialMedia.css`, docs: socialMedia.mdx)

- Clean concept (URL pattern matching to icon). CSS is minimal and tokenized via `--icon-size`.
- **Triple labeling**: each link has `title`, `aria-label`, and a `.a11y-srOnly` span with the same text; screen readers may read the name twice. Pick one (`aria-label` or the span).
- `target="_blank"` is forced with no opt-out prop.
- Platform names as labels ("X", "Github") are fine, but the label should ideally include context ("mCSS on GitHub"); worth a `label` override per URL.
- No size validation; `size="xxl"` silently renders base size (CC-1: no types).
- Docs: good, full icon table.

### Tags (`Tags.astro` + `component.tags.css`, docs: tags.mdx)

- **Does not typecheck**: `interface Props extends HTMLAttributes<'ul'>` without importing `HTMLAttributes`, and `Tag[]` type is never defined (Tags.astro lines 3-4). `astro check` fails here; it only builds because the site has no check gate (see architecture review, finding 10).
- `key={tag}` on the `<li>` is a JSX-ism with no meaning in Astro templates; noise to copy-pasters.
- `<li class="tag">` references a `.tag` class that no CSS defines.
- Always sorts alphabetically with no way to preserve input order; make sorting opt-in or a prop.
- `aria-label` on a bare `<ul>` is announced inconsistently; if the label matters, wrap in `<nav aria-label>` since tag lists are navigation.
- CSS: fine; uses element selectors within the block per the documented "don't class every element" guidance.
- Docs: accurate on props, including the ones that are broken in code.

### Toc (`Toc.astro` + `component.toc.css`, docs: toc.mdx)

- **Bug**: `component.toc.css:44` uses `var(--opacity-5)` (does not exist; should be `--o-5`), so the active icon opacity does nothing. Same in `component.navDocs.css:17`.
- **Client-side only**: the entire TOC is built in the browser from the DOM. On a static Astro site the headings are known at build time; rendering the list server-side (keeping JS only for active-link highlighting) would give no-JS users and crawlers a real TOC and remove the empty-`<nav>` flash. This is the single biggest improvement available here.
- `history.replaceState` on every intersection change spams session history state and makes the URL churn while scrolling; consider highlighting without rewriting the URL.
- The `<nav>` has `aria-label={description}` where `description` doubles as the visible heading text and defaults to `undefined`; give it a real default ("Table of contents").
- Good: cleanup of listeners, `aria-current` on active link, hide-when-fewer-than-2-items CSS trick.
- Docs: accurate.

### ReadProgressBar (`ReadProgressBar.astro` + CSS, docs: ReadProgressBar.mdx)

- The best small component in the library: scroll-driven animation with capability detection and a throttled JS fallback, `aria-hidden` on a purely decorative element, tokenized height/color. No findings beyond:
- The doc file is `ReadProgressBar.mdx` while every other component doc is lowercase, so the public URL is `/components/ReadProgressBar` amid `/components/avatar` etc. Slugs are path-derived and renames break URLs, so fix it now (CC-6).
- Fallback listeners are never removed on `astro:before-swap` (Hero's parallax script does this correctly); only matters with view transitions, but the library should be consistent.

---

## Site chrome (styled by public CSS, not documented as components)

`Header.astro`, `Footer.astro`, `Nav.astro`, `NavMobile.astro`, `NavDocs.astro`, `NavComponents.astro`, `ThemeToggle.astro` are site components, but their CSS lives in the same `component.*.css` namespace and theme-token blocks as the public library, and nothing marks the boundary (`_global.css` does separate "internal components" imports, but header/footer/navDocs sit in the public group). For v1 either promote them to configurable components (see MVP doc; Header/Footer are must-haves for a website framework) or move their CSS to the site bucket.

Issues worth fixing regardless:

- **ThemeToggle**: bare checkbox with no `aria-label` or associated `<label>`; screen readers announce "checkbox, not checked" with no name. Both instances (desktop + mobile) render `id="js-theme"`, duplicate IDs on every page. The toggle semantic should be `role="switch"` or at least a labeled checkbox.
- **Header.astro**: `window.onscroll = throttle(...)` clobbers other scroll handlers; use `addEventListener`. Theme logic lives in Header while the checkbox lives in ThemeToggle; consolidating it in ThemeToggle would make the component self-contained and reusable.
- **NavMobile**: `aria-expanded="false"` is set in markup but never updated when the menu opens; close button has no accessible name (icon only); no `Escape` handling; focus is not trapped or moved into the full-screen menu. The menu panel hard-codes `--base-950` background and `--base-0` links (always dark regardless of theme; possibly intentional, but then the theme toggle inside it sits on an unthemed surface).
- **Footer**: empty `href=""` on the YouTube link (links to current page); hard-coded `--base-0` / `--primary-200` link colors partially bypass the `--footer-*` token set that exists for exactly this.
- **Nav/NavDocs/NavComponents**: fine; `class={condition && 'is-active'}` renders `class="false"` when false in Astro string-interpolation contexts; use `class:list` like the library components do.
- `.header_navMobile_themeToggle_text` and `.footer_meta_webring` are 3-4 level element chains; the documented convention caps at `block_element`. Grandchild elements should re-block (`.themeToggle_text`).

## Internal components (`_` prefix)

`_CanIUse.astro`, `_ColorPickerOklch.jsx`, `_CopyButton.jsx`, `_GridDemo.jsx`, `_GridViz.astro`, `_SelectMask.jsx`, `_useHighlightedCode.js`: correctly prefixed, correctly excluded from collections, imported only by content. Their CSS files are correctly grouped as internal in `_global.css`. Not audited in depth; two notes: `_GridDemo.jsx` is 1,611 lines (the largest file in `src/`) and worth splitting if it ever needs maintenance, and the internal-component CSS still loads globally on every page (PurgeCSS being disabled makes this a real payload cost; see architecture review findings 2 and 10).

---

## Cross-cutting findings

| # | Finding | Affects | Recommendation |
| --- | --- | --- | --- |
| CC-1 | **Inconsistent component API conventions**: TS Props interface (Card, Hero, Toc, Tags-broken) vs none (Avatar, Notice, SocialMedia); `...rest` spread (Card, Tags, Hero, Toc) vs none (Avatar, Notice, SocialMedia); `data-testid` prop (Card, Tags, Toc, Avatar) vs none (Notice, Hero, SocialMedia); `extraClass` everywhere instead of Astro's conventional `class` pass-through | all Astro components | Write a short "component contract" (typed Props extending the right `HTMLAttributes`, `class` + `class:list` pass-through, rest spread, `data-testid`, slot conventions) and apply it mechanically. This is the highest-leverage consistency fix before building more components. |
| CC-2 | **Theme token coverage is uneven**: toggle has no theme block; Card's `--card-aspect-ratio` and Avatar's `--w`/`--fs` are undeclared in the theme; local property naming ranges from `--w` to `--status-dot-border-width` | atoms + several components | Every themable knob gets a declared default in `settings.theme.default.css`; local-only properties use a documented naming style. |
| CC-3 | **Raw palette tokens in component/atom CSS** without `light-dark()`: toggle track, notice variant text, footer links, NavMobile panel, button feedback variants | several | Sweep alongside the elements-layer dark-mode fixes (architecture review, finding 5). |
| CC-4 | **No unified focus-visible treatment**: custom ring on `select` only; buttons, toggles, tags, toc links, pagination dots all rely on UA defaults, and `appearance: none` widgets can end up with nothing | atoms, hero, toggle | Add a global `:focus-visible` rule (tokenized ring) in `global.a11y.css`; remove per-element one-offs. |
| CC-5 | **State vs modifier grammar is mixed**: `.is-disabled`/`.is-active` (Card, Hero, nav) vs `.avatar-online` vs `[aria-disabled]` styling (button) | several | Document the rule (suggest: `.is-*` for states that change at runtime, modifiers for build-time variants; prefer styling ARIA attributes where one exists, like `[aria-current]`, `[aria-expanded]`). |
| CC-6 | **Docs slugs mixed case** (`ReadProgressBar` vs `avatar`) and doc `version` numbers do not track component maturity consistently (hero is 0.9 with open bugs; card 0.1 while nearly complete) | content | Lowercase all component doc filenames now; define what `version` means. |
| CC-7 | **Autoplay/motion JS ignores `prefers-reduced-motion`** (the CSS reset handles CSS animation only) | Hero slideshow, Hero parallax, ReadProgressBar fallback (minor) | Gate JS-driven motion on `matchMedia('(prefers-reduced-motion: reduce)')`. |

## Suggested fix order

1. Bugs: `--opacity-5` (Toc/NavDocs), `bt-tightIcon`/`bt-iconTight`, Tags.astro types, Hero `var(undefined)` + ratio default, Footer empty href.
2. CC-1 component contract, then mechanically align Avatar/Notice/SocialMedia/Tags.
3. A11y pass: ThemeToggle label + duplicate id, NavMobile aria-expanded/focus, Notice roles, Card link labeling, global focus-visible (CC-4), Hero autoplay pause + reduced motion (CC-7).
4. Token/dark-mode sweep (CC-2, CC-3).
5. Naming decisions (CC-5, CC-6, `.bt-outline-white`), documented in agents/css.md so they stick.
