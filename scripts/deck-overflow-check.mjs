import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
let globalMax = 0;
for (const [w, h] of [[1024, 768], [1280, 800], [1366, 768], [1440, 900], [1536, 864], [1920, 1080]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  try { await page.goto('http://localhost:3000/services', { waitUntil: 'load', timeout: 45000 }); } catch {}
  await page.waitForTimeout(2200);
  const res = await page.evaluate(() => {
    const deck = document.querySelector('div[style*="600vh"]');
    const els = deck ? Array.from(deck.querySelectorAll('.flex.flex-col.rounded-\\[var\\(--radius-xl\\)\\]')) : [];
    return els.map((c) => {
      const fixedH = c.getBoundingClientRect().height; // = H (460)
      const prev = c.style.height;
      c.style.height = 'auto';
      const natural = Math.ceil(c.getBoundingClientRect().height);
      c.style.height = prev;
      const t = c.querySelector('h3');
      return { fixedH: Math.round(fixedH), natural, overflow: natural > Math.round(fixedH), title: t ? t.textContent.slice(0, 18) : '?' };
    });
  });
  const max = Math.max(...res.map((r) => r.natural));
  globalMax = Math.max(globalMax, max);
  const anyOverflow = res.some((r) => r.overflow);
  console.log(`${w}px: maxNatural=${max} overflow=${anyOverflow} ->`, JSON.stringify(res.map(r => `${r.title}:${r.natural}${r.overflow ? '!' : ''}`)));
  await ctx.close();
}
console.log(`\nGLOBAL MAX NATURAL CONTENT HEIGHT = ${globalMax}px`);
await browser.close();
