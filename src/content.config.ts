/* Content collections: the documentation pages, written in Markdown (src/content/docs/<lang>/<key>.md). */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    /* Page title, also used in the menu and the search. */
    title: z.string(),
    /* One or two sentences under the title; also the page description for search engines. */
    description: z.string(),
    /* Release that brings the feature, when it is not in version 0.1 (shown as a badge). */
    release: z.string().optional()
  })
});

export const collections = { docs };
