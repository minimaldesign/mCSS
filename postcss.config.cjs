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
      },
    }),
  ],
};

module.exports = config;
