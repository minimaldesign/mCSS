# Component playground

Component docs pages can embed an interactive playground (see the [button page](https://minimaldesign.github.io/mCSS/components/button)): toggle the available modifiers, watch the element update live, and copy the exact markup. It's powered by a single Preact island configured entirely from MDX, so adding a playground to a page is a config block, not a new component.

## Files

| File | Role |
| ---- | ---- |
| `src/components/_Playground.jsx` | The island. Generic, config-driven, no per-component code. |
| `src/styles/site/component.playground.css` | Site-only styles, registered unlayered in `src/styles/_global.css`. |
| `src/content/components/button.mdx` | Reference usage (the pilot page). |

All props must be serializable: they cross the Astro island boundary (`client:visible`), so functions can't be passed. That constraint shapes the whole API.

## Template

The `template` prop is an HTML string with placeholders. One substitution pass renders both the live preview and the generated code, so the two can never drift.

- `{classes}` becomes `baseClasses` plus the classes contributed by active controls.
- `{attrs}` becomes the active boolean attributes, with a leading space (empty when none).
- `{name}` becomes the value of the text control or snippet toggle named `name`.

Pass it as a quoted JS string so MDX doesn't parse `{classes}` as an expression:

```jsx
import Playground from "../../components/_Playground.jsx";

<Playground
  client:visible
  template={'<button class="{classes}"{attrs}>{label}</button>'}
  baseClasses="bt"
  controls={[/* see below */]}
/>
```

Text control values are HTML-escaped before substitution (they're user-typed). The template itself is trusted, it's authored in MDX like the rest of the page.

## Controls

The `controls` prop is an array of groups, each `{ heading, items }`. Groups become grid columns: 2 on mobile, 4 from the `--md` breakpoint (768px) up. A flat array of controls also works: consecutive ungrouped controls collect into one implicit group.

Control types:

| Control | Behavior |
| ------- | -------- |
| `{ type: "select", name, options: [{ label, value }], default }` | Mutually exclusive modifier group. Renders as radio buttons up to 4 options (`RADIO_MAX_OPTIONS` in `_Playground.jsx`), as a `<select>` above that. |
| `{ type: "checkbox", name, label, value: "bt-outline" }` | Boolean modifier: adds `value` to `{classes}` when checked. |
| `{ type: "checkbox", name, label, attr: "disabled" }` | Boolean attribute: adds `attr` to `{attrs}` when checked. |
| `{ type: "checkbox", name, label, snippet: "icon" }` | Substitutes the named snippet (or an empty string) for `{name}`. |
| `{ type: "text", name, label, default }` | Free text, HTML-escaped before substitution in both preview and code. |

Control `label`s are optional: skip them when a group `heading` already says the same thing.

## Snippets and dark surfaces

- `snippets={{ icon: { preview: mailSvgRaw, code: "<svg>[…]</svg> " } }}` gives snippet toggles different markup for the live preview (the real SVG, imported with `?raw`) and the code panel (the abbreviated form used across the docs).
- An option or checkbox control can set `previewSurface: "dark"` to render the preview on a dark surface while active, which keeps `.bt-white` and friends visible.

## Example

The button pilot, abbreviated:

```jsx
<Playground
  client:visible
  template={'<button class="{classes}"{attrs}>{icon}{label}</button>'}
  baseClasses="bt"
  snippets={{ icon: { preview: mail, code: "<svg>[…]</svg> " } }}
  controls={[
    { heading: "Size", items: [
      { type: "select", name: "size", default: "", options: [
        { label: "Default", value: "" },
        { label: "Medium", value: "bt-md" },
        { label: "Large", value: "bt-lg" },
      ]},
    ]},
    { heading: "Modifiers", items: [
      { type: "checkbox", name: "outline", label: "Outline", value: "bt-outline", default: false },
      { type: "checkbox", name: "icon", label: "Icon", snippet: "icon", default: false },
    ]},
    { heading: "Content", items: [
      { type: "text", name: "label", label: "Label", default: "Button" },
      { type: "checkbox", name: "disabled", label: "Disabled", attr: "disabled", default: false },
    ]},
  ]}
/>
```

## Not built yet (on purpose)

- A `variant` control selecting among named templates, e.g. `<button>` vs `<a role="button">`.
- A CSS output tab next to the HTML one.
- Per-page column overrides. If a page ever needs them, the plan is a `columns` prop setting custom properties consumed by the CSS, not runtime media queries.
