'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollFadeIn } from '@/components/animation/ScrollFadeIn';
import { SectionDivider } from '@/components/animation/SectionDivider';
import { ParallaxLayer } from '@/components/animation/ParallaxLayer';
import { useStaggeredScrollReveal } from '@/hooks/useStaggeredScrollReveal';
import { PageHero } from '@/components/sections/PageHero';
import { HexGridBackground } from '@/components/shared/HexGridBackground';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Captcha, type CaptchaHandle } from '@/components/ui/Captcha';
import { socialLinks } from '@/content/navigation';
import { SITE_CONFIG } from '@/lib/utils/constants';
// ---------------------------------------------------------------------------
// Select options
// ---------------------------------------------------------------------------

const budgetOptions = [
  { value: 'under-5l', label: 'Under ₹5 Lakhs' },
  { value: '5l-10l', label: '₹5–10 Lakhs' },
  { value: '10l-20l', label: '₹10–20 Lakhs' },
  { value: '20l-50l', label: '₹20–50 Lakhs' },
  { value: '50l-plus', label: '₹50 Lakhs+' },
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

type ContactInfoItem = {
  label: string;
  value: string;
  href: string;
  copyable: boolean;
  externalLink: boolean;
  /** Optional lead-in text rendered inline before the linked value. */
  prefix?: string;
};

const contactInfo: ContactInfoItem[] = [
  {
    label: 'Email',
    value: 'communication@kaizeninfotech.com',
    href: 'mailto:communication@kaizeninfotech.com',
    copyable: true,
    externalLink: false,
  },
  {
    label: 'Calls & WhatsApp',
    // Reads "For business enquiries contact +91 93724 30855"; the number stays
    // a tel: link and the copy button copies just the number.
    prefix: 'For business enquiries contact',
    value: '+91 93724 30855',
    href: 'tel:+919372430855',
    copyable: true,
    externalLink: false,
  },
  {
    label: 'Address',
    value: 'A 406, Centrum Business Square, Road No. 16, Wagle Industrial Estate, Thane West, Thane, Maharashtra, India - 400604',
    // Opens the address in Google Maps (new tab).
    href: 'https://maps.app.goo.gl/E3AMLk3rY7wdxHzG7',
    copyable: false,
    externalLink: true,
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
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const captchaRef = useRef<CaptchaHandle>(null);

  const handleCaptchaChange = useCallback((token: string, answer: string) => {
    setCaptchaToken(token);
    setCaptchaAnswer(answer);
    if (answer) setCaptchaError(false);
  }, []);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectErrors, setSelectErrors] = useState<{
    budget?: string;
    projectType?: string;
  }>({});

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
      setSelectErrors((prev) => ({ ...prev, [field]: undefined }));
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

      // The custom Select isn't a native form control, so validate it manually.
      // (The Input/Textarea fields are enforced by native `required`.)
      const nextErrors = {
        budget: formState.budget ? undefined : 'Please select a budget range.',
        projectType: formState.projectType
          ? undefined
          : 'Please select a project type.',
      };
      if (nextErrors.budget || nextErrors.projectType) {
        setSelectErrors(nextErrors);
        return;
      }
      setSelectErrors({});

      // Block submission until the captcha code is typed.
      if (!captchaAnswer.trim()) {
        setCaptchaError(true);
        return;
      }
      setCaptchaError(false);

      setIsSubmitting(true);
      setSubmitStatus('idle');

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formState, captchaToken, captchaAnswer }),
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
          captchaRef.current?.reset(); // single-use — fetch a fresh code
        } else {
          // Distinguish a wrong captcha (inline message + new code) from other errors.
          const data = await res.json().catch(() => ({}));
          const isCaptcha = /captcha|code/i.test(String(data?.error ?? ''));
          captchaRef.current?.reset();
          if (isCaptcha) {
            setCaptchaError(true);
          } else {
            setSubmitStatus('error');
          }
        }
      } catch {
        setSubmitStatus('error');
        captchaRef.current?.reset();
      } finally {
        setIsSubmitting(false);
      }
    },
    [formState, captchaToken, captchaAnswer]
  );

  return (
    <main className="relative isolate min-h-screen bg-[var(--color-bg-primary)]">      {/* Hero Section */}
      <PageHero
        align="center"
        backdrop={<HexGridBackground />}
        kicker="Contact"
        title="Let's Start a Conversation"
        accentWords={['Conversation']}
        description="Tell us about your project, your goals, or your challenges - and we will get back to you within 24 hours. No obligation, just a conversation."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      {/* Contact Form + Info */}
      <section className="section-tint seam-blue relative px-6 py-24 md:px-12 lg:px-24">
        <div className="mx-auto grid max-w-7xl gap-16 xl:grid-cols-[1fr_auto_25rem]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-10">
            <div ref={formFieldsRef} className="space-y-10">
              <fieldset className="space-y-10 border-0 p-0">
                <legend className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent-primary)]">
                  About <span className="text-[var(--red-brand)]">Yourself</span>
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
                    label="Phone"
                    type="tel"
                    value={formState.phone}
                    onChange={handleInputChange('phone')}
                    required
                  />
                  <Input
                    label="Company / Organisation"
                    value={formState.company}
                    onChange={handleInputChange('company')}
                    required
                  />
                </div>
              </fieldset>

              <fieldset className="space-y-10 border-0 p-0">
                <legend className="mb-6 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent-primary)]">
                  Your <span className="text-[var(--red-brand)]">project</span>
                </legend>
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                  <Select
                    label="Budget Range"
                    options={budgetOptions}
                    value={formState.budget}
                    onChange={handleSelectChange('budget')}
                    error={selectErrors.budget}
                  />
                  <Select
                    label="Project Type"
                    options={projectTypeOptions}
                    value={formState.projectType}
                    onChange={handleSelectChange('projectType')}
                    error={selectErrors.projectType}
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

            {/* Spam protection — alphanumeric image captcha (verified server-side) */}
            <Captcha ref={captchaRef} onChange={handleCaptchaChange} error={captchaError} />

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

          {/* Vertical Section Divider — only when the 3-column layout is active (xl+) */}
          <SectionDivider variant="line" direction="vertical" className="hidden xl:block" />

          {/* Contact Info Sidebar */}
          <ScrollFadeIn direction="right">
            <ParallaxLayer speed={0.1}>
              <div className="section-ink card-accent-ring relative isolate overflow-hidden space-y-10 rounded-2xl p-8">
                <div className="space-y-8">
                  {contactInfo.map((item) => (
                    <div key={item.label}>
                      <p
                        className="mb-1 flex items-center gap-2 text-[length:var(--text-xs)] uppercase tracking-wider text-[var(--red-coral)]"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        <span aria-hidden="true" className="text-[var(--red-coral)]">
                          {item.label === 'Email' ? (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
                              <path d="M2 4l6 4.5L14 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : item.label === 'Address' ? (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M8 1.5c-2.5 0-4.5 2-4.5 4.5C3.5 9.5 8 14.5 8 14.5S12.5 9.5 12.5 6c0-2.5-2-4.5-4.5-4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                              <circle cx="8" cy="6" r="1.6" stroke="currentColor" strokeWidth="1.4" />
                            </svg>
                          ) : (
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M3 2.5h2.5l1 3-1.5 1a8 8 0 0 0 4.5 4.5l1-1.5 3 1V13a1.5 1.5 0 0 1-1.5 1.5C7 14.5 1.5 9 1.5 4A1.5 1.5 0 0 1 3 2.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
                        {item.label}
                      </p>
                      <div className="flex min-w-0 items-center gap-2">
                        {item.href ? (
                          <p
                            className="min-w-0 text-[length:var(--text-base)] text-[var(--text-on-ink)]"
                            style={{ fontFamily: 'var(--font-body)' }}
                          >
                            {item.prefix ? <>{item.prefix} </> : null}
                            <a
                              href={item.href}
                              target={item.href?.startsWith('http') ? '_blank' : undefined}
                              rel={item.href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                              className="focus-ring break-all transition-colors hover:text-[var(--accent-on-ink)]"
                            >
                              {item.value}
                            </a>
                          </p>
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

                        {item.externalLink && item.href && (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="focus-ring shrink-0 cursor-pointer rounded-[var(--radius-sm)] p-1.5 text-[var(--text-on-ink-muted)] transition-colors hover:bg-[rgba(245,248,252,0.1)] hover:text-[var(--text-on-ink)]"
                            aria-label={`Open ${item.label} in Google Maps (new tab)`}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                              <path
                                d="M6.5 3.5H4A1.5 1.5 0 0 0 2.5 5v7A1.5 1.5 0 0 0 4 13.5h7A1.5 1.5 0 0 0 12.5 12V9.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9.5 2.5H13.5V6.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M13 3L7.5 8.5"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
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
