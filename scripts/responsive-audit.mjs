import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

// Responsive audit: render every page at true mobile→big-screen viewports and
// screenshot full pages, plus measure card-overlap numerically. Playwright sets
// an exact CSS viewport regardless of the physical screen.

const OUT = 'audit-shots/responsive';
mkdirSync(OUT, { recursive: true });

const BASE = 'http://localhost:3000';

const PAGES = ['/', '/work', '/services', '/about', '/blog', '/contact', '/careers'];

// [label, width, height, touch?, dpr]  — dpr capped at 2 to keep fullPage shots
// of very tall pages from blowing the screenshot timeout.
const VIEWPORTS = [
  ['320', 320, 720, true, 2],   // small mobile (iPhone SE)
  ['390', 390, 844, true, 2],   // normal mobile
  ['430', 430, 932, true, 2],   // large mobile
  ['768', 768, 1024, true, 2],  // iPad portrait
  ['1024', 1024, 768, true, 2], // iPad landscape
  ['1366', 1366, 768, false, 1],// laptop
  ['1440', 1440, 900, false, 1],// desktop
  ['1920', 1920, 1080, false, 1],// big
  ['2560', 2560, 1440, false, 1],// XL / big screen
];

const filter = process.argv[2]; // optional: only pages containing this substring
const vpFilter = process.argv[3]; // optional: only viewport labels containing this

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});

const results = [];

for (const route of PAGES) {
  if (filter && !route.includes(filter)) continue;
  for (const [label, w, h, touch, dpr] of VIEWPORTS) {
    if (vpFilter && !label.includes(vpFilter)) continue;
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      isMobile: !!touch,
      hasTouch: !!touch,
      deviceScaleFactor: dpr,
      reducedMotion: 'no-preference',
    });
    // Skip the intro loader; make touch viewports report hover:none.
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
    const name = (route === '/' ? 'home' : route.replace(/\//g, '')) + '-' + label;
    try {
    try {
      await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 });
    } catch {}
    await page.waitForTimeout(1200);

    // Scroll through to trigger scroll-reveal + lazy images, then force any
    // reveal-gated content visible so the STATIC layout is legible in one shot.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
      const s = document.createElement('style');
      s.textContent = `.sia-bullets li,.sia-closing,.sia-cta,.sia-media-inner,[style*="opacity"]{opacity:1!important;transform:none!important}
        .sia-crisp{clip-path:none!important}`;
      document.head.appendChild(s);
      await new Promise((r) => setTimeout(r, 200));
    });

    // Measure horizontal overflow + (on /work) sia-card content vs sticky height.
    const metrics = await page.evaluate(() => {
      const de = document.documentElement;
      const overflowX = Math.round(de.scrollWidth - de.clientWidth);
      const cards = [...document.querySelectorAll('.sia-card')].map((c, i) => {
        const sticky = c.querySelector('.sia-sticky');
        const content = c.querySelector('.sia-content');
        return {
          i,
          stickyH: sticky ? Math.round(sticky.getBoundingClientRect().height) : null,
          contentH: content ? Math.round(content.scrollHeight) : null,
          vh: window.innerHeight,
          overflows: content && sticky ? content.scrollHeight > sticky.clientHeight + 4 : null,
        };
      });
      return { overflowX, vw: window.innerWidth, cards };
    });
    results.push({ page: route, vp: label, ...metrics });

    // Home is extremely tall + heavy under swiftshader — a full-page shot times
    // out, so capture just the top two viewports there. Everything else: fullPage.
    const fullPage = route !== '/';
    await page.screenshot({ path: `${OUT}/${name}.png`, fullPage, animations: 'disabled', timeout: 120000 });
    process.stdout.write(`shot ${name}  overflowX=${metrics.overflowX}${metrics.cards.some(c=>c.overflows)?'  SIA-OVERFLOW':''}\n`);
    } catch (err) {
      process.stdout.write(`FAIL ${name}: ${String(err).split('\n')[0]}\n`);
    } finally {
      await ctx.close();
    }
  }
}

await browser.close();

// Print a compact overflow/overlap report.
console.log('\n=== HORIZONTAL OVERFLOW (px past viewport; >0 = sideways scroll) ===');
for (const r of results) {
  if (r.overflowX > 0) console.log(`  ${r.page} @${r.vp}: overflowX=${r.overflowX}`);
}
console.log('\n=== SIA CARD OVERLAP (content taller than sticky) ===');
for (const r of results) {
  const bad = r.cards.filter((c) => c.overflows);
  if (bad.length) console.log(`  ${r.page} @${r.vp}: cards ${bad.map((c) => `#${c.i}(content ${c.contentH}>sticky ${c.stickyH})`).join(', ')}`);
}
console.log('\ndone');
