import {createRequire} from 'node:module';const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));

for(const width of [1440,1024]){
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:5180/?catalogue=chats#chats');await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 const box=await page.locator('.chat-list-page').boundingBox();expect(box.x).toBe(width===1440?80:32);expect(box.width).toBe(width===1440?1280:960);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await expect(page.locator('.chat-thread-row.is-priority')).toHaveCount(1);
 await page.waitForTimeout(650);await page.screenshot({path:`../.desktop-work/qa/chats-${width}-after.png`,fullPage:true});
 await page.locator('.chat-thread-row').first().click();await expect(page).toHaveURL(/#trip-chat$/);await expect(page.locator('.hotel-chat-flow')).toBeVisible();
 await page.locator('.hotel-chat-header').getByRole('button',{name:'Назад',exact:true}).click();await expect(page).toHaveURL(/#chats$/);
 await page.getByRole('button',{name:/AI-ассистент/}).click();await expect(page).toHaveURL(/#wish-search$/);
}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5173/?catalogue=chats#chats');await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
const mobilePhoto=await page.locator('.chat-hotel-photo').first().evaluate(el=>getComputedStyle(el).width);expect(mobilePhoto).toBe('64px');
if(errors.length)throw Error(errors.join('\n'));console.log('PASS standard 1280/960 page width, priority chat, conversation/back, AI, mobile unchanged');await browser.close();
