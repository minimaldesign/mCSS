# Component Conventions

## Component contract (every public library component)

1. **Typed props**: `interface Props extends HTMLAttributes<'<root element>'>` from `astro/types`; variant-ish props use string-literal unions, never free strings.
2. **`class` pass-through**: accept Astro's standard `class` prop (destructure as `class: className`) and merge it via `class:list`. Do **not** invent `extraClass`-style props for the root.
3. **`<part>Class` props for internals**: when consumers legitimately need to restyle an internal part, expose a class prop named after the part (`headerClass`, `titleClass`, `iconClass`) that mixes onto that element via `class:list`. This is the only sanctioned hook into a component's internals: consumer CSS must never target the part's own classes from outside (see the CRITICAL rule in [css.md](css.md)).
4. **Rest spread**: `{...rest}` on the root element so consumers can set any native attribute.
5. **`data-testid`**: accepted as a prop with a sensible per-component default.
6. **States vs modifiers**: runtime states are `.is-*` classes (`.is-active`, `.is-online`); build-time variants are block modifiers (`.card-filled`). Prefer styling ARIA attributes when one exists (`[aria-current]`, `[aria-disabled]`).
7. **Theme tokens**: every themable knob has a declared default in `settings.theme.default.css`; local-only custom properties use descriptive names (`--avatar-size`, not `--w`).
8. **Slots**: default slot for main content; named slots documented on the component's docs page.
9. **A11y**: keyboard operable, labelled, JS motion gated on `prefers-reduced-motion`, no live-region roles on static content.

`Card.astro` is the reference implementation of the shape; `Notice.astro` of the CSS variant pattern (variants only swap local custom properties).

## Astro vs Preact

- **Astro (`.astro`)**: Default. Static UI, page structure, light interactivity via `<script>` (toggles, accordions).
- **Preact (`.jsx`)**: Multi-variable reactive state, canvas tied to state, complex input (drag/pointer capture, contenteditable). JSX is configured for Preact, not React.
- **Hydration**: Use the laziest directive that works — `client:visible` (default) > `client:idle` > `client:load`.

## Naming

- **PascalCase** for all component filenames: `ComponentName.astro`, `ComponentName.jsx`.
- **`_` prefix** for internal/private components (not part of the public Astro component library; used only in blog posts or docs): `_ColorPickerOklch.jsx`, `_GridDemo.jsx`.

## Layouts

Available page wrappers in `src/layouts/`:

| Layout                 | Used for                |
| ---------------------- | ----------------------- |
| `BaseLayout`           | Default page wrapper    |
| `BlogPostLayout`       | Blog post pages         |
| `DocsPostLayout`       | Documentation pages     |
| `DocsComponentsLayout` | Component documentation |
| `DemoLayout`           | Demo/example pages      |

## Client Scripts

- In Astro components, use `<script>` tags for client-side JS.
- In Preact islands, `@preact/signals` is available alongside standard hooks (`useState`, `useReducer`).
- Use throttle/debounce for resize, scroll, and other high-frequency event handlers (utilities in `src/scripts/utilities.js`).
