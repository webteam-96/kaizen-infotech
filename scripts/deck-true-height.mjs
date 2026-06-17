import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
let globalMax = 0;
for (const [w, h] of [[1024, 768], [1280, 800], [1440, 900], [1920, 1080]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(2200);
  const res = await page.evaluate(() => {
    const deck = document.querySelector('div[style*="600vh"]');
    const els = deck ? Array.from(deck.querySelectorAll('.flex.flex-col.rounded-\\[var\\(--radius-xl\\)\\]')) : [];
    return els.map((c) => {
      const fixed = c.offsetHeight;            // layout height = H (transform-independent)
      const prev = c.style.height;
      c.style.height = 'auto';
      const trueContent = c.offsetHeight;      // unscaled natural content height
      c.style.height = prev;
      const t = c.querySelector('h3');
      return { H: fixed, content: trueContent, overflow: trueContent > fixed, title: t ? t.textContent.slice(0, 16) : '?' };
    });
  });
  const max = Math.max(...res.map((r) => r.content));
  globalMax = Math.max(globalMax, max);
  console.log(`${w}px (H=${res[0]?.H}) ->`, JSON.stringify(res.map(r => `${r.title}:${r.content}${r.overflow ? ' OVERFLOW' : ''}`)));
  await ctx.close();
}
console.log(`\nTRUE GLOBAL MAX CONTENT HEIGHT = ${globalMax}px`);
await browser.close();
