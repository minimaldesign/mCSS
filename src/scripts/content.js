// CONTENT HELPERS
// Kept separate from utilities.js: this module imports `astro:content`, so it
// must never be pulled into a client-side bundle.

import { getCollection } from "astro:content";

/**
 * Blog posts, with drafts hidden in production builds and visible in dev.
 * Always use this instead of getCollection("blog") so a draft cannot leak
 * into a listing, a tag page, the RSS feed, or the sitemap.
 *
 * @returns {Promise<import("astro:content").CollectionEntry<"blog">[]>}
 */
export async function getBlogPosts() {
  return getCollection("blog", ({ data }) =>
    import.meta.env.PROD ? !data.draft : true,
  );
}
