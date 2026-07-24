// Extract reference frames from BackDrop Rubix Section.mp4 by screenshotting a
// <video> element at seeked timestamps in real Chrome (h264-capable).
import { chromium } from 'playwright-core';
import { mkdirSync, writeFileSync } from 'fs';

const OUT = 'D:/FEBA/Claude-learn/Kaizen Infotech Solutions/kaizen-infotech/audit-shots/refvideo';
mkdirSync(OUT, { recursive: true });

const html = `<!doctype html><html><body style="margin:0;background:#000">
<video id="v" src="file:///D:/FEBA/Claude-learn/Kaizen%20Infotech%20Solutions/kaizen-infotech/BackDrop%20Rubix%20Section.mp4"
 muted style="display:block;width:1280px"></video></body></html>`;
const HTML_PATH = 'C:/Users/ASUS/AppData/Local/Temp/claude/D--FEBA-Claude-learn-Kaizen-Infotech-Solutions-kaizen-infotech/3b968c23-e2b3-43bb-b7dd-f292350ddd9e/scratchpad/video-frames.html';
writeFileSync(HTML_PATH, html);

const browser = await chromium.launch({ channel: 'chrome', args: ['--allow-file-access-from-files'] });
const page = await (await browser.newContext({ viewport: { width: 1300, height: 760 } })).newPage();
await page.goto('file:///' + HTML_PATH.replace(/ /g, '%20'));
await page.waitForFunction(() => {
  const v = document.getElementById('v');
  return v && v.readyState >= 2;
}, { timeout: 30000 });

const meta = await page.evaluate(() => {
  const v = document.getElementById('v');
  return { duration: v.duration, w: v.videoWidth, h: v.videoHeight };
});
console.log('video meta:', JSON.stringify(meta));

const times = [0.2, 1, 2, 2.5, 4, 6, 8, Math.max(0.5, meta.duration - 0.3)];
for (const t of times) {
  await page.evaluate(async (tt) => {
    const v = document.getElementById('v');
    v.currentTime = tt;
    await new Promise((res) => v.addEventListener('seeked', res, { once: true }));
  }, t);
  await page.waitForTimeout(150);
  await page.locator('#v').screenshot({ path: `${OUT}/frame-${String(t).replace('.', '_')}.png` });
  console.log('frame at', t);
}
await browser.close();
console.log('done');
