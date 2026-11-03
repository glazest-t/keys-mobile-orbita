import {createRequire} from 'node:module';const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));

for(const width of [1440,1024]) {
 await page.setViewportSize({width,height:1000});
 await page.goto('http://127.0.0.1:5180/?catalogue=favorite-list#favorite-list');
 await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 await page.waitForTimeout(650);
 await expect(page.locator('.favorite-screen h1')).toHaveCount(1);
 const back=await page.getByRole('button',{name:'Назад к спискам'}).boundingBox(),title=await page.locator('.desktop-favorite-title').boundingBox();
 expect(Math.abs(back.y+back.height/2-title.y-title.height/2)).toBeLessThan(3);
 const search=await page.locator('.favorite-search').boundingBox(),map=await page.getByRole('button',{name:'Карта отелей подборки'}).boundingBox();
 expect(Math.abs(search.y+search.height/2-map.y-map.height/2)).toBeLessThan(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`../.desktop-work/qa/favorite-detail-${width}.png`,fullPage:true});
 await page.locator('.favorite-search button').first().click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await page.locator('.favorite-search button').nth(1).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Карта отелей подборки'}).click();
 await expect(page).toHaveURL(/#favorite-map$/);
 console.log(`Favorite detail ${width}: title, toolbar, dates, guests, map OK`);
}
expect(errors).toEqual([]);await browser.close();
