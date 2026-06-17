import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:3000';
const OUT = 'audit-shots/rc-responsive';
mkdirSync(OUT, { recursive: true });

const WIDTHS = [360, 400, 640, 768, 1024, 1440];

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });

for (const w of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  // Skip the countdown overlay so the cube hero is visible immediately.
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try {
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 });
  } catch { /* RAF loops keep networkidle from settling */ }
  await page.waitForTimeout(6000); // allow the remote Spline scene to load + render

  // Horizontal-overflow check at the hero.
  const overflow = await page.evaluate(() => {
    const de = document.documentElement;
    return { scrollW: de.scrollWidth, innerW: window.innerWidth, overflowing: de.scrollWidth > window.innerWidth + 1 };
  });

  const scene = await page.evaluate(() => {
    const el = document.querySelector('.fixed.inset-y-0.right-0.z-0');
    if (!el) return 'no scene el';
    const cs = getComputedStyle(el);
    const fr = el.querySelector('.rc-spline-float');
    const r = fr ? fr.getBoundingClientRect() : el.getBoundingClientRect();
    return {
      opacity: cs.opacity,
      padL: cs.paddingLeft,
      padT: cs.paddingTop,
      sceneLeft: Math.round(r.left),
      sceneRight: Math.round(r.right),
      offRight: Math.round(r.right - window.innerWidth),
    };
  });
  console.log(`${w}px scene=${JSON.stringify(scene)}`);

  await page.screenshot({ path: `${OUT}/hero-${w}.png` });

  // Sticky/pin sanity: scroll to FeaturedWork area and grab a frame.
  await page.evaluate(() => {
    const el = document.querySelector('[data-section-index="4"]');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/featured-${w}.png` });

  console.log(`${w}px  scrollW=${overflow.scrollW} innerW=${overflow.innerW}  overflowX=${overflow.overflowing ? 'YES ⚠' : 'no'}`);
  await ctx.close();
}

await browser.close();
console.log('done');
