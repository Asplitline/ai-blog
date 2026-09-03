import { defineCollections } from 'fumadocs-mdx/config';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

export const posts = defineCollections({
  type: 'doc',
  dir: 'content/posts',
  schema: pageSchema.extend({
    date: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});
