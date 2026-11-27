'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export type NavigationPost = {
  title: string;
  url: string;
};

export function ArticleNavigation({ posts, currentUrl }: {
  posts: NavigationPost[];
  currentUrl: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-controls="article-navigation-panel"
        className="mb-3 inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-foreground"
      >
        <span aria-hidden="true">☰</span>
        文章列表
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex bg-black/40" role="presentation" onMouseDown={() => setOpen(false)}>
          <nav
            id="article-navigation-panel"
            aria-label="全部文章"
            className="flex h-full w-[min(90vw,360px)] flex-col border-r bg-fd-background shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="font-semibold">全部文章</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="关闭文章列表" className="rounded-md px-2 py-1 text-fd-muted-foreground hover:bg-fd-accent">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {posts.map((post) => (
                <Link
                  key={post.url}
                  href={post.url}
                  aria-current={post.url === currentUrl ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-2 text-sm leading-5 hover:bg-fd-accent ${post.url === currentUrl ? 'bg-fd-accent font-medium' : 'text-fd-muted-foreground'}`}
                >
                  {post.title}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}
