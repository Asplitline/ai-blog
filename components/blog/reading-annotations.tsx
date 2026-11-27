'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
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
  const draftRange = useRef<Range | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [feedback, setFeedback] = useState<{ id?: string; text: string } | null>(null);
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [position, setPosition] = useState({ left: 12, top: 12 });
  const [above, setAbove] = useState(false);
  const [emphasis, setEmphasis] = useState<{ x: number; y: number; width: number; height: number }[]>([]);
  const ranges = useRef<Map<string, Range>>(new Map());
  const [notes, setNotes] = useState<Annotation[]>([]);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [panel, setPanel] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const editing = editor !== null;
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
    if (typeof Highlight !== 'undefined' && typeof CSS !== 'undefined' && CSS.highlights) {
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
    draftRange.current = null;
    setEditor(null);
    setActiveId(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    if (!ready || editor) return;
    let timer: ReturnType<typeof setTimeout>;
    let pointerDown = false;
    function inspect() {
      if (pointerDown) return;
      const selection = window.getSelection();
      const element = root.current;
      if (!element || !selection || selection.isCollapsed || !selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      const anchor = capture(element, range);
      if (!anchor) return;
      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      draftRange.current = range.cloneRange();
      setHover(null);
      setEditor({ anchor, content: '', x: rect.left + rect.width / 2, y: rect.bottom });
    }
    function schedule() {
      clearTimeout(timer);
      timer = setTimeout(inspect, 350);
    }
    function startPointer() { pointerDown = true; clearTimeout(timer); }
    function endPointer() { pointerDown = false; schedule(); }
    document.addEventListener('selectionchange', schedule);
    document.addEventListener('pointerdown', startPointer);
    document.addEventListener('pointerup', endPointer);
    document.addEventListener('pointercancel', endPointer);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('selectionchange', schedule);
      document.removeEventListener('pointerdown', startPointer);
      document.removeEventListener('pointerup', endPointer);
      document.removeEventListener('pointercancel', endPointer);
    };
  }, [ready, editor]);

  // Keep the selected source visibly highlighted even after textarea focus.
  useLayoutEffect(() => {
    const range = editor ? (draftRange.current ?? (editor.id ? ranges.current.get(editor.id) : null)) :
      (activeId ? ranges.current.get(activeId) : hover ? ranges.current.get(hover.id) : null);
    const name = editor || activeId ? 'reading-annotation-active' : 'reading-annotation-hover';
    const redraw = () => {
      if (typeof Highlight !== 'undefined' && CSS.highlights) {
        CSS.highlights.delete('reading-annotation-active');
        CSS.highlights.delete('reading-annotation-hover');
        if (range) {
          const highlight = new Highlight(range);
          highlight.priority = 10;
          CSS.highlights.set(name, highlight);
        }
        setEmphasis([]);
      } else {
        setEmphasis(range ? Array.from(range.getClientRects()).filter(rect => rect.width && rect.height).map(rect => ({
          x: rect.left, y: rect.top, width: rect.width, height: rect.height,
        })) : []);
      }
    };
    redraw();
    window.addEventListener('scroll', redraw, true);
    window.addEventListener('resize', redraw);
    return () => {
      if (typeof Highlight !== 'undefined' && CSS.highlights) {
        CSS.highlights.delete('reading-annotation-active');
        CSS.highlights.delete('reading-annotation-hover');
      }
      window.removeEventListener('scroll', redraw, true);
      window.removeEventListener('resize', redraw);
    };
  }, [editor?.id, editing, activeId, hover?.id, notes]);

  useLayoutEffect(() => {
    if (!editing || !popup.current) return;
    const place = () => {
      const element = popup.current;
      if (!element) return;
      const rect = (draftRange.current ?? (editor?.id ? ranges.current.get(editor.id) : null))?.getBoundingClientRect();
      const x = rect ? rect.left + rect.width / 2 : editor?.x ?? window.innerWidth / 2;
      const bottom = rect?.bottom ?? editor?.y ?? 80;
      const top = rect?.top ?? bottom;
      const height = element.offsetHeight;
      const width = element.offsetWidth;
      const preferAbove = bottom + height + 20 > window.innerHeight && top - height - 12 >= 12;
      setAbove(preferAbove);
      setPosition({
        left: Math.max(12, Math.min(x - width / 2, window.innerWidth - width - 12)),
        top: Math.max(12, Math.min(preferAbove ? top - height - 12 : bottom + 12, window.innerHeight - height - 12)),
      });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(popup.current);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => { observer.disconnect(); window.removeEventListener('resize', place); window.removeEventListener('scroll', place, true); };
  }, [editing, editor?.id]);

  useEffect(() => () => { if (feedbackTimer.current) clearTimeout(feedbackTimer.current); }, []);

  useEffect(() => {
    if (!panel || editing) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); setPanel(false); }
    };
    document.addEventListener('keydown', close, true);
    return () => document.removeEventListener('keydown', close, true);
  }, [panel, editing]);

  function notify(text: string, id?: string) {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setFeedback({ text, id });
    setActiveId(id ?? null);
    feedbackTimer.current = setTimeout(() => { setFeedback(null); setActiveId(null); }, 1800);
  }

  function hit(x: number, y: number) {
    return current.find(note => Array.from(ranges.current.get(note.id)?.getClientRects() ?? []).some(rect =>
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom));
  }

  useEffect(() => {
    if (!editing) return;
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
  }, [editing, dismiss]);

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
    })) { dismiss(); notify(editor.content.trim() ? '批注已保存' : '划线已保存', id); }
  }

  function edit(note: Annotation) {
    draftRange.current = ranges.current.get(note.id)?.cloneRange() ?? null;
    setHover(null);
    setPanel(false);
    const rect = ranges.current.get(note.id)?.getBoundingClientRect();
    setEditor({ id: note.id, anchor: note, content: note.content, x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2, y: rect?.bottom ?? 80 });
  }

  function goTo(note: Annotation) {
    const range = ranges.current.get(note.id);
    if (!range) return;
    const rect = range.getBoundingClientRect();
    setPanel(false);
    window.scrollBy({ top: rect.top - window.innerHeight / 3, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    notify('已定位原文', note.id);
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
      notify('已导出全部批注');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('导出失败，请检查浏览器存储。');
    }
  }

  return (
    <div className="reading-annotations">
      <div className="annotation-toolbar">
        <button type="button" aria-expanded={panel} onClick={() => setPanel(!panel)} className="annotation-button">
          <span aria-hidden="true">✎</span> 批注 <span className="annotation-count">{current.length}</span>{missing.length > 0 && <span className="annotation-dot" title="存在未定位批注" />}
        </button>
      </div>
      <div ref={root} className={hover && !editor ? 'annotation-source-hover' : undefined}
        onPointerMove={event => {
          if (editor || panel || event.pointerType !== 'mouse' || event.buttons) { setHover(null); return; }
          const found = hit(event.clientX, event.clientY);
          setHover(previous => found ? (previous?.id === found.id ? previous : { id: found.id, x: event.clientX, y: event.clientY }) : null);
        }}
        onPointerLeave={() => setHover(null)}
        onClick={event => {
        if (editor || !window.getSelection()?.isCollapsed || (event.target instanceof Element && event.target.closest('a, button, input, textarea, select'))) return;
        const found = hit(event.clientX, event.clientY);
        if (found) { event.preventDefault(); edit(found); }
      }}>{children}</div>
      {fallback.map((rect, i) => <span aria-hidden="true" key={i} className="annotation-fallback" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }} />)}
      {emphasis.map((rect, i) => <span key={i} aria-hidden="true" className="annotation-fallback annotation-emphasis" style={{ left: rect.x, top: rect.y, width: rect.width, height: rect.height }} />)}
      {hover && !editor && !panel && <div role="tooltip" className="annotation-tooltip" style={{ left: Math.max(12, Math.min(hover.x, window.innerWidth - 260)), top: Math.max(12, hover.y - 80) }}>
        <span>{current.find(note => note.id === hover.id)?.content || '已划线'}</span><small>点击编辑批注</small>
      </div>}
      {feedback && <div key={feedback.text + feedback.id} role="status" className="annotation-toast"><span aria-hidden="true">✓</span> {feedback.text}</div>}
      {error && <p role="alert" className="annotation-error">{error}</p>}
      {panel && (<>
        <button type="button" className="annotation-backdrop" aria-label="关闭批注面板" onClick={() => setPanel(false)} />
        <aside className="annotation-panel" aria-label="文章批注">
          <div className="annotation-panel-header">
            <div><strong>文章批注 <span className="annotation-count">{current.length}</span></strong><p>当前浏览器 · 自动保存</p></div>
            <button type="button" className="annotation-button" onClick={() => setPanel(false)} aria-label="关闭批注">×</button>
          </div>
          <div className="annotation-export">
            <button type="button" className="annotation-button" onClick={() => exportNotes('json')}>导出全部 JSON</button>
            <button type="button" className="annotation-button" onClick={() => exportNotes('md')}>导出 Markdown</button>
          </div>
          {missing.length > 0 && <p className="annotation-warning">{missing.length} 条批注的原文已变化，记录仍然保留。</p>}
          <div className="annotation-list">
            {!current.length && <p className="annotation-empty">选中文章中的文字，即可添加批注。记录仅保存在当前浏览器。</p>}
            {current.map(note => (
              <div key={note.id} className="annotation-item" data-active={activeId === note.id}>
                <button type="button" className="annotation-quote" disabled={missing.includes(note.id)} title="定位原文" onClick={() => goTo(note)}>{note.quote}</button>
                {note.content && <p className="annotation-content">{note.content}</p>}
                {missing.includes(note.id) && <p className="annotation-muted">原文已变更，暂时无法定位</p>}
                <div className="annotation-item-actions">
                  <time dateTime={note.updatedAt}>{new Date(note.updatedAt).toLocaleDateString('zh-CN')}</time>
                  <button type="button" disabled={missing.includes(note.id)} onClick={() => goTo(note)}>定位</button>
                  <button type="button" onClick={() => edit(note)}>编辑</button>
                  <button type="button" onClick={() => {
                    if (confirm('删除这条批注？') && persist(previous => previous.filter(n => n.id !== note.id))) {
                      if (editor?.id === note.id) dismiss();
                      notify('批注已删除');
                    }
                  }}>删除</button>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </>)}
      {editor && (
        <div ref={popup} className="annotation-popover" role="dialog" aria-label="编辑批注"
          data-above={above} style={position}>
          <div className="annotation-panel-header"><strong>{editor.id ? '编辑批注' : '添加批注'}</strong><button type="button" className="annotation-button" onClick={dismiss} aria-label="取消">×</button></div>
          <div className="annotation-preview"><div className="annotation-preview-label">已选原文 <span>{editor.anchor.quote.length} 字符</span></div><blockquote>{editor.anchor.quote}</blockquote></div>
          <textarea aria-label="批注内容（选填）" value={editor.content} onChange={event => setEditor({ ...editor, content: event.target.value })}
            placeholder="记录想法或问题（选填）…" rows={3}
            onKeyDown={event => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') { event.preventDefault(); save(); } }} />
          <div className="annotation-popover-actions"><span>留空即可划线 <small className="annotation-shortcut">⌘ / Ctrl + Enter</small></span><button type="button" className="annotation-button" onClick={dismiss}>取消</button><button type="button" className="annotation-primary" onClick={save}>{editor.content.trim() ? '保存批注' : '保存划线'}</button></div>
          {error && <p role="alert" className="annotation-error">{error}</p>}
        </div>
      )}
    </div>
  );
}
