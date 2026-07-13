// perf-probe.mjs — cold-cache, multi-device performance probe.
//
// Simulates a first-time visitor on a NEW system (fresh browser context, cache
// disabled) across several device classes, and measures what actually gets
// downloaded + how heavy the page is to run. Complements audit-shots.mjs.
//
// Usage (against a RUNNING server — prefer `npm run start` for prod-accurate
// numbers, falls back to dev):
//   node scripts/perf-probe.mjs                # label "current"
//   node scripts/perf-probe.mjs baseline       # writes perf-report/baseline.json
//   node scripts/perf-probe.mjs after          # writes perf-report/after.json
//
// Must launch chromium with swiftshader (software GL — matches no-GPU CI boxes).
// Sets sessionStorage['kaizen-intro-seen']='1' to skip the intro loader.

import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';

const BASE = process.env.BASE || 'http://localhost:3000';
const LABEL = process.argv[2] || 'current';
const OUT = 'perf-report';
mkdirSync(OUT, { recursive: true });
mkdirSync(`${OUT}/shots`, { recursive: true });

// Device profiles: fresh cold-cache context each → first-visit simulation.
// cpuThrottle = CDP rate (1 = none, 4 = ~4x slower ≈ mid/low phone).
const PROFILES = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, dpr: 1, mobile: false, cpuThrottle: 1 },
  { name: 'ipad', viewport: { width: 820, height: 1180 }, dpr: 2, mobile: false, cpuThrottle: 2 },
  // Genuinely low-end: inject weak hardware signals so useDeviceCapability() resolves
  // liteExperience=true (the site should then skip the 3D hero + background videos).
  { name: 'mobile-lowend', viewport: { width: 390, height: 844 }, dpr: 3, mobile: true, cpuThrottle: 4, lowEnd: true },
];

// Pages to probe. Slugs picked from generateStaticParams routes.
const PAGES = [
  { path: '/', name: 'home' },
  { path: '/about', name: 'about' },
  { path: '/services/custom-software-development', name: 'service-detail' },
  { path: '/work/rotary-zones', name: 'work-detail' },
  { path: '/blog', name: 'blog' },
  { path: '/contact', name: 'contact' },
];

const TYPE_OF = (url, mime = '') => {
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url) || mime.startsWith('video/')) return 'video';
  if (/\.(png|jpe?g|webp|avif|gif|svg)(\?|$)/i.test(url) || mime.startsWith('image/')) return 'image';
  if (/\.(js|mjs)(\?|$)/i.test(url) || mime.includes('javascript')) return 'script';
  if (/\.(woff2?|ttf|otf)(\?|$)/i.test(url) || mime.includes('font')) return 'font';
  if (/\.css(\?|$)/i.test(url) || mime.includes('css')) return 'css';
  if (url.includes('spline.design') || url.includes('splinecode')) return 'spline-3d';
  return 'other';
};

function fmt(bytes) {
  if (bytes > 1048576) return (bytes / 1048576).toFixed(2) + ' MB';
  if (bytes > 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return bytes + ' B';
}

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--no-sandbox'] });
const report = { label: LABEL, base: BASE, generatedAt: 'n/a (Date unavailable in scripts is fine here)', profiles: {} };

for (const prof of PROFILES) {
  report.profiles[prof.name] = { pages: {} };
  for (const pg of PAGES) {
    const ctx = await browser.newContext({
      viewport: prof.viewport,
      deviceScaleFactor: Math.min(prof.dpr, 2), // swiftshader OOMs above 2
      isMobile: prof.mobile,
      hasTouch: prof.mobile,
      bypassCSP: false,
    });
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      try { sessionStorage.setItem('kaizen-intro-seen', '1'); } catch {}
    });
    if (prof.lowEnd) {
      // Emulate a weak device/connection so the capability gate takes the lite path.
      await page.addInitScript(() => {
        try {
          Object.defineProperty(navigator, 'deviceMemory', { get: () => 2, configurable: true });
          Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2, configurable: true });
          Object.defineProperty(navigator, 'connection', {
            get: () => ({ saveData: false, effectiveType: '3g', addEventListener() {}, removeEventListener() {} }),
            configurable: true,
          });
        } catch {}
      });
    }

    // CDP: disable cache (cold), throttle CPU, capture true wire bytes.
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (prof.cpuThrottle > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: prof.cpuThrottle });

    const byType = {};
    let totalBytes = 0;
    let reqCount = 0;
    const biggest = [];
    const urlMime = new Map();
    cdp.on('Network.responseReceived', (e) => urlMime.set(e.requestId, { url: e.response.url, mime: e.response.mimeType || '' }));
    cdp.on('Network.loadingFinished', (e) => {
      const info = urlMime.get(e.requestId);
      if (!info) return;
      const bytes = e.encodedDataLength || 0;
      const t = TYPE_OF(info.url, info.mime);
      byType[t] = (byType[t] || 0) + bytes;
      totalBytes += bytes;
      reqCount++;
      biggest.push({ url: info.url.replace(BASE, '').slice(0, 80), bytes, type: t });
    });

    let navOk = true;
    try {
      await page.goto(BASE + pg.path, { waitUntil: 'domcontentloaded', timeout: 45000 });
    } catch { navOk = false; }
    // Let the hero + lazy media settle (mirrors a real few seconds of viewing).
    await page.waitForTimeout(pg.name === 'home' ? 6000 : 3500);
    // Scroll through to trigger lazy videos/images (footer video, section backdrops).
    try {
      await page.evaluate(async () => {
        const h = document.body.scrollHeight;
        for (let y = 0; y <= h; y += window.innerHeight * 0.8) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 350));
        }
        window.scrollTo(0, 0);
      });
    } catch {}
    await page.waitForTimeout(2500);

    let metrics = {};
    try {
      metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] || {};
        const paints = performance.getEntriesByType('paint') || [];
        const fcp = paints.find((p) => p.name === 'first-contentful-paint');
        const mem = performance.memory ? performance.memory.usedJSHeapSize : null;
        let lcp = null;
        try {
          const lcps = performance.getEntriesByType('largest-contentful-paint');
          if (lcps.length) lcp = Math.round(lcps[lcps.length - 1].startTime);
        } catch {}
        return {
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
          loadEvent: Math.round(nav.loadEventEnd || 0),
          fcp: fcp ? Math.round(fcp.startTime) : null,
          lcp,
          jsHeapMB: mem ? +(mem / 1048576).toFixed(1) : null,
          domNodes: document.getElementsByTagName('*').length,
        };
      });
    } catch {}

    try {
      await page.screenshot({ path: `${OUT}/shots/${LABEL}-${prof.name}-${pg.name}.png`, timeout: 30000 });
    } catch {}

    biggest.sort((a, b) => b.bytes - a.bytes);
    const typeSummary = Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, fmt(v)]));
    report.profiles[prof.name].pages[pg.name] = {
      path: pg.path,
      navOk,
      totalTransfer: fmt(totalBytes),
      totalBytes,
      requests: reqCount,
      byType: typeSummary,
      top5: biggest.slice(0, 5).map((b) => `${fmt(b.bytes)} ${b.type} ${b.url}`),
      metrics,
    };
    console.log(`[${prof.name}] ${pg.name.padEnd(14)} ${fmt(totalBytes).padStart(9)}  ${reqCount} reqs  LCP=${metrics.lcp ?? '?'}ms  heap=${metrics.jsHeapMB ?? '?'}MB`);

    await ctx.close();
  }
}

writeFileSync(`${OUT}/${LABEL}.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(`\nWrote ${OUT}/${LABEL}.json`);
