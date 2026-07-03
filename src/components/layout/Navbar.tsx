'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';
import { NAV_LINKS } from '@/lib/utils/constants';
import { useLoaderStore } from '@/store/loaderStore';

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const loaderComplete = useLoaderStore((s) => s.isComplete);
  const isHomepage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setIsScrolled(currentScrollY > 50);
      setIsVisible(currentScrollY < lastScrollY.current || currentScrollY < 100);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change (React 19 derived state pattern)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsMenuOpen(false);
  }

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Focus trap: focus the first link on open; Tab/Shift+Tab wrap within the
  // menu; Escape closes and returns focus to the hamburger button.
  useEffect(() => {
    if (!isMenuOpen) return;
    const menu = menuRef.current;
    if (!menu) return;

    const getFocusable = () =>
      Array.from(menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'));

    getFocusable()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsMenuOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;
      // The hamburger lives outside the overlay but stays interactive; include
      // it in the cycle by treating it as the element before `first`.
      if (e.shiftKey) {
        if (active === first || !menu.contains(active)) {
          e.preventDefault();
          last.focus();
        }
      } else if (active === last || !menu.contains(active)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: isHomepage ? -100 : 0, opacity: isHomepage ? 0 : 1 }}
        animate={{
          y: isHomepage && !loaderComplete ? -100 : isVisible ? 0 : -100,
          opacity: isHomepage && !loaderComplete ? 0 : 1,
        }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed top-0 left-0 right-0 z-[var(--z-sticky)] transition-all duration-300',
          isScrolled
            ? 'bg-[var(--color-bg-primary)]/80 backdrop-blur-[var(--blur-md)] py-3'
            : 'bg-transparent py-5'
        )}
      >
        <nav className="mx-auto flex max-w-[var(--container-max)] items-center justify-between px-[var(--container-padding)]">
          {/* Logo */}
          <Link href="/" className="focus-ring relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/images/logos/kaizen-logo.svg"
                alt="Kaizen Infotech Solutions"
                width={602}
                height={376}
                // `h-*!` overrides the global `img { height: auto }` reset (globals.css),
                // which is unlayered and would otherwise collapse this SVG logo to 0.
                // 2× the prior size (was h-7 / sm:h-9).
                className="h-14! w-auto sm:h-18!"
                priority
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((link, i) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={pathname === link.href}
                index={i}
              />
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            ref={toggleRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="focus-ring relative z-10 flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
          >
            <motion.span
              animate={{
                rotate: isMenuOpen ? 45 : 0,
                y: isMenuOpen ? 6 : 0,
              }}
              className="h-[2px] w-6 bg-[var(--color-text-primary)]"
            />
            <motion.span
              animate={{ opacity: isMenuOpen ? 0 : 1 }}
              className="h-[2px] w-6 bg-[var(--color-text-primary)]"
            />
            <motion.span
              animate={{
                rotate: isMenuOpen ? -45 : 0,
                y: isMenuOpen ? -6 : 0,
              }}
              className="h-[2px] w-6 bg-[var(--color-text-primary)]"
            />
          </button>
        </nav>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            ref={menuRef}
            className="fixed inset-0 z-[calc(var(--z-sticky)-1)] bg-[var(--color-bg-primary)]"
          >
            <div className="flex h-full flex-col items-center justify-center gap-8">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.5,
                    delay: i * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      'focus-ring block font-[family-name:var(--font-heading)] text-4xl font-medium transition-colors duration-300',
                      pathname === link.href
                        ? 'text-[var(--color-accent-primary)]'
                        : 'text-[var(--color-text-primary)] hover:text-[var(--color-accent-primary)]'
                    )}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({
  href,
  label,
  isActive,
  index,
}: {
  href: string;
  label: string;
  isActive: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link
        href={href}
        className={cn(
          'focus-ring group relative py-1 font-[family-name:var(--font-body)] text-sm tracking-wide transition-colors duration-300',
          isActive
            ? 'text-[var(--color-accent-primary)]'
            : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
        )}
      >
        {label}
        <span
          className={cn(
            'absolute bottom-0 left-0 h-[1.5px] bg-[var(--color-accent-primary)] transition-all duration-300 ease-[var(--ease-out-expo)]',
            isActive ? 'w-full' : 'w-0 group-hover:w-full'
          )}
        />
      </Link>
    </motion.div>
  );
}
