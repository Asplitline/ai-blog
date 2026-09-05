import Link from 'next/link';
import { ArticleCard } from '@/components/blog/article-card';
import { getPublishedPosts, getTags } from '@/lib/posts';

export default function HomePage() {
  const posts = getPublishedPosts();
  const tags = getTags();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8 md:py-12">
      <section className="max-w-2xl py-5 md:py-8">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-fd-muted-foreground">
          Asplitline Blog
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          把对话沉淀成长期可复用的知识。
        </h1>
        <p className="mt-4 text-base leading-7 text-fd-muted-foreground">
          记录 AI、Agent、前端开发与工程实践中的问题、原理和解决方案。
        </p>
      </section>

      <section id="latest-posts" className="border-t py-8 scroll-mt-20">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">最新文章</h2>
          <Link
            href="#latest-posts"
            className="text-sm text-fd-muted-foreground transition-colors hover:text-fd-foreground"
          >
            全部文章 →
          </Link>
        </div>
        <div className="grid gap-4">
          {posts.map((post) => (
            <ArticleCard key={post.url} post={post} />
          ))}
        </div>
      </section>

      <section className="border-t py-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">标签</h2>
            <Link href="/tags" className="text-xs text-fd-muted-foreground hover:text-fd-foreground">
              全部 →
            </Link>
          </div>

          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 10).map((tag) => (
              <Link
                key={tag.slug}
                href={`/tags/${tag.slug}`}
                className="rounded-full border px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
