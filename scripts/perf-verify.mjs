// Verification probe for the 2026-07-23 perf pass:
//  1. ZERO third-party requests (spline.design / unpkg / simpleicons all self-hosted)
//  2. Self-hosted /spline/scene-v1.splinecode + /spline/wasm/*.wasm actually load (desktop)
//  3. Mobile (touch) never fetches the scene, wasm, or the Spline runtime chunk
//  4. SSR poster paints in the first viewport pre-mount; hero + marquee screenshots
// Run against a running dev server: node scripts/perf-verify.mjs
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:3000';
const OUT = 'audit-shots/perf-verify';
mkdirSync(OUT, { recursive: true });

const THIRD_PARTY = /spline\.design|unpkg\.com|simpleicons\.org/i;

async function run(name, { touch, width, height }) {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
  const ctx = await browser.newContext({
    viewport: { width, height },
    hasTouch: touch,
    isMobile: touch,
    deviceScaleFactor: touch ? 2 : 1,
    userAgent: touch
      ? 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Mobile Safari/537.36'
      : undefined,
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  if (touch) {
    await page.addInitScript(() => {
      const mq = window.matchMedia.bind(window);
      window.matchMedia = (q) => {
        if (/hover:\s*hover|pointer:\s*fine/.test(q))
          return { matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false };
        if (/pointer:\s*coarse|hover:\s*none/.test(q))
          return { matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false };
        return mq(q);
      };
    });
  }

  const thirdParty = [];
  const splineAssets = [];
  page.on('request', (req) => {
    const url = req.url();
    if (THIRD_PARTY.test(url)) thirdParty.push(url.slice(0, 120));
    if (/\/spline\//.test(url)) splineAssets.push(url.replace(BASE, ''));
  });

  try {
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 60000 });
  } catch {}
  await page.waitForTimeout(8000);
  await page.screenshot({ path: `${OUT}/${name}-hero.png` });

  // TechStack marquee: land on it, confirm it advances while visible.
  await page.evaluate(() => {
    document.querySelector('[data-section-index="7"]')?.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(1500);
  const x1 = await page.evaluate(
    () => document.querySelector('[data-section-index="7"] .flex.w-max')?.getBoundingClientRect().x
  );
  await page.waitForTimeout(1200);
  const x2 = await page.evaluate(
    () => document.querySelector('[data-section-index="7"] .flex.w-max')?.getBoundingClientRect().x
  );
  await page.screenshot({ path: `${OUT}/${name}-techstack.png` });

  console.log(`== ${name}`);
  console.log('  third-party requests:', thirdParty.length, thirdParty.slice(0, 5));
  console.log('  /spline/ assets:', JSON.stringify(splineAssets));
  console.log('  marquee moved while visible:', x1 != null && x2 != null && Math.abs(x2 - x1) > 3, `(${x1?.toFixed(1)} -> ${x2?.toFixed(1)})`);
  await browser.close();
}

await run('desktop-1440', { touch: false, width: 1440, height: 900 });
await run('mobile-390', { touch: true, width: 390, height: 844 });
console.log('done');
