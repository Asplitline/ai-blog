import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/blog/article-card';
import { getCategories, getPostsByCategory } from '@/lib/posts';

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategories().find((item) => item.slug === slug);
  if (!category) notFound();

  return {
    title: category.name,
    description: `${category.name} 分类下的技术文章。`,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategories().find((item) => item.slug === slug);
  if (!category) notFound();

  const posts = getPostsByCategory(slug);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-14 md:py-20">
      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-medium text-fd-muted-foreground">Category</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{category.name}</h1>
        <p className="mt-4 text-fd-muted-foreground">{category.count} 篇文章</p>
      </header>

      <div className="grid gap-4">
        {posts.map((post) => (
          <ArticleCard key={post.url} post={post} />
        ))}
      </div>
    </main>
  );
}
