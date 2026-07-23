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
    const footer = document.querySelector('footer');
    if (footer) {
      const r = footer.getBoundingClientRect();
      if (r.y < 10 && r.height > 100) {
        // Flash frame: dump the footer's siblings — who is (or isn't) above it?
        const sibs = footer.parentElement
          ? [...footer.parentElement.children].map(
              (c) =>
                `${c.tagName.toLowerCase()}.${(typeof c.className === 'string' ? c.className : '').split(/\s+/).slice(0, 2).join('.')}=h${c.offsetHeight}`,
            )
          : [];
        window.__hits.push({
          t: Math.round(t),
          rect: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`,
          mainExists: !!document.querySelector('main'),
          mainH: document.querySelector('main')?.offsetHeight ?? -1,
          mainMinH: document.querySelector('main') ? getComputedStyle(document.querySelector('main')).minHeight : 'n/a',
          sibs: sibs.slice(0, 8),
          chain: chain(footer),
        });
        if (window.__hits.length > 6) return;
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
for (const h of hits.slice(0, 4)) console.log(JSON.stringify(h, null, 1));
await browser.close();
