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
  scrub: {
    tight: 0.5,
    smooth: 1,
    cinematic: 2,
    heavy: 3,
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
