// Attribute layout shifts on a FIRST visit (countdown loader runs — mirrors the
// PSI lab pass, which never scrolls and never sets kaizen-intro-seen).
// Usage: node scripts/cls-trace.mjs [port|live] [touch]
//   'live' targets https://www.kaizeninfotech.com with cold cache + PSI-like
//   network throttling (40ms RTT / 10Mbps) so timing-dependent shifts reproduce.
import { chromium } from 'playwright-core';

const TARGET = process.argv[2] || '3100';
const LIVE = TARGET === 'live';
const TOUCH = process.argv.includes('touch');
// 'throttle' arg applies the PSI-like network shaping to localhost targets too
// (the shifts are timing-dependent; unthrottled localhost hides them).
const THROTTLE = LIVE || process.argv.includes('throttle');

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext(
  TOUCH
    ? { viewport: { width: 412, height: 823 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1.75 }
    : { viewport: { width: 1350, height: 940 }, deviceScaleFactor: 1 },
);
const page = await ctx.newPage();

// Collect every layout-shift with source attribution, from before first paint.
await page.addInitScript(() => {
  window.__shifts = [];
  const desc = (n) => {
    if (!n) return '(no node)';
    const el = n.nodeType === 1 ? n : n.parentElement;
    if (!el) return n.nodeName || '(text)';
    const cls = (typeof el.className === 'string' ? el.className : '').split(/\s+/).slice(0, 4).join('.');
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls : ''} txt="${(el.textContent || '').trim().slice(0, 40)}"`;
  };
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({
        t: Math.round(e.startTime),
        value: +e.value.toFixed(5),
        sources: (e.sources || []).map((s) => ({
          node: desc(s.node),
          prev: `${s.previousRect.x},${s.previousRect.y} ${s.previousRect.width}x${s.previousRect.height}`,
          cur: `${s.currentRect.x},${s.currentRect.y} ${s.currentRect.width}x${s.currentRect.height}`,
        })),
      });
    }
  }).observe({ type: 'layout-shift', buffered: true });
});

if (THROTTLE) {
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 40,
    downloadThroughput: (10 * 1024 * 1024) / 8,
    uploadThroughput: (5 * 1024 * 1024) / 8,
  });
}
const url = LIVE ? 'https://www.kaizeninfotech.com/' : `http://localhost:${TARGET}/`;
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
// Ride through the full countdown (~7.75s) + settle.
await page.waitForTimeout(15000);

const shifts = await page.evaluate(() => window.__shifts);
const total = shifts.reduce((a, s) => a + s.value, 0);
console.log(`total CLS: ${total.toFixed(4)}  (${shifts.length} events)`);
for (const s of shifts.sort((a, b) => b.value - a.value).slice(0, 8)) {
  console.log(`\n[${s.value}] @${s.t}ms`);
  for (const src of s.sources.slice(0, 5)) console.log(`   ${src.node}\n      ${src.prev} -> ${src.cur}`);
}
await browser.close();
