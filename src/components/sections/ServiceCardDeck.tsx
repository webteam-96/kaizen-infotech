'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { services } from '@/content/services';

// ─────────────────────────────────────────────────────────────────────────────
// Capabilities — 3D ORBIT carousel.
//
// Cards sit on a ring (cylinder) and rotate around a central axis like a globe.
// Scrolling the section spins the ring (two turns); dragging left/right spins it
// manually and snaps to the nearest card; clicking the front card opens its
// detail panel, clicking a side card brings it to the front. Pure React + CSS 3D
// transforms — no animation libraries. The SAME animation runs on phone, iPad and
// desktop (pointer drag + `touch-action: pan-y`, capability-independent), only the
// ring radius scales down. Styled in our brand: light-blue accents on the ink
// surface, our display + body fonts.
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

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
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
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRotRef = useRef(0); // rotation contributed by scroll
  const dragRotRef = useRef(0);   // rotation contributed by drag
  const rafRef = useRef(0);
  const drag = useRef({ active: false, startX: 0, startRot: 0, moved: false });

  const [rotation, setRotation] = useState(0);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<CardT | null>(null);
  const [dragging, setDragging] = useState(false);
  const [radius, setRadius] = useState(400);
  const [reduced, setReduced] = useState(false);

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
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const apply = useCallback(() => {
    const total = scrollRotRef.current + dragRotRef.current;
    setRotation(total);
    const idx = ((Math.round(-total / STEP) % N) + N) % N;
    setActive(idx);
  }, []);

  // Scroll drives the ring while the section passes through the viewport.
  // (Lenis updates the native scroll position, so window 'scroll' still fires.)
  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const travel = rect.height - vh;
        const progress = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
        scrollRotRef.current = -progress * 360; // one full turn across the section
        apply();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [apply]);

  // Pointer drag to rotate + snap (works for mouse AND touch).
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, startX: e.clientX, startRot: dragRotRef.current, moved: false };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    dragRotRef.current = drag.current.startRot + dx * 0.35; // 0.35 deg / px
    apply();
  };
  const endDrag = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
    const total = scrollRotRef.current + dragRotRef.current;
    const snappedTotal = Math.round(total / STEP) * STEP;
    dragRotRef.current += snappedTotal - total;
    apply();
  };

  // Arrow-key navigation.
  const rotateBy = useCallback((dir: number) => {
    dragRotRef.current -= dir * STEP;
    apply();
  }, [apply]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selected) return;
      if (e.key === 'ArrowLeft') rotateBy(-1);
      if (e.key === 'ArrowRight') rotateBy(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [rotateBy, selected]);

  const goToCard = (i: number) => {
    const target = -i * STEP;
    const current = scrollRotRef.current + dragRotRef.current;
    let diff = target - current;
    diff = (((diff + 180) % 360) + 360) % 360 - 180; // wrap to [-180,180]
    dragRotRef.current += diff;
    apply();
  };

  return (
    <div className="oc-root">
      <style>{styles}</style>

      <section ref={sectionRef} className="oc-section">
        <div className="oc-sticky">
          <div className="oc-scene">
            <div className="oc-core" aria-hidden />
            <div
              className={`oc-ring-wrap ${dragging ? 'dragging' : ''} ${reduced ? 'reduced' : ''}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onPointerLeave={endDrag}
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
                        if (drag.current.moved) return; // ignore click right after a drag
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
                      <span className="oc-card-line" />
                      <span className="oc-card-cta">{isActive ? 'Read more' : 'Bring to front'}</span>
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

/* tall section so scroll has room to spin the ring ONE full turn; inner stage is sticky */
.oc-section{position:relative;height:210vh;}
.oc-sticky{
  position:sticky;top:0;height:100vh;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  overflow:hidden;
}

/* 3D scene */
.oc-scene{
  flex:1;width:100%;
  display:flex;align-items:center;justify-content:center;
  perspective:1500px;
  position:relative;
}
.oc-core{
  position:absolute;width:130px;height:130px;border-radius:50%;
  background:radial-gradient(circle at 50% 45%, #BFE2FB, #2196F3 42%, rgba(33,150,243,0) 72%);
  filter:blur(2px);
  box-shadow:0 0 130px 34px rgba(33,150,243,.26);
  pointer-events:none;
  animation:oc-pulse 6s ease-in-out infinite;
}
@keyframes oc-pulse{0%,100%{transform:scale(1);opacity:.9}50%{transform:scale(1.08);opacity:1}}

.oc-ring-wrap{
  position:relative;width:300px;height:380px;
  transform-style:preserve-3d;
  cursor:grab;touch-action:pan-y;
}
.oc-ring-wrap.dragging{cursor:grabbing;}
.oc-ring{
  position:absolute;inset:0;
  transform-style:preserve-3d;
  transition:transform .65s cubic-bezier(.22,.61,.36,1);
}
.oc-ring-wrap.dragging .oc-ring{transition:none;}
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
  transition:border-color .4s, box-shadow .4s, opacity .4s, filter .4s;
  opacity:.4;filter:saturate(.7);
}
.oc-card.active{
  opacity:1;filter:none;
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
.oc-card-line{
  height:1px;width:100%;background:var(--oc-line);margin:16px 0 14px;
}
.oc-card-cta{
  font-size:12px;font-weight:600;letter-spacing:.04em;
  color:var(--accent);font-family:var(--font-heading);
  display:flex;align-items:center;gap:6px;
}
.oc-card-cta::after{content:"→";transition:transform .3s;}
.oc-card.active:hover .oc-card-cta::after{transform:translateX(4px);}

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
