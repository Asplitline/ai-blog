import type { Metadata } from 'next';
import { TaxonomyList } from '@/components/blog/taxonomy-list';
import { getTags } from '@/lib/posts';

export const metadata: Metadata = {
  title: '标签',
  description: '按技术、工具和概念浏览 Asplitline Blog 的文章。',
};

export default function TagsPage() {
  const tags = getTags();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-14 md:py-20">
      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-medium text-fd-muted-foreground">Tags</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">标签</h1>
        <p className="mt-4 text-lg leading-8 text-fd-muted-foreground">
          标签可以跨越主分类，用来描述具体技术、工具和概念。
        </p>
      </header>
      <TaxonomyList items={tags} basePath="/tags" />
    </main>
  );
}
