// Animation-related types for GSAP and scroll interactions

export type AnimationDirection = 'up' | 'down' | 'left' | 'right';
export type SplitType = 'chars' | 'words' | 'lines';
export type CursorVariant = 'default' | 'hover' | 'text' | 'hidden';
export type ScrollDirection = 'up' | 'down';

export interface ScrollTriggerConfig {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  markers?: boolean;
  toggleActions?: string;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

export interface AnimationPreset {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  duration?: number;
  ease?: string;
  stagger?: number | gsap.StaggerVars;
  scrollTrigger?: ScrollTriggerConfig;
}

export interface ParallaxConfig {
  speed: number;
  direction?: 'vertical' | 'horizontal';
}
