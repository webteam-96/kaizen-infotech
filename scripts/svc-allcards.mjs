import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 45000 }); } catch {}
await page.waitForTimeout(2500);
const geom = await page.evaluate(() => {
  const sec = document.querySelector('[data-section-index="2"] section');
  return { top: window.scrollY + sec.getBoundingClientRect().top, H: sec.offsetHeight };
});
for (const p of [0.45, 0.6]) {
  await page.evaluate((y) => window.scrollTo(0, y), geom.top + geom.H * p);
  await page.waitForTimeout(1600);
  const data = await page.evaluate(() => {
    const realScrollFrac = (window.scrollY) / (document.body.scrollHeight - window.innerHeight);
    const cards = Array.from(document.querySelectorAll('.deck-card'));
    return {
      realScrollFrac: realScrollFrac.toFixed(3),
      cards: cards.map((c) => {
        const r = c.getBoundingClientRect();
        const m = new DOMMatrix(getComputedStyle(c).transform);
        return { w: Math.round(r.width), cx: Math.round(r.left + r.width / 2), scale: m.a.toFixed(2), op: getComputedStyle(c).opacity.slice(0,4) };
      }),
    };
  });
  console.log(`scrollTo p=${p}`, JSON.stringify(data));
}
await browser.close();
