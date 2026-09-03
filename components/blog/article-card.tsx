import Link from 'next/link';
import type { BlogPage } from '@/lib/posts';
import { toTaxonomySlug } from '@/lib/posts';

export function ArticleCard({ post }: { post: BlogPage }) {
  return (
    <article className="rounded-2xl border bg-fd-card p-6 transition-colors hover:bg-fd-accent/40">
      <div className="flex flex-wrap items-center gap-2 text-sm text-fd-muted-foreground">
        <time dateTime={post.data.date}>{post.data.date}</time>
        <span aria-hidden="true">·</span>
        <Link
          href={`/categories/${toTaxonomySlug(post.data.category)}`}
          className="font-medium text-fd-foreground hover:underline"
        >
          {post.data.category}
        </Link>
      </div>

      <h2 className="mt-3 text-2xl font-semibold tracking-tight">
        <Link href={post.url} className="hover:underline">
          {post.data.title}
        </Link>
      </h2>

      {post.data.description ? (
        <p className="mt-3 leading-7 text-fd-muted-foreground">
          {post.data.description}
        </p>
      ) : null}

      {post.data.tags.length > 0 ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {post.data.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${toTaxonomySlug(tag)}`}
              className="rounded-full border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
            >
              {tag}
            </Link>
          ))}
        </div>
      ) : null}
    </article>
  );
}
