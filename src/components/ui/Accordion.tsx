'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccordionItem {
  title: string;
  content: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------

const contentVariants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.2 },
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
      opacity: { duration: 0.3, delay: 0.1 },
    },
  },
} as const;

// ---------------------------------------------------------------------------
// Chevron icon
// ---------------------------------------------------------------------------

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <motion.svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0 text-[var(--color-text-tertiary)]"
      animate={{ rotate: isOpen ? 180 : 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

// ---------------------------------------------------------------------------
// Accordion
// ---------------------------------------------------------------------------

export function Accordion({
  items,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set());

  const toggle = useCallback(
    (index: number) => {
      setOpenIndices((prev) => {
        const next = new Set(prev);
        if (next.has(index)) {
          next.delete(index);
        } else {
          if (!allowMultiple) {
            next.clear();
          }
          next.add(index);
        }
        return next;
      });
    },
    [allowMultiple]
  );

  return (
    <div className={cn('w-full', className)}>
      {items.map((item, index) => {
        const isOpen = openIndices.has(index);
        return (
          <div
            key={index}
            className={cn(
              'border-b border-[var(--color-border)]',
              'transition-colors duration-300'
            )}
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggle(index);
                }
              }}
              aria-expanded={isOpen}
              className={cn(
                'flex w-full items-center justify-between gap-4',
                'py-5 text-left',
                'text-[var(--text-base)] font-medium font-[family-name:var(--font-heading)]',
                'text-[var(--color-text-primary)]',
                'outline-none cursor-pointer',
                'focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
                'focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)]',
                'rounded-[var(--radius-sm)]',
                'transition-colors duration-200'
              )}
            >
              <span className="flex items-center gap-3">
                {/* Accent left border indicator */}
                <span
                  className={cn(
                    'h-5 w-0.5 rounded-full transition-colors duration-300',
                    isOpen
                      ? 'bg-[var(--color-accent-primary)]'
                      : 'bg-transparent'
                  )}
                />
                {item.title}
              </span>
              <ChevronIcon isOpen={isOpen} />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={`content-${index}`}
                  variants={contentVariants}
                  initial="collapsed"
                  animate="expanded"
                  exit="collapsed"
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      'pb-5 pl-[calc(0.125rem+0.75rem+0.75rem)]',
                      'text-[var(--text-sm)] text-[var(--color-text-secondary)]',
                      'leading-relaxed'
                    )}
                  >
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
