import { createSearchAPI } from 'fumadocs-core/search/server';
import { getPublishedPosts } from '@/lib/posts';

export const revalidate = false;

export const { staticGET: GET } = createSearchAPI('advanced', {
  indexes: getPublishedPosts().map((page) => ({
    title: page.data.title,
    description: page.data.description,
    url: page.url,
    id: page.url,
    structuredData: page.data.structuredData,
  })),
});
