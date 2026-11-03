import {createRequire} from 'node:module';const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));

for(const width of [1440,1024])for(const scene of ['rewards','rewards-hotelier']){
 await page.setViewportSize({width,height:1000});await page.goto(`http://127.0.0.1:5180/?catalogue=${scene}#rewards`);await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 await expect(page.locator('.desktop-rewards-column')).toHaveCount(2);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const gaps=await page.locator('.desktop-rewards-column').evaluateAll(cols=>cols.flatMap(col=>[...col.children].slice(1).map((n,i)=>n.getBoundingClientRect().top-col.children[i].getBoundingClientRect().bottom)));
 expect(gaps.every(gap=>Math.abs(gap-16)<1)).toBe(true);
 await expect(page.getByText('Friendly Rate',{exact:true})).toHaveCount(scene==='rewards-hotelier'?1:0);
 await page.screenshot({path:`../.desktop-work/qa/${scene}-${width}-after.png`,fullPage:true});
 await page.getByRole('button',{name:/Привилегии «Ключей»/}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Понятно',exact:true}).click();
 await page.locator('.benefit-history-row').first().click();await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Понятно',exact:true}).click();
 await page.getByRole('button',{name:'История баллов',exact:true}).click();await expect(page).toHaveURL(/#points$/);
 await page.goto(`http://127.0.0.1:5180/?catalogue=${scene}#rewards`);await page.getByRole('button',{name:/Пригласите друзей/}).click();await expect(page).toHaveURL(/#hotelier-share$/);
 await page.goto(`http://127.0.0.1:5180/?catalogue=${scene}#rewards`);await page.locator('.benefit-program-row').first().click();await expect(page).toHaveURL(/#loyalty-program\/orbit-sea$/);
}
await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5173/?catalogue=rewards#rewards');await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');await expect(page.locator('.desktop-rewards-column')).toHaveCount(0);await expect(page.locator('.benefits-page > .benefit-hero')).toBeVisible();
if(errors.length)throw Error(errors.join('\n'));console.log('PASS rewards guest/hotelier at 1440/1024; history, operations, privileges, invites, programs; mobile unchanged');await browser.close();
