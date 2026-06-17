// Centralized Framer Motion easing/transition values.
// GSAP eases live in ANIMATION_CONFIG.ease; Framer needs bezier arrays/spring configs.
import { ANIMATION_CONFIG } from './config';

export const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as const;

export const SPRING_SOFT = { type: 'spring', stiffness: 120, damping: 20 } as const;
export const SPRING_SNAPPY = { type: 'spring', stiffness: 300, damping: 20 } as const;

export const TRANSITION_FAST = { duration: ANIMATION_CONFIG.duration.fast, ease: EASE_OUT } as const;
export const TRANSITION_NORMAL = { duration: ANIMATION_CONFIG.duration.normal, ease: EASE_OUT } as const;
