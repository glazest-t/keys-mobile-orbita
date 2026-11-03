import {createRequire} from 'node:module';const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const scene of ['trip-upcoming','trip-staying','trip-departure','trip-completed']){await page.goto(`http://127.0.0.1:5180/?catalogue=${scene}#trips`);await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');await page.waitForTimeout(600);await page.screenshot({path:`../.desktop-work/qa/${scene}-${process.env.QA_PHASE||'before'}.png`,fullPage:true});console.log(scene,await page.locator('.trip-home,.completed-stay').evaluate(el=>({height:el.clientHeight,children:[...el.children].map(n=>({class:n.className,y:Math.round(n.getBoundingClientRect().y),height:Math.round(n.getBoundingClientRect().height)}))})));}
for(const width of [1024,1440]) {
 await page.setViewportSize({width,height:1000});
 for(const scene of ['trip-upcoming','trip-staying','trip-departure','trip-completed']) {
  await page.goto(`http://127.0.0.1:5180/?catalogue=${scene}#trips`);
  await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const gaps=await page.locator('.desktop-trip-column').evaluateAll(cols=>cols.flatMap(col=>[...col.children].slice(1).map((n,i)=>n.getBoundingClientRect().top-col.children[i].getBoundingClientRect().bottom)));
  expect(gaps.every(gap=>Math.abs(gap-16)<1)).toBe(true);
 }
}
await page.goto('http://127.0.0.1:5180/?catalogue=trip-upcoming#trips');
await page.getByRole('button',{name:'Детали брони',exact:true}).click();
await expect(page).toHaveURL(/#booking-record$/);
await page.goto('http://127.0.0.1:5180/?catalogue=trip-staying#trips');
await page.getByRole('button',{name:'Открыть дверь',exact:true}).click();
await expect(page.getByRole('button',{name:/Дверь открыта/})).toBeVisible();
await page.goto('http://127.0.0.1:5180/?catalogue=trip-upcoming#trips');
await page.locator('.stay-nearby .nearby-place-row').first().click();
await expect(page.getByRole('dialog')).toBeVisible();
await page.getByRole('button',{name:'Понятно',exact:true}).click();
await page.goto('http://127.0.0.1:5180/?catalogue=trip-completed#trips');
await page.getByRole('button',{name:'Оценить поездку на 5 из 5',exact:true}).click();
await expect(page).toHaveURL(/#trip-review$/);
await page.setViewportSize({width:390,height:844});
await page.goto('http://127.0.0.1:5173/?catalogue=trip-upcoming#trips');
await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
await expect(page.locator('.desktop-trip-columns')).toHaveCount(0);
await expect(page.locator('.trip-home > .upcoming-card')).toBeVisible();
await page.screenshot({path:'../.desktop-work/qa/trip-mobile-unchanged.png',fullPage:true});
if(errors.length)throw Error(errors.join('\n'));
console.log('PASS: four trip states, 1024/1440, 16px column gaps, details/key/nearby/review transitions and mobile flat layout');
await browser.close();
