import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/industries';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
for (const [w, h, label] of [[1440, 900, 'desktop'], [390, 844, 'phone']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(2500);
  const top = await page.evaluate(() => {
    const s = document.querySelector('[data-section-index="6"]');
    return window.scrollY + s.getBoundingClientRect().top;
  });
  // Approach so row 1 enters first.
  await page.evaluate((y) => window.scrollTo(0, y - 500), top);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${OUT}/${label}-1-approach.png` });
  // A bit further — row 1 revealed, row 2 still entering.
  await page.evaluate((y) => window.scrollTo(0, y - 120), top);
  await page.waitForTimeout(1100);
  await page.screenshot({ path: `${OUT}/${label}-2-row1.png` });
  // Fully in view — both rows revealed.
  await page.evaluate((y) => window.scrollTo(0, y + 240), top);
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${label}-3-full.png` });
  // Card metrics
  const m = await page.evaluate(() => {
    const c = document.querySelector('.magic-bento-card');
    if (!c) return null;
    const t = c.querySelector('.magic-bento-card__title');
    const d = c.querySelector('.magic-bento-card__description');
    const r = c.getBoundingClientRect();
    const cs = (el) => el ? getComputedStyle(el).fontSize : null;
    return { cardW: Math.round(r.width), cardH: Math.round(r.height), title: cs(t), desc: cs(d), op: getComputedStyle(c).opacity };
  });
  console.log(`${label} ->`, JSON.stringify(m));
  await ctx.close();
}
await browser.close();
console.log('done');
