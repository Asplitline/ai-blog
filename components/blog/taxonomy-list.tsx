import Link from 'next/link';
import type { TaxonomyEntry } from '@/lib/posts';

export function TaxonomyList({
  items,
  basePath,
}: {
  items: TaxonomyEntry[];
  basePath: '/categories' | '/tags';
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`${basePath}/${item.slug}`}
          className="flex items-center justify-between rounded-xl border bg-fd-card px-4 py-3 transition-colors hover:bg-fd-accent/50"
        >
          <span className="font-medium">{item.name}</span>
          <span className="text-sm text-fd-muted-foreground">{item.count}</span>
        </Link>
      ))}
    </div>
  );
}
