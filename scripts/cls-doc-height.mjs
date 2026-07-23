// Sample document height + <main>'s direct children heights every frame; log
// only when the document height CHANGES. Pinpoints what collapses during the
// spacer -> experience handoff under throttled (PSI-like) conditions.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1350, height: 940 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

await page.addInitScript(() => {
  window.__doc = [];
  const sample = (t) => {
    const h = document.documentElement.scrollHeight;
    const last = window.__doc[window.__doc.length - 1];
    if (!last || Math.abs(last.h - h) > 4) {
      const main = document.querySelector('main');
      window.__doc.push({
        t: Math.round(t),
        h,
        kids: main
          ? [...main.children].map(
              (c) =>
                `${c.tagName.toLowerCase()}.${(typeof c.className === 'string' ? c.className : '').slice(0, 24)}=${c.offsetHeight}`,
            )
          : [],
      });
    }
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
});

const cdp = await ctx.newCDPSession(page);
await cdp.send('Network.enable');
await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
await cdp.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 40,
  downloadThroughput: (10 * 1024 * 1024) / 8,
  uploadThroughput: (5 * 1024 * 1024) / 8,
});

await page.goto('https://www.kaizeninfotech.com/', { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
await page.waitForTimeout(12000);

const doc = await page.evaluate(() => window.__doc);
for (const d of doc.slice(0, 20)) {
  console.log(`@${d.t}ms docH=${d.h}`);
  for (const k of d.kids.slice(0, 6)) console.log(`   ${k}`);
}
await browser.close();
