import { defineCollections } from 'fumadocs-mdx/macro';
import { loader } from 'fumadocs-core/source';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

const posts = defineCollections({
  type: 'doc',
  dir: 'content/posts',
  schema: pageSchema.extend({
    date: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const blog = loader({
  baseUrl: '/posts',
  source: posts.toFumadocsSource(),
});
