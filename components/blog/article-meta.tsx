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
    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fd-muted-foreground">
      <time dateTime={date}>{date}</time>
      <span aria-hidden="true">·</span>
      <Link
        href={`/categories/${toTaxonomySlug(category)}`}
        className="font-medium text-fd-foreground hover:underline"
      >
        {category}
      </Link>
      {tags.length > 0 ? (
        <details className="group relative">
          <summary className="cursor-pointer list-none rounded px-1 hover:text-fd-foreground [&::-webkit-details-marker]:hidden">
            标签 ({tags.length}) <span aria-hidden="true">⌄</span>
          </summary>
          <div className="absolute top-full left-0 z-20 mt-2 flex max-h-56 w-64 flex-wrap gap-1.5 overflow-auto rounded-lg border bg-fd-background p-3 shadow-lg">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tags/${toTaxonomySlug(tag)}`}
                className="rounded-full border px-2 py-0.5 text-xs hover:bg-fd-accent hover:text-fd-foreground"
              >
                {tag}
              </Link>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}
