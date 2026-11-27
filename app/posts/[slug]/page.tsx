import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/notebook/page';
import { ArticleMeta } from '@/components/blog/article-meta';
import { ArticleNavigation } from '@/components/blog/article-navigation';
import { ReadingAnnotations } from '@/components/blog/reading-annotations';
import { ZenReadingToggle } from '@/components/blog/zen-reading-toggle';
import { getMDXComponents } from '@/components/mdx';
import { getPublishedPosts } from '@/lib/posts';
import { blog } from '@/lib/source';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = blog.getPage([slug]);

  if (!page || page.data.draft) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export function generateStaticParams(): { slug: string }[] {
  return getPublishedPosts().map((page) => ({
    slug: page.slugs[0],
  }));
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = blog.getPage([slug]);

  if (!page || page.data.draft) notFound();

  const MDX = page.data.body;
  const posts = getPublishedPosts().map((post) => ({
    title: post.data.title,
    url: post.url,
  }));

  return (
    <DocsPage toc={page.data.toc}>
      <div className="zen-reading-article">
        <ZenReadingToggle key={slug} />
        <div className="zen-reading-secondary">
          <ArticleNavigation posts={posts} currentUrl={page.url} />
        </div>
        <ArticleMeta
          date={page.data.date}
          category={page.data.category}
          tags={page.data.tags}
        />
        <DocsTitle>{page.data.title}</DocsTitle>
        {page.data.description ? (
          <DocsDescription>{page.data.description}</DocsDescription>
        ) : null}
        <ReadingAnnotations key={slug} slug={slug} title={page.data.title}>
          <DocsBody>
            <MDX components={getMDXComponents()} />
          </DocsBody>
        </ReadingAnnotations>
      </div>
    </DocsPage>
  );
}
