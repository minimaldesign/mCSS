import { useState } from "preact/hooks";

const CHEVRON = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C%2Fsvg%3E")`;

const LAYERS = [
  { key: "l1", label: "Layer 1", sub: "SVG chevron · padding-box · add" },
  { key: "l2", label: "Layer 2", sub: "right strip · padding-box · exclude" },
  { key: "l3", label: "Layer 3", sub: "solid fill · border-box" },
];

function buildMaskStyle(visible) {
  const images = [],
    composites = [],
    clips = [],
    origins = [],
    sizes = [],
    positions = [];

  if (visible.l1) {
    images.push(CHEVRON);
    composites.push("add");
    clips.push("padding-box");
    origins.push("padding-box");
    sizes.push("24px");
    positions.push("calc(100% - var(--xs1)) center");
  }
  if (visible.l2) {
    images.push(
      "linear-gradient(to right, transparent calc(100% - 25px), red 0)",
    );
    composites.push("exclude");
    clips.push("padding-box");
    origins.push("padding-box");
    sizes.push("auto");
    positions.push("0 0");
  }
  if (visible.l3) {
    images.push("linear-gradient(red 0 0)");
    composites.push("add");
    clips.push("border-box");
    origins.push("border-box");
    sizes.push("auto");
    positions.push("0 0");
  }

  if (!images.length) return {};

  return {
    maskImage: images.join(", "),
    maskComposite: composites.join(", "),
    maskClip: clips.join(", "),
    maskOrigin: origins.join(", "),
    maskSize: sizes.join(", "),
    maskPosition: positions.join(", "),
    maskRepeat: "no-repeat",
  };
}

export default function SelectMask() {
  const [visible, setVisible] = useState({ l1: false, l2: false, l3: false });
  const toggle = (key) => setVisible((p) => ({ ...p, [key]: !p[key] }));

  const anyOn = visible.l1 || visible.l2 || visible.l3;
  const maskStyle = anyOn ? buildMaskStyle(visible) : {};

  return (
    <div class="selectMask not-prose">
      <p class="selectMask_legend">
        Toggle the checkboxes to see how <code>add</code>add and{" "}
        <code>exclude</code> compose the combined result.
        <br />
        (Red area = opaque in the mask.)
      </p>
      <div class="selectMask_layers">
        {LAYERS.map(({ key, label, sub }) => (
          <div key={key} class="selectMask_col">
            <div class="selectMask_field">
              <div class={`sm_${key}`} />
            </div>
            <label class="selectMask_toggle">
              <input
                type="checkbox"
                checked={visible[key]}
                onChange={() => toggle(key)}
              />
              <span class="selectMask_info">
                <strong>{label}</strong>
                <span>{sub}</span>
              </span>
            </label>
          </div>
        ))}
      </div>
      <div
        class={`selectMask_field selectMask_field-combined${anyOn ? "" : " sm_noMask"}`}
        style={maskStyle}
      >
        <div class="selectMask_redOverlay" />
        <span class="selectMask_fieldText">Select…</span>
      </div>
      <p class="selectMask_caption">Combined result</p>
    </div>
  );
}
