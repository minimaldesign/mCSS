import { useId, useMemo, useState } from "preact/hooks";
import resetIcon from "../assets/icons/rotate-ccw.svg?raw";
import { useHighlightedCode } from "./_useHighlightedCode.js";
import CopyButton from "./_CopyButton.jsx";

/*
  Generic component playground. Configured entirely from MDX through
  serializable props (functions can't cross the island boundary):

  - template: HTML string with placeholders. `{classes}` becomes baseClasses
    plus classes contributed by active controls; `{attrs}` becomes active
    boolean attributes (leading space included, empty when none); `{name}`
    becomes the value of the text control or snippet toggle named `name`.
    In MDX, pass it as a quoted JS string prop so `{classes}` isn't parsed
    as an expression: template={'<button class="{classes}">{label}</button>'}
  - baseClasses: classes always present, e.g. "bt".
  - controls: array of plain objects. Entries are either a control (see the
    types below) or a group `{ heading, items: [controls] }`. Groups become
    columns in an auto-fit grid, so column count adapts to available width
    with no per-page configuration. Consecutive ungrouped controls collect
    into one implicit group, which keeps flat configs working.
  - snippets: { name: { preview, code } } markup for snippet toggles; the
    live preview uses `preview` (real SVG), the code panel uses `code`
    (abbreviated, e.g. "<svg>[…]</svg> ").

  Control types:
  - { type: "select", name, label, default, options: [{ label, value }] }
    mutually exclusive modifier group; radios up to 4 options, <select> above.
  - { type: "checkbox", name, label, value: "bt-outline", default }
    boolean modifier, contributes `value` to {classes} when checked.
  - { type: "checkbox", name, label, attr: "disabled", default }
    boolean attribute, contributes `attr` to {attrs} when checked.
  - { type: "checkbox", name, label, snippet: "icon", default }
    substitutes the named snippet (or "") for {name}.
  - { type: "text", name, label, default }
    free text, HTML-escaped before substitution.

  An option (or checkbox control) can set previewSurface: "dark" to render
  the preview on a dark surface while active (for .bt-white and friends).

  v2 ideas, deliberately not built: a `variant` control selecting among named
  templates (e.g. <button> vs <a role="button">), a CSS output tab.
*/

const RADIO_MAX_OPTIONS = 4;

function escapeHtml(str) {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Entries are controls or { heading, items } groups; consecutive ungrouped
// controls collect into one implicit group so flat configs keep working.
function normalizeGroups(controls) {
  const groups = [];
  let implicit = null;
  for (const entry of controls) {
    if (entry.items) {
      implicit = null;
      groups.push(entry);
    } else {
      if (!implicit) {
        implicit = { items: [] };
        groups.push(implicit);
      }
      implicit.items.push(entry);
    }
  }
  return groups;
}

function defaultValues(controls) {
  const values = {};
  for (const control of controls) {
    values[control.name] =
      control.default ?? (control.type === "checkbox" ? false : "");
  }
  return values;
}

// Single source of truth: the same substitution builds the live preview
// (mode "preview") and the code panel / clipboard string (mode "code").
function buildHtml({ template, baseClasses, controls, snippets, values, mode }) {
  const classes = baseClasses ? [baseClasses] : [];
  const attrs = [];
  const substitutions = {};

  for (const control of controls) {
    const value = values[control.name];
    if (control.type === "select") {
      if (value) classes.push(value);
    } else if (control.type === "checkbox") {
      if (control.snippet) {
        const snippet = snippets[control.snippet] ?? {};
        substitutions[control.name] = value ? (snippet[mode] ?? "") : "";
      } else if (value) {
        if (control.value) classes.push(control.value);
        if (control.attr) attrs.push(control.attr);
      }
    } else if (control.type === "text") {
      substitutions[control.name] = escapeHtml(String(value ?? ""));
    }
  }

  let html = template
    .replaceAll("{classes}", classes.join(" "))
    .replaceAll("{attrs}", attrs.length ? ` ${attrs.join(" ")}` : "");
  for (const [name, replacement] of Object.entries(substitutions)) {
    html = html.replaceAll(`{${name}}`, replacement);
  }
  return html;
}

function hasDarkSurface(controls, values) {
  return controls.some((control) => {
    if (control.type === "select") {
      const selected = control.options.find(
        (option) => option.value === values[control.name],
      );
      return selected?.previewSurface === "dark";
    }
    return control.previewSurface === "dark" && Boolean(values[control.name]);
  });
}

function SelectControl({ control, groupName, value, onChange }) {
  if (control.options.length > RADIO_MAX_OPTIONS) {
    return (
      <div class="playground_settings_field">
        {control.label && (
          <label class="playground_settings_label">{control.label}</label>
        )}
        <select
          class="playground_settings_select"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {control.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <fieldset class="playground_settings_field">
      {control.label && (
        <legend class="playground_settings_label">{control.label}</legend>
      )}
      {control.options.map((option) => (
        <label key={option.value} class="playground_settings_check">
          <input
            type="radio"
            name={groupName}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

export default function Playground({
  template,
  baseClasses = "",
  controls = [],
  snippets = {},
  class: className = "",
}) {
  const id = useId();
  const groups = useMemo(() => normalizeGroups(controls), [controls]);
  const allControls = useMemo(
    () => groups.flatMap((group) => group.items),
    [groups],
  );
  const [values, setValues] = useState(() => defaultValues(allControls));

  const setValue = (name, value) =>
    setValues((current) => ({ ...current, [name]: value }));

  const previewHtml = useMemo(
    () =>
      buildHtml({
        template,
        baseClasses,
        controls: allControls,
        snippets,
        values,
        mode: "preview",
      }),
    [template, baseClasses, allControls, snippets, values],
  );
  const codeHtml = useMemo(
    () =>
      buildHtml({
        template,
        baseClasses,
        controls: allControls,
        snippets,
        values,
        mode: "code",
      }),
    [template, baseClasses, allControls, snippets, values],
  );
  const highlightedHtml = useHighlightedCode(codeHtml, "html");
  const darkSurface = hasDarkSurface(allControls, values);

  const renderControl = (control) => {
    const value = values[control.name];
    if (control.type === "select") {
      return (
        <SelectControl
          key={control.name}
          control={control}
          groupName={`${id}-${control.name}`}
          value={value}
          onChange={(v) => setValue(control.name, v)}
        />
      );
    }
    if (control.type === "checkbox") {
      return (
        <div key={control.name} class="playground_settings_field">
          <label class="playground_settings_check">
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => setValue(control.name, e.target.checked)}
            />
            {control.label}
          </label>
        </div>
      );
    }
    if (control.type === "text") {
      return (
        <div key={control.name} class="playground_settings_field">
          {control.label && (
            <label class="playground_settings_label">{control.label}</label>
          )}
          <input
            class="playground_settings_input"
            type="text"
            value={value}
            onInput={(e) => setValue(control.name, e.target.value)}
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div class={`playground not-prose${className ? ` ${className}` : ""}`}>
      <div
        class={`playground_preview${darkSurface ? " is-darkSurface" : ""}`}
        dangerouslySetInnerHTML={{ __html: previewHtml }}
      />
      <div class="playground_settings">
        {groups.map((group, index) => (
          <div key={group.heading ?? index} class="playground_settings_group">
            {group.heading && (
              <h4 class="playground_settings_heading">{group.heading}</h4>
            )}
            {group.items.map(renderControl)}
          </div>
        ))}
        <button
          class="playground_btn playground_settings_reset"
          onClick={() => setValues(defaultValues(allControls))}
          title="Reset to defaults"
          dangerouslySetInnerHTML={{ __html: resetIcon }}
        />
      </div>
      <div class="playground_code">
        <CopyButton code={codeHtml} />
        <pre>
          {highlightedHtml ? (
            <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          ) : (
            <code>{codeHtml}</code>
          )}
        </pre>
      </div>
    </div>
  );
}
