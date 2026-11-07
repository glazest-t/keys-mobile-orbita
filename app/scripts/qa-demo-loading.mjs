// Search accordion regression: run with mobile :5173 and desktop :5180 dev servers.
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');process.chdir(root);await fs.mkdir('.desktop-work/qa',{recursive:true});
const require=createRequire(process.cwd()+'/app/package.json');
const {chromium,expect}=require('@playwright/test');
let executablePath;const cache=path.join(os.homedir(),'Library/Caches/ms-playwright');for(const n of (await fs.readdir(cache)).filter(x=>x.startsWith('chromium_headless_shell-')).sort().reverse()){const candidate=path.join(cache,n,'chrome-headless-shell-mac-x64/chrome-headless-shell');try{await fs.access(candidate);executablePath=candidate;break;}catch{}}
const browser=await chromium.launch({headless:true,executablePath});
try{for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',...(width<500?{isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'}:{})});
 await page.goto(`http://127.0.0.1:${width<500?5173:5180}/?variant=november&catalogue=results#results`,{waitUntil:'domcontentloaded'});
 await expect(page.locator('.hotel-list-card').first()).toBeVisible({timeout:15000});
 const open=()=>page.getByRole('button',{name:width<500?'Открыть настройки прототипа':'Сценарии',exact:true}).click();
 await open();await page.locator('.demo-search-loading > summary').click();await page.screenshot({path:root+`/.desktop-work/qa/demo-settings-${width}.png`});await expect(page.getByRole('button',{name:'Обычная',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.getByRole('button',{name:'Показать прелоудер',exact:true}).click();
 await expect(page.locator('.search-results-loading')).toBeVisible();
 await expect(page.getByRole('button',{name:'Показать прелоудер',exact:true})).not.toBeVisible();
 await expect(page).toHaveURL(/searchLoading=slow/);
 if(width<500){
  const geometry=await page.locator('.results-scroll').evaluate(el=>{const scroll=el.querySelector('.mobile-scroll');const orbit=el.querySelector('.brand-orbit-loader').getBoundingClientRect();const app=el.closest('.keys-app').getBoundingClientRect();return {extra:scroll.scrollHeight-scroll.clientHeight,offset:Math.abs(orbit.y+orbit.height/2-(app.y+app.height/2))};});
  expect(geometry.extra).toBeLessThanOrEqual(1);expect(geometry.offset).toBeLessThanOrEqual(2);
  await page.mouse.move(195,450);await page.mouse.wheel(0,400);
  expect(await page.locator('.results-scroll .mobile-scroll').evaluate(el=>el.scrollTop)).toBe(0);
 }
 await page.screenshot({path:root+`/.desktop-work/qa/demo-loading-${width}.png`});
 await expect(page.locator('.hotel-list-card').first()).toBeVisible({timeout:10000});
 await open();await page.getByRole('button',{name:'Показать прелоудер',exact:true}).click();await expect(page.locator('.search-results-loading')).toBeVisible();
 await open();await page.getByRole('button',{name:'Обычная',exact:true}).click();
 await expect(page).not.toHaveURL(/searchLoading=slow/);await expect(page.locator('.search-results-loading')).toHaveCount(0,{timeout:5000});
 console.log('PASS',width,'preview, repeat, auto-close, disable during loading');await page.close();
}}finally{await browser.close();}
