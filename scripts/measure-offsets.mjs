import { chromium } from 'playwright-core';

// Report offsetTop + height of selectors so we can compute a settled-pin scrollY.
// args: <route> <WxH> <t|d> <selector1> [selector2...]
const [route0, wh, mode, ...sels] = process.argv.slice(2);
const route = route0 === 'home' ? '/' : route0;
const [w, h] = wh.split('x').map(Number);
const touch = mode === 't';

let browser;
try { browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] }); }
catch { browser = await chromium.launch({ args: ['--use-angle=swiftshader'] }); }
const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: touch, hasTouch: touch, deviceScaleFactor: touch ? 2 : 1 });
await ctx.addInitScript(() => { try { sessionStorage.setItem('kaizen-intro-seen', '1'); } catch {} });
if (touch) {
  await ctx.addInitScript(() => {
    const orig = window.matchMedia.bind(window);
    window.matchMedia = (q) => /hover: hover|pointer: fine/.test(q)
      ? { matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } }
      : orig(q);
  });
}
const page = await ctx.newPage();
try { await page.goto('http://localhost:3000' + route, { waitUntil: 'load', timeout: 60000 }); } catch {}
await page.waitForTimeout(1500);
await page.evaluate(async () => {
  const step = window.innerHeight * 0.8;
  for (let y = 0; y < document.body.scrollHeight; y += step) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 110)); }
  window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 200));
});
const out = await page.evaluate((sels) => {
  const r = { pageHeight: document.body.scrollHeight, innerHeight: window.innerHeight };
  r.els = sels.map((s) => {
    const list = [...document.querySelectorAll(s)];
    if (!list.length) return { sel: s, found: false };
    return {
      sel: s, count: list.length,
      items: list.slice(0, 8).map((el) => {
        const rect = el.getBoundingClientRect();
        return { offsetTop: Math.round(rect.top + window.scrollY), height: Math.round(rect.height), scrollHeight: el.scrollHeight };
      }),
    };
  });
  return r;
}, sels);
console.log(JSON.stringify(out, null, 1));
await browser.close();
