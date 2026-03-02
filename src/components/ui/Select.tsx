'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
}

// ---------------------------------------------------------------------------
// Animation config
// ---------------------------------------------------------------------------

const spring = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

const dropdownVariants = {
  hidden: {
    opacity: 0,
    scaleY: 0.9,
    scaleX: 0.98,
    transition: { duration: 0.15, ease: [0.16, 1, 0.3, 1] },
  },
  visible: {
    opacity: 1,
    scaleY: 1,
    scaleX: 1,
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
  },
};

const shakeVariants = {
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.5, ease: 'easeInOut' },
  },
  idle: { x: 0 },
};

// ---------------------------------------------------------------------------
// Select component
// ---------------------------------------------------------------------------

export function Select({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = 'Select an option',
  className,
}: SelectProps) {
  const autoId = useId();
  const triggerId = `${autoId}-trigger`;
  const listboxId = `${autoId}-listbox`;
  const errorId = `${autoId}-error`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const hasValue = !!selectedOption;
  const isFloating = isOpen || hasValue;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('[role="option"]');
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen]);

  function toggleOpen() {
    setIsOpen((prev) => {
      if (!prev) {
        const idx = options.findIndex((opt) => opt.value === value);
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
      return !prev;
    });
  }

  function selectOption(opt: SelectOption) {
    onChange?.(opt.value);
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          selectOption(options[highlightedIndex]);
        } else {
          toggleOpen();
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          toggleOpen();
        } else {
          setHighlightedIndex((prev) =>
            prev < options.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          toggleOpen();
        } else {
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : options.length - 1
          );
        }
        break;

      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;

      case 'Tab':
        setIsOpen(false);
        break;
    }
  }

  // Border color
  const borderColor = error
    ? 'var(--color-accent-warm)'
    : isOpen
      ? 'var(--color-accent-primary)'
      : 'var(--color-border)';

  const glowColor = error
    ? 'rgba(192, 0, 0, 0.15)'
    : 'rgba(33, 150, 243, 0.1)';

  return (
    <motion.div
      ref={containerRef}
      className={cn('relative w-full', className)}
      variants={shakeVariants}
      animate={error ? 'shake' : 'idle'}
    >
      {/* Floating label */}
      <motion.span
        className={cn(
          'pointer-events-none absolute left-0 origin-left',
          'font-[family-name:var(--font-body)]',
          error
            ? 'text-[var(--color-accent-warm)]'
            : isFloating
              ? 'text-[var(--color-text-secondary)]'
              : 'text-[var(--color-text-tertiary)]'
        )}
        animate={{
          y: isFloating ? -22 : 0,
          scale: isFloating ? 0.75 : 1,
          opacity: isFloating ? 1 : 0.7,
        }}
        transition={spring}
        style={{ top: '50%', translateY: '-50%' }}
      >
        {label}
      </motion.span>

      {/* Trigger button */}
      <button
        id={triggerId}
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          'flex w-full cursor-pointer items-center justify-between bg-transparent pb-2 pt-4',
          'text-[length:var(--text-base)] text-left outline-none',
          'font-[family-name:var(--font-body)]',
          'border-b-2 border-transparent',
          'focus-visible:ring-0'
        )}
        style={{ borderBottomColor: borderColor, transition: 'border-color 0.3s' }}
        onClick={toggleOpen}
        onKeyDown={handleKeyDown}
      >
        <span
          className={cn(
            hasValue
              ? 'text-[var(--color-text-primary)]'
              : 'text-transparent'
          )}
        >
          {selectedOption?.label ?? placeholder}
        </span>

        {/* Chevron */}
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 text-[var(--color-text-tertiary)]"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={spring}
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </button>

      {/* Focus glow */}
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
        animate={{
          boxShadow: isOpen
            ? `0 2px 20px 4px ${glowColor}`
            : '0 0 0 0 transparent',
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={triggerId}
            className={cn(
              'absolute left-0 right-0 top-full z-[var(--z-overlay)]',
              'mt-2 max-h-60 overflow-auto rounded-[var(--radius-md)]',
              'border border-[var(--color-border)] bg-[var(--color-bg-secondary)]',
              'shadow-[var(--shadow-lg)] origin-top'
            )}
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isHighlighted = index === highlightedIndex;
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'flex cursor-pointer items-center justify-between px-4 py-2.5',
                    'text-[length:var(--text-sm)] font-[family-name:var(--font-body)]',
                    'transition-colors duration-150',
                    isHighlighted
                      ? 'bg-[var(--color-surface-glass)] text-[var(--color-text-primary)]'
                      : 'text-[var(--color-text-secondary)]',
                    isSelected && 'text-[var(--color-accent-primary)]'
                  )}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectOption(option);
                  }}
                >
                  {option.label}

                  {/* Selected checkmark */}
                  {isSelected && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="shrink-0"
                    >
                      <path
                        d="M2.5 7.5L5.5 10.5L11.5 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            className="mt-1.5 text-[length:var(--text-xs)] text-[var(--color-accent-warm)]"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
