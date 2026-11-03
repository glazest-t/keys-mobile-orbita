import {createRequire} from 'node:module';const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const width of [1440,1024]){
 await page.setViewportSize({width,height:1000});await page.goto('http://127.0.0.1:5180/?catalogue=trip-completed#trips');await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 if(await page.locator('.completed-review-stars').count()){await page.getByRole('button',{name:'Оценить поездку на 5 из 5',exact:true}).click();await page.getByRole('button',{name:'Отправить отзыв',exact:true}).click();await page.getByRole('button',{name:'Готово',exact:true}).click();}
 await expect(page.locator('.completed-review-summary')).toBeVisible();await expect(page.locator('.completed-review-stars')).toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const alignment=await page.locator('.completed-content').evaluate(el=>{const a=el.children[0].getBoundingClientRect(),b=el.children[1].getBoundingClientRect();return Math.abs(a.bottom-b.bottom)});expect(alignment).toBeLessThan(1);
 await page.screenshot({path:`../.desktop-work/qa/completed-reviewed-${width}.png`,fullPage:true});
 await page.getByRole('button',{name:'Забронировать снова',exact:true}).click();await expect(page).toHaveURL(/#booking-flow$/);await expect(page.locator('h1').filter({hasText:'Mantera'}).first()).toBeVisible();
}
if(errors.length)throw Error(errors.join('\n'));console.log('PASS submitted review, compact state, column alignment, repeat opens same hotel, 1440/1024');await browser.close();
