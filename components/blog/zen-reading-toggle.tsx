'use client';

import { useEffect, useState } from 'react';

export function ZenReadingToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setEnabled(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      delete document.documentElement.dataset.zenReading;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.zenReading = enabled ? 'true' : 'false';
  }, [enabled]);

  return (
    <div className="zen-reading-controls">
      <button
        type="button"
        aria-pressed={enabled}
        title={enabled ? '退出专注阅读（Esc）' : '进入专注阅读'}
        onClick={() => setEnabled((previous) => !previous)}
        className="inline-flex items-center gap-2 rounded-full border bg-fd-background px-3 py-1.5 text-xs font-medium text-fd-foreground shadow-sm transition-colors hover:bg-fd-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
      >
        <span aria-hidden="true">{enabled ? '↙' : '⛶'}</span>
        {enabled ? '退出 Zen · Esc' : 'Zen 阅读'}
      </button>
    </div>
  );
}
