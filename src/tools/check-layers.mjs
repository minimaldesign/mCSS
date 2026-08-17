/**
 * Verifies that every copy of the cascade-layer statement agrees with the
 * canonical one in src/styles/framework/mcss.css.
 *
 * The statement is deliberately duplicated: the self-layered theme files
 * pin the order so they work when loaded alone, dist must work with zero
 * tooling, and the docs quote the code. Each copy has to stand on its own,
 * so the invariant "they all agree" is enforced here instead of removed
 * with an abstraction.
 *
 * Run:  npm run check:layers            # verify, exit 1 on drift
 *       npm run check:layers -- --fix   # rewrite stale copies in place
 *
 * Extra file paths can be passed as arguments to check files outside the
 * repo (e.g. a local agent-instructions copy of the rules block).
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CANONICAL_FILE = "src/styles/framework/mcss.css";

// Every file that carries a copy of the statement (or of its bare layer
// list, e.g. inline code in the docs). Dist files are included on purpose:
// they only agree after `npm run build:css`, so a stale dist fails here.
const CARRIERS = [
  "src/styles/framework/theme.default.css",
  "src/styles/framework/theme.starter.css",
  "src/styles/framework/theme.wireframe.css",
  "src/pages/templates/marketing.astro",
  "src/content/docs/installation.mdx",
  "src/content/docs/ai.mdx",
  "dist/mcss.css",
  "dist/css/mcss.css",
  "dist/css/theme.default.css",
  "dist/css/theme.starter.css",
  "dist/css/theme.wireframe.css",
];

const args = process.argv.slice(2);
const fix = args.includes("--fix");
const extras = args.filter((a) => a !== "--fix");

const canonicalSource = await readFile(join(ROOT, CANONICAL_FILE), "utf8");
const statement = canonicalSource.match(/^@layer ([^;{]+);/m);
if (!statement) {
  console.error(`No @layer statement found in ${CANONICAL_FILE}`);
  process.exit(1);
}
const LIST = statement[1].trim().replace(/\s+/g, " ");

// A "run" is any occurrence of the layer list: it starts at "base," and
// ends at a terminator (";" in CSS, a backtick in docs prose, or the end
// of the line). Every run in a carrier must equal the canonical list.
const RUN = /base,\s*elements[^;`\n]*/g;
const normalize = (run) => run.trim().replace(/\s+/g, " ");

let failed = false;
for (const file of [...CARRIERS, ...extras]) {
  const path = file.startsWith("/") ? file : join(ROOT, file);
  let content;
  try {
    content = await readFile(path, "utf8");
  } catch {
    console.error(`✗ ${file}: cannot read`);
    failed = true;
    continue;
  }
  const runs = content.match(RUN) ?? [];
  if (runs.length === 0) {
    console.error(`✗ ${file}: no layer list found`);
    failed = true;
    continue;
  }
  const stale = runs.filter((run) => normalize(run) !== LIST);
  if (stale.length === 0) {
    console.log(`✓ ${file}`);
  } else if (fix) {
    await writeFile(path, content.replace(RUN, LIST));
    console.log(`✎ ${file}: rewrote ${stale.length} stale of ${runs.length}`);
  } else {
    failed = true;
    console.error(`✗ ${file}:`);
    console.error(`    expected  ${LIST}`);
    for (const run of stale) console.error(`    found     ${normalize(run)}`);
  }
}

if (failed) {
  console.error(`\nLayer statements disagree with ${CANONICAL_FILE}.`);
  console.error("Run `npm run check:layers -- --fix` to rewrite them.");
  process.exit(1);
}
