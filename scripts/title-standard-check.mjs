import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';
const OUT = 'audit-shots/titles';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));

// Collect computed font-size (px) of every section <h2> on a page.
async function titlesOn(url) {
  await page.goto('http://localhost:3000' + url, { waitUntil: 'load', timeout: 45000 });
  await page.waitForTimeout(2500);
  return page.evaluate(() => {
    const out = [];
    document.querySelectorAll('h2').forEach((h) => {
      const t = (h.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 42);
      if (!t) return;
      const fs = parseFloat(getComputedStyle(h).fontSize);
      out.push({ t, fs: Math.round(fs * 10) / 10 });
    });
    return out;
  });
}

for (const url of ['/services', '/about', '/']) {
  const titles = await titlesOn(url);
  console.log('\n=== ' + url + ' (h2 font sizes, px) ===');
  titles.forEach((x) => console.log(`  ${String(x.fs).padStart(5)}px  ${x.t}`));
}
await browser.close();
console.log('\ndone');
