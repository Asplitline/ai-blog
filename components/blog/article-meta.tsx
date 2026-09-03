import Link from 'next/link';
import { toTaxonomySlug } from '@/lib/posts';

export function ArticleMeta({
  date,
  category,
  tags,
}: {
  date: string;
  category: string;
  tags: string[];
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-fd-muted-foreground">
      <time dateTime={date}>{date}</time>
      <span aria-hidden="true">·</span>
      <Link
        href={`/categories/${toTaxonomySlug(category)}`}
        className="font-medium text-fd-foreground hover:underline"
      >
        {category}
      </Link>
      {tags.map((tag) => (
        <Link
          key={tag}
          href={`/tags/${toTaxonomySlug(tag)}`}
          className="rounded-full border px-2 py-0.5 text-xs transition-colors hover:bg-fd-accent hover:text-fd-foreground"
        >
          {tag}
        </Link>
      ))}
    </div>
  );
}
