const postcssPresetEnv = require("postcss-preset-env");

const config = {
  plugins: [
    require("postcss-mixins"),
    postcssPresetEnv({
      stage: 2,
      features: {
        // mCSS ships native cascade layers; without this, preset-env's
        // polyfill strips every @layer rule and rewrites priorities as
        // specificity hacks. Do not remove.
        "cascade-layers": false,
        // Let native random() pass through untouched. The polyfill freezes
        // random() into a single static value (seeded by source length, so
        // it churns on any edit) AND leaves it inside the @supports
        // (random()) gate, defeating the wireframe theme's live per-element
        // tilt. Browsers without random() already fall back to the tier 1
        // sibling-index() math. Do not enable.
        "random-function": false,
      },
    }),
  ],
};

module.exports = config;
