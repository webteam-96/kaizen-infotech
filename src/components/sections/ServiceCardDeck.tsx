'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { services } from '@/content/services';
import { CapabilityBackdrop } from '@/components/shared/CapabilityBackdrop';
import { useLenis } from '@/components/layout/SmoothScroll';

// ─────────────────────────────────────────────────────────────────────────────
// Capabilities — 3D ORBIT carousel with a timed, scroll-locked stepper.
//
// Cards sit on a ring (cylinder). Only the CENTRED card is shown (the sides are
// hidden). When the section reaches the viewport it PINS and plays a one-card-at-
// a-time sequence: each card rotates to centre and is HELD for 0.5s before the next
// scroll input can advance it. Because advancement is time-gated and one step at
// a time, a fast flick can never fling cards past — every card gets its pause at
// centre. After the last card (or before the first), the pin releases and normal
// scroll resumes. The front card opens its detail panel on click; the dots jump.
//
// Under prefers-reduced-motion (no Lenis) there is NO scroll lock — a position-
// based dwell map drives the ring off scroll position instead. Pure React + CSS
// 3D transforms. Brand: light-blue accents on the ink surface.
// ─────────────────────────────────────────────────────────────────────────────

// Card highlight accent — a single light blue (the brand on-ink light blue) for
// EVERY card, so capabilities are highlighted in light blue only (no red/dark-blue).
const ACCENTS = ['#5AB6F7', '#5AB6F7', '#5AB6F7', '#5AB6F7', '#5AB6F7'];
const TAGS = ['Software', 'Mobile', 'Events', 'Web Portals', 'Marketing'];

const CARDS = services.map((s, i) => ({
  id: s.id,
  slug: s.slug,
  icon: s.icon,
  label: String(i + 1).padStart(2, '0'),
  title: s.title,
  tag: TAGS[i] ?? 'Service',
  body: s.description,
  features: s.features ?? [],
  accent: ACCENTS[i % ACCENTS.length],
}));

const N = CARDS.length;
const STEP = 360 / N;

// Timed scroll-lock (the primary, smooth-scroll path). When the section reaches
// the viewport it PINS and plays a one-card-at-a-time sequence: each card centres
// and is HELD for DWELL ms before the next scroll input can advance — so a fast
// flick can never fling cards past; every card pauses at centre. WHEEL/TOUCH_STEP
// are the intent thresholds to move one card once the hold clears.
const DWELL = 500;       // ms each card stays centred (the requested 0.5-second pause)
const WHEEL_STEP = 26;   // wheel deltaY to advance a card after the hold
const TOUCH_STEP = 46;   // touch-drag px to advance a card after the hold
const SETTLE = 0.62;     // s — smooth glide into/out of the pinned position (entry/exit transition)

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

// Reduced-motion / no-Lenis FALLBACK only: a position-based dwell map (no lock).
// Each card holds centred across a band of the section's scroll, linked by quick
// eased snaps — cards still pause at centre, just tied to scroll position rather
// than a timer.
const HOLD = 0.15; // fraction of the section's travel each card stays centred
const TRANS = (1 - N * HOLD) / (N - 1); // the remainder, split across the N−1 snaps
function smoothstep(x: number) {
  x = x < 0 ? 0 : x > 1 ? 1 : x;
  return x * x * (3 - 2 * x);
}
function ringRotationForProgress(p: number) {
  p = clamp(p, 0, 1);
  let c = 0;
  for (let i = 0; i < N; i++) {
    if (p < c + HOLD) return -i * STEP; // holding on card i (centred)
    c += HOLD;
    if (i < N - 1) {
      if (p < c + TRANS) return -(i + smoothstep((p - c) / TRANS)) * STEP; // snapping i → i+1
      c += TRANS;
    }
  }
  return -(N - 1) * STEP; // settled on the last card
}

function ServiceIcon({ name }: { name: string }) {
  const p = {
    width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none',
    stroke: 'currentColor', strokeWidth: 1.5,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  };
  switch (name) {
    case 'Code':
      return <svg {...p}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
    case 'Smartphone':
      return <svg {...p}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
    case 'Calendar':
      return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case 'Globe':
      return <svg {...p}><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>;
    case 'TrendingUp':
      return <svg {...p}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
    default:
      return <svg {...p}><circle cx="12" cy="12" r="10" /></svg>;
  }
}

type CardT = (typeof CARDS)[number];

export function ServiceCardDeck() {
  const { lenis } = useLenis();
  const sectionRef = useRef<HTMLElement>(null);
  const rafRef = useRef(0);

  const [rotation, setRotation] = useState(0);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<CardT | null>(null);
  const [radius, setRadius] = useState(400);
  const [reduced, setReduced] = useState(false);

  // Stepper / scroll-lock state (refs — read inside native listeners).
  const indexRef = useRef(0);        // which card is currently centred
  const engagedRef = useRef(false);  // are we pinned + running the timed sequence?
  const settlingRef = useRef(false); // gliding into the pinned position (entry transition)
  const lockUntilRef = useRef(0);    // ms; advancement is blocked until this time (the 0.5s hold)
  const intentRef = useRef(0);       // accumulated directional scroll intent since the hold cleared
  const cooldownRef = useRef(0);     // ms; suppress re-engage right after a release
  const anchorYRef = useRef(0);      // page Y where the section top meets the viewport top
  const lastYRef = useRef(0);        // last scrollY (for direction)
  const touchYRef = useRef(0);
  const reducedRef = useRef(false);
  const selectedRef = useRef(false);

  useEffect(() => { selectedRef.current = !!selected; }, [selected]);

  // Responsive ring radius.
  useEffect(() => {
    const measure = () => {
      const w = window.innerWidth;
      setRadius(w < 560 ? 215 : w < 960 ? 310 : 400);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Reduced-motion preference.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReduced(mq.matches); reducedRef.current = mq.matches; };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Centre a card (used by the stepper, the dots and the keys). Sets the 0.5s hold.
  const centerCard = useCallback((i: number, resetDwell = true) => {
    i = ((i % N) + N) % N;
    indexRef.current = i;
    setRotation(-i * STEP);
    setActive(i);
    if (resetDwell) lockUntilRef.current = performance.now() + DWELL;
  }, []);

  // Release the lock and GLIDE just past the section so the hand-off to the next
  // band reads as one continuous scroll (no jump).
  const disengage = useCallback((dir: 1 | -1) => {
    engagedRef.current = false;
    settlingRef.current = false;
    const html = document.documentElement;
    html.style.overflow = '';
    html.style.overscrollBehavior = '';
    cooldownRef.current = performance.now() + 950; // covers the exit glide → no instant re-engage
    const vh = window.innerHeight;
    const el = sectionRef.current;
    const secH = el ? el.offsetHeight : vh;
    const top = anchorYRef.current;
    const target = dir === 1 ? top + secH + 2 : Math.max(0, top - vh - 2);
    if (lenis) { lenis.start(); lenis.scrollTo(target, { duration: SETTLE, force: true }); }
    else window.scrollTo(0, target);
  }, [lenis]);

  // Pin the section, but GLIDE it into place first so entering from the hero is a
  // smooth continuation of the scroll rather than a jump-cut lock. The hard freeze
  // (and the first card's 0.5s hold) only begins once the glide settles.
  const engage = useCallback((entry: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = window.scrollY + el.getBoundingClientRect().top;
    anchorYRef.current = top;
    engagedRef.current = true;
    settlingRef.current = true;
    intentRef.current = 0;
    // show the entry card immediately — it rides up with the section during the glide
    indexRef.current = ((entry % N) + N) % N;
    setRotation(-indexRef.current * STEP);
    setActive(indexRef.current);
    let settleTimer = 0;
    const finishLock = () => {
      if (!engagedRef.current || !settlingRef.current) return; // run once; skip if we were cancelled
      if (settleTimer) { clearTimeout(settleTimer); settleTimer = 0; }
      settlingRef.current = false;
      const html = document.documentElement;
      html.style.overflow = 'hidden';   // freeze (scrollbar-gutter is stable → no shift)
      html.style.overscrollBehavior = 'none';
      lenis?.stop();
      lockUntilRef.current = performance.now() + DWELL; // full 0.5s once centred
    };
    if (lenis) {
      lenis.scrollTo(top, { duration: SETTLE, lock: true, force: true, onComplete: finishLock });
      settleTimer = window.setTimeout(finishLock, 2500); // fallback so a missed onComplete can't trap scroll
    } else {
      window.scrollTo(0, top);
      finishLock();
    }
  }, [lenis]);

  // One step, honoured only after the current card's 0.5s hold — so a fast flick
  // can never skip a card; each is guaranteed its pause at centre.
  const advance = useCallback((dir: 1 | -1) => {
    if (performance.now() < lockUntilRef.current) return;
    const next = indexRef.current + dir;
    if (next < 0) return disengage(-1);
    if (next > N - 1) return disengage(1);
    centerCard(next, true);
  }, [centerCard, disengage]);

  const goToCard = useCallback((i: number) => {
    if (settlingRef.current) return; // don't fight the entry glide
    centerCard(i, true);
  }, [centerCard]);

  // Engage detection + the reduced-motion (no-Lenis) fallback scroll map.
  useEffect(() => {
    rafRef.current = 0; // a prior run's rAF was cancelled in cleanup; clear the stale id
    lastYRef.current = window.scrollY;
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // No smooth scroll / reduced motion → no lock; drive the ring off scroll
        // position with the dwell map (each card still holds across a band).
        if (reducedRef.current || !lenis) {
          const travel = rect.height - vh;
          const progress = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
          const rot = ringRotationForProgress(progress);
          setRotation(rot);
          setActive(((Math.round(-rot / STEP) % N) + N) % N);
          return;
        }
        if (engagedRef.current) return;
        if (performance.now() < cooldownRef.current) { lastYRef.current = window.scrollY; return; }
        const dir: 1 | -1 = window.scrollY >= lastYRef.current ? 1 : -1;
        lastYRef.current = window.scrollY;
        // Engage the moment the section covers the middle of the viewport.
        if (rect.top <= vh * 0.5 && rect.bottom >= vh * 0.5) engage(dir === -1 ? N - 1 : 0);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0; // reset so a re-run's guard isn't stuck on a stale id
    };
  }, [lenis, engage]);

  // Timed, scroll-locked stepping while engaged (wheel / touch / keyboard).
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (!engagedRef.current) return;
      e.preventDefault(); // page stays pinned
      if (settlingRef.current || selectedRef.current || performance.now() < lockUntilRef.current) { intentRef.current = 0; return; }
      intentRef.current += e.deltaY;
      if (intentRef.current > WHEEL_STEP) { intentRef.current = 0; advance(1); }
      else if (intentRef.current < -WHEEL_STEP) { intentRef.current = 0; advance(-1); }
    };
    const onTouchStart = (e: TouchEvent) => { touchYRef.current = e.touches[0]?.clientY ?? 0; };
    const onTouchMove = (e: TouchEvent) => {
      if (!engagedRef.current) return;
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? touchYRef.current;
      const dy = touchYRef.current - y; // swipe content up = forward
      touchYRef.current = y;
      if (settlingRef.current || selectedRef.current || performance.now() < lockUntilRef.current) { intentRef.current = 0; return; }
      intentRef.current += dy;
      if (intentRef.current > TOUCH_STEP) { intentRef.current = 0; advance(1); }
      else if (intentRef.current < -TOUCH_STEP) { intentRef.current = 0; advance(-1); }
    };
    const onKey = (e: KeyboardEvent) => {
      if (!engagedRef.current || settlingRef.current || selectedRef.current) return;
      if (e.key === 'Escape') { disengage(1); return; }
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === 'PageDown' || e.code === 'Space') {
        e.preventDefault(); advance(1);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault(); advance(-1);
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [advance, disengage]);

  // Safety: if we unmount mid-lock (or mid-glide), restore scrolling and mark us
  // disengaged so a pending glide callback can't re-freeze the page after we're gone.
  useEffect(() => () => {
    if (engagedRef.current) {
      engagedRef.current = false;
      settlingRef.current = false;
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
      lenis?.start();
    }
  }, [lenis]);

  return (
    <div className="oc-root">
      <style>{styles}</style>

      <section
        ref={sectionRef}
        className="oc-section"
        style={{ height: reduced ? '260vh' : '100vh' }}
      >
        <div className="oc-sticky">
          <CapabilityBackdrop active={active} />
          <div className="oc-scene">
            <div
              className={`oc-ring-wrap ${reduced ? 'reduced' : ''}`}
              role="listbox"
              aria-label="Our capabilities"
            >
              <div
                className="oc-ring"
                style={{ transform: `translateZ(-${radius}px) rotateY(${rotation}deg)` }}
              >
                {CARDS.map((c, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={c.id}
                      className={`oc-card ${isActive ? 'active' : ''}`}
                      role="option"
                      aria-selected={isActive}
                      style={{
                        transform: `rotateY(${i * STEP}deg) translateZ(${radius}px)`,
                        '--accent': c.accent,
                      } as React.CSSProperties}
                      onClick={() => {
                        if (isActive) setSelected(c);
                        else goToCard(i);
                      }}
                    >
                      <span className="oc-card-icon" style={{ color: c.accent }}>
                        <ServiceIcon name={c.icon} />
                      </span>
                      <span className="oc-card-label" style={{ color: c.accent }}>{c.label}</span>
                      <span className="oc-card-tag">{c.tag}</span>
                      <span className="oc-card-name">{c.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <nav className="oc-dots" aria-label="Jump to capability">
            {CARDS.map((c, i) => (
              <button
                key={c.id}
                className={`oc-dot ${i === active ? 'on' : ''}`}
                style={{ '--accent': c.accent } as React.CSSProperties}
                aria-label={`Go to ${c.title}`}
                onClick={() => goToCard(i)}
              />
            ))}
          </nav>
        </div>
      </section>

      {/* Detail panel */}
      <div className={`oc-panel ${selected ? 'open' : ''}`} aria-hidden={!selected}>
        <div className="oc-panel-bg" onClick={() => setSelected(null)} />
        {selected && (
          <div className="oc-panel-card" style={{ '--accent': selected.accent } as React.CSSProperties}>
            <button className="oc-close" onClick={() => setSelected(null)} aria-label="Close">✕</button>
            <span className="oc-panel-icon" style={{ color: selected.accent }}>
              <ServiceIcon name={selected.icon} />
            </span>
            <span className="oc-panel-label">{selected.label}</span>
            <span className="oc-panel-tag">{selected.tag}</span>
            <h2 className="oc-panel-name">{selected.title}</h2>
            <p className="oc-panel-body">{selected.body}</p>
            {selected.features.length > 0 && (
              <ul className="oc-panel-feats">
                {selected.features.slice(0, 3).map((f) => (
                  <li key={f}><span style={{ color: selected.accent }}>—</span>{f}</li>
                ))}
              </ul>
            )}
            <Link href={`/services/${selected.slug}`} className="oc-panel-link" style={{ color: selected.accent }}>
              Explore service →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = `
.oc-root{
  --oc-ink: var(--text-on-ink);
  --oc-muted: var(--text-on-ink-muted);
  --oc-line: rgba(245,248,252,.14);
  color: var(--oc-ink);
}
.oc-root *{box-sizing:border-box;}

/* height is set inline: 100vh when the timed scroll-lock drives it, taller for
   the reduced-motion fallback (so scroll has room to dwell on each card). */
.oc-section{position:relative;}
.oc-sticky{
  position:sticky;top:0;height:100vh;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  overflow:hidden;
}

/* per-card motion backdrop — sits behind the ring, fills the sticky stage */
.oc-backdrop{position:absolute;inset:0;z-index:0;pointer-events:none;}

/* 3D scene */
.oc-scene{
  flex:1;width:100%;
  display:flex;align-items:center;justify-content:center;
  perspective:1500px;
  position:relative;
  z-index:1;
}
.oc-ring-wrap{
  position:relative;width:300px;height:380px;
  transform-style:preserve-3d;
  touch-action:pan-y;
}
.oc-ring{
  position:absolute;inset:0;
  transform-style:preserve-3d;
  transition:transform .6s cubic-bezier(.22,.61,.36,1);
}
.oc-ring-wrap.reduced .oc-ring{transition:transform .2s linear;}

.oc-card{
  position:absolute;left:0;top:0;width:300px;height:380px;
  display:flex;flex-direction:column;
  padding:28px 26px;text-align:left;
  background:linear-gradient(160deg, rgba(22,39,61,.94), rgba(14,27,44,.94));
  border:1px solid var(--oc-line);
  border-radius:20px;
  backface-visibility:hidden;
  -webkit-backface-visibility:hidden;
  box-shadow:0 24px 60px rgba(0,0,0,.45);
  color:var(--oc-ink);font-family:var(--font-body);
  cursor:pointer;
  transition:border-color .4s, box-shadow .4s, opacity .45s, filter .4s;
  /* Only the centred (active) card is visible — the side cards are fully hidden. */
  opacity:0;filter:saturate(.7);pointer-events:none;
}
.oc-card.active{
  opacity:1;filter:none;pointer-events:auto;
  border-color:color-mix(in srgb, var(--accent) 60%, transparent);
  box-shadow:0 30px 80px rgba(0,0,0,.55),
             0 0 0 1px color-mix(in srgb, var(--accent) 35%, transparent),
             0 0 60px -10px var(--accent);
}
.oc-card-icon{display:inline-flex;}
.oc-card-label{
  font-family:var(--font-display);font-size:38px;font-weight:600;line-height:1;
  margin-top:14px;
}
.oc-card-tag{
  margin-top:auto;font-size:11px;letter-spacing:.22em;text-transform:uppercase;
  color:var(--oc-muted);font-family:var(--font-heading);
}
.oc-card-name{
  font-family:var(--font-display);font-size:25px;font-weight:600;
  margin-top:8px;letter-spacing:-.01em;line-height:1.18;
}
/* dots — 24px hit box (touch target) with a 9px visual dot rendered via ::before */
.oc-dots{display:flex;gap:6px;padding:0 0 5vh;z-index:5;}
.oc-dot{
  width:24px;height:24px;border-radius:50%;border:0;padding:0;cursor:pointer;
  background:transparent;position:relative;-webkit-tap-highlight-color:transparent;
}
.oc-dot::before{
  content:"";position:absolute;top:50%;left:50%;width:9px;height:9px;border-radius:50%;
  background:rgba(245,248,252,.28);
  transform:translate(-50%,-50%);
  transition:transform .3s, background .3s, box-shadow .3s;
}
.oc-dot:hover::before{transform:translate(-50%,-50%) scale(1.3);}
.oc-dot.on::before{background:var(--accent);transform:translate(-50%,-50%) scale(1.25);box-shadow:0 0 12px var(--accent);}

/* detail panel */
.oc-panel{position:fixed;inset:0;z-index:50;pointer-events:none;opacity:0;transition:opacity .35s;}
.oc-panel.open{pointer-events:auto;opacity:1;}
.oc-panel-bg{position:absolute;inset:0;background:rgba(7,12,22,.74);backdrop-filter:blur(6px);}
.oc-panel-card{
  position:absolute;top:50%;left:50%;
  transform:translate(-50%,-46%);
  width:min(500px,92vw);
  background:linear-gradient(160deg,#16273d,#0b1726);
  border:1px solid color-mix(in srgb, var(--accent) 40%, transparent);
  border-radius:22px;padding:38px 34px;
  box-shadow:0 40px 120px rgba(0,0,0,.6),0 0 80px -20px var(--accent);
  transition:transform .4s cubic-bezier(.22,.61,.36,1);
  color:var(--oc-ink);font-family:var(--font-body);
}
.oc-panel.open .oc-panel-card{transform:translate(-50%,-50%);}
.oc-panel-icon{display:inline-flex;margin-bottom:14px;}
.oc-panel-label{display:block;font-family:var(--font-display);font-size:48px;font-weight:600;color:var(--accent);line-height:1;}
.oc-panel-tag{display:block;margin-top:12px;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--oc-muted);font-family:var(--font-heading);}
.oc-panel-name{font-family:var(--font-display);font-weight:600;font-size:32px;margin:4px 0 0;letter-spacing:-.01em;line-height:1.15;color:var(--oc-ink);}
.oc-panel-body{color:var(--oc-muted);font-size:15px;line-height:1.7;margin:16px 0 18px;}
.oc-panel-feats{list-style:none;margin:0 0 22px;padding:0;border-top:1px solid var(--oc-line);}
.oc-panel-feats li{display:flex;gap:10px;padding:11px 0;border-bottom:1px solid var(--oc-line);font-size:13.5px;color:var(--oc-ink);}
.oc-panel-link{display:inline-block;font-family:var(--font-heading);font-weight:600;font-size:13px;letter-spacing:.04em;text-decoration:none;}
.oc-close{
  position:absolute;top:18px;right:18px;width:34px;height:34px;border-radius:50%;
  background:rgba(245,248,252,.1);border:1px solid var(--oc-line);
  color:var(--oc-ink);cursor:pointer;font-size:13px;transition:background .25s;
}
.oc-close:hover{background:rgba(245,248,252,.22);}

.oc-card:focus-visible,.oc-dot:focus-visible,.oc-close:focus-visible{
  outline:2px solid var(--accent-on-ink);outline-offset:3px;
}

@media (max-width:560px){
  .oc-ring-wrap{width:250px;height:350px;}
  .oc-card{width:250px;height:350px;padding:22px 20px;}
  .oc-card-label{font-size:32px;}
  .oc-card-name{font-size:22px;}
}
`;
