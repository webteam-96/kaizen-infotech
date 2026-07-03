import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/autoplay';
mkdirSync(OUT, { recursive: true });

async function run(label, viewport, useTouch) {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
  const ctx = await browser.newContext({
    viewport,
    hasTouch: !!useTouch,
    isMobile: !!useTouch,
  });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(6000); // let Spline + ScrollTrigger settle

  const before = await page.evaluate(() => window.scrollY);
  const cue = await page.evaluate(() => document.querySelector('.rc-scroll-cue span')?.textContent || null);

  if (useTouch) {
    // tap centre of screen
    await page.touchscreen.tap(viewport.width / 2, viewport.height / 2);
  } else {
    await page.keyboard.press('Enter');
  }

  // sample scroll over the 3s autoplay
  const samples = [];
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(450);
    samples.push(await page.evaluate(() => Math.round(window.scrollY)));
  }
  const after = await page.evaluate(() => window.scrollY);
  await page.screenshot({ path: `${OUT}/${label}-after.png` });

  console.log(JSON.stringify({ label, cue, before: Math.round(before), after: Math.round(after), samples }, null, 2));
  await browser.close();
}

await run('desktop', { width: 1280, height: 800 }, false);
await run('mobile', { width: 390, height: 844 }, true);
console.log('done');
