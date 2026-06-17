import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/service-cards';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });

// <820 => mobile vertical stack; >=820 => desktop carousel (must be unchanged)
for (const w of [375, 768, 819, 820, 1024]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(2500);

  // Scroll the first service card into view (mobile stack lives in section index 2).
  await page.evaluate(() => {
    const a = document.querySelector('article');
    if (a) a.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(1200);

  const info = await page.evaluate(() => {
    // First service card article on the page (mobile stack OR carousel deck).
    const card = document.querySelector('article');
    if (!card) return { card: null };
    const h3 = card.querySelector('h3');
    const p = card.querySelector('p');
    const icon = card.querySelector('div[class*="rounded-"]');
    const cs = (el) => el ? getComputedStyle(el) : null;
    const r = card.getBoundingClientRect();
    const c = cs(card), th = cs(h3), tp = cs(p), ic = cs(icon);
    return {
      cardW: Math.round(r.width), cardH: Math.round(r.height),
      pad: c.padding,
      title: th && th.fontSize, body: tp && tp.fontSize,
      iconW: ic && ic.width,
    };
  });
  console.log(`${w}px ->`, JSON.stringify(info));
  await page.screenshot({ path: `${OUT}/cards-${w}.png` });
  await ctx.close();
}
await browser.close();
console.log('done');
