import { blog } from '@/lib/source';

export type BlogPage = ReturnType<typeof blog.getPages>[number];

export type TaxonomyEntry = {
  name: string;
  slug: string;
  count: number;
};

export function toTaxonomySlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/gu, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-+/gu, '-')
    .replace(/^-|-$/gu, '');
}

export function getPublishedPosts(): BlogPage[] {
  return blog
    .getPages()
    .filter((page) => !page.data.draft)
    .sort((a, b) => b.data.date.localeCompare(a.data.date));
}

function aggregate(values: string[]): TaxonomyEntry[] {
  const entries = new Map<string, TaxonomyEntry>();

  for (const value of values) {
    const name = value.trim();
    const slug = toTaxonomySlug(name);
    if (!name || !slug) continue;

    const current = entries.get(slug);
    if (current) {
      current.count += 1;
      continue;
    }

    entries.set(slug, { name, slug, count: 1 });
  }

  return [...entries.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'),
  );
}

export function getCategories(): TaxonomyEntry[] {
  return aggregate(getPublishedPosts().map((page) => page.data.category));
}

export function getTags(): TaxonomyEntry[] {
  return aggregate(getPublishedPosts().flatMap((page) => page.data.tags));
}

export function getPostsByCategory(slug: string): BlogPage[] {
  return getPublishedPosts().filter(
    (page) => toTaxonomySlug(page.data.category) === slug,
  );
}

export function getPostsByTag(slug: string): BlogPage[] {
  return getPublishedPosts().filter((page) =>
    page.data.tags.some((tag) => toTaxonomySlug(tag) === slug),
  );
}
