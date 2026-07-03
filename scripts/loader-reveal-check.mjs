import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/loader-reveal';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  channel: 'chrome',
  args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
});
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const logs = [];
page.on('console', (m) => { if (/Spline/i.test(m.text())) logs.push(m.text()); });

// Fresh visit → run the full countdown loader (do NOT set kaizen-intro-seen).
try { await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 45000 }); } catch {}

const probe = async (label) => {
  const data = await page.evaluate(() => {
    const overlay = document.querySelector('.loader-active') ? true
      : !!document.querySelector('[style*="z-index: 9999"], [style*="z-index:9999"]');
    const loaderVisible = document.body.classList.contains('loader-active');
    const poster = document.querySelector('img[src*="spline-monitor-poster"]');
    const pcs = poster ? getComputedStyle(poster) : null;
    const canvas = document.querySelector('canvas');
    const splineCanvases = document.querySelectorAll('canvas').length;
    return {
      loaderActive: loaderVisible,
      posterOpacity: pcs ? pcs.opacity : null,
      canvasCount: splineCanvases,
    };
  });
  return { label, ...data };
};

const shots = [];
// t≈1.5s: countdown should be on screen, computer hidden behind overlay
await page.waitForTimeout(1500);
shots.push(await probe('t1.5-loader'));
await page.screenshot({ path: `${OUT}/01-loader.png` });

// t≈8.5s: loader has cleared (~7.7s), computer should be SHARP (poster faded)
await page.waitForTimeout(7000);
shots.push(await probe('t8.5-just-cleared'));
await page.screenshot({ path: `${OUT}/02-cleared.png` });

// t≈10.5s: typing in progress
await page.waitForTimeout(2000);
shots.push(await probe('t10.5-typing'));
await page.screenshot({ path: `${OUT}/03-typing.png` });

// t≈13s: typing settled
await page.waitForTimeout(2500);
shots.push(await probe('t13-settled'));
await page.screenshot({ path: `${OUT}/04-settled.png` });

console.log(JSON.stringify({ shots, splineLogs: logs }, null, 2));
await browser.close();
console.log('done');
