import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/work-cards';
mkdirSync(OUT, { recursive: true });
const tag = process.argv[2] || 'before';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
try { await page.goto('http://localhost:3000/work', { waitUntil: 'networkidle', timeout: 60000 }); } catch {}
await page.waitForTimeout(1500);

// Scroll so the first sticky card is freshly stuck at its rest position
// (top:10vh, scale 1) — the scroll handler scales/tilts it once you scroll PAST,
// so land right at the lock point for a clean, undistorted view.
const top = await page.evaluate(() => {
  const a = document.querySelector('a[aria-label^="View project"]');
  const card = a?.closest('.sticky');
  return card ? Math.round(card.getBoundingClientRect().top + window.scrollY) : null;
});
if (top != null) {
  await page.evaluate((y) => window.scrollTo(0, y - Math.round(window.innerHeight * 0.10) + 8), top);
  await page.waitForTimeout(1000);
}
const diag = await page.evaluate(() => {
  const card = document.querySelector('a[aria-label^="View project"]')?.closest('.sticky');
  const panel = card?.querySelector('.bg-white\\/92') || [...(card?.querySelectorAll('div') || [])].find((d) => /bottom-/.test(d.className) && /bg-white/.test(d.className));
  const m = card ? new DOMMatrixReadOnly(getComputedStyle(card).transform) : null;
  return { scale: m ? +m.a.toFixed(3) : null, hasPanel: !!panel };
});
console.log('diag', JSON.stringify(diag));
await page.screenshot({ path: `${OUT}/${tag}.png` });
await browser.close();
console.log('shot', tag);
