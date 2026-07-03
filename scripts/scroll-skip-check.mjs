import { chromium } from 'playwright-core';

const CARDS = ['card-s1', 'card-s2', 'card-s3', 'card-s4', 'card-s6', 'card-s7', 'card-s8'];

const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader', '--autoplay-policy=no-user-gesture-required'] });

async function run(label, vw, vh, flickSize) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));
  await page.goto('http://localhost:3000/', { waitUntil: 'load', timeout: 60000 });
  await page.waitForTimeout(6000);

  // Start the intro autoplay (Enter) and wait for it to finish + unlock.
  await page.mouse.move(vw / 2, vh / 2);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(4000);

  // Begin a page-context sampler that records the max opacity each card reaches,
  // plus the scroll position at which it first crosses 0.99 (to gauge per-card
  // scroll distance).
  await page.evaluate((cards) => {
    const peak = {}; const peakY = {}; const firstFullY = {};
    cards.forEach((c) => { peak[c] = 0; });
    window.__scrollProbe = { peak, peakY, firstFullY, samples: 0 };
    const loop = () => {
      const y = window.scrollY;
      cards.forEach((c) => {
        const el = document.querySelector(`[data-card="${c}"]`);
        if (!el) return;
        const o = parseFloat(getComputedStyle(el).opacity) || 0;
        if (o > window.__scrollProbe.peak[c]) { window.__scrollProbe.peak[c] = o; window.__scrollProbe.peakY[c] = y; }
        if (o >= 0.99 && window.__scrollProbe.firstFullY[c] === undefined) window.__scrollProbe.firstFullY[c] = y;
      });
      window.__scrollProbe.samples++;
      window.__scrollProbe._raf = requestAnimationFrame(loop);
    };
    loop();
  }, CARDS);

  // Realistic FAST scroll: stepped wheel bursts covering the whole section in a
  // couple of seconds (a hurried user), sampling continuously. Not a single
  // teleport (which would overshoot past the section and freeze it).
  const maxScroll = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
  const steps = Math.ceil(maxScroll / flickSize);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, flickSize);
    await page.waitForTimeout(110); // ~fast flick cadence
  }
  // Let the velocity-capped narrative finish catching up to the last cards.
  await page.waitForTimeout(3000);

  const probe = await page.evaluate(() => {
    cancelAnimationFrame(window.__scrollProbe._raf);
    const { peak, firstFullY, samples } = window.__scrollProbe;
    return { peak, firstFullY, samples, maxScroll: document.documentElement.scrollHeight - window.innerHeight, finalY: window.scrollY };
  });

  console.log(`\n=== ${label} (${vw}x${vh}, flick ${flickSize}/burst x6) ===`);
  console.log(`samples=${probe.samples}  finalY=${Math.round(probe.finalY)}  maxScroll=${Math.round(probe.maxScroll)}`);
  let prevY;
  for (const c of CARDS) {
    const pk = probe.peak[c].toFixed(3);
    const fy = probe.firstFullY[c];
    const gap = (fy !== undefined && prevY !== undefined) ? `  Δ${Math.round(fy - prevY)}px` : '';
    const ok = probe.peak[c] >= 0.99 ? 'OK  ' : 'SKIP';
    console.log(`  ${ok} ${c}  peak=${pk}  firstFullY=${fy ?? '—'}${gap}`);
    if (fy !== undefined) prevY = fy;
  }
  await ctx.close();
}

await run('FAST SCROLL desktop', 1440, 900, 1300);
await run('FAST SCROLL mobile', 390, 844, 1100);
await browser.close();
console.log('\ndone');
