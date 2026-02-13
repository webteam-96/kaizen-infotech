'use client';

import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

// ---------------------------------------------------------------------------
// Play icon
// ---------------------------------------------------------------------------

function PlayIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden
    >
      <circle
        cx="24"
        cy="24"
        r="23"
        stroke="var(--color-text-primary)"
        strokeWidth="1.5"
        opacity="0.6"
      />
      <path
        d="M19 16L33 24L19 32V16Z"
        fill="var(--color-text-primary)"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// VideoPlayer
// ---------------------------------------------------------------------------

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showOverlay, setShowOverlay] = useState(!autoPlay);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
      setShowOverlay(false);
    } else {
      video.pause();
      setIsPlaying(false);
      setShowOverlay(true);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setShowOverlay(true);
  }, []);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-lg)]',
        'bg-[var(--color-bg-tertiary)]',
        className
      )}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        playsInline
        controls={isPlaying}
        onEnded={handleEnded}
        onPause={() => {
          setIsPlaying(false);
          setShowOverlay(true);
        }}
        onPlay={() => {
          setIsPlaying(true);
          setShowOverlay(false);
        }}
        className="h-full w-full object-cover"
      />

      {/* Play/Pause overlay */}
      <AnimatePresence>
        {showOverlay && (
          <motion.button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            className={cn(
              'absolute inset-0 z-10 flex items-center justify-center',
              'bg-[var(--color-bg-primary)]/40 backdrop-blur-[var(--blur-sm)]',
              'cursor-pointer outline-none',
              'focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)]',
              'focus-visible:ring-inset'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <PlayIcon />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Poster fade-in if provided */}
      {poster && !isPlaying && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
    </div>
  );
}
