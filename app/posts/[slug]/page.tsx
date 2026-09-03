import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/notebook/page';
import { ArticleMeta } from '@/components/blog/article-meta';
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

  return (
    <DocsPage toc={page.data.toc}>
      <ArticleMeta
        date={page.data.date}
        category={page.data.category}
        tags={page.data.tags}
      />
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description ? (
        <DocsDescription>{page.data.description}</DocsDescription>
      ) : null}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
}
