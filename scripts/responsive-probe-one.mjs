import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';

// Targeted single-viewport probe for verifying a specific responsive finding.
// Usage:
//   node scripts/responsive-probe-one.mjs <route> <width> <height> [touch01] [selector] [shotName] [scrollY]
// Example:
//   node scripts/responsive-probe-one.mjs / 390 844 1 ".deck-shortfit" deck-390 4200
// Prints JSON metrics to stdout; optional screenshot → audit-shots/probe/<shotName>.jpg

const [route = '/', wArg = '390', hArg = '844', touchArg = '1', selector = '', shotName = '', yArg = '0'] =
  process.argv.slice(2);
const w = parseInt(wArg, 10);
const h = parseInt(hArg, 10);
const touch = touchArg === '1';
const scrollY = parseInt(yArg, 10) || 0;

const OUT = 'audit-shots/probe';
mkdirSync(OUT, { recursive: true });

let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
} catch {
  browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
}

const ctx = await browser.newContext({
  viewport: { width: w, height: h },
  isMobile: touch,
  hasTouch: touch,
  deviceScaleFactor: touch ? 2 : 1,
});
await ctx.addInitScript(() => {
  try { sessionStorage.setItem('kaizen-intro-seen', '1'); } catch {}
});
if (touch) {
  await ctx.addInitScript(() => {
    const orig = window.matchMedia.bind(window);
    window.matchMedia = (q) =>
      /hover: hover|pointer: fine/.test(q)
        ? { matches: false, media: q, onchange: null, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent() { return false; } }
        : orig(q);
  });
}
const page = await ctx.newPage();
try {
  await page.goto('http://localhost:3000' + route, { waitUntil: 'load', timeout: 60000 });
} catch {}
await page.waitForTimeout(1500);
await page.evaluate(async () => {
  const step = window.innerHeight * 0.8;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 110));
  }
  window.scrollTo(0, 0);
});
await page.evaluate((yy) => window.scrollTo(0, yy), scrollY);
await page.waitForTimeout(1400);

const result = await page.evaluate((sel) => {
  const de = document.documentElement;
  const out = {
    vw: de.clientWidth,
    innerWidth: window.innerWidth,
    pageHeight: document.body.scrollHeight,
    overflowX: Math.round(de.scrollWidth - de.clientWidth),
    scrollY: window.scrollY,
    matches: [],
  };
  if (sel) {
    for (const el of [...document.querySelectorAll(sel)].slice(0, 10)) {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.matches.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.getAttribute('class') || '').slice(0, 140),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        display: cs.display,
        position: cs.position,
        overflowX: cs.overflowX,
        fontSize: cs.fontSize,
        transform: cs.transform === 'none' ? 'none' : 'yes',
        opacity: cs.opacity,
        visibility: cs.visibility,
        scrollW: el.scrollWidth,
        clientW: el.clientWidth,
        text: (el.textContent || '').trim().slice(0, 60),
      });
    }
  }
  return out;
}, selector);

if (shotName) {
  await page.screenshot({ path: `${OUT}/${shotName}.jpg`, type: 'jpeg', quality: 70, timeout: 60000 });
  result.shot = `${OUT}/${shotName}.jpg`;
}
console.log(JSON.stringify(result, null, 1));
await browser.close();
