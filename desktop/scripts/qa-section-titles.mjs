import {createRequire} from 'node:module';const require=createRequire(new URL('../../app/package.json',import.meta.url));const {chromium,expect}=require('@playwright/test');
const browser=await chromium.launch({executablePath:process.env.DESKTOP_QA_BROWSER||chromium.executablePath(),args:['--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));

for(const width of [1440,1024]) {
 await page.setViewportSize({width,height:1000});
 for(const [scene,route] of [['find','find'],['trip-empty','trips'],['trip-upcoming','trips'],['trip-staying','trips'],['trip-departure','trips'],['trip-completed','trips'],['chats','chats'],['rewards','rewards']]) {
  await page.goto(`http://127.0.0.1:5180/?catalogue=${scene}#${route}`);
  await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
  await page.waitForTimeout(650);
  const title=page.locator('.keys-content h1').first();
  const style=await title.evaluate(el=>{const s=getComputedStyle(el);return {family:s.fontFamily,size:s.fontSize,line:s.lineHeight,weight:s.fontWeight,spacing:s.letterSpacing}});
  expect(style).toEqual({family:'Unbounded, sans-serif',size:'26px',line:'34px',weight:'500',spacing:'-0.8px'});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.screenshot({path:`../.desktop-work/qa/title-${scene}-${width}.png`,fullPage:false});
  console.log(`${scene} ${width}: title OK`);
 }
}
expect(errors).toEqual([]);await browser.close();
