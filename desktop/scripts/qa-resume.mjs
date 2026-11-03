import {createRequire} from 'node:module';
const require=createRequire(new URL('../../app/package.json',import.meta.url));
const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const [id,route] of [['filters','results'],['results','results'],['booking-checkout','booking-flow']]){
 await page.goto(`http://127.0.0.1:5180/?catalogue=${id}#${route}`);
 await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 if(id==='results')await expect(page.locator('.gis-state')).toHaveCount(0,{timeout:25000});
 await page.waitForTimeout(500);
 console.log('PASS',id,await page.evaluate(()=>({status:document.documentElement.dataset.catalogueStatus,overflow:document.documentElement.scrollWidth>innerWidth})));
 await page.screenshot({path:`../.desktop-work/qa/resume-${id}.png`});
}
await page.setViewportSize({width:1024,height:720});
await page.goto('http://127.0.0.1:5180/?catalogue=filters#results');
await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
await expect(page.getByRole('complementary',{name:'Все фильтры'})).toBeVisible();
console.log('PASS desktop filters at 1024');
await page.goto('http://127.0.0.1:5173/?catalogue=filters#results');
await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
await expect(page.locator('.filter-editor')).toBeVisible();
console.log('PASS mobile filter editor unchanged');
if(errors.length)throw Error(errors.join('\n'));
await browser.close();
