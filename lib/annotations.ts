export const STORAGE_KEY = 'ai-blog:annotations:v1';

export interface Annotation {
  id: string;
  slug: string;
  title: string;
  url: string;
  quote: string;
  prefix: string;
  suffix: string;
  start: number;
  end: number;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export function readAnnotations(): Annotation[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error('Invalid annotations');
  return parsed as Annotation[];
}

export function textNodes(root: HTMLElement): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  return nodes;
}

export function capture(root: HTMLElement, range: Range) {
  if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
  const before = document.createRange();
  before.selectNodeContents(root);
  before.setEnd(range.startContainer, range.startOffset);
  const start = before.toString().length;
  const quote = range.toString();
  if (!quote.trim()) return null;
  const text = root.textContent ?? '';
  const end = start + quote.length;
  return { quote, start, end, prefix: text.slice(Math.max(0, start - 48), start), suffix: text.slice(end, end + 48) };
}

export function locate(root: HTMLElement, note: Annotation): Range | null {
  const nodes = textNodes(root);
  const text = nodes.map(n => n.data).join('');
  if (!note.quote) return null;
  const matches: { start: number; score: number }[] = [];
  for (let i = text.indexOf(note.quote); i >= 0; i = text.indexOf(note.quote, i + 1)) {
    const prefix = text.slice(Math.max(0, i - note.prefix.length), i);
    const suffix = text.slice(i + note.quote.length, i + note.quote.length + note.suffix.length);
    matches.push({ start: i, score: Number(prefix === note.prefix) + Number(suffix === note.suffix) });
  }
  matches.sort((a, b) => b.score - a.score);
  if (!matches.length) return null;
  const best = matches.filter(match => match.score === matches[0].score);
  // An unchanged offset plus matching surrounding text resolves repeated quotations.
  const chosen = best.length === 1 ? best[0] : best.find(match => match.start === note.start && match.score === 2);
  if (!chosen) return null;
  const start = chosen.start;
  const end = start + note.quote.length;
  const range = document.createRange();
  let offset = 0;
  let started = false;
  for (const node of nodes) {
    const next = offset + node.length;
    if (!started && start < next) {
      range.setStart(node, start - offset);
      started = true;
    }
    if (started && end <= next) {
      range.setEnd(node, end - offset);
      return range;
    }
    offset = next;
  }
  return null;
}
