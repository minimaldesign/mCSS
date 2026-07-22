import rss from "@astrojs/rss";
import { getBlogPosts } from "../scripts/content.js";

export async function GET(context) {
  const blog = await getBlogPosts();
  return rss({
    title: "mCSS News",
    description: "Stay up to date with mCSS updates",
    site: context.site,
    items: blog.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.id}/`,
    })),
    customData: `<language>en-us</language>`,
  });
}
