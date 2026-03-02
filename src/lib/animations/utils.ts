'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANIMATION_CONFIG } from './config';
import type { AnimationPreset } from './presets';

export type SplitType = 'chars' | 'words' | 'lines';

export interface SplitResult {
  elements: HTMLElement[];
  revert: () => void;
}

/**
 * Manually splits text content of an element into individual spans.
 * Works as a lightweight alternative to GSAP's SplitText plugin.
 */
export function splitTextIntoSpans(
  element: HTMLElement,
  type: SplitType = 'words'
): SplitResult {
  const originalHTML = element.innerHTML;

  const revert = () => {
    element.innerHTML = originalHTML;
  };

  if (type === 'lines') {
    return splitIntoLines(element, revert);
  }

  const text = element.textContent || '';
  element.innerHTML = '';

  // For chars mode, group characters inside word wrappers so the browser
  // only breaks between words, never mid-word.
  if (type === 'chars') {
    const parts = text.split(/(\s+)/);
    const elements: HTMLElement[] = [];

    parts.forEach((part) => {
      if (part === '') return;

      if (/^\s+$/.test(part)) {
        element.appendChild(document.createTextNode(part));
        return;
      }

      // Word wrapper: keeps all characters in this word on the same line
      const wordWrap = document.createElement('span');
      wordWrap.style.display = 'inline-block';
      wordWrap.style.whiteSpace = 'nowrap';

      part.split('').forEach((char) => {
        const charSpan = document.createElement('span');
        charSpan.style.display = 'inline-block';
        charSpan.textContent = char;
        wordWrap.appendChild(charSpan);
        elements.push(charSpan);
      });

      element.appendChild(wordWrap);
    });

    return { elements, revert };
  }

  // Words mode
  const units = text.split(/(\s+)/);
  const elements: HTMLElement[] = [];

  units.forEach((unit) => {
    if (unit === '') return;

    if (/^\s+$/.test(unit)) {
      element.appendChild(document.createTextNode(unit));
      return;
    }

    const span = document.createElement('span');
    span.style.display = 'inline-block';
    span.textContent = unit;
    element.appendChild(span);
    elements.push(span);
  });

  return { elements, revert };
}

function splitIntoLines(
  element: HTMLElement,
  revert: () => void
): SplitResult {
  const text = element.textContent || '';
  const words = text.split(/\s+/).filter(Boolean);
  element.innerHTML = '';

  // First pass: add all words as spans to measure line breaks
  const wordSpans: HTMLSpanElement[] = [];
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.display = 'inline';
    element.appendChild(span);
    wordSpans.push(span);
    if (i < words.length - 1) {
      element.appendChild(document.createTextNode(' '));
    }
  });

  // Second pass: group words by their top offset into lines
  const lines: string[][] = [];
  let currentLine: string[] = [];
  let lastTop = -1;

  wordSpans.forEach((span, i) => {
    const top = span.getBoundingClientRect().top;
    if (lastTop !== -1 && Math.abs(top - lastTop) > 2) {
      lines.push(currentLine);
      currentLine = [];
    }
    currentLine.push(words[i]);
    lastTop = top;
  });
  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  // Third pass: rebuild with line wrappers
  element.innerHTML = '';
  const lineElements: HTMLElement[] = [];

  lines.forEach((lineWords) => {
    const lineSpan = document.createElement('span');
    lineSpan.style.display = 'block';
    lineSpan.textContent = lineWords.join(' ');
    element.appendChild(lineSpan);
    lineElements.push(lineSpan);
  });

  return { elements: lineElements, revert };
}

/**
 * Safely kills an array of ScrollTrigger instances.
 */
export function killScrollTriggers(triggers: ScrollTrigger[]): void {
  triggers.forEach((trigger) => {
    if (trigger && typeof trigger.kill === 'function') {
      trigger.kill();
    }
  });
}

export interface ScrollTimelineOptions {
  trigger?: string | Element;
  start?: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean | string | Element;
  markers?: boolean;
  toggleActions?: string;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
}

/**
 * Creates a GSAP timeline bound to a ScrollTrigger.
 */
export function createScrollTimeline(
  element: Element,
  options: ScrollTimelineOptions = {}
): gsap.core.Timeline {
  const {
    trigger,
    start = ANIMATION_CONFIG.scrollTrigger.start,
    end = ANIMATION_CONFIG.scrollTrigger.end,
    scrub = false,
    pin = false,
    markers = false,
    toggleActions = ANIMATION_CONFIG.scrollTrigger.toggleActions,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
  } = options;

  return gsap.timeline({
    scrollTrigger: {
      trigger: trigger || element,
      start,
      end,
      scrub,
      pin,
      markers,
      toggleActions: scrub ? undefined : toggleActions,
      onEnter,
      onLeave,
      onEnterBack,
      onLeaveBack,
    },
  });
}

/**
 * Returns a simplified animation preset if reduced motion is preferred.
 * Strips transforms, keeps only opacity fade.
 */
export function getReducedMotionPreset(
  originalPreset: AnimationPreset
): AnimationPreset {
  return {
    from: { opacity: originalPreset.from.opacity ?? 0 },
    to: {
      opacity: originalPreset.to.opacity ?? 1,
      duration: ANIMATION_CONFIG.duration.fast,
      ease: ANIMATION_CONFIG.ease.smooth,
    },
  };
}
