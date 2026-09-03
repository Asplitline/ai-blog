import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArticleCard } from '@/components/blog/article-card';
import { getPostsByTag, getTags } from '@/lib/posts';

export function generateStaticParams() {
  return getTags().map((tag) => ({ slug: tag.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tag = getTags().find((item) => item.slug === slug);
  if (!tag) notFound();

  return {
    title: tag.name,
    description: `带有 ${tag.name} 标签的技术文章。`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tag = getTags().find((item) => item.slug === slug);
  if (!tag) notFound();

  const posts = getPostsByTag(slug);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-14 md:py-20">
      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-medium text-fd-muted-foreground">Tag</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{tag.name}</h1>
        <p className="mt-4 text-fd-muted-foreground">{tag.count} 篇文章</p>
      </header>

      <div className="grid gap-4">
        {posts.map((post) => (
          <ArticleCard key={post.url} post={post} />
        ))}
      </div>
    </main>
  );
}
