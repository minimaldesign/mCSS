// Import utilities from `astro:content`
import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

// Define a `type` and `schema` for each collection
const blogCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    description: z.string(),
    author: z.string(),
    image: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    tags: z.array(z.string()),
  }),
});

const docsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{md,mdx}", base: "./src/content/docs" }),
  schema: z.object({
    title: z.string(),
    lastUpdate: z.date(),
    version: z.number(),
  }),
});

const componentsCollection = defineCollection({
  loader: glob({
    pattern: "**/[^_]*.{md,mdx}",
    base: "./src/content/components",
  }),
  schema: z.object({
    title: z.string(),
    lastUpdate: z.date(),
    version: z.number(),
    type: z.enum(["intro", "atom", "component"]),
  }),
});

// Export a single `collections` object to register your collection(s)
export const collections = {
  blog: blogCollection,
  docs: docsCollection,
  components: componentsCollection,
};
