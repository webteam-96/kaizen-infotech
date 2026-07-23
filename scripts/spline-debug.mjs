// Diagnose the missing Spline monitor: console output, network, canvas census.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));

const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text().slice(0, 200)}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${String(e).slice(0, 300)}`));
const splineReqs = [];
page.on('request', (r) => { if (/spline/i.test(r.url())) splineReqs.push(r.url().replace('http://localhost:3000', '').slice(0, 90)); });

await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(12000);

const census = await page.evaluate(() => ({
  canvases: [...document.querySelectorAll('canvas')].map((c) => `${c.width}x${c.height} parent=${(c.parentElement?.className || '').toString().slice(0, 40)}`),
  posterImgs: [...document.querySelectorAll('img[src*="poster"]')].map((i) => `${i.src.split('/').pop()} opacity=${getComputedStyle(i).opacity} vis=${i.getBoundingClientRect().width > 0}`),
  splineWrapperHTML: (document.querySelector('.rc-spline-float')?.innerHTML || 'NO .rc-spline-float').slice(0, 300),
}));

console.log('== spline-related requests:'); splineReqs.forEach((r) => console.log('  ', r));
console.log('== canvases:', JSON.stringify(census.canvases, null, 1));
console.log('== poster imgs:', JSON.stringify(census.posterImgs, null, 1));
console.log('== spline frame innerHTML head:', census.splineWrapperHTML.replace(/\s+/g, ' ').slice(0, 280));
console.log('== console (filtered):');
logs.filter((l) => /error|warn|spline|fail|wasm|draco/i.test(l)).slice(0, 15).forEach((l) => console.log('  ', l));
await browser.close();
