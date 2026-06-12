'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { SectionDivider } from '@/components/animation/SectionDivider';
import { ParallaxLayer } from '@/components/animation/ParallaxLayer';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { PageHero } from '@/components/sections/PageHero';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { socialLinks } from '@/content/navigation';
import { SITE_CONFIG } from '@/lib/utils/constants';

// ---------------------------------------------------------------------------
// Select options
// ---------------------------------------------------------------------------

const budgetOptions = [
  { value: 'under-5l', label: 'Under ₹5 Lakhs' },
  { value: '5l-15l', label: '₹5–15 Lakhs' },
  { value: '15l-50l', label: '₹15–50 Lakhs' },
  { value: '50l-plus', label: '₹50 Lakhs+' },
  { value: 'not-decided', label: 'Not decided yet - let\'s discuss' },
];

const projectTypeOptions = [
  { value: 'custom-software', label: 'Custom Software' },
  { value: 'mobile-app', label: 'Mobile App' },
  { value: 'event-management', label: 'Event Registration & Management' },
  { value: 'web-portal', label: 'Enterprise Web Portal' },
  { value: 'digital-marketing', label: 'Digital Marketing' },
  { value: 'other', label: 'Other' },
];

// ---------------------------------------------------------------------------
// Contact info
// ---------------------------------------------------------------------------

const contactInfo = [
  {
    label: 'Email',
    value: 'connect@kaizeninfotech.com',
    href: 'mailto:connect@kaizeninfotech.com',
    copyable: true,
  },
  {
    label: 'Phone',
    value: '+91 99201 30855',
    href: 'tel:+919920130855',
    copyable: true,
  },
  {
    label: 'WhatsApp',
    value: '+91 99201 30855',
    href: 'https://wa.me/919920130855',
    copyable: true,
  },
  {
    label: 'Address',
    value: 'Centrum Business Square, A 406, Road No. 16, Nehru Nagar, Wagle Industrial Estate, Thane West, Thane, Maharashtra 400604',
    href: null,
    copyable: false,
  },
];

// Social links come from @/content/navigation; entries with href '#' are
// hidden until the client provides real profile URLs.
const visibleSocialLinks = socialLinks.filter(
  (link) => link.href && link.href !== '#'
);

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    budget: '',
    projectType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const formFieldsRef = useRef<HTMLDivElement>(null);

  useStaggeredScrollReveal(formFieldsRef, {
    childSelector: '> *',
    from: { opacity: 0, y: 30 },
    to: { opacity: 1, y: 0 },
    stagger: 0.08,
  });

  const handleInputChange = useCallback(
    (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, [field]: e.target.value }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (field: string) => (value: string) => {
      setFormState((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleCopy = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard API not available
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitStatus('idle');

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formState),
        });

        if (res.ok) {
          setSubmitStatus('success');
          setFormState({
            name: '',
            email: '',
            phone: '',
            company: '',
            budget: '',
            projectType: '',
            message: '',
          });
        } else {
          setSubmitStatus('error');
        }
      } catch {
        setSubmitStatus('error');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState]
  );

  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Hero Section */}
      <PageHero
        kicker="Contact"
        title="Let's Start a Conversation"
        accentWords={['Conversation']}
        description="Tell us about your project, your goals, or your challenges - and we will get back to you within 24 hours. No obligation, just a conversation."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      {/* Contact Form + Info */}
      <section className="px-6 pb-24 md:px-12 lg:px-24">
        <div className="mx-auto grid max-w-7xl gap-16 md:grid-cols-2 lg:grid-cols-[1fr_auto_400px]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-10">
            <div ref={formFieldsRef} className="space-y-10">
              <fieldset className="space-y-10 border-0 p-0">
                <legend className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent-primary)]">
                  Who you are
                </legend>
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                  <Input
                    label="Name"
                    value={formState.name}
                    onChange={handleInputChange('name')}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formState.email}
                    onChange={handleInputChange('email')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                  <Input
                    label="Phone (optional)"
                    type="tel"
                    value={formState.phone}
                    onChange={handleInputChange('phone')}
                  />
                  <Input
                    label="Company / Organisation (optional)"
                    value={formState.company}
                    onChange={handleInputChange('company')}
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-10 border-0 p-0">
                <legend className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent-primary)]">
                  Your project
                </legend>
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                  <Select
                    label="Budget Range (optional)"
                    options={budgetOptions}
                    value={formState.budget}
                    onChange={handleSelectChange('budget')}
                  />
                  <Select
                    label="Project Type (optional)"
                    options={projectTypeOptions}
                    value={formState.projectType}
                    onChange={handleSelectChange('projectType')}
                  />
                </div>

                <Textarea
                  label="Message"
                  placeholder="Tell us about your project..."
                  value={formState.message}
                  onChange={handleInputChange('message')}
                  maxLength={2000}
                  showCount
                  required
                />
              </fieldset>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" size="lg" isLoading={isSubmitting}>
                Send Message
              </Button>

              <AnimatePresence>
                {submitStatus === 'success' && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[length:var(--text-sm)] text-[var(--color-accent-secondary)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Thank you! Your message has been sent. We will get back to you within 24 hours.
                  </motion.p>
                )}
                {submitStatus === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-[length:var(--text-sm)] text-[var(--color-accent-warm)]"
                    style={{ fontFamily: 'var(--font-body)' }}
                  >
                    Something went wrong. Please try again or email us directly at {SITE_CONFIG.contactEmail}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </form>

          {/* Vertical Section Divider (desktop only) */}
          <SectionDivider variant="line" direction="vertical" className="hidden lg:block" />

          {/* Contact Info Sidebar */}
          <ScrollFadeIn direction="right">
            <ParallaxLayer speed={0.1}>
              <div className="section-ink space-y-10 rounded-2xl p-8">
                <div className="space-y-8">
                  {contactInfo.map((item) => (
                    <div key={item.label}>
                      <p
                        className="ink-accent mb-1 text-[length:var(--text-xs)] uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {item.label}
                      </p>
                      <div className="flex items-center gap-2">
                        {item.href ? (
                          <a
                            href={item.href}
                            className="focus-ring text-[length:var(--text-base)] text-[var(--text-on-ink)] transition-colors hover:text-[var(--accent-on-ink)]"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p
                            className="text-[length:var(--text-base)] text-[var(--text-on-ink)]"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {item.value}
                          </p>
                        )}

                        {item.copyable && (
                          <button
                            type="button"
                            onClick={() => handleCopy(item.value, item.label)}
                            className="focus-ring shrink-0 cursor-pointer rounded-[var(--radius-sm)] p-1.5 text-[var(--text-on-ink-muted)] transition-colors hover:bg-[rgba(245,248,252,0.1)] hover:text-[var(--text-on-ink)]"
                            aria-label={`Copy ${item.label}`}
                          >
                            <AnimatePresence mode="wait">
                              {copiedField === item.label ? (
                                <motion.svg
                                  key="check"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="text-[var(--color-accent-secondary)]"
                                >
                                  <path
                                    d="M3 8.5L6.5 12L13 4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </motion.svg>
                              ) : (
                                <motion.svg
                                  key="copy"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                >
                                  <rect
                                    x="5"
                                    y="5"
                                    width="8"
                                    height="8"
                                    rx="1.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                  />
                                  <path
                                    d="M3 11V3.5C3 2.67 3.67 2 4.5 2H11"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                  />
                                </motion.svg>
                              )}
                            </AnimatePresence>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Social Links — hidden entirely until real URLs are provided */}
                {visibleSocialLinks.length > 0 && (
                  <>
                    <div className="h-px bg-[rgba(245,248,252,0.15)]" />
                    <div>
                      <p
                        className="ink-accent mb-4 text-[length:var(--text-xs)] uppercase tracking-wider"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        Follow Us
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {visibleSocialLinks.map((link) => (
                          <a
                            key={link.platform}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="focus-ring rounded-[var(--radius-full)] border border-[rgba(245,248,252,0.25)] px-4 py-2 text-[length:var(--text-sm)] text-[var(--text-on-ink-muted)] transition-colors duration-300 hover:border-[var(--accent-on-ink)] hover:text-[var(--accent-on-ink)]"
                            style={{ fontFamily: 'var(--font-heading)' }}
                          >
                            {link.platform}
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ParallaxLayer>
          </ScrollFadeIn>
        </div>
      </section>
    </main>
  );
}
