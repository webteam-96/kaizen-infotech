import { ANIMATION_CONFIG } from './config';

const { duration, ease, stagger } = ANIMATION_CONFIG;

export interface AnimationPreset {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
}

export const fadeUp: AnimationPreset = {
  from: { opacity: 0, y: 40 },
  to: { opacity: 1, y: 0, duration: duration.normal, ease: ease.smooth },
};

export const fadeDown: AnimationPreset = {
  from: { opacity: 0, y: -40 },
  to: { opacity: 1, y: 0, duration: duration.normal, ease: ease.smooth },
};

export const fadeLeft: AnimationPreset = {
  from: { opacity: 0, x: -40 },
  to: { opacity: 1, x: 0, duration: duration.normal, ease: ease.smooth },
};

export const fadeRight: AnimationPreset = {
  from: { opacity: 0, x: 40 },
  to: { opacity: 1, x: 0, duration: duration.normal, ease: ease.smooth },
};

export const scaleIn: AnimationPreset = {
  from: { opacity: 0, scale: 0.8 },
  to: { opacity: 1, scale: 1, duration: duration.normal, ease: ease.snappy },
};

export const scaleOut: AnimationPreset = {
  from: { opacity: 1, scale: 1 },
  to: { opacity: 0, scale: 0.8, duration: duration.fast, ease: ease.smooth },
};

export const slideUp: AnimationPreset = {
  from: { y: '100%' },
  to: { y: '0%', duration: duration.slow, ease: ease.cinematic },
};

export const slideDown: AnimationPreset = {
  from: { y: '-100%' },
  to: { y: '0%', duration: duration.slow, ease: ease.cinematic },
};

export const textRevealUp: AnimationPreset = {
  from: { y: '110%', opacity: 0 },
  to: {
    y: '0%',
    opacity: 1,
    duration: duration.slow,
    ease: ease.textReveal,
    stagger: stagger.fast,
  },
};

export const staggerFadeUp: AnimationPreset = {
  from: { opacity: 0, y: 30 },
  to: {
    opacity: 1,
    y: 0,
    duration: duration.normal,
    ease: ease.smooth,
    stagger: stagger.normal,
  },
};

export const presets = {
  fadeUp,
  fadeDown,
  fadeLeft,
  fadeRight,
  scaleIn,
  scaleOut,
  slideUp,
  slideDown,
  textRevealUp,
  staggerFadeUp,
} as const;

export type PresetName = keyof typeof presets;
