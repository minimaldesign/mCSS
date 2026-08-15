/**
 * Builds the distributable framework CSS into dist/.
 *
 * Outputs (all with @custom-media resolved and mixins expanded, so they work
 * with zero tooling; cascade layers are kept intact):
 *   dist/mcss.css                — single-file bundle of the framework core
 *                                  WITH the default theme baked in, so it
 *                                  stays a working drop-in on its own
 *                                  (declares the components slot, imports
 *                                  no component)
 *   dist/mcss.min.css            — minified core bundle
 *   dist/mcss.components.css     — single-file bundle of the component
 *                                  library (@layer components)
 *   dist/mcss.components.min.css — minified components bundle
 *   dist/css/<file>.css — every framework file processed individually,
 *                         wrapped in its cascade layer (theme.* files
 *                         self-layer and aren't re-wrapped)
 *   dist/css/mcss.css   — @import index over the per-file outputs; the
 *                         default theme import is active (the framework
 *                         doesn't paint without it), other themes are
 *                         commented out (swap which one is active)
 *
 * Run: npm run build:css
 */
import { readFile, writeFile, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import postcss from "postcss";
import postcssImport from "postcss-import";
import postcssMixins from "postcss-mixins";
import postcssPresetEnv from "postcss-preset-env";
import { transform as esbuildTransform } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const SRC = join(ROOT, "src/styles/framework");
const OUT = join(ROOT, "dist");

const pkg = JSON.parse(await readFile(join(ROOT, "package.json"), "utf8"));
const BANNER = `/*! mCSS v${pkg.version} | MIT | https://mcss.dev */\n`;

// Same semantics as the site pipeline (postcss.config.cjs + Vite's
// postcss-import): custom media resolved, mixins expanded, layers kept.
const plugins = (withImport) =>
  [
    withImport && postcssImport(),
    postcssMixins(),
    postcssPresetEnv({
      stage: 2,
      // Keep in sync with postcss.config.cjs. cascade-layers: mCSS ships
      // native @layer, the polyfill would strip it. random-function: let
      // native random() pass through so it doesn't freeze into a static,
      // source-length-seeded value that churns dist on any edit (the
      // wireframe theme's tier 1 sibling-index() math is the fallback).
      features: { "cascade-layers": false, "random-function": false },
    }),
  ].filter(Boolean);

async function process(css, from, withImport = false) {
  const result = await postcss(plugins(withImport)).process(css, { from });
  for (const warning of result.warnings()) console.warn(String(warning));
  return result.css;
}

// Map a framework file name to its cascade layer via its prefix.
function layerOf(file) {
  const prefix = file.split(".")[0];
  return (
    {
      base: "base",
      elements: "elements",
      global: "global",
      component: "components",
      theme: "theme",
      help: "helpers",
    }[prefix] ?? null
  );
}

const LAYER_STATEMENT =
  "@layer base, elements, global, components, theme.default, theme.user, helpers;\n";

// Rebuild dist/css from scratch so renamed or deleted source files can't
// leave stale outputs behind.
await rm(join(OUT, "css"), { recursive: true, force: true });
await mkdir(join(OUT, "css"), { recursive: true });

// 1. Single-file bundles, core + component library (postcss-import inlines
//    the layer() imports), each with a minified variant. The core bundle
//    bakes the default theme in so dist/mcss.css works as a one-file
//    drop-in; source consumers activate the theme themselves.
const coreEntry =
  "@import url(./mcss.css);\n@import url(./theme.default.css);\n";
const bundles = {};
for (const name of ["mcss.css", "mcss.components.css"]) {
  const entry = join(SRC, name);
  const source =
    name === "mcss.css" ? coreEntry : await readFile(entry, "utf8");
  const bundled = await process(source, join(SRC, `_entry-${name}`), true);
  await writeFile(join(OUT, name), BANNER + bundled);

  const { code: minified } = await esbuildTransform(bundled, {
    loader: "css",
    minify: true,
  });
  const minName = name.replace(/\.css$/, ".min.css");
  await writeFile(join(OUT, minName), BANNER + minified);
  bundles[name] = { bundled, minified, minName };
}

// 2. Per-file outputs for copy-paste consumers.
const buildTimeOnly = new Set([
  "settings.media-queries.css",
  "settings.mixins.css",
]);
const settingsPrelude = [
  await readFile(join(SRC, "settings.media-queries.css"), "utf8"),
  await readFile(join(SRC, "settings.mixins.css"), "utf8"),
].join("\n");

const files = (await readdir(SRC))
  .filter(
    (f) =>
      f.endsWith(".css") &&
      f !== "mcss.css" &&
      f !== "mcss.components.css" &&
      !buildTimeOnly.has(f),
  )
  .sort();

const indexImports = [];
for (const file of files) {
  const layer = layerOf(file);
  const css = await readFile(join(SRC, file), "utf8");
  // Prepend the build-time settings so @custom-media/@mixin resolve, then
  // wrap the file's own rules in its layer. preset-env removes the
  // @custom-media definitions from the output. Standalone theme files
  // (starter, skins) self-layer, so they're not re-wrapped; the default
  // theme's parts are plain CSS layered by their entry in source, so the
  // dist copies get wrapped here so a lone <link> still slots correctly.
  // In the index the default theme import is active (the framework
  // doesn't paint without a theme); other theme entries are commented:
  // swap which one is active to change skins.
  const importsOnly = file === "theme.default.css";
  const isDefaultPart = file.startsWith("theme.default.") && !importsOnly;
  const selfLayered = layer === "theme" && !isDefaultPart;
  const wrapLayer = isDefaultPart ? "theme.default" : layer;
  const wrapped = importsOnly
    ? css
    : selfLayered
      ? `${settingsPrelude}\n${css}`
      : `${settingsPrelude}\n@layer ${wrapLayer} {\n${css}\n}`;
  const processed = await process(wrapped, join(SRC, file));
  await writeFile(join(OUT, "css", file), BANNER + processed.trim() + "\n");
  indexImports.push(
    importsOnly
      ? `@import url(./${file}); /* the default theme */`
      : isDefaultPart
        ? `/* @import url(./${file}); */ /* imported by theme.default.css */`
        : selfLayered
          ? `/* @import url(./${file}); */ /* theme: swap for the default */`
          : `@import url(./${file}) layer(${layer});`,
  );
}

// 3. @import index (usable in the browser with no build step).
await writeFile(
  join(OUT, "css", "mcss.css"),
  BANNER + LAYER_STATEMENT + indexImports.join("\n") + "\n",
);

console.log(
  Object.entries(bundles)
    .map(
      ([name, { bundled, minified, minName }]) =>
        `Built dist/${name} (${(bundled.length / 1024).toFixed(1)} kB), ` +
        `dist/${minName} (${(minified.length / 1024).toFixed(1)} kB)`,
    )
    .join("\n") + `\n${files.length} files in dist/css/`,
);
