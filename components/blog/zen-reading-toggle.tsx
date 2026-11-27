'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type ReadingAnchor = { element: Element; top: number } | null;

export function ZenReadingToggle() {
  const [enabled, setEnabled] = useState(false);
  const anchor = useRef<ReadingAnchor>(null);
  const progress = useRef<HTMLSpanElement>(null);

  function toggle(next: boolean) {
    const blocks = document.querySelectorAll(
      '.zen-reading-article :is(h1,h2,h3,h4,p,li,pre,table,blockquote)',
    );
    const visible = Array.from(blocks).find((element) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > 100 && rect.top < window.innerHeight;
    });
    anchor.current = window.scrollY > 80 && visible
      ? { element: visible, top: visible.getBoundingClientRect().top }
      : null;
    setEnabled(next);
  }

  useLayoutEffect(() => {
    document.documentElement.dataset.zenReading = String(enabled);
    if (anchor.current?.element.isConnected) {
      const { element, top } = anchor.current;
      window.scrollBy({ top: element.getBoundingClientRect().top - top, behavior: 'instant' });
    }
    anchor.current = null;
  }, [enabled]);

  useEffect(() => () => {
    delete document.documentElement.dataset.zenReading;
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') toggle(false);
    };
    const updateProgress = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = total > 0 ? Math.min(1, Math.max(0, window.scrollY / total)) : 1;
      if (progress.current) progress.current.style.transform = `scaleX(${ratio})`;
    };
    const observer = new ResizeObserver(updateProgress);
    observer.observe(document.body);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, [enabled]);

  return (
    <div className="zen-reading-controls">
      <div className="zen-reading-progress" aria-hidden="true">
        <span ref={progress} style={{ transform: 'scaleX(0)' }} />
      </div>
      <button
        type="button"
        aria-pressed={enabled}
        title={enabled ? '退出专注阅读（Esc）' : '进入专注阅读'}
        onClick={() => toggle(!enabled)}
        className="inline-flex items-center gap-2 rounded-full border bg-fd-background px-3 py-1.5 text-xs font-medium text-fd-foreground shadow-sm transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
      >
        <span aria-hidden="true">{enabled ? '↙' : '⛶'}</span>
        {enabled ? '退出 Zen · Esc' : 'Zen 阅读'}
      </button>
    </div>
  );
}
