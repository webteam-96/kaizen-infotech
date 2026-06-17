import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
// Measure the natural content height each card needs at the 320px deck width.
for (const [w, h] of [[1024, 768], [1440, 900]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(2500);
  const res = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('div[style*="600vh"] div[style*="width: 320px"], div[style*="600vh"] div[style*="width:320px"]'));
    // Fallback: any absolutely-positioned deck card
    const deck = document.querySelector('div[style*="600vh"]');
    const els = deck ? Array.from(deck.querySelectorAll('.flex.flex-col.rounded-\\[var\\(--radius-xl\\)\\]')) : [];
    return els.map((c) => {
      const prevH = c.style.height;
      c.style.height = 'auto';      // let it grow to content
      const needed = Math.ceil(c.getBoundingClientRect().height);
      c.style.height = prevH;       // restore
      const t = c.querySelector('h3');
      return { needed, title: t ? t.textContent.slice(0, 22) : '?' };
    });
  });
  const max = Math.max(...res.map((r) => r.needed));
  console.log(`${w}x${h}: max needed = ${max}px ->`, JSON.stringify(res));
  await ctx.close();
}
await browser.close();
