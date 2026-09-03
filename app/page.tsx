import Link from 'next/link';
import { blog } from '@/lib/source';

export default function HomePage() {
  const posts = blog
    .getPages()
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.date.localeCompare(a.data.date));

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16 md:py-24">
      <section className="mb-14 max-w-3xl">
        <p className="mb-3 text-sm font-medium text-fd-muted-foreground">Asplitline Blog</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">把对话沉淀成长期可复用的知识。</h1>
        <p className="mt-5 text-lg leading-8 text-fd-muted-foreground">
          记录 AI、Agent、前端开发与工程实践中的问题、原理和解决方案。
        </p>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">最新文章</h2>
            <p className="mt-1 text-sm text-fd-muted-foreground">从 ChatGPT 技术讨论中整理出的可复用笔记。</p>
          </div>
        </div>

        <div className="grid gap-4">
          {posts.map((post) => (
            <Link
              key={post.url}
              href={post.url}
              className="group rounded-2xl border bg-fd-card p-6 transition-colors hover:bg-fd-accent/50"
            >
              <div className="flex flex-wrap items-center gap-2 text-sm text-fd-muted-foreground">
                <time dateTime={post.data.date}>{post.data.date}</time>
                {post.data.tags.map((tag) => (
                  <span key={tag} className="rounded-full border px-2 py-0.5 text-xs">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="mt-3 text-xl font-semibold group-hover:underline">{post.data.title}</h3>
              {post.data.description ? (
                <p className="mt-2 leading-7 text-fd-muted-foreground">{post.data.description}</p>
              ) : null}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
