# Component Conventions

## Astro vs Preact

- **Astro (`.astro`)**: Default. Static UI, page structure, light interactivity via `<script>` (toggles, accordions).
- **Preact (`.jsx`)**: Multi-variable reactive state, canvas tied to state, complex input (drag/pointer capture, contenteditable). JSX is configured for Preact, not React.
- **Hydration**: Use the laziest directive that works — `client:visible` (default) > `client:idle` > `client:load`.

## Naming

- **PascalCase** for all component filenames: `ComponentName.astro`, `ComponentName.jsx`.
- **`_` prefix** for internal/private components: `_ColorPickerHsl.jsx`.

## Layouts

Available page wrappers in `src/layouts/`:

| Layout                  | Used for                    |
| ----------------------- | --------------------------- |
| `BaseLayout`            | Default page wrapper        |
| `BlogPostLayout`        | Blog post pages             |
| `DocsPostLayout`        | Documentation pages         |
| `DocsComponentsLayout`  | Component documentation     |
| `DemoLayout`            | Demo/example pages          |

## Client Scripts

- In Astro components, use `<script>` tags for client-side JS.
- In Preact islands, `@preact/signals` is available alongside standard hooks (`useState`, `useReducer`).
- Use throttle/debounce for resize, scroll, and other high-frequency event handlers (utilities in `src/scripts/utilities.js`).
