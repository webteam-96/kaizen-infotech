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

const coreGone = await page.evaluate(() => !document.querySelector('.oc-core'));
console.log('oc-core removed:', coreGone);

const geom = await page.evaluate(() => {
  const s = document.querySelector('.oc-section');
  if (!s) return null;
  const top = window.scrollY + s.getBoundingClientRect().top;
  return { top, h: s.offsetHeight, vh: window.innerHeight };
});
if (!geom) { console.log('no section'); await browser.close(); process.exit(1); }
const travel = geom.h - geom.vh;

// Fine-sample the whole section; record active + ring rotation + #visible cards.
const STEPS = 56;
const rows = [];
for (let k = 0; k <= STEPS; k++) {
  const p = k / STEPS;
  await page.evaluate((y) => window.scrollTo(0, y), geom.top + p * travel);
  await page.waitForTimeout(120);
  const s = await page.evaluate(() => {
    const dots = [...document.querySelectorAll('.oc-dot')];
    const active = dots.findIndex((d) => d.classList.contains('on'));
    const ring = document.querySelector('.oc-ring');
    const m = ring && ring.getAttribute('style') || '';
    const rot = (m.match(/rotateY\(([-\d.]+)deg\)/) || [])[1];
    const cards = [...document.querySelectorAll('.oc-card')];
    const vis = cards.filter((c) => parseFloat(getComputedStyle(c).opacity) > 0.5).length;
    return { active, rot: rot ? Math.round(parseFloat(rot)) : null, vis };
  });
  rows.push({ p: p.toFixed(3), ...s });
}
// Compact per-active dwell summary
let cur = null, start = 0;
const bands = [];
rows.forEach((r, i) => {
  if (r.active !== cur) { if (cur !== null) bands.push({ active: cur, from: rows[start].p, to: rows[i-1].p, samples: i - start }); cur = r.active; start = i; }
});
bands.push({ active: cur, from: rows[start].p, to: rows[rows.length-1].p, samples: rows.length - start });
console.log('dwell bands (active card held across a scroll range):');
for (const b of bands) console.log(`  card ${b.active}: p ${b.from}..${b.to}  (${b.samples} samples)`);
const maxVis = Math.max(...rows.map(r => r.vis));
console.log('max simultaneously-visible cards across all positions:', maxVis, '(1 = only centre card ever fully shown)');
await browser.close();
console.log('done');
