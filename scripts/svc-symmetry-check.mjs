import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });

// HYSTERESIS test. render(p) is a pure function of progress, so the ONLY thing
// that can make scroll-up differ from scroll-down is temporal lag (scrub
// catch-up + any CSS transition) stacked on the scrub. Under continuous motion
// that lag shows up as a HYSTERESIS LOOP: at the same scroll position the
// rendered card sits at a different place going down vs up. We drive a real
// continuous wheel-scroll (Lenis handles wheel; window.scrollTo it ignores)
// down then up, sample card-0's translateX vs the live scroll position, and
// measure the loop width. Narrow + flat = symmetric to-and-fro.
async function run(label, viewport, forceTouch) {
  const ctx = await browser.newContext({ viewport, isMobile: !!forceTouch, hasTouch: !!forceTouch, deviceScaleFactor: forceTouch ? 2 : 1 });
  const page = await ctx.newPage();
  await page.addInitScript(() => { sessionStorage.setItem('kaizen-intro-seen', '1'); });
  if (forceTouch) {
    await page.addInitScript(() => {
      const orig = window.matchMedia.bind(window);
      window.matchMedia = (q) => q.includes('hover: hover')
        ? { matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } }
        : orig(q);
    });
  }
  // domcontentloaded — the homepage streams Spline + a bg video, so networkidle
  // never fires. Then give hydration + GSAP/ScrollTrigger setup time to settle.
  try { await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 }); } catch {}
  await page.waitForTimeout(3000);

  const sec = await page.evaluate(() => {
    const s = [...document.querySelectorAll('section')].find((e) => /End-to-End Technology Services/.test(e.textContent || ''));
    if (!s) return null;
    const r = s.getBoundingClientRect();
    return { top: Math.round(r.top + window.scrollY), h: Math.round(r.height), vh: window.innerHeight };
  });
  if (!sec) { console.log(label, 'NO services section'); await ctx.close(); return; }
  const range = sec.h - sec.vh;

  await page.mouse.move(viewport.width / 2, viewport.height / 2);

  const sampleAt = () => page.evaluate(({ top, range }) => {
    const c0 = document.querySelector('.deck-card');
    if (!c0) return { ip: 0, x: 0 };
    const m = new DOMMatrixReadOnly(getComputedStyle(c0).transform);
    const ip = Math.max(0, Math.min(1, (window.scrollY - top) / range));
    return { ip: +ip.toFixed(4), x: +m.m41.toFixed(1) };
  }, { top: sec.top, range });

  const down = [], up = [];
  for (let i = 0; i < 55; i++) { await page.mouse.wheel(0, 90); await page.waitForTimeout(50); down.push(await sampleAt()); }
  await page.waitForTimeout(300);
  for (let i = 0; i < 60; i++) { await page.mouse.wheel(0, -90); await page.waitForTimeout(50); up.push(await sampleAt()); }

  const xs = [...down, ...up].map((p) => p.x);
  const travel = Math.round(Math.max(...xs) - Math.min(...xs));
  const ipReached = Math.max(...down.map((p) => p.ip));
  if (travel < 20 || ipReached < 0.5) {
    console.log(`${label}: INCONCLUSIVE — scroll didn't drive deck (cardTravel=${travel}px, maxProgress=${ipReached.toFixed(2)})`);
    await ctx.close();
    return;
  }

  const interp = (arr, ip) => {
    const pts = arr.filter((p) => p.ip > 0.02 && p.ip < 0.98).sort((a, b) => a.ip - b.ip);
    if (pts.length < 2) return null;
    if (ip <= pts[0].ip) return pts[0].x;
    if (ip >= pts[pts.length - 1].ip) return pts[pts.length - 1].x;
    for (let i = 1; i < pts.length; i++) {
      if (ip <= pts[i].ip) {
        const a = pts[i - 1], b = pts[i];
        return a.x + (b.x - a.x) * ((ip - a.ip) / (b.ip - a.ip || 1));
      }
    }
    return pts[pts.length - 1].x;
  };

  let maxLoop = 0, covered = 0;
  for (let k = 1; k <= 9; k++) {
    const ip = k / 10;
    const xd = interp(down, ip), xu = interp(up, ip);
    if (xd == null || xu == null) continue;
    covered++;
    maxLoop = Math.max(maxLoop, Math.abs(xd - xu));
  }
  const pct = ((maxLoop / travel) * 100).toFixed(1);
  console.log(`${label}: hysteresisLoop=${maxLoop.toFixed(0)}px / cardTravel=${travel}px = ${pct}% of travel  (ladder ${covered}/9)  → ${maxLoop / travel < 0.06 ? 'SYMMETRIC ✓' : 'check'}`);
  await ctx.close();
}

await run('DESKTOP', { width: 1440, height: 900 }, false);
await run('IPAD   ', { width: 820, height: 1180 }, true);
await run('PHONE  ', { width: 390, height: 844 }, true);
await browser.close();
console.log('done');
