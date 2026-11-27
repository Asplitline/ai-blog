'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { capture, locate, readAnnotations, STORAGE_KEY, type Annotation } from '@/lib/annotations';

type Editor = {
  id?: string;
  anchor: Pick<Annotation, 'quote' | 'prefix' | 'suffix' | 'start' | 'end'>;
  content: string;
  x: number;
  y: number;
};

export function ReadingAnnotations({ slug, title, children }: {
  slug: string;
  title: string;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const ranges = useRef<Map<string, Range>>(new Map());
  const [notes, setNotes] = useState<Annotation[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [panel, setPanel] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState<string[]>([]);
  const [fallback, setFallback] = useState<{ x: number; y: number; width: number; height: number }[]>([]);
  const current = notes.filter(note => note.slug === slug).sort((a, b) => a.start - b.start);

  useEffect(() => {
    function load() {
      try {
        setNotes(readAnnotations());
        setReady(true);
        setError('');
      } catch {
        setReady(false);
        setError('无法读取浏览器批注，请检查浏览器存储权限。');
      }
    }
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const map = new Map<string, Range>();
    const unresolved: string[] = [];
    for (const note of notes.filter(n => n.slug === slug)) {
      const range = locate(element, note);
      if (range) map.set(note.id, range);
      else unresolved.push(note.id);
    }
    ranges.current = map;
    setMissing(unresolved);
    if (typeof Highlight !== 'undefined' && CSS.highlights) {
      CSS.highlights.set('reading-annotations', new Highlight(...map.values()));
      setFallback([]);
      return () => { CSS.highlights.delete('reading-annotations'); };
    }
    const redraw = () => setFallback(Array.from(map.values()).flatMap(range =>
      Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0)
        .map(rect => ({ x: rect.left, y: rect.top, width: rect.width, height: rect.height }))
    ));
    redraw();
    const observer = new ResizeObserver(redraw);
    observer.observe(element);
    window.addEventListener('scroll', redraw, true);
    window.addEventListener('resize', redraw);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', redraw, true);
      window.removeEventListener('resize', redraw);
    };
  }, [notes, slug]);

  const dismiss = useCallback(() => {
    setEditor(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    if (!ready || editor) return;
    let timer: ReturnType<typeof setTimeout>;
    function inspect() {
      const selection = window.getSelection();
      const element = root.current;
      if (!element || !selection || selection.isCollapsed || !selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const anchor = capture(element, range);
      if (!anchor) return;
      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      setEditor({ anchor, content: '', x: rect.left + rect.width / 2, y: rect.bottom });
    }
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(inspect, 350);
    }
    document.addEventListener('selectionchange', schedule);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('selectionchange', schedule);
    };
  }, [ready, editor]);

  useEffect(() => {
    if (!editor) return;
    // Keep the native selection visible; focus the input only on desktop.
    if (window.matchMedia('(pointer: fine)').matches) popup.current?.querySelector('textarea')?.focus({ preventScroll: true });
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        dismiss();
      }
    }
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [Boolean(editor), dismiss]);

  function persist(change: (previous: Annotation[]) => Annotation[]) {
    try {
      const next = change(readAnnotations());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setNotes(next);
      setError('');
      return true;
    } catch {
      setError('保存失败，批注仍保留在编辑框中。请检查浏览器存储空间。');
      return false;
    }
  }

  function save() {
    if (!editor) return;
    const now = new Date().toISOString();
    const id = editor.id || crypto.randomUUID();
    if (persist(previous => {
      const original = previous.find(note => note.id === id);
      return [...previous.filter(note => note.id !== id), {
        ...editor.anchor, id, slug, title, url: location.origin + location.pathname,
        content: editor.content.trim(), createdAt: original?.createdAt ?? now, updatedAt: now,
      }];
    })) dismiss();
  }

  function edit(note: Annotation) {
    const rect = ranges.current.get(note.id)?.getBoundingClientRect();
    setEditor({ id: note.id, anchor: note, content: note.content, x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2, y: rect?.bottom ?? 80 });
  }

  function goTo(note: Annotation) {
    const range = ranges.current.get(note.id);
    if (!range) return;
    const rect = range.getBoundingClientRect();
    window.scrollBy({ top: rect.top - window.innerHeight / 3, behavior: 'smooth' });
  }

  function exportNotes(format: 'json' | 'md') {
    try {
      const all = readAnnotations();
      const data = format === 'json'
        ? JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), annotations: all }, null, 2)
        : all.map(note => ['## ' + note.title, note.url, '', '> ' + note.quote.replace(/\n/g, '\n> '), '', note.content || '（仅划线）', '', '---', ''].join('\n')).join('\n');
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ai-blog-annotations-' + new Date().toISOString().slice(0, 10) + '.' + format;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('导出失败，请检查浏览器存储。');
    }
  }

  return (
    <div className="reading-annotations">
      <div className="annotation-toolbar">
        <button type="button" aria-expanded={panel} onClick={() => setPanel(!panel)} className="annotation-button">
          批注 {current.length > 0 ? current.length : ''}
        </button>
      </div>
      <div ref={root} onClick={event => {
        if (editor || !window.getSelection()?.isCollapsed) return;
        const found = current.find(note => Array.from(ranges.current.get(note.id)?.getClientRects() ?? []).some(rect =>
          event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom));
        if (found) { event.preventDefault(); edit(found); }
      }}>{children}</div>
      {fallback.map((rect, i) => <span aria-hidden="true" key={i} className="annotation-fallback" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }} />)}
      {error && <p role="alert" className="annotation-error">{error}</p>}
      {panel && (
        <aside className="annotation-panel" aria-label="文章批注">
          <div className="annotation-panel-header">
            <div><strong>文章批注</strong><p>{current.length} 条 · 本地保存</p></div>
            <button type="button" className="annotation-button" onClick={() => setPanel(false)} aria-label="关闭批注">×</button>
          </div>
          <div className="annotation-export">
            <button type="button" className="annotation-button" onClick={() => exportNotes('json')}>导出全部 JSON</button>
            <button type="button" className="annotation-button" onClick={() => exportNotes('md')}>导出 Markdown</button>
          </div>
          <div className="annotation-list">
            {!current.length && <p className="annotation-empty">选中文章中的文字，即可添加批注。记录仅保存在当前浏览器。</p>}
            {current.map(note => (
              <div key={note.id} className="annotation-item">
                <button type="button" className="annotation-quote" onClick={() => goTo(note)}>{note.quote}</button>
                {note.content && <p className="annotation-content">{note.content}</p>}
                {missing.includes(note.id) && <p className="annotation-muted">原文已变更，暂时无法定位</p>}
                <div className="annotation-item-actions">
                  <button type="button" onClick={() => edit(note)}>编辑</button>
                  <button type="button" onClick={() => {
                    if (confirm('删除这条批注？') && persist(previous => previous.filter(n => n.id !== note.id))) {
                      if (editor?.id === note.id) dismiss();
                    }
                  }}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}
      {editor && (
        <div ref={popup} className="annotation-popover" role="dialog" aria-label="编辑批注"
          style={{ left: Math.max(12, Math.min(editor.x - 160, window.innerWidth - 332)), top: Math.max(12, Math.min(editor.y + 10, window.innerHeight - 244)) }}>
          <div className="annotation-panel-header"><strong>{editor.id ? '编辑批注' : '添加批注'}</strong><button type="button" className="annotation-button" onClick={dismiss} aria-label="取消">×</button></div>
          <textarea value={editor.content} onChange={event => setEditor({ ...editor, content: event.target.value })}
            placeholder="记录想法或问题（选填）…" rows={3}
            onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); save(); } }} />
          <div className="annotation-popover-actions"><span>留空即可划线</span><button type="button" className="annotation-button" onClick={dismiss}>取消</button><button type="button" className="annotation-primary" onClick={save}>保存</button></div>
          {error && <p role="alert" className="annotation-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
