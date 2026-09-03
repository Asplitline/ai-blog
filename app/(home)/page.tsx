import Link from 'next/link';
import { ArticleCard } from '@/components/blog/article-card';
import { TaxonomyList } from '@/components/blog/taxonomy-list';
import { getCategories, getPublishedPosts, getTags } from '@/lib/posts';

export default function HomePage() {
  const posts = getPublishedPosts();
  const categories = getCategories();
  const tags = getTags();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-14 md:py-20">
      <section className="max-w-3xl py-8 md:py-12">
        <p className="text-sm font-medium text-fd-muted-foreground">Asplitline Blog</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
          把对话沉淀成长期可复用的知识。
        </h1>
        <p className="mt-6 text-lg leading-8 text-fd-muted-foreground">
          记录 AI、Agent、前端开发与工程实践中的问题、原理和解决方案。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="#latest-posts"
            className="rounded-full bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground"
          >
            浏览文章
          </Link>
          <Link
            href="/categories"
            className="rounded-full border px-4 py-2 text-sm font-medium hover:bg-fd-accent"
          >
            查看分类
          </Link>
        </div>
      </section>

      <section className="border-t py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">分类</h2>
            <p className="mt-1 text-sm text-fd-muted-foreground">按主题域浏览长期积累的内容。</p>
          </div>
          <Link href="/categories" className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
            全部分类 →
          </Link>
        </div>
        <TaxonomyList items={categories} basePath="/categories" />
      </section>

      <section id="latest-posts" className="border-t py-10 scroll-mt-20">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">最新文章</h2>
          <p className="mt-1 text-sm text-fd-muted-foreground">从日常技术讨论中整理出的可复用笔记。</p>
        </div>
        <div className="grid gap-4">
          {posts.map((post) => (
            <ArticleCard key={post.url} post={post} />
          ))}
        </div>
      </section>

      <section className="border-t py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">热门标签</h2>
            <p className="mt-1 text-sm text-fd-muted-foreground">跨分类查看具体技术、工具和概念。</p>
          </div>
          <Link href="/tags" className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
            全部标签 →
          </Link>
        </div>
        <TaxonomyList items={tags.slice(0, 12)} basePath="/tags" />
      </section>
    </main>
  );
}
