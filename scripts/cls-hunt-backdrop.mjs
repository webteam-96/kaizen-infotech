// Identify the mystery backdrop: every frame, find '.absolute.inset-0.-z-10'
// nodes whose visible rect starts near the viewport origin, and dump their
// ancestor chain (who is the containing block at that moment?).
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1350, height: 940 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

await page.addInitScript(() => {
  window.__hits = [];
  const chain = (el) => {
    const parts = [];
    let n = el;
    for (let i = 0; n && i < 8; i++) {
      const cls = (typeof n.className === 'string' ? n.className : '').slice(0, 48);
      const pos = n.nodeType === 1 ? getComputedStyle(n).position : '';
      parts.push(`${n.tagName?.toLowerCase()}[${pos}]${cls ? '.' + cls.split(/\s+/).slice(0, 3).join('.') : ''}`);
      n = n.parentElement;
    }
    return parts.join(' < ');
  };
  const sample = (t) => {
    for (const el of document.querySelectorAll('.absolute.inset-0')) {
      const r = el.getBoundingClientRect();
      if (r.y < 10 && r.width > 1000 && r.height > 200) {
        window.__hits.push({ t: Math.round(t), rect: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`, chain: chain(el) });
        if (window.__hits.length > 12) return; // enough
      }
    }
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
});

const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
await cdp.send('Network.emulateNetworkConditions', {
  offline: false, latency: 40,
  downloadThroughput: (10 * 1024 * 1024) / 8,
  uploadThroughput: (5 * 1024 * 1024) / 8,
});

await page.goto('http://localhost:3100/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(6000);

const hits = await page.evaluate(() => window.__hits);
if (!hits.length) console.log('no viewport-origin backdrop caught');
for (const h of hits.slice(0, 8)) console.log(`@${h.t}ms ${h.rect}\n   ${h.chain}\n`);
await browser.close();
