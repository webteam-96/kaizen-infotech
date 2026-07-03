import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

// Capture each home-page section individually (the full-page shot is unusable
// because the hero has a huge scroll runway). Scrolls each <section> into view
// and screenshots the viewport.

const OUT = 'audit-shots/responsive/home-sections';
mkdirSync(OUT, { recursive: true });

const VPS = [
  ['sm', 390, 844, true, 2],
  ['xl', 2560, 1440, false, 1],
];

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});

for (const [label, w, h, touch, dpr] of VPS) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h }, isMobile: !!touch, hasTouch: !!touch,
    deviceScaleFactor: dpr, reducedMotion: 'no-preference',
  });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('kaizen-intro-seen', '1'); } catch {} });
  if (touch) await ctx.addInitScript(() => {
    const o = window.matchMedia.bind(window);
    window.matchMedia = (q) => /hover: hover|pointer: fine/.test(q)
      ? { matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } } : o(q);
  });
  const page = await ctx.newPage();
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 }); } catch {}
  await page.waitForTimeout(1500);

  // Enumerate section elements + a short label from their text.
  const sections = await page.evaluate(() => {
    return [...document.querySelectorAll('main section, main > div section, section')].map((s, i) => {
      const t = (s.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      return { i, t };
    });
  });

  for (let i = 0; i < sections.length; i++) {
    try {
      await page.evaluate((idx) => {
        const el = document.querySelectorAll('section')[idx];
        if (el) el.scrollIntoView({ block: 'start' });
      }, i);
      await page.waitForTimeout(500);
      // force reveals visible
      await page.evaluate(() => {
        const s = document.createElement('style');
        s.textContent = '*{animation-play-state:paused}[style*="opacity"]{opacity:1!important;transform:none!important}';
        document.head.appendChild(s);
      });
      await page.waitForTimeout(300);
      const tag = sections[i].t.replace(/[^a-z0-9]+/gi, '-').slice(0, 24) || 'sec';
      await page.screenshot({ path: `${OUT}/${label}-${String(i).padStart(2, '0')}-${tag}.png`, timeout: 60000 });
      process.stdout.write(`${label} #${i} "${sections[i].t}"\n`);
    } catch (e) { process.stdout.write(`FAIL ${label} #${i}: ${String(e).split('\n')[0]}\n`); }
  }
  await ctx.close();
}
await browser.close();
console.log('done');
