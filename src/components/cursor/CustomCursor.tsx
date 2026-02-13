'use client';

import { useEffect, useSyncExternalStore } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from 'framer-motion';
import { useCursorContext } from './CursorProvider';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from '@/styles/modules/cursor.module.css';

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return true;
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia('(hover: none)').matches
  );
}

const noopSubscribe = () => () => {};

export function CustomCursor() {
  const { variant, text } = useCursorContext();
  const prefersReducedMotion = useReducedMotion();
  const isTouch = useSyncExternalStore(noopSubscribe, isTouchDevice, () => true);
  const hasMounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  // Raw mouse position via motion values (avoids React re-renders)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Dot follows closely with slight smoothing
  const dotX = useSpring(mouseX, { stiffness: 500, damping: 28, mass: 0.5 });
  const dotY = useSpring(mouseY, { stiffness: 500, damping: 28, mass: 0.5 });

  // Follower trails behind with springy physics
  const followerX = useSpring(mouseX, {
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  });
  const followerY = useSpring(mouseY, {
    stiffness: 120,
    damping: 20,
    mass: 0.8,
  });

  useEffect(() => {
    if (isTouch || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseLeaveWindow = () => {
      mouseX.set(-100);
      mouseY.set(-100);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.documentElement.addEventListener(
      'mouseleave',
      handleMouseLeaveWindow
    );

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener(
        'mouseleave',
        handleMouseLeaveWindow
      );
    };
  }, [isTouch, prefersReducedMotion, mouseX, mouseY]);

  // Hide on touch devices or reduced motion
  if (!hasMounted || isTouch || prefersReducedMotion) {
    return null;
  }

  const isHidden = variant === 'hidden';
  const isText = variant === 'text';
  const isHover = variant === 'hover';

  return (
    <>
      {/* Small dot - follows cursor tightly */}
      <motion.div
        className={styles.dot}
        style={{
          x: dotX,
          y: dotY,
          opacity: isHidden ? 0 : 1,
          scale: isHidden ? 0 : 1,
        }}
        transition={{ opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
        aria-hidden="true"
      />

      {/* Larger follower circle */}
      <motion.div
        className={styles.follower}
        style={{
          x: followerX,
          y: followerY,
        }}
        animate={{
          width: isText ? 'auto' : isHover ? 80 : 40,
          height: isText ? 'auto' : isHover ? 80 : 40,
          opacity: isHidden ? 0 : isHover ? 0.5 : 1,
          scale: isHidden ? 0 : 1,
          borderRadius: isText ? 100 : 9999,
          backgroundColor: isText
            ? 'var(--color-accent-primary, #2196F3)'
            : 'transparent',
          borderColor: isHidden
            ? 'transparent'
            : 'var(--color-accent-primary, #2196F3)',
          padding: isText ? '8px 16px' : '0px',
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 25,
          mass: 0.5,
        }}
        aria-hidden="true"
      >
        <AnimatePresence mode="wait">
          {isText && text && (
            <motion.span
              key={text}
              className={styles.followerText}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
