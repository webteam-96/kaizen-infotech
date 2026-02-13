import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RichTextProps {
  content: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// RichText — renders sanitised HTML with typography styles
// ---------------------------------------------------------------------------

export function RichText({ content, className }: RichTextProps) {
  return (
    <div
      className={cn(
        // Base typography
        'font-[family-name:var(--font-body)] text-[var(--text-base)] text-[var(--color-text-secondary)]',
        'leading-relaxed',

        // Headings
        '[&_h1]:text-[var(--text-3xl)] [&_h1]:font-[family-name:var(--font-heading)] [&_h1]:font-bold [&_h1]:text-[var(--color-text-primary)] [&_h1]:mt-12 [&_h1]:mb-4',
        '[&_h2]:text-[var(--text-2xl)] [&_h2]:font-[family-name:var(--font-heading)] [&_h2]:font-bold [&_h2]:text-[var(--color-text-primary)] [&_h2]:mt-10 [&_h2]:mb-3',
        '[&_h3]:text-[var(--text-xl)] [&_h3]:font-[family-name:var(--font-heading)] [&_h3]:font-semibold [&_h3]:text-[var(--color-text-primary)] [&_h3]:mt-8 [&_h3]:mb-3',

        // Paragraphs
        '[&_p]:mb-4 [&_p]:last:mb-0',

        // Links
        '[&_a]:text-[var(--color-accent-primary)] [&_a]:underline [&_a]:underline-offset-2',
        '[&_a:hover]:text-[var(--color-accent-secondary)]',

        // Lists
        '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4',
        '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4',
        '[&_li]:mb-1 [&_li]:text-[var(--color-text-secondary)]',

        // Blockquote / pull quote
        '[&_blockquote]:border-l-2 [&_blockquote]:border-[var(--color-accent-primary)]',
        '[&_blockquote]:pl-5 [&_blockquote]:my-6',
        '[&_blockquote]:text-[var(--text-lg)] [&_blockquote]:italic',
        '[&_blockquote]:text-[var(--color-text-primary)]',

        // Inline code
        '[&_code]:rounded-[var(--radius-sm)] [&_code]:bg-[var(--color-bg-tertiary)]',
        '[&_code]:px-1.5 [&_code]:py-0.5',
        '[&_code]:font-[family-name:var(--font-mono)] [&_code]:text-[var(--text-sm)]',
        '[&_code]:text-[var(--color-accent-primary)]',

        // Code blocks
        '[&_pre]:rounded-[var(--radius-md)] [&_pre]:bg-[var(--color-bg-tertiary)]',
        '[&_pre]:border [&_pre]:border-[var(--color-border)]',
        '[&_pre]:p-4 [&_pre]:my-6 [&_pre]:overflow-x-auto',
        '[&_pre_code]:bg-transparent [&_pre_code]:p-0',
        '[&_pre_code]:text-[var(--color-text-secondary)]',

        // Images
        '[&_img]:rounded-[var(--radius-lg)] [&_img]:my-6',

        // Horizontal rule
        '[&_hr]:border-[var(--color-border)] [&_hr]:my-8',

        // Strong/em
        '[&_strong]:font-semibold [&_strong]:text-[var(--color-text-primary)]',

        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
