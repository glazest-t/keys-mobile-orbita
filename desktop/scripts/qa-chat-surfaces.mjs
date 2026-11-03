import {createRequire} from 'node:module';const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));


for(const width of [1440,1024]){
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:5180/?catalogue=trip-chat#trip-chat');await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 for(const selector of ['.hotel-chat-header','.hotel-chat-flow .desktop-flow-content','.hotel-chat-messages','.hotel-chat-flow .record-scroll','.hotel-chat-flow .desktop-flow-footer'])expect(await page.locator(selector).evaluate(el=>getComputedStyle(el).backgroundColor)).toBe('rgb(255, 255, 255)');
 await page.getByRole('textbox',{name:'Сообщение отелю'}).fill('Когда завтрак?');await page.getByRole('button',{name:'Отправить сообщение',exact:true}).click();await expect(page.locator('.hotel-chat-message.guest').last()).toContainText('Когда завтрак?');
 await expect(page.locator('.hotel-chat-typing')).toHaveCount(0,{timeout:10000});await page.waitForTimeout(650);await page.screenshot({path:`../.desktop-work/qa/chat-white-${width}.png`,fullPage:true});
 await page.goto('http://127.0.0.1:5180/?catalogue=trip-empty#trips');await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');await page.getByRole('navigation',{name:'Главные разделы'}).getByRole('button',{name:'Чаты',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Здесь будут ваши диалоги',exact:true})).toBeVisible();await page.waitForTimeout(650);
 const empty=await page.locator('.chat-list-page > .k-empty').boundingBox(),list=await page.locator('.chat-list-page').boundingBox();expect(empty.width).toBe(list.width);expect(empty.height).toBeGreaterThanOrEqual(260);expect(empty.height).toBeLessThanOrEqual(360);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.screenshot({path:`../.desktop-work/qa/chats-empty-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:/AI-ассистент/}).click();await expect(page).toHaveURL(/#wish-search$/);
}
if(errors.length)throw Error(errors.join('\n'));console.log('PASS white dialogue surfaces, send/reply, full-width empty state, AI entry, 1440/1024');await browser.close();
