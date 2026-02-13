'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { ANIMATION_CONFIG } from '@/lib/animations/config';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { useReducedMotion } from '@/hooks';


const footerLinks = {
  quickLinks: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Work', href: '/work' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  services: [
    { label: 'Custom Software', href: '/services/custom-software-development' },
    { label: 'Mobile Apps', href: '/services/mobile-app-development' },
    { label: 'Event Management', href: '/services/event-registration-management' },
    { label: 'Web Portals', href: '/services/enterprise-web-portals' },
    { label: 'Digital Marketing', href: '/services/digital-marketing-services' },
  ],
  social: [
    { label: 'LinkedIn', href: '#', icon: 'linkedin' },
    { label: 'Twitter', href: '#', icon: 'twitter' },
    { label: 'Instagram', href: '#', icon: 'instagram' },
    { label: 'Facebook', href: '#', icon: 'facebook' },
  ],
};

export function Footer() {
  const contentRef = useRef<HTMLDivElement>(null);
  const topBorderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useStaggeredScrollReveal(contentRef, {
    from: { opacity: 0, y: 20 },
    to: { opacity: 1, y: 0 },
    stagger: 0.1,
  });

  registerGSAPPlugins();

  // Top border scaleX 0 -> 1 on scroll enter
  useGSAP(
    () => {
      if (!topBorderRef.current || prefersReducedMotion) return;

      gsap.fromTo(
        topBorderRef.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: ANIMATION_CONFIG.duration.slow,
          ease: ANIMATION_CONFIG.ease.cinematic,
          scrollTrigger: {
            trigger: topBorderRef.current,
            start: ANIMATION_CONFIG.scrollTrigger.start,
            toggleActions: ANIMATION_CONFIG.scrollTrigger.toggleActions,
            once: true,
          },
        }
      );
    },
    { dependencies: [prefersReducedMotion] }
  );

  // Newsletter input border pulse on scroll entry
  useGSAP(
    () => {
      if (!inputRef.current || prefersReducedMotion) return;

      gsap.fromTo(
        inputRef.current,
        { borderColor: 'var(--color-border)' },
        {
          borderColor: 'var(--color-accent-primary)',
          duration: 0.6,
          ease: ANIMATION_CONFIG.ease.smooth,
          yoyo: true,
          repeat: 1,
          scrollTrigger: {
            trigger: inputRef.current,
            start: ANIMATION_CONFIG.scrollTrigger.start,
            once: true,
          },
        }
      );
    },
    { dependencies: [prefersReducedMotion] }
  );

  return (
    <footer className="relative bg-[var(--color-bg-primary)]">
      {/* Animated top border */}
      <div
        ref={topBorderRef}
        className="h-px w-full origin-left bg-[var(--color-border)]"
        style={{ transform: prefersReducedMotion ? undefined : 'scaleX(0)' }}
      />

      <div
        ref={contentRef}
        className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-16 lg:py-24"
      >
        {/* Top Section */}
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link
              href="/"
              className="inline-block font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-[var(--color-text-primary)]"
            >
              Kaizen<span className="text-[var(--color-accent-primary)]">.</span>
            </Link>
            <p className="mt-4 max-w-sm text-[length:var(--text-sm)] leading-relaxed text-[var(--color-text-secondary)]">
              Kaizen Infotech Solutions Pvt. Ltd. delivers custom software, mobile apps, event
              management systems, and digital marketing solutions that help organizations
              operate smarter and scale faster.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="mb-4 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)] transition-colors duration-300 hover:text-[var(--color-text-primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h3 className="mb-4 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
              Services
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[length:var(--text-sm)] text-[var(--color-text-secondary)] transition-colors duration-300 hover:text-[var(--color-text-primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Contact */}
          <div className="lg:col-span-3">
            <h3 className="mb-4 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-[var(--color-text-primary)]">
              Stay Updated
            </h3>
            <p className="mb-4 text-[length:var(--text-sm)] text-[var(--color-text-secondary)]">
              Subscribe to our newsletter for insights and updates.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] transition-all duration-300 focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]/30"
                aria-label="Email for newsletter"
              />
              <button
                type="submit"
                className="flex-shrink-0 rounded-lg bg-[var(--color-accent-primary)] px-4 py-2.5 text-sm font-medium text-[var(--color-text-inverse)] transition-all duration-300 hover:brightness-110"
                aria-label="Subscribe to newsletter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </form>

            <div className="mt-6 space-y-2 text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]">
              <p>info@kaizeninfotech.com</p>
              <p>+91 98200 00000</p>
              <p>Mumbai, Maharashtra, India</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 md:flex-row">
          <p className="text-[length:var(--text-xs)] text-[var(--color-text-tertiary)]">
            &copy; {new Date().getFullYear()} Kaizen Infotech Solutions. All rights reserved.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {footerLinks.social.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-text-secondary)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-110 hover:border-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary)]"
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
              >
                <SocialIcon name={social.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    linkedin: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    twitter: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    instagram: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    facebook: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  };

  return <>{icons[name] || null}</>;
}
