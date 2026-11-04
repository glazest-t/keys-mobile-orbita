// Desktop dialog action regression checks; run from desktop with npm run test:dialogs.
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));process.chdir(root);await fs.mkdir('.desktop-work/qa',{recursive:true});
const require=createRequire(process.cwd()+'/app/package.json');
const {chromium,expect}=require('@playwright/test');
let executablePath;const cache=path.join(os.homedir(),'Library/Caches/ms-playwright');for(const n of (await fs.readdir(cache)).filter(x=>x.startsWith('chromium_headless_shell-')).sort().reverse()){const candidate=path.join(cache,n,'chrome-headless-shell-mac-x64/chrome-headless-shell');try{await fs.access(candidate);executablePath=candidate;break;}catch{}}
const browser=await chromium.launch({headless:true,executablePath});
const fixtureMode=process.argv.includes('--fixtures');
try{for(const mobile of [true,false]){
 const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
 if(fixtureMode){
  await page.route('https://catalog.api.2gis.com/**',route=>{const q=new URL(route.request().url()).searchParams.get('q')||'';return route.fulfill({json:{result:{items:[{name:q.includes('Вокзал')?'Вокзал Адлер':'Аэропорт Сочи',point:q.includes('Вокзал')?{lon:39.928,lat:43.44}:{lon:39.941956,lat:43.448624}}]}}});});
  await page.route('https://routing.api.2gis.com/**',route=>{const body=route.request().postDataJSON(),transit=!!body.source,from=transit?body.source.point:body.points[0],to=transit?body.target.point:body.points[1];const selection=`LINESTRING(${from.lon} ${from.lat}, 39.93 43.42, ${to.lon} ${to.lat})`,geometry=[{selection}];const result={total_distance:7400,total_duration:transit?2100:body.transport==='walking'?5800:800,...(transit?{movements:[{alternatives:[{geometry}]}]}:{maneuvers:[{outcoming_path:{geometry}}]})};return route.fulfill({json:transit?[result]:{result:[result]}});});
 }
 await page.goto(`http://127.0.0.1:${mobile?5173:5180}/?catalogue=booking-confirmation`);await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 await page.evaluate(()=>{location.hash='trip-route'});
 const hero=page.locator('.route-hero');
 await expect(hero.locator('.gis-map')).toHaveAttribute('data-map-status','ready',{timeout:25000});
 await expect(page.locator('.route-summary')).toContainText('км',{timeout:25000});
 console.log('route',await page.locator('.route-summary').innerText());
 await hero.screenshot({path:`${root}/.desktop-work/qa/route-${fixtureMode?'fixture':'live'}-${mobile?'mobile':'desktop'}.png`});
 const activate=async locator=>mobile?locator.tap():locator.click();
 for(const name of ['Авто','Транспорт','Пешком']){
  await activate(page.getByRole('button',{name,exact:true}));await expect(page.locator('.route-summary')).toContainText('км',{timeout:25000});
  await expect(hero.locator('.gis-map')).not.toHaveAttribute('data-route-segments','0');
 }
 await activate(page.getByRole('button',{name:'Изменить',exact:true}));
 await activate(page.getByRole('button',{name:'Вокзал Адлер',exact:true}));await activate(page.getByRole('button',{name:'Готово',exact:true}));
 await expect(page.locator('.route-summary')).toContainText('км',{timeout:25000});
 await expect(page.locator('.route-addresses')).toContainText('Адлер');
 await expect(page.getByRole('button',{name:'Пешком',exact:true})).toHaveAttribute('aria-pressed','true');
 await hero.scrollIntoViewIfNeeded();await hero.screenshot({path:`${root}/.desktop-work/qa/route-station-${fixtureMode?'fixture':'live'}-${mobile?'mobile':'desktop'}.png`});
 // The next transport has no cached route for this origin; simulate provider failure.
 const failRouting=route=>route.fulfill({status:429,body:'{}',contentType:'application/json',headers:{'access-control-allow-origin':'*'}});await page.route('https://routing.api.2gis.com/**',failRouting);
 await activate(page.getByRole('button',{name:'Авто',exact:true}));
 await expect(page.locator('.route-summary')).toContainText('временно занят');
 await expect(hero.locator('.gis-map')).toHaveAttribute('data-route-segments','0');
 await page.unroute('https://routing.api.2gis.com/**',failRouting);await activate(page.getByRole('button',{name:'Повторить расчёт'}));
 await expect(page.locator('.route-summary')).toContainText('км',{timeout:25000});
 await hero.scrollIntoViewIfNeeded();
 const pin=await hero.locator('.gis-price-pin.selected').boundingBox(),time=await hero.locator('.route-time').boundingBox();
 expect(pin.x+pin.width<=time.x||time.x+time.width<=pin.x||pin.y+pin.height<=time.y||time.y+time.height<=pin.y).toBe(true);
 console.log('PASS',mobile?'mobile':'desktop',fixtureMode?'fixture modes, origin change, failure clears route, retry, label layout':'four live modes, origin change, failure clears route, retry, label layout');
 await page.close();
}}finally{await browser.close()}
