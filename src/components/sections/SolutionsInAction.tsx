'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, registerGSAPPlugins } from '@/lib/animations/gsap-setup';
import { cn } from '@/lib/utils/cn';

// ─────────────────────────────────────────────────────────────────────────────
// Solutions in Action — FOLLOW.ART "Curators & Artists"-style STACKING cards.
//
// Each card is a 200vh runway whose inner pane is `position: sticky; top:0`
// (pins for one viewport). Every card after the first is pulled up by 100vh
// (`.sia-card + .sia-card { margin-top:-100vh }`) so its ENTRANCE runs while it
// rises OVER the previous, pinned card — card-on-card cover, not a push/slide.
//
// The pin is pure CSS sticky. GSAP is only a read-only progress meter (no
// ScrollTrigger pin): one trigger per card, start 'top bottom' → end 'top top',
// scrub:true (1:1 with the Lenis-smoothed position, symmetric reverse). render()
// drives — transform/opacity on .sia-media-inner + .sia-blob, and a per-line
// `--hl` (0→1) that wipes the headline from ghost to crisp under a travelling
// blue marker. Bullets latch in via a discrete CSS keyframe stagger.
//
// gsap.matchMedia gates the whole mechanic to desktop + motion-OK; mobile and
// reduced-motion collapse (via CSS) to plain, fully-legible stacked blocks.
// Brand tokens only.
// ─────────────────────────────────────────────────────────────────────────────

interface SolutionCardData {
  slug: string;
  title: string;
  image: string;
  head: [string, string];
  bullets: [string, string, string];
  closing: { pre: string; key: string; post: string };
}

const CARDS: SolutionCardData[] = [
  {
    slug: 'rotary-zones',
    title: 'Rotary Zones 4–7',
    image: '/images/projects/rotary-zones.png',
    head: ['Rotary,', 'Connected'],
    bullets: [
      '4,500+ clubs and 1.8 lakh Rotarians on one ecosystem.',
      '1,000+ auto-synced, SEO-optimized club websites.',
      'Automated e-governance, dues, and event registration.',
    ],
    closing: { pre: 'Now the world’s largest provider of ', key: 'Rotary club websites', post: '.' },
  },
  {
    slug: 'mbpt-eseva',
    title: 'MbPT eSeva',
    image: '/images/projects/mbpt-eseva.png',
    head: ['Port Ops,', 'Digitized'],
    bullets: [
      'Citizen grievance redressal, tracked end to end.',
      'Pensions for 28,000 employees, in real time.',
      'Live vessel tracking and digital pilot management.',
    ],
    closing: { pre: 'One platform lifting ', key: 'transparency across Mumbai Port', post: '.' },
  },
  {
    slug: 'aaykar-kutumb',
    title: 'Aaykar Kutumb',
    image: '/images/projects/aaykar-kutumb.png',
    head: ['50,000 Officers,', 'One Truth'],
    bullets: [
      'Find any officer, rule, or circular in seconds.',
      'Updates reach every officer instantly, nationwide.',
      'Role-based access protects sensitive government data.',
    ],
    closing: { pre: 'A single ', key: 'source of truth', post: ' for the Income Tax Department.' },
  },
  {
    slug: 'jito-world',
    title: 'JITO World',
    image: '/images/projects/jito-world.png',
    head: ['5 Lakh Members,', 'One Network'],
    bullets: [
      'Regions, chapters, and wings on one system.',
      'Automated newsletters, events, and greetings.',
      'Secure digital dues and payments worldwide.',
    ],
    closing: { pre: 'Global community, run with ', key: 'operational excellence', post: '.' },
  },
  {
    slug: 'yatri-mitra',
    title: 'Yatri Mitra',
    image: '/images/projects/yatri-mitra.png',
    head: ['Fair Fares,', 'Fair Earnings'],
    bullets: [
      'Government-regulated meter fares, zero surge.',
      'Direct driver payouts — no aggregator commission.',
      'SOS, verified profiles, and two-way ratings.',
    ],
    closing: { pre: 'Reduced idle time lifted ', key: 'driver earnings by 25%', post: '.' },
  },
  {
    slug: 'arovia',
    title: 'Arovia',
    image: '/images/projects/arovia.png',
    head: ['Clinics,', 'Elevated'],
    bullets: [
      'Online appointments with automated reminders.',
      'Digital records and a global prescription repository.',
      'Encrypted billing and WhatsApp patient reminders.',
    ],
    closing: { pre: 'Less paperwork, more ', key: 'patient care', post: '.' },
  },
];

function Spark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 0c.6 5.4 1.2 10.8 12 12-10.8 1.2-11.4 6.6-12 12-.6-5.4-1.2-10.8-12-12C10.8 10.8 11.4 5.4 12 0Z" />
    </svg>
  );
}

// ── Scroll-progress → animation tuning (single source of truth) ──────────────
const MEDIA: readonly [number, number] = [0.0, 0.5]; // media entrance window
const HL: ReadonlyArray<[number, number]> = [
  [0.45, 0.78], // headline line 0 sweep
  [0.6, 0.92], // headline line 1 sweep (line-by-line lag)
];
const BULLETS_ARM = 0.82; // fire bullet stagger
const BULLETS_REARM = 0.4; // re-arm on scroll-up
const MEDIA_OFFSET = 56; // px outer-edge entrance
const BLOB_OFFSET = 96; // px deeper blob parallax

const clamp01 = gsap.utils.clamp(0, 1);
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const win = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

export function SolutionsInAction() {
  const stackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  registerGSAPPlugins();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ONE gate: build the scroll mechanic on EVERY motion-OK screen — desktop,
      // iPad, AND phones (single-column wrapping layout via the CSS below). Only
      // reduced-motion gets the static CSS fallback (no JS). gsap.matchMedia()
      // re-evaluates on resize/orientation change, so rotating a tablet or
      // crossing a breakpoint automatically re-runs this setup.
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = cardRefs.current.filter(Boolean) as HTMLElement[];

        const triggers = cards.map((cardEl) => {
          const dir = cardEl.classList.contains('sia-media-left') ? -1 : 1; // enter from outer edge

          const mediaEl = cardEl.querySelector<HTMLElement>('.sia-media-inner')!;
          const blobEl = cardEl.querySelector<HTMLElement>('.sia-blob')!;
          const contentEl = cardEl.querySelector<HTMLElement>('.sia-content')!;
          const lineEls = gsap.utils.toArray<HTMLElement>('.sia-line', cardEl);

          const setMX = gsap.quickSetter(mediaEl, 'x', 'px') as (v: number) => void;
          const setMO = gsap.quickSetter(mediaEl, 'opacity') as (v: number) => void;
          const setBX = gsap.quickSetter(blobEl, 'x', 'px') as (v: number) => void;
          const setHl = lineEls.map((l) => gsap.quickSetter(l, '--hl') as (v: number) => void);

          let bulletsArmed = false;

          // Seed offstage so there's no first-frame flash before render(0).
          gsap.set(mediaEl, { x: dir * MEDIA_OFFSET, opacity: 0, force3D: true });

          const render = (p: number) => {
            // (a) media enters from the outer edge → centred, fading in
            const me = easeOutCubic(win(p, MEDIA[0], MEDIA[1]));
            setMX(dir * MEDIA_OFFSET * (1 - me));
            setMO(me);
            setBX(dir * BLOB_OFFSET * (1 - easeOutCubic(win(p, 0, 0.7))));

            // (b) headline marker sweep, line by line
            setHl.forEach((set, i) => {
              const w = HL[i] ?? [0.45 + i * 0.15, 0.78 + i * 0.15];
              set(win(p, w[0], w[1]));
            });

            // (c) discrete bullet/closing stagger — CSS owns the timing
            if (!bulletsArmed && p > BULLETS_ARM) {
              bulletsArmed = true;
              contentEl.classList.add('sia-bullets-in');
            } else if (bulletsArmed && p < BULLETS_REARM) {
              bulletsArmed = false;
              contentEl.classList.remove('sia-bullets-in');
            }
          };

          const st = ScrollTrigger.create({
            trigger: cardEl,
            start: 'top bottom', // p=0: card top at viewport bottom (begins rising over prev)
            end: 'top top', // p=1: card top at viewport top (sticky pin engages)
            scrub: true,
            invalidateOnRefresh: true,
            onUpdate: (self) => render(self.progress),
            onRefresh: (self) => render(self.progress),
          });
          render(0);
          return st;
        });

        // Recompute pin/scrub start-end now that this breakpoint's (possibly
        // single-column) layout is applied.
        ScrollTrigger.refresh();

        return () => triggers.forEach((t) => t.kill());
      });

      return () => mm.revert();
    },
    { scope: stackRef }
  );

  return (
    <section className="sia-section" aria-label="Solutions in action">
      <div className="sia-head">
        <span className="sia-eyebrow">Solutions in Action</span>
        <h2 className="sia-title">Real platforms. Real outcomes.</h2>
      </div>

      <div className="sia-stack" ref={stackRef}>
        {CARDS.map((card, i) => (
          <article
            key={card.slug}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className={cn('sia-card', i % 2 === 0 ? 'sia-media-left' : 'sia-media-right')}
            style={{ ['--idx']: i, zIndex: i + 1 } as React.CSSProperties}
          >
            {/* Sticky pane = the only visual layer; opaque bg = the cover surface. */}
            <div className="sia-sticky">
              <div className="sia-media">
                <span className="sia-blob" aria-hidden />
                <div className="sia-media-inner">
                  <Link
                    href={`/work/${card.slug}`}
                    className="sia-image-wrap focus-ring"
                    aria-label={`View case study: ${card.title}`}
                  >
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      sizes="(max-width: 768px) 86vw, 40vw"
                      className="sia-image"
                    />
                  </Link>
                  <span className="sia-spark" aria-hidden>
                    <Spark />
                  </span>
                </div>
              </div>

              <div className="sia-content">
                <h2 className="sia-headline">
                  {card.head.map((line, li) => (
                    <span key={li} className="sia-line">
                      <span className="sia-ghost">{line}</span>
                      <span className="sia-crisp" aria-hidden>
                        {line}
                      </span>
                      <span className="sia-hl" aria-hidden />
                    </span>
                  ))}
                </h2>

                <ul className="sia-bullets">
                  {card.bullets.map((b, bi) => (
                    <li key={bi} style={{ ['--i']: bi } as React.CSSProperties}>
                      {b}
                    </li>
                  ))}
                </ul>

                <p className="sia-closing">
                  {card.closing.pre}
                  <u>{card.closing.key}</u>
                  {card.closing.post}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
