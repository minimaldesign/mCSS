/**
 * Builds the distributable framework CSS into dist/.
 *
 * Outputs (all with @custom-media resolved and mixins expanded, so they work
 * with zero tooling; cascade layers are kept intact):
 *   dist/mcss.css       — single-file bundle of the whole framework
 *   dist/mcss.min.css   — minified bundle
 *   dist/css/<file>.css — every framework file processed individually,
 *                         wrapped in its cascade layer
 *   dist/css/mcss.css   — @import index over the per-file outputs
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
      features: { "cascade-layers": false },
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
      settings: "settings",
      base: "base",
      elements: "elements",
      global: "global",
      component: "components",
      page: "pages",
      help: "helpers",
    }[prefix] ?? null
  );
}

const LAYER_STATEMENT =
  "@layer settings, base, elements, global, components, pages, helpers;\n";

// Rebuild dist/css from scratch so renamed or deleted source files can't
// leave stale outputs behind.
await rm(join(OUT, "css"), { recursive: true, force: true });
await mkdir(join(OUT, "css"), { recursive: true });

// 1. Single-file bundle (postcss-import inlines the layer() imports).
const entry = join(SRC, "mcss.css");
const bundled = await process(await readFile(entry, "utf8"), entry, true);
await writeFile(join(OUT, "mcss.css"), BANNER + bundled);

// 2. Minified bundle.
const { code: minified } = await esbuildTransform(bundled, {
  loader: "css",
  minify: true,
});
await writeFile(join(OUT, "mcss.min.css"), BANNER + minified);

// 3. Per-file outputs for copy-paste consumers.
const buildTimeOnly = new Set(["settings.media-queries.css", "settings.mixins.css"]);
const settingsPrelude = [
  await readFile(join(SRC, "settings.media-queries.css"), "utf8"),
  await readFile(join(SRC, "settings.mixins.css"), "utf8"),
].join("\n");

const files = (await readdir(SRC))
  .filter((f) => f.endsWith(".css") && f !== "mcss.css" && !buildTimeOnly.has(f))
  .sort();

const indexImports = [];
for (const file of files) {
  const layer = layerOf(file);
  const css = await readFile(join(SRC, file), "utf8");
  // Prepend the build-time settings so @custom-media/@mixin resolve, then
  // wrap the file's own rules in its layer. preset-env removes the
  // @custom-media definitions from the output.
  const wrapped = `${settingsPrelude}\n@layer ${layer} {\n${css}\n}`;
  const processed = await process(wrapped, join(SRC, file));
  await writeFile(join(OUT, "css", file), BANNER + processed.trim() + "\n");
  indexImports.push(`@import url(./${file}) layer(${layer});`);
}

// 4. @import index (usable in the browser with no build step).
await writeFile(
  join(OUT, "css", "mcss.css"),
  BANNER + LAYER_STATEMENT + indexImports.join("\n") + "\n"
);

console.log(
  `Built dist/mcss.css (${(bundled.length / 1024).toFixed(1)} kB), ` +
    `dist/mcss.min.css (${(minified.length / 1024).toFixed(1)} kB), ` +
    `${files.length} files in dist/css/`
);
