// Quick shot of the /bgtest harness for HexDomeBackground iteration.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const OUT = 'audit-shots/hexdome';
mkdirSync(OUT, { recursive: true });
const tag = process.argv[2] || 'v';

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
await page.goto('http://localhost:3000/bgtest', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/${tag}-a.png` });
await page.waitForTimeout(4000);
await page.screenshot({ path: `${OUT}/${tag}-b.png` });
await browser.close();
console.log('done', tag);
