import {createRequire} from 'node:module';const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));

for(const width of [1440,1024,800]) {
 await page.setViewportSize({width,height:1000});
 await page.goto('http://127.0.0.1:5180/?catalogue=programs#loyalty-programs');
 await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 await page.waitForTimeout(650);
 const box=await page.locator('.benefits-page').boundingBox();
 expect(box.width).toBeGreaterThan(width-180);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const rows=page.locator('.benefit-program-row:not(.benefit-network-card)');
 await expect(rows).toHaveCount(4);
 const first=await page.locator('.benefit-network-card').boundingBox(),second=await rows.first().boundingBox();
 expect(Math.abs(first.width-second.width)).toBeLessThan(2);
 expect(Math.abs(first.height-second.height)).toBeLessThan(2);
 expect(width>900?Math.abs(first.y-second.y)<2:second.y>first.y).toBe(true);
 await page.screenshot({path:`../.desktop-work/qa/programs-after-${width}.png`,fullPage:true});
 await page.getByPlaceholder('Поиск программ').fill('неттакогоотеля');
 await expect(page.getByText('Программы не найдены',{exact:true})).toBeVisible();
 await page.getByPlaceholder('Поиск программ').fill('Сочи');
 await expect(rows).toHaveCount(1);
 await page.getByPlaceholder('Поиск программ').fill('');
 for(const filter of ['Баллы','Скидки','Сети','Все']) {
  await page.getByRole('button',{name:filter,exact:true}).click();
  await expect(page.getByRole('button',{name:filter,exact:true})).toHaveAttribute('aria-pressed','true');
  if(filter==='Сети') await expect(rows).toHaveCount(0);
 }
 await rows.first().click();await expect(page).toHaveURL(/#loyalty-program\//);
 await page.getByRole('button',{name:'Назад',exact:true}).click();
 await expect(page).toHaveURL(/#loyalty-programs$/);
 await page.locator('.benefit-network-card').click();
 await expect(page).toHaveURL(/#loyalty-network$/);
 await page.waitForTimeout(650);
 await expect(page.locator('.benefit-program-row')).toHaveCount(2);
 const networkBox=await page.locator('.benefits-page').boundingBox();
 expect(Math.abs(networkBox.width-box.width)).toBeLessThan(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.screenshot({path:`../.desktop-work/qa/network-after-${width}.png`,fullPage:true});
 await page.locator('.benefit-program-row').first().click();
 await expect(page).toHaveURL(/#loyalty-program\//);
 await page.getByRole('button',{name:'Назад',exact:true}).click();
 await expect(page).toHaveURL(/#loyalty-network$/);
 await page.getByRole('button',{name:'Назад',exact:true}).click();
 await expect(page).toHaveURL(/#loyalty-programs$/);
 console.log(`Programs ${width}: layout, search, filters, details/back OK`);
}
expect(errors).toEqual([]);await browser.close();
