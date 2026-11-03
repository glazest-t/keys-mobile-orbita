import {createRequire} from 'node:module';const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));

for(const width of [1440,1024]) {
 await page.setViewportSize({width,height:1000});
 await page.goto('http://127.0.0.1:5180/?catalogue=trip-empty#trips');
 await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');await page.waitForTimeout(650);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const banner=page.locator('.desktop-benefits-banner');
 const b=await banner.boundingBox(),history=await page.locator('.trip-history-entry').boundingBox();
 const empty=await page.locator('.keys-content > .k-empty').boundingBox();
 expect(Math.abs(empty.y-b.y)).toBeLessThan(2);
 expect(Math.abs(empty.y+empty.height-history.y-history.height)).toBeLessThan(2);
 expect(Math.abs(history.y-b.y-b.height-24)).toBeLessThan(2);
 console.log({width,height:b.height,gap:history.y-b.y-b.height,aligned:true});
 expect(b.height).toBeLessThanOrEqual(220);
 await page.screenshot({path:`../.desktop-work/qa/benefits-compact-${width}.png`,fullPage:true});
 await banner.click();await expect(page).toHaveURL(/#rewards$/);
}
expect(errors).toEqual([]);await browser.close();
