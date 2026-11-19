import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    // Thumbnail in the Writing list.
    cover: z.string().optional(),
    // Figure shown under the article header, above the text. `narrow` is served to phones.
    hero: z
      .object({ src: z.string(), narrow: z.string().optional(), alt: z.string(), caption: z.string().optional() })
      .optional(),
  }),
});
export const collections = { posts };
