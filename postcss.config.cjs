const postcssPresetEnv = require("postcss-preset-env");

const config = {
  plugins: [
    require("postcss-mixins"),
    postcssPresetEnv({
      stage: 2,
    }),
  ],
};

module.exports = config;
