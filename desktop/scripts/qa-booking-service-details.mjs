import {createRequire} from 'node:module';
const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:5180/?catalogue=booking-hotel#booking-flow');await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
await page.locator('.room-rate-price button').first().click();await expect(page.getByRole('heading',{name:'Оформление бронирования'})).toBeVisible();
const rows=page.locator('.desktop-service-row'),dialog=page.getByRole('dialog'),cart=page.locator('.desktop-payment-summary');
const baseline=await cart.textContent();
for(let i=0;i<await rows.count();i++){
 const row=rows.nth(i),title=await row.locator('strong').innerText();
 await row.click();await expect(dialog.getByRole('heading',{name:title,exact:true})).toBeVisible();
 await expect(dialog.locator('.desktop-service-description')).toBeVisible();
 if(await dialog.locator('img.desktop-service-image').count())await expect.poll(()=>dialog.locator('img.desktop-service-image').evaluate(el=>el.naturalWidth)).toBeGreaterThan(0);
 await expect(dialog.locator('.desktop-service-calculation')).toBeVisible();
 if(title==='Завтрак')await expect(dialog.locator('.desktop-service-calculation')).toContainText('Гостей: 1 · дней: 2');
 if(title==='Спа-программа')await page.screenshot({path:'../.desktop-work/qa/booking-service-spa.png'});
 if(title==='Завтрак')await page.screenshot({path:'../.desktop-work/qa/booking-service-breakfast.png'});
 await dialog.getByRole('button',{name:'Закрыть',exact:true}).click();await expect(cart).toHaveText(baseline);
 await row.click();await dialog.getByRole('button',{name:'Добавить',exact:true}).click();await expect(dialog).toHaveCount(0);await expect(row).toContainText('Добавлено');await expect(cart).not.toHaveText(baseline);
 await row.click();await expect(dialog).toContainText('Добавлено в бронирование');await dialog.getByRole('button',{name:'Убрать из брони',exact:true}).click();await expect(row.getByRole('button',{name:/^Добавить:/})).toBeVisible();await expect(cart).toHaveText(baseline);
}
const first=rows.first();
await first.getByRole('button',{name:/^Добавить:/}).click();
await expect(dialog).toHaveCount(0);await expect(first).toContainText('Добавлено');await expect(cart).not.toHaveText(baseline);
await first.getByRole('button',{name:/^Подробнее:/}).focus();await page.keyboard.press('Enter');
await expect(dialog).toBeVisible();await dialog.getByRole('button',{name:'Убрать из брони',exact:true}).click();await expect(cart).toHaveText(baseline);
await page.locator('.desktop-checkout-services').screenshot({path:'../.desktop-work/qa/booking-services-add-row.png'});
await page.setViewportSize({width:1024,height:720});await rows.first().click();await expect(dialog.getByRole('button',{name:'Добавить',exact:true})).toBeInViewport();await page.screenshot({path:'../.desktop-work/qa/booking-service-transfer-1024.png'});
if(errors.length)throw Error(errors.join('\n'));console.log('PASS details for all services, close without adding, add/remove and basket recalculation, breakfast units, 1024px');await browser.close();
