import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'node:fs';

// Exhaustive responsive matrix: every public page at every real-device viewport.
// Screenshots (viewport-sized, at scroll steps) + hard metrics: horizontal
// overflow with offending elements, tiny fonts, small tap targets, section
// widths, viewport meta. Manifest lands in audit-shots/matrix/manifest.json.

const BASE = 'http://localhost:3000';
const OUT = 'audit-shots/matrix';
mkdirSync(OUT, { recursive: true });

// [route, slug, maxShots]
const PAGES = [
  ['/', 'home', 14],
  ['/about', 'about', 10],
  ['/services', 'services', 10],
  ['/work', 'work', 10],
  ['/blog', 'blog', 8],
  ['/contact', 'contact', 8],
  ['/careers', 'careers', 8],
  ['/privacy', 'privacy', 6],
  ['/terms', 'terms', 6],
  ['/services/custom-software-development', 'svc-detail', 10],
  ['/work/rotary-zones', 'work-detail', 10],
  ['/blog/aaykar-kutumb-digitized-handbook-for-50000-income-tax-officers', 'blog-detail', 8],
];

// [label, w, h, touch, dpr, takeShots] — takeShots=false → metrics only
// (near-duplicate widths still get measured, just not screenshotted).
const VIEWPORTS = [
  ['360x640', 360, 640, true, 2, true],
  ['375x667', 375, 667, true, 2, false],
  ['390x844', 390, 844, true, 2, true],
  ['393x852', 393, 852, true, 2, false],
  ['430x932', 430, 932, true, 2, true],
  ['768x1024', 768, 1024, true, 2, true],
  ['810x1080', 810, 1080, true, 2, false],
  ['820x1180', 820, 1180, true, 2, true],
  ['1024x1366', 1024, 1366, true, 2, true],
  ['1280x800', 1280, 800, false, 1, true],
  ['1366x768', 1366, 768, false, 1, true],
  ['1440x900', 1440, 900, false, 1, true],
  ['1536x960', 1536, 960, false, 1, false],
  ['1920x1080', 1920, 1080, false, 1, true],
  ['2560x1440', 2560, 1440, false, 1, true],
  ['3440x1440', 3440, 1440, false, 1, false],
  ['3840x2160', 3840, 2160, false, 1, true],
];

const CONCURRENCY = 3;

let browser;
try {
  browser = await chromium.launch({
    channel: 'chrome',
    args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
} catch {
  browser = await chromium.launch({
    args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'],
  });
}

const manifest = [];
const saveManifest = () =>
  writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest, null, 1));

async function runTask([route, slug, maxShots], [label, w, h, touch, dpr, takeShots]) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: h },
    isMobile: touch,
    hasTouch: touch,
    deviceScaleFactor: dpr,
    reducedMotion: 'no-preference',
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
  const name = `${slug}-${label}`;
  const entry = { page: route, slug, vp: label, w, h, touch, shots: [], metrics: null, error: null };
  try {
    try {
      await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 });
    } catch {}
    await page.waitForTimeout(1500);

    // Scroll through once to mount lazy/reveal-gated content, then back to top.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 110));
      }
      window.scrollTo(0, 0);
      await new Promise((r) => setTimeout(r, 250));
    });

    const total = await page.evaluate(() => document.body.scrollHeight);
    if (takeShots) {
      const stepH = Math.round(h * 0.85);
      const needed = Math.ceil(Math.max(0, total - h) / stepH) + 1;
      let ys = [];
      if (needed <= maxShots) {
        for (let i = 0; i < needed; i++) ys.push(Math.min(i * stepH, Math.max(0, total - h)));
      } else {
        const stride = (total - h) / (maxShots - 1);
        for (let i = 0; i < maxShots; i++) ys.push(Math.round(i * stride));
      }
      ys = [...new Set(ys)];
      for (let i = 0; i < ys.length; i++) {
        await page.evaluate((yy) => window.scrollTo(0, yy), ys[i]);
        await page.waitForTimeout(1100);
        const file = `${name}-s${String(i).padStart(2, '0')}.jpg`;
        try {
          await page.screenshot({ path: `${OUT}/${file}`, type: 'jpeg', quality: 65, timeout: 60000 });
          entry.shots.push({ file, y: ys[i] });
        } catch (e) {
          entry.shots.push({ file: null, y: ys[i], error: String(e).split('\n')[0] });
        }
      }
    }

    entry.metrics = await page.evaluate((isTouch) => {
      const de = document.documentElement;
      const vw = de.clientWidth;
      const selOf = (el) => {
        const parts = [];
        let e = el;
        for (let i = 0; e && e.nodeType === 1 && i < 4; i++) {
          let s = e.tagName.toLowerCase();
          if (e.id) { parts.unshift(s + '#' + e.id); break; }
          const cls = (e.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
          if (cls) s += '.' + cls;
          parts.unshift(s);
          e = e.parentElement;
        }
        return parts.join('>');
      };
      // Horizontal-overflow offenders: elements sticking past the viewport that
      // are NOT clipped by an overflow-hidden/scroll ancestor. Topmost only.
      const flagged = new Set();
      const offenders = [];
      for (const el of document.querySelectorAll('body *')) {
        if (offenders.length >= 20) break;
        if (['SCRIPT', 'STYLE', 'LINK', 'META', 'NOSCRIPT'].includes(el.tagName)) continue;
        let anc = el.parentElement, childOfFlagged = false;
        while (anc && anc !== document.body) {
          if (flagged.has(anc)) { childOfFlagged = true; break; }
          anc = anc.parentElement;
        }
        if (childOfFlagged) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        if (r.right <= vw + 1 && r.left >= -1) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        let p = el.parentElement, clipped = false;
        while (p && p !== document.body) {
          const ps = getComputedStyle(p);
          if (/hidden|clip|auto|scroll/.test(ps.overflowX)) { clipped = true; break; }
          p = p.parentElement;
        }
        if (clipped) continue;
        flagged.add(el);
        offenders.push({
          sel: selOf(el),
          left: Math.round(r.left),
          right: Math.round(r.right),
          width: Math.round(r.width),
          pos: cs.position,
          opacity: cs.opacity,
          transformed: cs.transform !== 'none',
        });
      }
      // Tiny fonts (<12px computed, visible, with real text).
      let tinyCount = 0;
      const tinySamples = [];
      for (const el of document.querySelectorAll('body *')) {
        let hasText = false;
        for (const n of el.childNodes) {
          if (n.nodeType === 3 && n.textContent.trim().length > 2) { hasText = true; break; }
        }
        if (!hasText) continue;
        const cs = getComputedStyle(el);
        const fs = parseFloat(cs.fontSize);
        if (!fs || fs >= 12) continue;
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        tinyCount++;
        if (tinySamples.length < 10) {
          tinySamples.push({ sel: selOf(el), px: Math.round(fs * 10) / 10, text: el.textContent.trim().slice(0, 40) });
        }
      }
      // Small tap targets (touch viewports only): interactive elements < 24px.
      let tapCount = 0;
      const tapSamples = [];
      if (isTouch) {
        for (const el of document.querySelectorAll('a,button,[role="button"],input:not([type="hidden"]),select,textarea')) {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) continue;
          if (r.width >= 24 && r.height >= 24) continue;
          tapCount++;
          if (tapSamples.length < 12) {
            tapSamples.push({
              sel: selOf(el),
              w: Math.round(r.width),
              h: Math.round(r.height),
              text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30),
            });
          }
        }
      }
      const sections = [...document.querySelectorAll('main > *')].slice(0, 15).map((s) => ({
        tag: s.tagName.toLowerCase(),
        cls: (s.getAttribute('class') || '').slice(0, 60),
        width: Math.round(s.getBoundingClientRect().width),
      }));
      return {
        viewportMeta: document.querySelector('meta[name="viewport"]')?.getAttribute('content') || null,
        vw,
        innerWidth: window.innerWidth,
        pageHeight: document.body.scrollHeight,
        overflowX: Math.round(de.scrollWidth - de.clientWidth),
        bodyOverflowX: Math.round(document.body.scrollWidth - vw),
        offenders,
        tinyFontCount: tinyCount,
        tinyFontSamples: tinySamples,
        smallTapCount: tapCount,
        smallTapSamples: tapSamples,
        sections,
      };
    }, touch);

    const flag = entry.metrics.overflowX > 0 ? `  OVERFLOW=${entry.metrics.overflowX}px` : '';
    process.stdout.write(`done ${name}  shots=${entry.shots.length}${flag}\n`);
  } catch (err) {
    entry.error = String(err).split('\n')[0];
    process.stdout.write(`FAIL ${name}: ${entry.error}\n`);
  } finally {
    await ctx.close();
  }
  manifest.push(entry);
  saveManifest();
}

const tasks = [];
for (const p of PAGES) for (const v of VIEWPORTS) tasks.push([p, v]);

let idx = 0;
async function worker() {
  while (idx < tasks.length) {
    const t = tasks[idx++];
    await runTask(t[0], t[1]);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

await browser.close();

// Compact summary for the log.
console.log('\n=== HORIZONTAL OVERFLOW (px past viewport) ===');
for (const r of manifest) {
  if (r.metrics && r.metrics.overflowX > 0) {
    console.log(`  ${r.page} @${r.vp}: ${r.metrics.overflowX}px  offenders: ${r.metrics.offenders.slice(0, 3).map((o) => o.sel).join(' | ')}`);
  }
}
console.log('\n=== TINY FONTS (<12px) ===');
for (const r of manifest) {
  if (r.metrics && r.metrics.tinyFontCount > 0) {
    console.log(`  ${r.page} @${r.vp}: ${r.metrics.tinyFontCount} elements`);
  }
}
console.log(`\nmanifest: ${OUT}/manifest.json  entries=${manifest.length}`);
console.log('done');
