export { registerGSAPPlugins, gsap, ScrollTrigger, ScrollToPlugin } from './gsap-setup';
export { ANIMATION_CONFIG } from './config';
export type { AnimationConfig, DurationKey, EaseKey, StaggerKey, ScrubKey } from './config';
export { presets, fadeUp, fadeDown, fadeLeft, fadeRight, scaleIn, scaleOut, slideUp, slideDown, textRevealUp, staggerFadeUp } from './presets';
export type { AnimationPreset, PresetName } from './presets';
export { splitTextIntoSpans, killScrollTriggers, createScrollTimeline, getReducedMotionPreset } from './utils';
export type { SplitType, SplitResult, ScrollTimelineOptions } from './utils';
