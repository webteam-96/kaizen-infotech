'use client';

import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, registerGSAPPlugins, ScrollTrigger } from '@/lib/animations/gsap-setup';

/* ── Helpers ── */
const C = (v: number) => Math.max(0, Math.min(1, v));
const ss = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ── Section time ranges (scroll progress) ── */
const T: Record<string, [number, number]> = {
  s1: [0, 0.14], s2: [0.16, 0.30], s3: [0.32, 0.48],
  s4: [0.50, 0.66], s5: [0.68, 0.84], s6: [0.86, 1],
};

const S1_TEXT = 'Nothing changes\novernight.';

/* ── Deterministic particle data (avoids SSR hydration mismatch) ── */
function seededRand(seed: number) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
const PARTICLES = Array.from({ length: 35 }, (_, i) => ({
  id: i,
  left: `${seededRand(i) * 100}%`,
  top: `${seededRand(i + 100) * 100}%`,
  size: 1 + seededRand(i + 200) * 2,
  speed: 0.3 + seededRand(i + 300) * 0.7,
  phase: seededRand(i + 400) * Math.PI * 2,
}));

/* ══════════════════════════════════════════════════════════════════
   ScrollStory — 6-section scroll-driven narrative
   ══════════════════════════════════════════════════════════════════ */
export function ScrollStory() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const s1typedRef = useRef<HTMLSpanElement>(null);
  const s4pxRef = useRef<HTMLSpanElement>(null);
  const s4seoRef = useRef<HTMLDivElement>(null);
  const s4convRef = useRef<HTMLDivElement>(null);
  const s4perfRef = useRef<HTMLDivElement>(null);
  const s5loadRef = useRef<HTMLDivElement>(null);
  const s5trafficRef = useRef<HTMLDivElement>(null);
  const s5scoreRef = useRef<HTMLDivElement>(null);

  registerGSAPPlugins();

  useGSAP(() => {
    if (!sectionRef.current) return;
    const root = sectionRef.current;
    const el = (n: string) => root.querySelector(`[data-el="${n}"]`) as HTMLElement | null;

    const sec1 = el('sec1'), sec2 = el('sec2'), sec3 = el('sec3');
    const sec4 = el('sec4'), sec5 = el('sec5'), sec6 = el('sec6');
    const s1par = el('s1par'), s1obj = el('s1obj'), s1cursor = el('s1cursor');
    const s2par = el('s2par'), s2c1 = el('s2c1'), s2c2 = el('s2c2'), s2c3 = el('s2c3'), s2text = el('s2text');
    const s3par = el('s3par'), s3c1 = el('s3c1'), s3c2 = el('s3c2'), s3c3 = el('s3c3'), s3w1 = el('s3w1'), s3w2 = el('s3w2');
    const s4par = el('s4par'), s4p1 = el('s4p1'), s4p2 = el('s4p2'), s4err = el('s4err'), s4fix = el('s4fix');
    const s4b1 = el('s4b1'), s4b2 = el('s4b2'), s4b3 = el('s4b3'), s4text = el('s4text');
    const s5par = el('s5par'), s5dash = el('s5dash'), s5b1 = el('s5b1'), s5b2 = el('s5b2'), s5b3 = el('s5b3'), s5text = el('s5text');
    const s6par = el('s6par'), s6title = el('s6title'), s6line = el('s6line'), s6sub = el('s6sub'), s6tag = el('s6tag');
    const orb1 = el('orb1'), orb2 = el('orb2'), orb3 = el('orb3');
    const pLine = el('pLine');
    const particleEls = Array.from(root.querySelectorAll('[data-particle]')) as HTMLElement[];

    /* Mouse tracking with smooth interpolation */
    let mouseX = 0, mouseY = 0, tMX = 0, tMY = 0;
    const onMouse = (e: MouseEvent) => {
      tMX = (e.clientX / window.innerWidth - 0.5) * 2;
      tMY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    document.addEventListener('mousemove', onMouse);
    let rafId: number;
    const tick = () => {
      mouseX += (tMX - mouseX) * 0.06;
      mouseY += (tMY - mouseY) * 0.06;
      rafId = requestAnimationFrame(tick);
    };
    tick();

    /* Section helpers */
    function sT(p: number, k: string) {
      const r = T[k]; return C((p - r[0]) / (r[1] - r[0]));
    }
    function sF(p: number, k: string) {
      const r = T[k], d = r[1] - r[0];
      return Math.min(C((p - r[0]) / (d * 0.1)), C((r[1] - p) / (d * 0.2)));
    }

    let time = 0;

    function render(p: number) {
      time += 0.016;
      if (pLine) pLine.style.height = `${p * 100}%`;

      /* Particles */
      particleEls.forEach((pe, i) => {
        const pd = PARTICLES[i];
        pe.style.opacity = p > 0.005 && p < 0.98
          ? String(0.03 + Math.sin(time * pd.speed + pd.phase) * 0.03)
          : '0';
        pe.style.transform = `translateY(${Math.sin(time * 0.5 + pd.phase) * 20}px)`;
      });

      /* Orbs */
      gsap.to(orb1, { x: mouseX * 30, y: mouseY * 30, duration: 1, overwrite: true });
      gsap.to(orb2, { x: -mouseX * 20, y: -mouseY * 25, duration: 1, overwrite: true });
      gsap.to(orb3, { x: mouseX * 15, y: mouseY * 20, duration: 1, overwrite: true });

      /* ═══ S1 — Typewriter ═══ */
      const f1 = sF(p, 's1'), t1 = sT(p, 's1');
      gsap.to(sec1, { opacity: f1, duration: 0.2, overwrite: true });
      gsap.to(s1par, { rotateY: mouseX * 3, rotateX: -mouseY * 3, duration: 0.5, overwrite: true });
      if (s1typedRef.current) {
        s1typedRef.current.innerHTML = S1_TEXT.substring(0, Math.floor(ss(C(t1 / 0.45)) * S1_TEXT.length)).replace(/\n/g, '<br>');
      }
      if (s1cursor) s1cursor.style.opacity = f1 > 0.1 ? '1' : '0';
      gsap.to(s1obj, { opacity: lerp(0, 0.6, ss(t1)), scale: lerp(0.5, 1, ss(t1)), duration: 0.4, overwrite: true });

      /* ═══ S2 — Friction ═══ */
      const f2 = sF(p, 's2'), t2 = sT(p, 's2'), c2 = ss(C(t2 / 0.5));
      gsap.to(sec2, { opacity: f2, duration: 0.2, overwrite: true });
      gsap.to(s2par, { rotateY: mouseX * 4, rotateX: -mouseY * 3, duration: 0.5, overwrite: true });
      gsap.to(s2c1, { rotateY: mouseX * 8, rotateX: -mouseY * 6, y: lerp(20, 0, c2), opacity: lerp(0, 1, c2), duration: 0.4, overwrite: true });
      gsap.to(s2c2, { rotateY: mouseX * 8, rotateX: -mouseY * 6, y: lerp(30, 0, c2), opacity: lerp(0, 1, c2 * 0.9), duration: 0.4, overwrite: true });
      gsap.to(s2c3, { rotateY: mouseX * 8, rotateX: -mouseY * 6, y: lerp(40, 0, c2), opacity: lerp(0, 1, c2 * 0.8), duration: 0.4, overwrite: true });
      const s2tO = ss(C((t2 - 0.4) / 0.25));
      gsap.to(s2text, { opacity: s2tO, y: lerp(20, 0, s2tO), filter: `blur(${lerp(6, 0, s2tO).toFixed(1)}px)`, duration: 0.3, overwrite: true });

      /* ═══ S3 — Improvement ═══ */
      const f3 = sF(p, 's3'), t3 = sT(p, 's3'), c3 = ss(C(t3 / 0.45));
      gsap.to(sec3, { opacity: f3, duration: 0.2, overwrite: true });
      gsap.to(s3par, { rotateY: mouseX * 4, rotateX: -mouseY * 3, duration: 0.5, overwrite: true });
      gsap.to(s3c1, { rotateY: mouseX * 8, rotateX: -mouseY * 6, y: lerp(20, 0, c3), opacity: c3, borderColor: `rgba(33,150,243,${lerp(0, 0.3, c3).toFixed(2)})`, boxShadow: `0 8px 32px rgba(0,0,0,.08), 0 0 ${lerp(0, 20, c3).toFixed(0)}px rgba(33,150,243,${lerp(0, 0.08, c3).toFixed(2)})`, duration: 0.4, overwrite: true });
      gsap.to(s3c2, { rotateY: mouseX * 8, rotateX: -mouseY * 6, y: lerp(25, 0, c3), opacity: c3 * 0.95, borderColor: `rgba(33,150,243,${lerp(0, 0.2, c3).toFixed(2)})`, duration: 0.4, overwrite: true });
      gsap.to(s3c3, { rotateY: mouseX * 8, rotateX: -mouseY * 6, y: lerp(30, 0, c3), opacity: c3 * 0.9, borderColor: `rgba(33,150,243,${lerp(0, 0.2, c3).toFixed(2)})`, duration: 0.4, overwrite: true });
      gsap.to(s3w1, { opacity: ss(C((t3 - 0.3) / 0.2)), y: lerp(14, 0, ss(C((t3 - 0.3) / 0.2))), duration: 0.3, overwrite: true });
      gsap.to(s3w2, { opacity: ss(C((t3 - 0.55) / 0.2)), y: lerp(14, 0, ss(C((t3 - 0.55) / 0.2))), duration: 0.3, overwrite: true });

      /* ═══ S4 — Developer + Designer ═══ */
      const f4 = sF(p, 's4'), t4 = sT(p, 's4');
      gsap.to(sec4, { opacity: f4, duration: 0.2, overwrite: true });
      gsap.to(s4par, { rotateY: mouseX * 2, rotateX: -mouseY * 2, duration: 0.5, overwrite: true });
      gsap.to(s4p1, { rotateY: mouseX * 5, rotateX: -mouseY * 4, duration: 0.5, overwrite: true });
      gsap.to(s4p2, { rotateY: mouseX * 5, rotateX: -mouseY * 4, duration: 0.5, overwrite: true });
      const c4 = ss(C(t4 / 0.35));
      gsap.to(s4err, { opacity: lerp(1, 0.2, c4), duration: 0.3, overwrite: true });
      gsap.to(s4fix, { opacity: c4, duration: 0.3, overwrite: true });
      gsap.to(s4p1, { borderColor: `rgba(33,150,243,${lerp(0.03, 0.12, c4).toFixed(2)})`, duration: 0.3, overwrite: true });
      const d4 = ss(C((t4 - 0.15) / 0.3));
      gsap.to(s4b1, { x: lerp(6, 0, d4), borderColor: `rgba(135,206,235,${lerp(0, 0.25, d4).toFixed(2)})`, duration: 0.3, overwrite: true });
      if (s4pxRef.current) s4pxRef.current.textContent = `${Math.round(lerp(16, 12, d4))}px`;
      gsap.to(s4b2, { width: lerp(140, 170, d4), borderColor: `rgba(135,206,235,${lerp(0, 0.2, d4).toFixed(2)})`, duration: 0.3, overwrite: true });
      gsap.to(s4b3, { x: lerp(-4, 0, d4), borderColor: `rgba(135,206,235,${lerp(0, 0.2, d4).toFixed(2)})`, duration: 0.3, overwrite: true });
      const m4 = ss(C((t4 - 0.25) / 0.45));
      if (s4seoRef.current) s4seoRef.current.textContent = `#${Math.round(lerp(23, 11, m4))}`;
      if (s4convRef.current) s4convRef.current.textContent = `${lerp(2.1, 3.2, m4).toFixed(1)}%`;
      if (s4perfRef.current) s4perfRef.current.textContent = String(Math.round(lerp(68, 96, m4)));
      const mg = `linear-gradient(135deg,rgba(33,150,243,${lerp(0.3, 1, m4).toFixed(2)}),rgba(135,206,235,${lerp(0.2, 0.8, m4).toFixed(2)}))`;
      [s4seoRef.current, s4convRef.current, s4perfRef.current].forEach((e) => {
        if (!e) return;
        e.style.background = mg;
        e.style.webkitBackgroundClip = 'text';
        (e.style as unknown as Record<string, string>).webkitTextFillColor = 'transparent';
        e.style.backgroundClip = 'text';
      });
      const s4tO = ss(C((t4 - 0.58) / 0.2));
      gsap.to(s4text, { opacity: s4tO, y: lerp(14, 0, s4tO), filter: `blur(${lerp(4, 0, s4tO).toFixed(1)}px)`, duration: 0.3, overwrite: true });

      /* ═══ S5 — Dashboard ═══ */
      const f5 = sF(p, 's5'), t5 = sT(p, 's5');
      gsap.to(sec5, { opacity: f5, duration: 0.2, overwrite: true });
      gsap.to(s5par, { rotateY: mouseX * 2, rotateX: -mouseY * 2, duration: 0.5, overwrite: true });
      gsap.to(s5dash, { rotateY: mouseX * 4, rotateX: -mouseY * 3, boxShadow: `0 20px 60px rgba(0,0,0,.08), 0 0 ${lerp(0, 40, ss(t5)).toFixed(0)}px rgba(33,150,243,${lerp(0, 0.04, ss(t5)).toFixed(2)})`, borderColor: `rgba(33,150,243,${lerp(0.03, 0.1, ss(t5)).toFixed(2)})`, duration: 0.5, overwrite: true });
      const c5 = ss(C(t5 / 0.6));
      if (s5loadRef.current) s5loadRef.current.textContent = `${lerp(3.2, 1.4, c5).toFixed(1)}s`;
      if (s5trafficRef.current) s5trafficRef.current.textContent = `${lerp(1.2, 8.7, c5).toFixed(1)}k`;
      if (s5scoreRef.current) s5scoreRef.current.textContent = String(Math.round(lerp(71, 97, c5)));
      gsap.to(s5b1, { width: `${c5 * 92}%`, duration: 0.3, overwrite: true });
      gsap.to(s5b2, { width: `${c5 * 87}%`, duration: 0.3, overwrite: true });
      gsap.to(s5b3, { width: `${c5 * 97}%`, duration: 0.3, overwrite: true });
      const s5tO = ss(C((t5 - 0.5) / 0.2));
      gsap.to(s5text, { opacity: s5tO, y: lerp(14, 0, s5tO), filter: `blur(${lerp(4, 0, s5tO).toFixed(1)}px)`, duration: 0.3, overwrite: true });

      /* ═══ S6 — Kaizen Finale ═══ */
      const t6 = sT(p, 's6'), i6 = C((p - T.s6[0]) / (0.14 * 0.12));
      gsap.to(sec6, { opacity: i6, duration: 0.2, overwrite: true });
      gsap.to(s6par, { rotateY: mouseX * 2, rotateX: -mouseY * 2, duration: 0.5, overwrite: true });
      const tt = ss(C(t6 / 0.25));
      gsap.to(s6title, { opacity: tt, y: lerp(30, 0, tt), scale: lerp(0.9, 1, tt), filter: `blur(${lerp(8, 0, tt).toFixed(1)}px)`, rotateX: lerp(15, 0, tt), duration: 0.4, overwrite: true });
      gsap.to(s6line, { opacity: ss(C((t6 - 0.18) / 0.15)), scaleX: ss(C((t6 - 0.18) / 0.15)), duration: 0.3, overwrite: true });
      gsap.to(s6sub, { opacity: ss(C((t6 - 0.28) / 0.2)) * 0.6, y: lerp(14, 0, ss(C((t6 - 0.28) / 0.2))), duration: 0.4, overwrite: true });
      gsap.to(s6tag, { opacity: ss(C((t6 - 0.5) / 0.25)), y: lerp(14, 0, ss(C((t6 - 0.5) / 0.25))), scale: lerp(0.95, 1, ss(C((t6 - 0.5) / 0.25))), duration: 0.4, overwrite: true });
      const eg = ss(C((t6 - 0.3) / 0.5));
      gsap.to(orb1, { opacity: lerp(0.1, 0.25, eg), duration: 0.5, overwrite: true });
      gsap.to(orb2, { opacity: lerp(0.08, 0.2, eg), duration: 0.5, overwrite: true });
      gsap.to(orb3, { opacity: lerp(0.06, 0.15, eg), duration: 0.5, overwrite: true });
    }

    ScrollTrigger.create({
      trigger: root,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0,
      onUpdate: (self) => render(self.progress),
    });
    render(0);

    return () => {
      document.removeEventListener('mousemove', onMouse);
      cancelAnimationFrame(rafId);
    };
  }, { scope: sectionRef, dependencies: [] });

  /* ═══════════════════ JSX ═══════════════════ */
  return (
    <div ref={sectionRef} style={{ height: '2800vh' }} className="relative">
      <div
        className="sticky top-0 flex h-screen w-screen items-center justify-center overflow-hidden bg-[var(--color-bg-primary)]"
        style={{ perspective: 1200 }}
      >
        {/* Grain */}
        <div
          className="pointer-events-none absolute inset-0 z-[9999] opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px',
          }}
        />

        {/* Progress line */}
        <div
          data-el="pLine"
          className="absolute left-0 top-0 z-[100] w-0.5 opacity-50"
          style={{ height: '0%', background: 'linear-gradient(to bottom,transparent,var(--color-accent-primary),var(--color-accent-secondary),var(--color-accent-warm),transparent)' }}
        />

        {/* Orbs */}
        <div data-el="orb1" className="pointer-events-none absolute rounded-full" style={{ width: 500, height: 500, background: 'rgba(33,150,243,.15)', top: '10%', left: '20%', filter: 'blur(100px)' }} />
        <div data-el="orb2" className="pointer-events-none absolute rounded-full" style={{ width: 400, height: 400, background: 'rgba(135,206,235,.12)', bottom: '20%', right: '15%', filter: 'blur(100px)' }} />
        <div data-el="orb3" className="pointer-events-none absolute rounded-full" style={{ width: 350, height: 350, background: 'rgba(192,0,0,.08)', top: '50%', left: '60%', filter: 'blur(100px)' }} />

        {/* Particles */}
        {PARTICLES.map((p) => (
          <div key={p.id} data-particle className="pointer-events-none absolute rounded-full bg-[var(--color-text-primary)] opacity-0" style={{ left: p.left, top: p.top, width: p.size, height: p.size }} />
        ))}

        {/* ═══ Section 1 — Typewriter ═══ */}
        <div data-el="sec1" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0" style={{ transformStyle: 'preserve-3d' }}>
          <div data-el="s1par" className="text-center" style={{ transformStyle: 'preserve-3d' }}>
            <div data-el="s1obj" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.12]" style={{ width: 300, height: 300, transformStyle: 'preserve-3d' }}>
              <div className="absolute inset-0 rounded-full border-[1.5px] border-[var(--color-accent-primary)]" />
              <div className="absolute inset-0 rounded-full border-[1.5px] border-[var(--color-accent-secondary)]" style={{ transform: 'rotateX(60deg)' }} />
              <div className="absolute inset-0 rounded-full border-[1.5px] border-[var(--color-accent-warm)]" style={{ transform: 'rotateY(60deg)' }} />
            </div>
            <div
              className="relative z-10"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 6vw, 80px)',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                background: 'linear-gradient(135deg, var(--color-text-primary) 0%, var(--color-accent-primary) 50%, var(--color-accent-secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 40px rgba(33,150,243,.1))',
              }}
            >
              <span ref={s1typedRef} />
              <span
                data-el="s1cursor"
                className="inline-block align-text-bottom"
                style={{ width: 3, height: '0.9em', background: 'var(--color-accent-primary)', marginLeft: 6, boxShadow: '0 0 12px var(--color-accent-primary)', animation: 'cursor-blink 1s step-end infinite' }}
              />
            </div>
          </div>
        </div>

        {/* ═══ Section 2 — Friction ═══ */}
        <div data-el="sec2" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0" style={{ transformStyle: 'preserve-3d' }}>
          <div data-el="s2par" className="flex flex-col items-center gap-12" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12" style={{ perspective: 800 }}>
              <div data-el="s2c1" className="flex h-[170px] w-[130px] flex-col items-center justify-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] sm:h-[200px] sm:w-[160px]" style={{ transformStyle: 'preserve-3d' }}>
                <div className="text-4xl grayscale opacity-40">&#128312;</div>
                <div className="text-[10px] font-medium uppercase tracking-[2px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Button</div>
                <div className="text-[9px] text-[var(--color-text-tertiary)] opacity-50" style={{ fontFamily: 'var(--font-mono)' }}>misaligned</div>
              </div>
              <div data-el="s2c2" className="flex h-[170px] w-[130px] flex-col items-center justify-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] sm:h-[200px] sm:w-[160px]" style={{ transformStyle: 'preserve-3d' }}>
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-text-tertiary)]" style={{ animationDuration: '3.5s' }} />
                <div className="text-[10px] font-medium uppercase tracking-[2px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Loading</div>
                <div className="text-[9px] text-[var(--color-text-tertiary)] opacity-50" style={{ fontFamily: 'var(--font-mono)' }}>3.2s</div>
              </div>
              <div data-el="s2c3" className="flex h-[170px] w-[130px] flex-col items-center justify-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] sm:h-[200px] sm:w-[160px]" style={{ transformStyle: 'preserve-3d' }}>
                <svg width="200" height="80" viewBox="0 0 200 80" className="w-[130px] sm:w-[160px]">
                  <path d="M10,50 Q50,49 100,50 T190,49" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="text-[10px] font-medium uppercase tracking-[2px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Analytics</div>
              </div>
            </div>
            <div data-el="s2text" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 900, textAlign: 'center', background: 'linear-gradient(135deg, rgba(0,0,0,.5), rgba(0,0,0,.2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              But everything has friction.
            </div>
          </div>
        </div>

        {/* ═══ Section 3 — Improvement ═══ */}
        <div data-el="sec3" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0" style={{ transformStyle: 'preserve-3d' }}>
          <div data-el="s3par" className="flex flex-col items-center gap-12" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12" style={{ perspective: 800 }}>
              <div data-el="s3c1" className="flex h-[170px] w-[130px] flex-col items-center justify-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] sm:h-[200px] sm:w-[160px]" style={{ transformStyle: 'preserve-3d' }}>
                <div className="text-4xl">&#9989;</div>
                <div className="text-[10px] font-medium uppercase tracking-[2px] text-[var(--color-accent-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>Aligned</div>
              </div>
              <div data-el="s3c2" className="flex h-[170px] w-[130px] flex-col items-center justify-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] sm:h-[200px] sm:w-[160px]" style={{ transformStyle: 'preserve-3d' }}>
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent-primary)]" style={{ animationDuration: '1s' }} />
                <div className="text-[10px] font-medium uppercase tracking-[2px] text-[var(--color-accent-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>Fast</div>
              </div>
              <div data-el="s3c3" className="flex h-[170px] w-[130px] flex-col items-center justify-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] sm:h-[200px] sm:w-[160px]" style={{ transformStyle: 'preserve-3d' }}>
                <svg width="200" height="80" viewBox="0 0 200 80" className="w-[130px] sm:w-[160px]">
                  <path d="M10,55 Q50,50 100,40 T190,20" fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <div className="text-[10px] font-medium uppercase tracking-[2px] text-[var(--color-accent-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>Growing</div>
              </div>
            </div>
            <div className="text-center" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 900, lineHeight: 1.4 }}>
              <span data-el="s3w1" style={{ background: 'linear-gradient(135deg, var(--color-text-primary), var(--color-accent-primary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                One improvement.
              </span>
              <span data-el="s3w2" className="block opacity-0" style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Measured.
              </span>
            </div>
          </div>
        </div>

        {/* ═══ Section 4 — Developer + Designer ═══ */}
        <div data-el="sec4" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0" style={{ transformStyle: 'preserve-3d' }}>
          <div data-el="s4par" className="flex w-[min(92vw,960px)] flex-col items-center gap-9" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex w-full flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8" style={{ perspective: 1000 }}>
              {/* Developer */}
              <div data-el="s4p1" className="w-full max-w-[420px] overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 sm:flex-1" style={{ transformStyle: 'preserve-3d' }}>
                <div className="mb-4 text-[10px] font-bold uppercase tracking-[3px] text-[var(--color-accent-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>Developer</div>
                <div className="text-xs leading-8 text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)', whiteSpace: 'pre' }}>
                  <span data-el="s4err" style={{ color: '#e07070', textDecorationLine: 'line-through', textDecorationStyle: 'wavy', textDecorationColor: 'rgba(224,112,112,.35)' }}>{'if(data = null){'}</span>{'\n'}<span data-el="s4fix" className="font-medium opacity-0" style={{ color: 'var(--color-accent-primary)' }}>{'if(data === null) {'}</span>{'\n'}{'  return optimize(\n    response\n  );\n}'}
                </div>
              </div>
              {/* Designer */}
              <div data-el="s4p2" className="w-full max-w-[420px] overflow-hidden rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 sm:flex-1" style={{ transformStyle: 'preserve-3d' }}>
                <div className="mb-4 text-[10px] font-bold uppercase tracking-[3px] text-[var(--color-accent-secondary)]" style={{ fontFamily: 'var(--font-mono)' }}>Designer</div>
                <div className="flex flex-col gap-3.5">
                  <div className="flex items-center gap-3">
                    <div data-el="s4b1" className="h-8 rounded-md border border-[var(--color-border)] bg-[rgba(0,0,0,.02)]" style={{ width: 80 }} />
                    <span className="whitespace-nowrap text-[10px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>padding: <span ref={s4pxRef}>16px</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div data-el="s4b2" className="h-2 rounded-sm border border-[var(--color-border)] bg-[rgba(0,0,0,.02)]" style={{ width: 140 }} />
                    <span className="whitespace-nowrap text-[10px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>grid aligned</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div data-el="s4b3" className="h-6 rounded-md border border-[var(--color-border)] bg-[rgba(0,0,0,.02)]" style={{ width: 60 }} />
                    <span className="whitespace-nowrap text-[10px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>balanced</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Metrics */}
            <div className="flex flex-wrap justify-center gap-10">
              <div className="text-center">
                <div ref={s4seoRef} className="text-[34px] font-bold tracking-[-2px]" style={{ fontFamily: 'var(--font-mono)' }}>#23</div>
                <div className="mt-1.5 text-[9px] uppercase tracking-[3px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>SEO Rank</div>
              </div>
              <div className="text-center">
                <div ref={s4convRef} className="text-[34px] font-bold tracking-[-2px]" style={{ fontFamily: 'var(--font-mono)' }}>2.1%</div>
                <div className="mt-1.5 text-[9px] uppercase tracking-[3px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Conversion</div>
              </div>
              <div className="text-center">
                <div ref={s4perfRef} className="text-[34px] font-bold tracking-[-2px]" style={{ fontFamily: 'var(--font-mono)' }}>68</div>
                <div className="mt-1.5 text-[9px] uppercase tracking-[3px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Perf Score</div>
              </div>
            </div>
            <div data-el="s4text" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 3.8vw, 48px)', fontWeight: 900, background: 'linear-gradient(135deg, var(--color-text-primary), var(--color-accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Then another. Then another.
            </div>
          </div>
        </div>

        {/* ═══ Section 5 — Dashboard ═══ */}
        <div data-el="sec5" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0" style={{ transformStyle: 'preserve-3d' }}>
          <div data-el="s5par" className="flex w-[min(92vw,760px)] flex-col items-center gap-10" style={{ transformStyle: 'preserve-3d' }}>
            <div data-el="s5dash" className="w-full overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8" style={{ transformStyle: 'preserve-3d' }}>
              <div className="mb-7 flex flex-wrap justify-center gap-10">
                <div className="flex-1 text-center">
                  <div ref={s5loadRef} className="text-4xl font-bold tracking-[-2px] text-[var(--color-accent-primary)]" style={{ fontFamily: 'var(--font-mono)' }}>3.2s</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[3px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Load Time</div>
                </div>
                <div className="flex-1 text-center">
                  <div ref={s5trafficRef} className="text-4xl font-bold tracking-[-2px] text-[var(--color-accent-secondary)]" style={{ fontFamily: 'var(--font-mono)' }}>1.2k</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[3px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Traffic</div>
                </div>
                <div className="flex-1 text-center">
                  <div ref={s5scoreRef} className="text-4xl font-bold tracking-[-2px] text-[var(--color-accent-warm)]" style={{ fontFamily: 'var(--font-mono)' }}>71</div>
                  <div className="mt-1 text-[9px] uppercase tracking-[3px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Quality</div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-20 text-right text-[9px] uppercase tracking-[2px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Speed</div>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]"><div data-el="s5b1" className="h-full w-0 rounded-full" style={{ background: 'linear-gradient(90deg, var(--color-accent-primary), rgba(33,150,243,.4))' }} /></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 text-right text-[9px] uppercase tracking-[2px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Traffic</div>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]"><div data-el="s5b2" className="h-full w-0 rounded-full" style={{ background: 'linear-gradient(90deg, var(--color-accent-secondary), rgba(135,206,235,.4))' }} /></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 text-right text-[9px] uppercase tracking-[2px] text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)' }}>Quality</div>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]"><div data-el="s5b3" className="h-full w-0 rounded-full" style={{ background: 'linear-gradient(90deg, var(--color-accent-warm), rgba(192,0,0,.4))' }} /></div>
                </div>
              </div>
            </div>
            <div data-el="s5text" className="text-center" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 52px)', fontWeight: 900, background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary), var(--color-accent-warm))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 30px rgba(33,150,243,.08))' }}>
              Small improvements. Compounded.
            </div>
          </div>
        </div>

        {/* ═══ Section 6 — Kaizen Finale ═══ */}
        <div data-el="sec6" className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0" style={{ transformStyle: 'preserve-3d' }}>
          <div data-el="s6par" className="flex flex-col items-center" style={{ transformStyle: 'preserve-3d' }}>
            <div data-el="s6title" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px, 8vw, 120px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, background: 'linear-gradient(135deg, var(--color-text-primary) 20%, var(--color-accent-primary) 50%, var(--color-accent-secondary) 75%, var(--color-accent-warm) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', filter: 'drop-shadow(0 0 60px rgba(33,150,243,.08))' }}>
              This is Kaizen.
            </div>
            <div data-el="s6line" className="mt-8" style={{ width: 60, height: 1, background: 'linear-gradient(90deg, transparent, var(--color-accent-primary), transparent)' }} />
            <div data-el="s6sub" className="mt-7 text-[var(--color-text-tertiary)]" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 5, textTransform: 'uppercase' }}>
              Custom Software{'\u00A0\u00B7\u00A0'}SEO{'\u00A0\u00B7\u00A0'}Marketing
            </div>
            <div data-el="s6tag" className="mt-11 opacity-0" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 3vw, 36px)', fontWeight: 700, fontStyle: 'italic', background: 'linear-gradient(135deg, var(--color-accent-primary), var(--color-accent-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Built to Evolve.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
