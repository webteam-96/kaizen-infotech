'use client';

import { useRef, useEffect, useState } from 'react';
import { gsap, registerGSAPPlugins, ScrollTrigger } from '@/lib/animations/gsap-setup';

/* ── Deterministic sparkle positions ── */
const SPARKLES = [
  { x: -18, y: -24, size: 4, dur: 1.2, delay: 0 },
  { x: 28, y: -18, size: 3, dur: 1.5, delay: 0.25 },
  { x: -28, y: 12, size: 3.5, dur: 1.0, delay: 0.55 },
  { x: 18, y: 28, size: 3, dur: 1.3, delay: 0.15 },
  { x: -12, y: 32, size: 4, dur: 1.6, delay: 0.4 },
  { x: 34, y: 6, size: 2.5, dur: 0.9, delay: 0.7 },
  { x: -34, y: -6, size: 3, dur: 1.4, delay: 0.2 },
  { x: 6, y: -34, size: 3.5, dur: 1.1, delay: 0.5 },
  { x: 24, y: -28, size: 2, dur: 1.7, delay: 0.35 },
  { x: -24, y: 22, size: 3, dur: 1.2, delay: 0.65 },
  { x: 38, y: -10, size: 2, dur: 1.0, delay: 0.8 },
  { x: -8, y: -38, size: 2.5, dur: 1.3, delay: 0.1 },
];

export function ShootingStarPath() {
  const containerRef = useRef<HTMLDivElement>(null);
  const starRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    setDims({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  useEffect(() => {
    if (!dims) return;
    registerGSAPPlugins();

    const container = containerRef.current;
    const star = starRef.current;
    const path = pathRef.current;
    if (!container || !star || !path) return;

    const totalLength = path.getTotalLength();

    /* Ultra-smooth quickTo setters — longer durations for easy gliding */
    const setX = gsap.quickTo(star, 'x', {
      duration: 0.9,
      ease: 'power2.out',
    });
    const setY = gsap.quickTo(star, 'y', {
      duration: 0.9,
      ease: 'power2.out',
    });
    const setRot = gsap.quickTo(star, 'rotation', {
      duration: 1.2,
      ease: 'power1.out',
    });

    const st = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const p = self.progress;
        // Fade in/out at edges, 80% max opacity
        const fadeIn = Math.min(1, Math.max(0, (p - 0.02) / 0.04));
        const fadeOut = Math.min(1, Math.max(0, (0.98 - p) / 0.04));
        const alpha = Math.min(fadeIn, fadeOut) * 0.8;
        container.style.opacity = String(alpha);

        if (alpha < 0.01) return;

        const pathProgress = Math.max(0, Math.min(1, (p - 0.02) / 0.96));
        const point = path.getPointAtLength(pathProgress * totalLength);
        const ahead = path.getPointAtLength(
          Math.min(totalLength, (pathProgress + 0.002) * totalLength)
        );
        const angle =
          Math.atan2(ahead.y - point.y, ahead.x - point.x) * (180 / Math.PI);

        // Star is 80x80, center offset = 40
        setX(point.x - 40);
        setY(point.y - 40);
        setRot(angle);
      },
    });

    return () => {
      st.kill();
    };
  }, [dims]);

  if (!dims) return null;

  const { w, h } = dims;
  /* ══════════════════════════════════════════════════════════════
     Smooth margin-hugging path — never crosses content.
     Flows around the viewport edges with gentle undulations.
     All cubic beziers (no arcs) for silky-smooth motion.

     ┌──── gentle waves along top ────┐
     │                                │
     gentle                      gentle
     waves                        waves
     down                          down
     left                         right
     │                                │
     └──── gentle waves along bottom ─┘
     ══════════════════════════════════════════════════════════════ */
  const pathD = [
    // ─── Start: top-left corner ───
    `M ${w * 0.02},${h * 0.04}`,

    // ─── TOP EDGE: gentle wave left → right (y stays 1–8%) ───
    `C ${w * 0.12},${h * 0.01} ${w * 0.22},${h * 0.08} ${w * 0.35},${h * 0.03}`,
    `C ${w * 0.48},${h * -0.02} ${w * 0.62},${h * 0.09} ${w * 0.76},${h * 0.03}`,
    `C ${w * 0.88},${h * -0.01} ${w * 0.96},${h * 0.05} ${w * 0.97},${h * 0.12}`,

    // ─── RIGHT EDGE: gentle wave down (x stays 93–99%) ───
    `C ${w * 0.98},${h * 0.22} ${w * 0.93},${h * 0.32} ${w * 0.97},${h * 0.42}`,
    `C ${w * 1.01},${h * 0.52} ${w * 0.94},${h * 0.62} ${w * 0.97},${h * 0.72}`,
    `C ${w * 1.00},${h * 0.82} ${w * 0.94},${h * 0.90} ${w * 0.96},${h * 0.95}`,

    // ─── BOTTOM EDGE: gentle wave right → left (y stays 92–99%) ───
    `C ${w * 0.97},${h * 0.99} ${w * 0.85},${h * 0.94} ${w * 0.72},${h * 0.97}`,
    `C ${w * 0.58},${h * 1.00} ${w * 0.44},${h * 0.93} ${w * 0.30},${h * 0.97}`,
    `C ${w * 0.18},${h * 1.01} ${w * 0.08},${h * 0.95} ${w * 0.03},${h * 0.92}`,

    // ─── LEFT EDGE: gentle wave up (x stays 1–7%) ───
    `C ${w * -0.01},${h * 0.82} ${w * 0.06},${h * 0.72} ${w * 0.03},${h * 0.62}`,
    `C ${w * 0.00},${h * 0.52} ${w * 0.07},${h * 0.42} ${w * 0.03},${h * 0.32}`,
    `C ${w * -0.01},${h * 0.22} ${w * 0.06},${h * 0.14} ${w * 0.03},${h * 0.06}`,
  ].join(' ');

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-[2] opacity-0"
    >
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        fill="none"
        className="absolute inset-0"
      >
        {/* Invisible reference path */}
        <path ref={pathRef} d={pathD} stroke="none" fill="none" />
      </svg>

      {/* ═══ Shooting star (80x80) ═══ */}
      <div
        ref={starRef}
        className="absolute left-0 top-0"
        style={{ willChange: 'transform' }}
      >
        <div className="relative" style={{ width: 80, height: 80 }}>
          {/* ── Shooting tail: sharp bright core ── */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              right: '100%',
              width: 220,
              height: 6,
              background:
                'linear-gradient(to left, rgba(33,150,243,0.9), rgba(100,181,246,0.5) 25%, rgba(144,202,249,0.15) 55%, transparent)',
              filter: 'blur(1.5px)',
              borderRadius: '0 6px 6px 0',
            }}
          />
          {/* ── Shooting tail: wide soft glow ── */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              right: '100%',
              width: 180,
              height: 28,
              background:
                'linear-gradient(to left, rgba(33,150,243,0.35), rgba(100,181,246,0.12) 40%, transparent)',
              filter: 'blur(10px)',
              borderRadius: '0 14px 14px 0',
            }}
          />
          {/* ── Shooting tail: outer haze ── */}
          <div
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              right: '100%',
              width: 120,
              height: 44,
              background:
                'linear-gradient(to left, rgba(33,150,243,0.12), transparent)',
              filter: 'blur(16px)',
              borderRadius: '0 20px 20px 0',
            }}
          />

          {/* ── Sparkle particles ── */}
          {SPARKLES.map((s, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: 40 + s.x - s.size / 2,
                top: 40 + s.y - s.size / 2,
                width: s.size,
                height: s.size,
                background:
                  'radial-gradient(circle, #FFFFFF 20%, #64B5F6 60%, transparent 100%)',
                boxShadow: `0 0 ${s.size * 2}px rgba(33,150,243,0.6), 0 0 ${s.size * 4}px rgba(33,150,243,0.3)`,
                animation: `shooting-sparkle ${s.dur}s ease-in-out infinite`,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}

          {/* ── Ambient glow behind star ── */}
          <div
            className="absolute"
            style={{
              inset: -24,
              background:
                'radial-gradient(circle, rgba(33,150,243,0.35) 0%, rgba(100,181,246,0.12) 35%, transparent 70%)',
              filter: 'blur(12px)',
            }}
          />

          {/* ── 3D Star SVG ── */}
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            className="relative"
          >
            <defs>
              {/* 3D body: lit from top-left */}
              <linearGradient
                id="starBody3d"
                x1="0.15"
                y1="0.1"
                x2="0.85"
                y2="0.9"
              >
                <stop offset="0%" stopColor="#E3F2FD" />
                <stop offset="25%" stopColor="#90CAF9" />
                <stop offset="55%" stopColor="#2196F3" />
                <stop offset="85%" stopColor="#1565C0" />
                <stop offset="100%" stopColor="#0D47A1" />
              </linearGradient>
              {/* Inner facet shine */}
              <linearGradient
                id="starFacet"
                x1="0.3"
                y1="0"
                x2="0.7"
                y2="1"
              >
                <stop offset="0%" stopColor="#BBDEFB" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#42A5F5" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#1976D2" stopOpacity="0.7" />
              </linearGradient>
              {/* Edge rim light */}
              <linearGradient
                id="starRim"
                x1="0"
                y1="0.3"
                x2="1"
                y2="0.7"
              >
                <stop offset="0%" stopColor="#E3F2FD" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#64B5F6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#E3F2FD" stopOpacity="0.5" />
              </linearGradient>
              {/* Radial aura */}
              <radialGradient id="starAura3d" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.7" />
                <stop offset="30%" stopColor="#64B5F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2196F3" stopOpacity="0" />
              </radialGradient>
              {/* Filters */}
              <filter id="starEdge">
                <feGaussianBlur stdDeviation="0.5" />
              </filter>
              <filter
                id="star3dShadow"
                x="-25%"
                y="-25%"
                width="150%"
                height="150%"
              >
                <feDropShadow
                  dx="2"
                  dy="3"
                  stdDeviation="3"
                  floodColor="#0D47A1"
                  floodOpacity="0.45"
                />
              </filter>
              <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
              </filter>
            </defs>

            {/* Outer glow halo */}
            <circle cx="40" cy="40" r="34" fill="url(#starAura3d)" />

            {/* Glow copy of star (blurred) for bloom effect */}
            <polygon
              points="40,2 47,30 76,40 47,50 40,78 33,50 4,40 33,30"
              fill="#2196F3"
              opacity="0.25"
              filter="url(#starGlow)"
            />

            {/* Back shadow — offset for 3D depth */}
            <polygon
              points="40,4 46,30 74,40 46,50 40,76 34,50 6,40 34,30"
              fill="#0D47A1"
              opacity="0.3"
              transform="translate(2,2.5)"
              filter="url(#starEdge)"
            />

            {/* Main star body */}
            <polygon
              points="40,4 46,30 74,40 46,50 40,76 34,50 6,40 34,30"
              fill="url(#starBody3d)"
              stroke="url(#starRim)"
              strokeWidth="0.6"
              filter="url(#star3dShadow)"
            />

            {/* Inner facet overlay — smaller star for 3D depth */}
            <polygon
              points="40,14 44,32 62,40 44,48 40,66 36,48 18,40 36,32"
              fill="url(#starFacet)"
              opacity="0.55"
            />

            {/* Bright inner core */}
            <circle cx="40" cy="40" r="7" fill="#BBDEFB" opacity="0.7" />
            <circle cx="40" cy="40" r="4" fill="#E3F2FD" opacity="0.85" />
            <circle cx="40" cy="40" r="2" fill="#FFFFFF" opacity="0.95" />

            {/* Specular highlight — top-left (main light source) */}
            <ellipse
              cx="34"
              cy="31"
              rx="5"
              ry="3.5"
              fill="#FFFFFF"
              opacity="0.5"
              transform="rotate(-25,34,31)"
            />

            {/* Secondary specular — bottom-right rim */}
            <ellipse
              cx="48"
              cy="50"
              rx="3"
              ry="2"
              fill="#BBDEFB"
              opacity="0.3"
              transform="rotate(30,48,50)"
            />

            {/* Tiny catch-light dots on star points */}
            <circle cx="40" cy="8" r="1.2" fill="#FFFFFF" opacity="0.6" />
            <circle cx="70" cy="40" r="1" fill="#E3F2FD" opacity="0.4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
