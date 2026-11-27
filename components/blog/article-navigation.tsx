'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export type NavigationPost = {
  title: string;
  url: string;
  date?: string;
  category?: string;
};

export function ArticleNavigation({ posts, currentUrl }: {
  posts: NavigationPost[];
  currentUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLElement>(null);
  const filtered = posts.filter(post => (post.title + ' ' + (post.category ?? '')).toLowerCase().includes(query.trim().toLowerCase()));

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' });
    search.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
      }
      if (event.key === 'Tab' && panel.current) {
        const items = Array.from(panel.current.querySelectorAll<HTMLElement>('button, input, a[href]'));
        const first = items[0], last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open]);

  function close() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <button ref={trigger} type="button" onClick={() => { setQuery(''); setOpen(true); }}
        aria-expanded={open} aria-controls="article-navigation-panel" className="reading-nav-button" title="打开文章导航">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M13 9h4m-4 4h4"/></svg>
        <span>文章列表</span>
      </button>
      {open && (
        <div className="article-nav-overlay" onMouseDown={close}>
          <nav ref={panel} id="article-navigation-panel" role="dialog" aria-modal="true" aria-label="文章导航" className="article-nav-drawer" onMouseDown={event => event.stopPropagation()}>
            <header className="article-nav-header">
              <div><h2>文章导航</h2><p>知识库 · {posts.length} 篇文章</p></div>
              <button type="button" onClick={close} aria-label="关闭文章导航" className="reading-nav-button">✕</button>
            </header>
            <div className="article-nav-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg>
              <input ref={search} value={query} onChange={event => setQuery(event.target.value)} placeholder="筛选文章…" aria-label="筛选文章"/>
              {query && <button type="button" onClick={() => setQuery('')} aria-label="清除搜索">×</button>}
            </div>
            <div className="article-nav-list">
              <div className="article-nav-section">{query ? '搜索结果' : '最近更新'} <span>{filtered.length}</span></div>
              {!filtered.length && <p className="article-nav-empty">没有匹配的文章</p>}
              {filtered.map(post => (
                <Link key={post.url} href={post.url} aria-current={post.url === currentUrl ? 'page' : undefined} onClick={close} className="article-nav-item">
                  <span className="article-nav-title">{post.title}</span>
                  {(post.date || post.category) && <span className="article-nav-meta">{[post.date, post.category].filter(Boolean).join(' · ')}</span>}
                </Link>
              ))}
            </div>
            <footer className="article-nav-footer"><span>按发布时间排序</span><kbd className="reading-key">Esc</kbd></footer>
          </nav>
        </div>
      )}
    </>
  );
}
