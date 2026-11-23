import Link from 'next/link';
import type { BlogPage } from '@/lib/posts';
import { toTaxonomySlug } from '@/lib/posts';

export function ArticleCard({
  post,
  compact = false,
}: {
  post: BlogPage;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <article className="px-4 py-3 transition-colors hover:bg-fd-accent/40 sm:px-5 sm:py-3.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fd-muted-foreground">
          <time dateTime={post.data.date}>{post.data.date}</time>
          <Link
            href={`/categories/${toTaxonomySlug(post.data.category)}`}
            className="hover:text-fd-foreground hover:underline"
          >
            {post.data.category}
          </Link>
        </div>
        <h3 className="mt-1 text-base font-semibold leading-6 tracking-tight sm:text-lg">
          <Link href={post.url} className="hover:underline">
            {post.data.title}
          </Link>
        </h3>
        {post.data.description ? (
          <p className="mt-1 line-clamp-1 text-xs leading-5 text-fd-muted-foreground sm:text-sm">
            {post.data.description}
          </p>
        ) : null}
      </article>
    );
  }

  return (
    <article className="rounded-xl border bg-fd-card p-4 transition-colors hover:bg-fd-accent/40 sm:rounded-2xl sm:p-5 md:p-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-fd-muted-foreground sm:text-sm">
        <time dateTime={post.data.date}>{post.data.date}</time>
        <span aria-hidden="true">·</span>
        <Link
          href={`/categories/${toTaxonomySlug(post.data.category)}`}
          className="font-medium text-fd-foreground hover:underline"
        >
          {post.data.category}
        </Link>
      </div>
      <h2 className="mt-2.5 text-xl font-semibold leading-snug tracking-tight sm:mt-3 sm:text-2xl">
        <Link href={post.url} className="hover:underline">
          {post.data.title}
        </Link>
      </h2>
      {post.data.description ? (
        <p className="mt-2.5 text-sm leading-6 text-fd-muted-foreground sm:mt-3 sm:text-base sm:leading-7">
          {post.data.description}
        </p>
      ) : null}
      {post.data.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
          {post.data.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${toTaxonomySlug(tag)}`}
              className="rounded-full border px-2 py-0.5 text-[11px] text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground sm:px-2.5 sm:py-1 sm:text-xs"
            >
              {tag}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
