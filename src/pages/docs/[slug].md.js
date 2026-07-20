import { getCollection } from "astro:content";
import { pageMarkdown, markdownResponse } from "../../scripts/llms";

// Markdown twin of every docs page: /docs/<slug>.md

export async function getStaticPaths() {
  const entries = await getCollection("docs");
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

export async function GET({ props, site }) {
  return markdownResponse(pageMarkdown(props.entry, "docs", site));
}
