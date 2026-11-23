import Link from 'next/link';
import { ArticleCard } from '@/components/blog/article-card';
import { getPublishedPosts } from '@/lib/posts';

export default function HomePage() {
  const posts = getPublishedPosts();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:px-6 sm:py-5">
      <header className="border-b pb-5 sm:pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-fd-muted-foreground">
          Asplitline Blog
        </p>
        <h1 className="mt-1.5 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
          把对话沉淀成长期可复用的知识。
        </h1>
        <p className="mt-1.5 text-sm leading-6 text-fd-muted-foreground">
          AI · Agent · 前端开发 · 工程实践
        </p>
      </header>

      <section id="latest-posts" className="scroll-mt-20 pt-4 pb-6 sm:pt-5">
        <div className="mb-2 flex items-center justify-between gap-3 sm:mb-3">
          <h2 className="text-base font-semibold sm:text-lg">
            最新文章 <span className="ml-1 text-sm font-normal text-fd-muted-foreground">({posts.length})</span>
          </h2>
          <Link href="/categories" className="text-xs text-fd-muted-foreground hover:text-fd-foreground">
            按分类浏览 →
          </Link>
        </div>
        <div className="divide-y rounded-xl border">
          {posts.map((post) => (
            <ArticleCard key={post.url} post={post} compact />
          ))}
        </div>
      </section>
    </main>
  );
}
