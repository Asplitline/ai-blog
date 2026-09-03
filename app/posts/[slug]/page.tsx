import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { InlineTOC } from 'fumadocs-ui/components/inline-toc';
import { blog } from '@/lib/source';
import { getMDXComponents } from '@/components/mdx';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = blog.getPage([slug]);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export function generateStaticParams(): { slug: string }[] {
  return blog.getPages().map((page) => ({
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
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12 md:py-16">
      <Link href="/" className="text-sm text-fd-muted-foreground hover:text-fd-foreground">
        ← 返回首页
      </Link>

      <header className="mt-10 border-b pb-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-fd-muted-foreground">
          <time dateTime={page.data.date}>{page.data.date}</time>
          {page.data.tags.map((tag) => (
            <span key={tag} className="rounded-full border px-2 py-0.5 text-xs">
              {tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{page.data.title}</h1>
        {page.data.description ? (
          <p className="mt-5 text-lg leading-8 text-fd-muted-foreground">{page.data.description}</p>
        ) : null}
      </header>

      <article className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
        <InlineTOC items={page.data.toc} />
        <MDX components={getMDXComponents()} />
      </article>
    </main>
  );
}
