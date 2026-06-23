export const ANIMATION_CONFIG = {
  scrollTrigger: {
    start: 'top 85%',
    end: 'bottom 15%',
    toggleActions: 'play none none reverse',
  },
  duration: {
    instant: 0.15,
    fast: 0.3,
    normal: 0.6,
    slow: 1.0,
    cinematic: 1.5,
    ambient: 3,
  },
  ease: {
    smooth: 'power2.out',
    snappy: 'power3.out',
    elastic: 'elastic.out(1, 0.5)',
    bounce: 'bounce.out',
    cinematic: 'expo.out',
    textReveal: 'power4.out',
  },
  stagger: {
    fast: 0.03,
    normal: 0.08,
    slow: 0.15,
    cascade: { each: 0.1, from: 'start' as const },
    center: { each: 0.08, from: 'center' as const },
    edges: { each: 0.08, from: 'edges' as const },
    random: { each: 0.1, from: 'random' as const },
  },
  // Single consistent scrub value across the site. A small numeric scrub (0.5s)
  // lets scroll-linked tweens smoothly *catch up* on fast scroll instead of
  // jumping/skipping, while staying tight enough to feel responsive. The keys
  // are kept (call sites reference them) but all resolve to the same value.
  scrub: {
    tight: 0.5,
    smooth: 0.5,
    cinematic: 0.5,
    heavy: 0.5,
  },
  reducedMotion: {
    respectPreference: true,
    fallback: 'fadeOnly' as const,
  },
} as const;

export type AnimationConfig = typeof ANIMATION_CONFIG;
export type DurationKey = keyof typeof ANIMATION_CONFIG.duration;
export type EaseKey = keyof typeof ANIMATION_CONFIG.ease;
export type StaggerKey = keyof typeof ANIMATION_CONFIG.stagger;
export type ScrubKey = keyof typeof ANIMATION_CONFIG.scrub;
