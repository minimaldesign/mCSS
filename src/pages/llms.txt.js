import { getCollection } from "astro:content";
import { sortDocs, sortComponents, pageUrl, markdownResponse } from "../scripts/llms";

// /llms.txt: index of the machine-readable docs (llmstxt.org format).

export async function GET(context) {
  const site = context.site;
  const docs = sortDocs(await getCollection("docs"));
  const components = sortComponents(await getCollection("components"));

  const docLine = (entry) => {
    const url = pageUrl(site, "docs", entry.id, ".md");
    const description = entry.data.description;
    return `- [${entry.data.title}](${url})${description ? `: ${description}` : ""}`;
  };

  const componentLine = (entry) => {
    const url = pageUrl(site, "components", entry.id, ".md");
    const label = entry.data.cssOnly ? " (CSS-only)" : "";
    return `- [${entry.data.title}](${url})${label}`;
  };

  const text = [
    "# mCSS",
    "",
    "> mCSS is a modern CSS framework and component library for websites: real CSS, real markup, zero build step, built on native cascade layers. It is not a dependency; you copy the files into your project and own them, editing them directly (starting with settings.tokens.css).",
    "",
    "Every docs and components page has a markdown twin at the same URL with `.md` appended (e.g. /docs/tokens.md). Fetch those instead of the HTML pages. The complete reference in a single file is at /llms-full.txt.",
    "",
    "## Docs",
    "",
    ...docs.map(docLine),
    "",
    "## Components",
    "",
    ...components.map(componentLine),
    "",
    "## Optional",
    "",
    `- [Blog](${new URL("/blog", site).href}): release notes and articles`,
    `- [Source](https://github.com/minimaldesign/mCSS): copy dist/mcss.min.css as a drop-in, dist/css/ for individual files, or src/styles/framework/ if you run PostCSS yourself`,
    "",
  ].join("\n");

  return markdownResponse(text);
}
