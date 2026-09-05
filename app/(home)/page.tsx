import Link from 'next/link';
import { ArticleCard } from '@/components/blog/article-card';
import { getPublishedPosts } from '@/lib/posts';

export default function HomePage() {
  const posts = getPublishedPosts();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-5 sm:px-6 sm:py-6 md:py-8">
      <section className="max-w-2xl py-3 sm:py-4 md:py-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fd-muted-foreground sm:text-xs sm:tracking-[0.16em]">
          Asplitline Blog
        </p>
        <h1 className="mt-2.5 text-2xl font-semibold leading-tight tracking-tight sm:mt-3 sm:text-3xl md:text-4xl">
          把对话沉淀成长期可复用的知识。
        </h1>
        <p className="mt-3 text-sm leading-6 text-fd-muted-foreground sm:text-base sm:leading-7">
          记录 AI、Agent、前端开发与工程实践中的问题、原理和解决方案。
        </p>
      </section>

      <section id="latest-posts" className="scroll-mt-20 border-t pt-5 pb-6 sm:pt-6 sm:pb-7 md:pt-7 md:pb-8">
        <div className="mb-3 flex items-center justify-between gap-3 sm:mb-4">
          <h2 className="text-lg font-semibold sm:text-xl">最新文章</h2>
          <Link
            href="#latest-posts"
            className="text-xs text-fd-muted-foreground transition-colors hover:text-fd-foreground sm:text-sm"
          >
            全部文章 →
          </Link>
        </div>
        <div className="grid gap-3 sm:gap-4">
          {posts.map((post) => (
            <ArticleCard key={post.url} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
