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
          <Link href="/" className="relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src="/images/logos/kaizen-logo.png"
                alt="Kaizen Infotech Solutions"
                width={120}
                height={36}
                className="h-7 w-auto sm:h-9"
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
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative z-10 flex h-11 w-11 flex-col items-center justify-center gap-1.5 lg:hidden"
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
                      'block font-[family-name:var(--font-heading)] text-4xl font-medium transition-colors duration-300',
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
          'group relative py-1 font-[family-name:var(--font-body)] text-sm tracking-wide transition-colors duration-300',
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
