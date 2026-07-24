// Verify contact-info updates: contact card, careers no-role card, footer.
import { chromium } from 'playwright-core';
import { mkdirSync } from 'fs';

const OUT = 'audit-shots/contactinfo';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ args: ['--use-angle=swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.addInitScript(() => sessionStorage.setItem('kaizen-intro-seen', '1'));

// Contact page — info card
await page.goto('http://localhost:3000/contact', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(3000);
const contactText = await page.evaluate(() => document.body.innerText);
console.log('contact has new number:', contactText.includes('+91 93724 30855'));
console.log('contact has enquiries line:', contactText.includes('For business enquiries contact'));
console.log('contact still has old number:', contactText.includes('+91 93721 30855'));
const card = page.locator('text=Calls & WhatsApp').locator('xpath=ancestor::div[2]');
await card.screenshot({ path: `${OUT}/contact-card.png` }).catch(async () => {
  await page.screenshot({ path: `${OUT}/contact-card.png` });
});

// Careers page — no-suitable-role card
await page.goto('http://localhost:3000/careers', { waitUntil: 'domcontentloaded', timeout: 45000 });
await page.waitForTimeout(3000);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1500);
const careersText = await page.evaluate(() => document.body.innerText);
console.log('careers has role-info number:', careersText.includes('+91 93721 30855'));
console.log('careers mentions open roles info:', careersText.includes('For more information on open roles'));
await page.screenshot({ path: `${OUT}/careers-bottom.png` });

// Footer (bottom of careers page includes footer)
const footerText = await page.evaluate(() => document.querySelector('footer')?.innerText || '');
console.log('footer has communication@:', footerText.includes('communication@kaizeninfotech.com'));
console.log('footer has new number:', footerText.includes('+91 93724 30855'));
console.log('footer still has dhini.s@:', footerText.includes('dhini.s'));
console.log('footer still has old number:', footerText.includes('+91 93721 30855'));

await browser.close();
console.log('done');
