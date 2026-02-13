'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

let registered = false;

export function registerGSAPPlugins() {
  if (registered) return;
  if (typeof window === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
  registered = true;
}

export { gsap, ScrollTrigger, ScrollToPlugin };
