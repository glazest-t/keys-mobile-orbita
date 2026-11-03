import {createRequire} from 'node:module';
const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const width of [1440,1024]){
 await page.setViewportSize({width,height:1100});
 await page.goto('http://127.0.0.1:5180/?catalogue=trip-upcoming#trips');
 await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 const nearby=page.locator('.stay-nearby-expanded');
 await expect(nearby.locator('.gis-map')).toHaveAttribute('data-map-status','ready',{timeout:25000});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`../.desktop-work/qa/trip-nearby-${width}.png`,fullPage:true});
 const categories=nearby.locator('.detail-segments button');
 const names=await categories.allTextContents();
 for(const name of names){
  await nearby.getByRole('button',{name,exact:true}).click();
  await expect(nearby.getByRole('button',{name,exact:true})).toHaveAttribute('aria-pressed','true');
  expect(await nearby.locator('.nearby-place-row').count()).toBeGreaterThan(0);
 }
 await nearby.getByRole('button',{name:'Всё',exact:true}).click();
 const first=nearby.locator('.nearby-place-row').first();const title=await first.locator('strong').textContent();
 await first.click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByRole('dialog')).toContainText(title);
 await expect(page.getByRole('dialog').getByText('Почему вам может понравиться')).toBeVisible();
 await page.getByRole('button',{name:'Понятно',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 const marker=nearby.locator('.gis-price-pin').filter({hasNotText:'Отель'}).first();await marker.click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Понятно',exact:true}).click();
}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5173/?catalogue=trip-upcoming#trips');
await expect(page.locator('.stay-nearby-expanded')).toHaveCount(0);await expect(page.locator('.stay-nearby').getByRole('button',{name:'Все',exact:true})).toBeVisible();
if(errors.length)throw Error(errors.join('\n'));console.log('PASS map loaded; categories, place details and map markers work at 1440/1024; mobile preview unchanged');await browser.close();
