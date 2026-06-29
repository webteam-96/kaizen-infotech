'use client';

import { useEffect, useRef } from 'react';
import {
  Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered,
  Link2, Table as TableIcon, Image as ImageIcon, Quote, Code2, Eraser, Pilcrow,
} from 'lucide-react';
import { fileToBlogImage } from '@/lib/blog/image';

// ---------------------------------------------------------------------------
// Lightweight rich-text editor: a toolbar over a contentEditable region that
// emits HTML. Uses document.execCommand — deprecated but universally supported
// and dependency-free, which suits an internal admin tool. Output is sanitised
// at render time (see sanitizeHtml) so the stored HTML need not be trusted.
// ---------------------------------------------------------------------------

interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
}

export function RichEditor({ value, onChange }: RichEditorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtml = useRef<string>('');

  // Sync external value in (e.g. loading an existing post) without clobbering
  // the caret while the user is typing.
  useEffect(() => {
    const el = ref.current;
    if (el && value !== lastHtml.current) {
      el.innerHTML = value;
      lastHtml.current = value;
    }
  }, [value]);

  const emit = () => {
    const el = ref.current;
    if (!el) return;
    lastHtml.current = el.innerHTML;
    onChange(el.innerHTML);
  };

  const exec = (command: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  const insertHtml = (html: string) => {
    ref.current?.focus();
    document.execCommand('insertHTML', false, html);
    emit();
  };

  const addLink = () => {
    const url = window.prompt('Link URL (https://…)');
    if (!url) return;
    exec('createLink', url);
  };

  const addTable = () => {
    const rows = Math.max(1, Math.min(20, Number(window.prompt('Rows (body)', '2')) || 2));
    const cols = Math.max(1, Math.min(10, Number(window.prompt('Columns', '2')) || 2));
    const head = `<tr>${Array.from({ length: cols }, (_, i) => `<th>Heading ${i + 1}</th>`).join('')}</tr>`;
    const body = Array.from({ length: rows }, () =>
      `<tr>${Array.from({ length: cols }, () => '<td>Cell</td>').join('')}</tr>`,
    ).join('');
    insertHtml(`<table><thead>${head}</thead><tbody>${body}</tbody></table><p><br/></p>`);
  };

  const addImageByUrl = () => {
    const url = window.prompt('Image URL (or paste a data URL)');
    if (!url) return;
    insertHtml(`<img src="${url}" alt="" /><p><br/></p>`);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const img = await fileToBlogImage(file, { maxW: 1280, quality: 0.8 });
    insertHtml(`<img src="${img.url}" alt="${img.alt ?? ''}" /><p><br/></p>`);
  };

  const Btn = ({
    onAction, title, children,
  }: { onAction: () => void; title: string; children: React.ReactNode }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      onMouseDown={(e) => e.preventDefault()} // keep selection
      onClick={onAction}
      className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]"
    >
      {children}
    </button>
  );

  const Divider = () => <span className="mx-1 h-6 w-px self-center bg-[var(--color-border)]" />;

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1.5">
        <Btn onAction={() => exec('formatBlock', '<p>')} title="Paragraph"><Pilcrow size={17} /></Btn>
        <Btn onAction={() => exec('formatBlock', '<h2>')} title="Heading 2"><Heading2 size={18} /></Btn>
        <Btn onAction={() => exec('formatBlock', '<h3>')} title="Heading 3"><Heading3 size={18} /></Btn>
        <Divider />
        <Btn onAction={() => exec('bold')} title="Bold"><Bold size={17} /></Btn>
        <Btn onAction={() => exec('italic')} title="Italic"><Italic size={17} /></Btn>
        <Btn onAction={() => exec('underline')} title="Underline"><Underline size={17} /></Btn>
        <Divider />
        <Btn onAction={() => exec('insertUnorderedList')} title="Bullet list"><List size={18} /></Btn>
        <Btn onAction={() => exec('insertOrderedList')} title="Numbered list"><ListOrdered size={18} /></Btn>
        <Btn onAction={() => exec('formatBlock', '<blockquote>')} title="Quote"><Quote size={17} /></Btn>
        <Btn onAction={() => exec('formatBlock', '<pre>')} title="Code block"><Code2 size={17} /></Btn>
        <Divider />
        <Btn onAction={addLink} title="Insert link"><Link2 size={17} /></Btn>
        <Btn onAction={addTable} title="Insert table"><TableIcon size={17} /></Btn>
        <Btn onAction={() => fileInputRef.current?.click()} title="Upload image"><ImageIcon size={17} /></Btn>
        <Btn onAction={addImageByUrl} title="Image by URL"><span className="text-[11px] font-bold">URL</span></Btn>
        <Divider />
        <Btn onAction={() => exec('removeFormat')} title="Clear formatting"><Eraser size={17} /></Btn>
      </div>

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        data-placeholder="Write the blog body here — use the toolbar for headings, lists, tables, and images…"
        className="rich-editor prose-custom min-h-[320px] max-w-none px-5 py-4 focus:outline-none"
        style={{ fontFamily: 'var(--font-body)' }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPickImage}
      />
    </div>
  );
}
