import { posts } from '@/.source';
import { loader } from 'fumadocs-core/source';

export const blog = loader({
  baseUrl: '/posts',
  source: posts.toFumadocsSource(),
});
