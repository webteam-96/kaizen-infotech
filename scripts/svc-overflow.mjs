import { chromium } from 'playwright-core';
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=swiftshader'] });
for (const [w,h] of [[390,844],[768,1024],[820,1180],[1280,800]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen','1'));
  try { await page.goto('http://localhost:3000/', { waitUntil:'load', timeout:45000 }); } catch {}
  await page.waitForTimeout(2500);
  const geom = await page.evaluate(()=>{const s=document.querySelector('[data-section-index="2"] section');return {top:window.scrollY+s.getBoundingClientRect().top,H:s.offsetHeight};});
  await page.evaluate((y)=>window.scrollTo(0,y), geom.top+geom.H*0.4);
  await page.waitForTimeout(1200);
  const o = await page.evaluate(()=>({docW:document.documentElement.scrollWidth, win:window.innerWidth, overflow:document.documentElement.scrollWidth>window.innerWidth}));
  console.log(`${w} -> ${JSON.stringify(o)}`);
  await ctx.close();
}
await browser.close();
