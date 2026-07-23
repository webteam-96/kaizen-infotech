// Per-frame rect sampling of the handoff suspects: the hero spacer (2nd main
// child), the first .section-ink section's top, and every poster img rect.
// Logs frames where anything moves >2px. Throttled live-site run.
import { chromium } from 'playwright-core';

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1350, height: 940 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();

await page.addInitScript(() => {
  window.__el = [];
  let prev = '';
  const sample = (t) => {
    const main = document.querySelector('main');
    const hero = main?.children?.[1];
    const ink = document.querySelector('section.section-ink');
    const posters = [...document.querySelectorAll('img[src*="spline-monitor-poster"]')].map((p) => {
      const r = p.getBoundingClientRect();
      return `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)} vis=${!!(p.offsetParent || r.width)}`;
    });
    const rec = {
      t: Math.round(t),
      heroTag: hero ? `${hero.tagName}.${(typeof hero.className === 'string' ? hero.className : '').slice(0, 16)}` : '?',
      heroH: hero?.offsetHeight ?? -1,
      inkTop: ink ? Math.round(ink.getBoundingClientRect().top) : -1,
      posters,
    };
    const key = JSON.stringify([rec.heroTag, Math.round(rec.heroH / 4), Math.round(rec.inkTop / 4), rec.posters]);
    if (key !== prev) {
      prev = key;
      window.__el.push(rec);
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
await page.waitForTimeout(11000);

const rows = await page.evaluate(() => window.__el);
for (const r of rows.slice(0, 30)) {
  console.log(`@${r.t}ms hero=${r.heroTag} h=${r.heroH} inkTop=${r.inkTop} posters=[${r.posters.join(' | ')}]`);
}
await browser.close();
