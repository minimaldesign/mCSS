// Shared helpers for the machine-readable docs endpoints:
// /llms.txt, /llms-full.txt, and the .md twin of every docs/components page.

// Docs pages in reading order (mirrors the NavDocs sidebar).
export const DOCS_ORDER = [
  "start",
  "tokens",
  "media-queries",
  "themes",
  "reset",
  "elements",
  "global",
  "helpers",
  "ai",
];

export function sortDocs(entries) {
  return [...entries].sort(
    (a, b) => DOCS_ORDER.indexOf(a.id) - DOCS_ORDER.indexOf(b.id),
  );
}

// Components: intro first, then components, alphabetical within each group.
const COMPONENT_TYPE_ORDER = ["intro", "component"];

export function sortComponents(entries) {
  return [...entries].sort((a, b) => {
    const typeDiff =
      COMPONENT_TYPE_ORDER.indexOf(a.data.type) -
      COMPONENT_TYPE_ORDER.indexOf(b.data.type);
    return typeDiff !== 0 ? typeDiff : a.id.localeCompare(b.id);
  });
}

// Strip MDX build noise (imports, MDX comments, docs-site prose wrappers) so the
// body reads as plain markdown. Lines inside code fences are never touched.
export function cleanMdxBody(body) {
  const lines = body.split("\n");
  const out = [];
  let inFence = false;
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    const trimmed = line.trim();
    if (/^import\s.+from\s+["'].+["'];?$/.test(trimmed)) continue;
    if (/^\{\/\*.*\*\/\}$/.test(trimmed)) continue;
    if (trimmed === '<section class="prose">' || trimmed === "</section>") continue;
    out.push(line);
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function pageUrl(site, collection, id, ext = "") {
  const base = collection === "docs" ? "docs" : "components";
  return new URL(`/${base}/${id}${ext}`, site).href;
}

// Full markdown document for one entry, served at its .md twin URL
// and embedded in /llms-full.txt.
export function pageMarkdown(entry, collection, site) {
  const canonical = pageUrl(site, collection, entry.id);
  return [
    `# ${entry.data.title}`,
    "",
    `> Part of mCSS (${new URL(site).host}). Rendered page: ${canonical}`,
    "",
    cleanMdxBody(entry.body),
    "",
  ].join("\n");
}

export const markdownResponse = (text) =>
  new Response(text, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
