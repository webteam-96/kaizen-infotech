import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/about-red';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/about', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
await page.waitForTimeout(1500);

// Find the "Our Values" pinned section and the "How We Work" section, scroll each
// into view, and confirm a red top accent bar exists on the cards.
const scan = await page.evaluate(() => {
  const out = {};
  const valuesCard = document.querySelector('.card-red-accent');
  out.foundAccentCards = document.querySelectorAll('.card-red-accent').length;
  // computed ::after of first accent card
  if (valuesCard) {
    const cs = getComputedStyle(valuesCard, '::after');
    out.barHeight = cs.height;
    out.barBg = cs.backgroundImage.slice(0, 60);
  }
  return out;
});
console.log('accent scan:', JSON.stringify(scan));

// Screenshot Our Values (KaizenValues is a pinned 90vh*5 section).
const valuesTop = await page.evaluate(() => {
  const h = [...document.querySelectorAll('h2')].find((e) => /Kaizen Way/i.test(e.textContent));
  const sec = h?.closest('div.relative') || h?.closest('section');
  return sec ? Math.round(sec.getBoundingClientRect().top + window.scrollY) : null;
});
if (valuesTop != null) {
  await page.evaluate((y) => window.scrollTo(0, y + 50), valuesTop);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/our-values.png` });
}

// Screenshot How We Work (Delivery Process).
const hwwTop = await page.evaluate(() => {
  const h = [...document.querySelectorAll('h2')].find((e) => /Delivery Process/i.test(e.textContent));
  return h ? Math.round(h.getBoundingClientRect().top + window.scrollY) : null;
});
if (hwwTop != null) {
  await page.evaluate((y) => window.scrollTo(0, y - 80), hwwTop);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/how-we-work.png` });
}
await browser.close();
console.log('done');
