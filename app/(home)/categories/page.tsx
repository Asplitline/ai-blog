import type { Metadata } from 'next';
import { TaxonomyList } from '@/components/blog/taxonomy-list';
import { getCategories } from '@/lib/posts';

export const metadata: Metadata = {
  title: '分类',
  description: '按主题域浏览 Asplitline Blog 的文章。',
};

export default function CategoriesPage() {
  const categories = getCategories();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-14 md:py-20">
      <header className="mb-10 max-w-3xl">
        <p className="text-sm font-medium text-fd-muted-foreground">Categories</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">分类</h1>
        <p className="mt-4 text-lg leading-8 text-fd-muted-foreground">
          每篇文章只有一个主分类，用来表示它最主要的主题域。
        </p>
      </header>
      <TaxonomyList items={categories} basePath="/categories" />
    </main>
  );
}
