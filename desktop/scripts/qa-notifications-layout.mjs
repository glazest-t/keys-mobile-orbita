import {createRequire} from 'node:module';const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));

for(const width of [1440,1024])for(const scene of ['notifications','hotel-notifications']) {
 await page.setViewportSize({width,height:1000});
 await page.goto(`http://127.0.0.1:5180/?catalogue=${scene}#notifications`);
 await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');await page.waitForTimeout(650);
 const header=await page.locator('.notification-header').boundingBox(),content=await page.locator('.notification-center').boundingBox();
 expect(header.width).toBe(width===1440?1280:960);
 expect(Math.abs(header.x-content.x)).toBeLessThan(2);
 expect(Math.abs(header.width-content.width)).toBeLessThan(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`../.desktop-work/qa/${scene}-standard-${width}.png`,fullPage:true});
 for(const category of ['Поездки','Выгоды','Отель','Все']) {
  const tab=page.locator('.notification-tabs').getByRole('button',{name:category,exact:true});await tab.click();await expect(tab).toHaveAttribute('aria-pressed','true');
 }
 const read=page.getByRole('button',{name:'Прочитать все',exact:true});
 if(await read.isEnabled())await read.click();
 await expect(read).toBeDisabled();await expect(page.locator('.notification-row.is-unread')).toHaveCount(0);
 await page.getByRole('button',{name:'Назад',exact:true}).click();
 await expect(page).not.toHaveURL(/#notifications$/);
 console.log(`${scene} ${width}: frame, categories, read-all, back OK`);
}
expect(errors).toEqual([]);await browser.close();
