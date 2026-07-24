import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/capability-bg';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(2000);
await page.mouse.move(720, 450);

const isEngaged = () => page.evaluate(() => document.documentElement.style.overflow === 'hidden');
const activeDot = () => page.evaluate(() => [...document.querySelectorAll('.oc-dot')].findIndex(d => d.classList.contains('on')));
const scrollY = () => page.evaluate(() => Math.round(window.scrollY));

// 1) Scroll down until the section engages (pins + locks).
let engaged = false, steps = 0;
for (let i = 0; i < 40; i++) {
  await page.mouse.wheel(0, 500);
  await page.waitForTimeout(180);
  steps++;
  if (await isEngaged()) { engaged = true; break; }
}
console.log(`engaged: ${engaged} after ${steps} wheel steps; active=${await activeDot()}; scrollY=${await scrollY()}`);
if (!engaged) { console.log('FAILED to engage'); await browser.close(); process.exit(1); }

// 2) Skip test: rapid flick during card 0's 2s hold must NOT advance and must stay pinned.
const y0 = await scrollY();
for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 500); await page.waitForTimeout(25); }
console.log(`after fast flick during hold: active=${await activeDot()} (expect 0), scrollY=${await scrollY()} (expect ${y0}, pinned)`);
await page.screenshot({ path: `${OUT}/lock-card0.png` });

// 3) Dwell measurement: keep scrolling; sample active over ~12s; derive hold durations.
const samples = [];
const t0 = Date.now();
while (Date.now() - t0 < 12500) {
  await page.mouse.wheel(0, 300); // continuous forward intent
  const a = await activeDot();
  samples.push({ t: Date.now() - t0, a, eng: await isEngaged() });
  await page.waitForTimeout(120);
}
// derive change timestamps
const changes = [];
for (let i = 1; i < samples.length; i++) if (samples[i].a !== samples[i-1].a) changes.push({ from: samples[i-1].a, to: samples[i].a, t: samples[i].t });
console.log('card-change timeline (ms from engage):');
let prev = 0;
for (const c of changes) { console.log(`  -> card ${c.to} at ${c.t}ms  (held previous ~${c.t - prev}ms)`); prev = c.t; }
const finalEngaged = samples[samples.length-1].eng;
console.log(`final active=${samples[samples.length-1].a}, still engaged=${finalEngaged}`);

await page.screenshot({ path: `${OUT}/lock-final.png` });
await browser.close();
console.log('done');
