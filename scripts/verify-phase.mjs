import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

// Focused verification capture reusing the exact context config that the full
// responsive-matrix.mjs used successfully. Pass combos as CLI args:
//   node scripts/verify-phase.mjs contact:768x1024:t / :1024x1366:t /work:390x844:t
// token = <route>:<WxH>:<t|d>  (t=touch, d=desktop). Route "/" may be written as "home" or "/".
// Screenshots (viewport-sized) → audit-shots/verify/, plus overflow metrics to stdout.

const OUT = 'audit-shots/verify';
mkdirSync(OUT, { recursive: true });
const BASE = 'http://localhost:3000';

// token = <route>:<WxH>:<t|d>[:scrollPx]  — if scrollPx present, capture a single
// shot at that exact scroll position (for landing on a settled pinned section).
const combos = (process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['/:1024x1366:t']
).map((tok) => {
  const [route0, wh, mode, scroll] = tok.split(':');
  const route = route0 === 'home' ? '/' : route0;
  const [w, h] = wh.split('x').map(Number);
  // scroll field: a number = absolute px; "@sel" = scroll that selector to center;
  // "@sel#N" = the Nth match (0-based).
  const sel = scroll && scroll.startsWith('@') ? scroll.slice(1) : null;
  return { route, w, h, touch: mode === 't', scrollPx: !sel && scroll != null ? Number(scroll) : null, sel };
});

let browser;
try {
  browser = await chromium.launch({
    channel: 'chrome',
    args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
} catch {
  browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
}

for (const { route, w, h, touch, scrollPx, sel } of combos) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    isMobile: touch,
    hasTouch: touch,
    deviceScaleFactor: touch ? 2 : 1,
    reducedMotion: 'no-preference',
  });
  await ctx.addInitScript(() => {
    try { sessionStorage.setItem('kaizen-intro-seen', '1'); } catch {}
  });
  if (touch) {
    await ctx.addInitScript(() => {
      const orig = window.matchMedia.bind(window);
      window.matchMedia = (q) =>
        /hover: hover|pointer: fine/.test(q)
          ? { matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } }
          : orig(q);
    });
  }
  const page = await ctx.newPage();
  const name = (route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '')) + `-${w}x${h}-${touch ? 't' : 'd'}`;
  try {
    try { await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 }); } catch {}
    await page.waitForTimeout(1500);
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 250));
    });
    const m = await page.evaluate(() => {
      const de = document.documentElement;
      return { vw: de.clientWidth, overflowX: Math.round(de.scrollWidth - de.clientWidth), pageHeight: document.body.scrollHeight };
    });
    if (sel) {
      const [s, nStr] = sel.split('#');
      const n = nStr ? Number(nStr) : 0;
      const info = await page.evaluate(({ s, n }) => {
        const el = document.querySelectorAll(s)[n];
        if (!el) return null;
        el.scrollIntoView({ block: 'center' });
        const r = el.getBoundingClientRect();
        return { y: Math.round(window.scrollY), top: Math.round(r.top), h: Math.round(r.height) };
      }, { s, n });
      await page.waitForTimeout(1100);
      const safe = s.replace(/[^a-z0-9]/gi, '') + n;
      await page.screenshot({ path: `${OUT}/${name}-${safe}.jpg`, type: 'jpeg', quality: 70, timeout: 60000 });
      console.log(`${name}  vw=${m.vw} overflowX=${m.overflowX} pageH=${m.pageHeight}  scrollTo(${s}#${n})=${JSON.stringify(info)}`);
    } else if (scrollPx != null) {
      await page.evaluate((y) => window.scrollTo(0, y), scrollPx);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: `${OUT}/${name}-y${scrollPx}.jpg`, type: 'jpeg', quality: 70, timeout: 60000 });
      console.log(`${name}  vw=${m.vw} overflowX=${m.overflowX} pageH=${m.pageHeight}  @y=${scrollPx}`);
    } else {
      // capture two shots: top and mid
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${OUT}/${name}-top.jpg`, type: 'jpeg', quality: 70, timeout: 60000 });
      await page.evaluate(() => window.scrollTo(0, Math.max(0, document.body.scrollHeight * 0.5)));
      await page.waitForTimeout(900);
      await page.screenshot({ path: `${OUT}/${name}-mid.jpg`, type: 'jpeg', quality: 70, timeout: 60000 });
      console.log(`${name}  vw=${m.vw} overflowX=${m.overflowX} pageH=${m.pageHeight}`);
    }
  } catch (e) {
    console.log(`${name}  FAIL ${String(e).split('\n')[0]}`);
  } finally {
    await ctx.close();
  }
}
await browser.close();
console.log('done');
