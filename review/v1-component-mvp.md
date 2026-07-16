# mCSS v1: distribution model and MVP component list

Written 2026-07-16 (v0.9). Target users, as agreed: **marketing/brochure sites** and **blogs, content, and docs sites**. App/dashboard UI is explicitly out of scope for v1.

## 1. Distribution model recommendation

### The options

**A. npm package** (`import '@mcss/core'`, `import Hero from '@mcss/astro'`): versioned updates and one-line installs, but it fights the mCSS philosophy on three fronts. The documented customization workflow is "open `settings.tokens.css` and change the values" (tokens.mdx), which is impossible inside `node_modules`. Components become API surface you must keep backward compatible forever (Hero already has 18 props trying to anticipate variations; that is what npm distribution does to components). And it adds the tooling dependency the framework promises to avoid.

**B. Copy-paste, shadcn-style** ("open code"): users copy CSS files and `.astro` components into their project and own them. Matches the philosophy exactly: the token file is meant to be edited, components are meant to be starting points, styling disagreements end with the user editing the file instead of filing an issue. The cost is updates: users must diff against new releases by hand.

### Recommendation: copy-paste ("open code") for v1, with release discipline

Go with B, deliberately, and say so on the site; "you own the code" is a differentiator the target audience (CSS lovers building websites) will appreciate. But make it work by adding what shadcn's model actually depends on:

1. **A clean framework boundary and a `dist/` build** (architecture review, finding 2). Copy-paste only works when it is obvious what to copy. Ship `dist/mcss.css` + `dist/mcss.min.css` (custom media resolved, so no build step needed) and a `framework/` source tree for users who do run PostCSS.
2. **Versioned releases with a changelog**, so "diff and update by hand" is realistic. Tag `v1.0.0`, write CHANGELOG entries per component.
3. **Per-component self-containment.** Each library component = one `.astro` file + one `component.*.css` file + declared theme tokens + listed icon dependencies. The docs page for each component links all of them. (The audit's CC-1 component contract is the prerequisite.)
4. **License fix first** (architecture review, finding 3): copy-paste distribution of GPLv3 code is the worst-case combination, since users are copying the covered work directly into their repos. MIT before v1 unless copyleft is a deliberate stance.
5. **Post-v1, not now**: a `npx mcss add hero` CLI that copies files and warns about token dependencies. Nice upgrade path once the manifest per component exists; premature today.

The npm door stays open: publishing the framework CSS (not the components) as an optional convenience package later is compatible with everything above.

## 2. Gap analysis

What exists today vs what the two target site types need:

| Need | Marketing site | Blog/docs site | Status today |
| --- | --- | --- | --- |
| Buttons/CTAs | yes | yes | `.bt` atom, solid (fix audit items) |
| Hero | yes | rare | `Hero.astro`, feature-rich (fix audit bugs) |
| Site header + nav (with mobile menu) | yes | yes | site-only, hard-coded content |
| Footer | yes | yes | site-only, hard-coded content |
| Page sections / feature grids | yes | no | raw `.grid`/`.wrap` primitives only |
| Cards (feature, article) | yes | yes | `Card.astro`, near-complete |
| Testimonials / quotes | yes | no | `blockquote` element styling only |
| Pricing table | yes | no | missing |
| FAQ / accordion | yes | yes | `details` element styled; no grouped component |
| Logo cloud / social proof | yes | no | missing |
| Newsletter/contact form | yes | yes | `elements.form.css` covers bare elements; no field/form patterns, no validation states |
| Announcement banner | yes | sometimes | missing (Notice is close but not dismissible/full-width) |
| Breadcrumbs | sometimes | yes | missing |
| Pagination / prev-next | no | yes | missing |
| Article/post list | no | yes | site builds it ad hoc in `page.blog.css` |
| Author byline / avatar | no | yes | `Avatar.astro` exists; no byline pattern |
| TOC | no | yes | `Toc.astro` (make it server-rendered, see audit) |
| Tags | no | yes | `Tags.astro` |
| Reading progress | no | yes | `ReadProgressBar.astro`, done |
| Social links | yes | yes | `SocialMedia.astro`, done |
| Badge / pill | yes | yes | trapped inside Card as `.card_badge` |
| Modal dialog | sometimes | rare | `dialog` element styled; no component |
| Tabs | sometimes | sometimes | missing |
| Notice/callout | rare | yes | `Notice.astro`, done |

Reading of the table: the existing ten components cover the **content-site accessories** well, but the **structural components every website needs** (header, footer, sections, forms) are the biggest holes, and they are exactly the ones currently hard-coded as site chrome.

## 3. MVP component list for v1

Phase 0 is the audit fix list (bugs, CC-1 contract, a11y pass); building new components on the current inconsistent conventions multiplies the cleanup. Then:

### Tier 1: must-have (v1 is not a "website framework" without these)

| # | Component | Kind | JS? | Notes |
| --- | --- | --- | --- | --- |
| 1 | **Header** | Astro | tiny (mobile menu) | Generalize the site's Header/Nav/NavMobile: slots or props for logo, nav items, actions; sticky option; fixes the NavMobile a11y list from the audit (aria-expanded, Escape, focus). The single highest-demand component for the target users. |
| 2 | **Footer** | Astro | none | Generalize site Footer: column slots, bottom bar, uses the existing `--footer-*` tokens properly. |
| 3 | **Section** | Astro + CSS | none | The workhorse wrapper marketing pages are made of: `.wrap` + vertical rhythm + optional eyebrow/title/lede header, background variant (plain, filled, primary). Cheap to build, used ten times per page. |
| 4 | **FeatureGrid / FeatureItem** | Astro + CSS | none | Icon + title + text items composing `.grid`; 2/3/4-column responsive presets. Mostly a documented pattern over existing primitives. |
| 5 | **FAQ (Accordion)** | Astro + CSS | none | Grouped `details`/`summary` (styling already exists in `elements.interactive.css`, fix its dark mode first); optional `name` attribute for exclusive-open (native, no JS). |
| 6 | **Form field patterns** | CSS (+ small Astro `Field`) | none | Label + input + hint + error composition, `:user-invalid` styling, fieldset layouts; then two documented recipes: newsletter signup (input + button inline) and contact form. Elements are already styled; the missing layer is composition and states. |
| 7 | **Badge** atom | CSS | none | Extract `.card_badge` into `atom.badge.css` with feedback variants (`badge-yes` etc. via custom-property pattern). Unlocks pricing, article cards, nav "new" markers. |
| 8 | **Testimonial** | Astro + CSS | none | Quote + Avatar + name/role; single and grid-of-three presets. Composes existing blockquote styling and Avatar. |
| 9 | **Pricing** | Astro + CSS | none | Cards-based tier table: price, feature list, CTA, highlighted tier. Marketing-site table stakes. |
| 10 | **CTA / Banner section** | Astro + CSS | none | Full-width closing CTA (title, text, buttons) and a top announcement-bar variant (dismissible = the one tiny bit of JS, persisted in localStorage). |
| 11 | **Breadcrumbs** | Astro + CSS | none | `nav > ol` with separators, `aria-current="page"`, JSON-LD optional. Trivial but expected on docs/marketing sites. |
| 12 | **Pagination + PrevNext** | Astro + CSS | none | Numbered pagination for blog indexes and prev/next for posts/docs; the site needs both itself. |
| 13 | **ArticleCard / PostList** | Astro | none | Blog-index pattern: image, tags, title, description, byline (Avatar + date). Mostly composes Card, Tags, Avatar; replaces the ad hoc markup behind `page.blog.css`, so the site dogfoods it. |

Everything in Tier 1 except the Header mobile menu and banner dismissal is **zero-JS**, which keeps the "it's just HTML and CSS" story intact.

### Tier 2: nice-to-have (rounds v1 out; ship if time allows)

- **LogoCloud** (grayscale-hover logo strip; pure CSS)
- **Stats** (big number + label row)
- **TeamCard** (Avatar + name + role + socials; composes three existing components, good showcase)
- **Modal** (thin Astro wrapper over the already-styled `dialog`: open/close wiring, `body-is-locked`, focus return)
- **Tabs** (progressive: radio/`:checked` CSS core or minimal JS with proper `role="tablist"` semantics; if the a11y cannot be done properly by v1, cut it, since bad tabs are worse than no tabs)
- **Figure/Image** treatments (captioned figure, full-bleed via existing `.wrap_content-fullBleed`, simple before/after or zoom is post-v1)
- **AuthorByline** (extracted from ArticleCard for reuse at top of posts)

### Tier 3: post-v1 (explicitly out)

Search (pagefind integration), carousel beyond Hero's slideshow, mega-menu, cookie consent, data tables with sorting, toasts, dropdown menus, command palette. Most of these are app-territory or need JS budgets that fight the positioning.

### Suggested build order

Header → Footer → Section → FeatureGrid → Badge → FAQ → Forms → ArticleCard/Pagination/Breadcrumbs (content-site cluster) → Testimonial → Pricing → CTA (marketing cluster) → Tier 2. Rationale: the first four let you rebuild mcss.dev's own pages and one real template with library components (dogfooding proof), and the v0.9 blog post already promises "website templates built with mCSS, creating components as needed", which is exactly this sequence.

## 4. Definition of done (per component, v1)

A component ships when:

1. Follows the **component contract** (audit CC-1): typed Props, `class` pass-through, rest spread, documented slots, `data-testid`.
2. **Both flavors documented**: plain-HTML usage and Astro usage on its docs page, per the existing button/notice page format.
3. **Theme tokens declared** in `settings.theme.default.css` with the agreed naming grammar; no raw palette values in component CSS without a `light-dark()` wrapper or a comment saying why.
4. **A11y checklist passed**: keyboard operable, visible focus (global `:focus-visible` from audit CC-4), labels/roles verified against the audit findings for the analogous component, JS motion gated on `prefers-reduced-motion`, touch targets 24px+.
5. **Verified in both themes** and at `xs` / `md` / `lg` breakpoints on its docs/demo page.
6. **Self-containment manifest**: docs page lists exactly which files and icons to copy (the copy-paste distribution depends on this).
7. Class naming passes the conventions in `agents/css.md` (including the state-vs-modifier rule once decided, audit CC-5).

## 5. v1 release checklist (pulling it together)

1. Phase 0: audit bug fixes + component contract + a11y pass (component-audit.md, "Suggested fix order").
2. Architecture blockers: `@layer` migration, framework/site split + `dist/` build, license decision, CI (architecture-review.md, "Structural").
3. Tier 1 components, in the build order above, each meeting the definition of done.
4. Rebuild mcss.dev's header, footer, and blog index with the library versions (dogfood proof).
5. One free template ("marketing one-pager" or "blog starter") built only from mCSS + library components; this is the launch artifact that proves the "v1 Astro component framework for websites" claim.
6. Version 1.0.0 tag, changelog, browser-support statement, updated what-is-mcss post (fix `.btn`, announce the component library).
