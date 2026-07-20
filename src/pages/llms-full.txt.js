import { getCollection } from "astro:content";
import { sortDocs, sortComponents, pageMarkdown, markdownResponse } from "../scripts/llms";

// /llms-full.txt: the entire docs and components reference as one markdown file,
// so an agent can load the whole framework reference in a single fetch.

export async function GET(context) {
  const site = context.site;
  const docs = sortDocs(await getCollection("docs"));
  const components = sortComponents(await getCollection("components"));

  const pages = [
    ...docs.map((entry) => pageMarkdown(entry, "docs", site)),
    ...components.map((entry) => pageMarkdown(entry, "components", site)),
  ];

  const text = [
    "# mCSS: full reference",
    "",
    "> mCSS is a modern CSS framework and component library for websites: real CSS, real markup, zero build step, built on native cascade layers. It is not a dependency; you copy the files into your project and own them. This file concatenates every docs and components page. A per-page index is at /llms.txt.",
    "",
    pages.join("\n\n---\n\n"),
  ].join("\n");

  return markdownResponse(text);
}
