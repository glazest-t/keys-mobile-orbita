// Local UI regression runner; opens isolated catalogue scenes, never publishes.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
const root=fileURLToPath(new URL('../../',import.meta.url));
const require=createRequire(path.join(root,'app/package.json'));
const {chromium,expect}=require('@playwright/test');
const out=path.join(root,'.desktop-work/qa');await fs.mkdir(out,{recursive:true});
let executablePath=process.env.DESKTOP_QA_BROWSER;
if(!executablePath){try{await fs.access(chromium.executablePath());}catch{const cache=path.join(os.homedir(),'Library/Caches/ms-playwright');for(const name of (await fs.readdir(cache)).filter(n=>n.startsWith('chromium_headless_shell-')).sort().reverse()){const candidate=path.join(cache,name,'chrome-headless-shell-mac-x64/chrome-headless-shell');try{await fs.access(candidate);executablePath=candidate;break;}catch{}}}}
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const base=process.env.DESKTOP_QA_URL||'http://127.0.0.1:5180';
const results=[];const mode=process.argv[2]||'targeted';
async function open(page,id,route){await page.goto(`${base}/?catalogue=${id}#${route}`);await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready',{},{timeout:20000});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(400);}
async function check(name,fn){try{await fn();results.push({name,passed:true});console.log('PASS '+name);}catch(e){results.push({name,passed:false,error:e.message});console.error('FAIL '+name+' '+e.message);}}
try{
if(mode==='catalogue'){
 const scenes=JSON.parse(await fs.readFile(path.join(root,'app/src/catalogue/scenes.json'),'utf8'));let index=0;
 await Promise.all([0,1].map(async()=>{const page=await browser.newPage({viewport:{width:1024,height:720},reducedMotion:'reduce'});while(index<scenes.length){const scene=scenes[index++];await check(scene.id,async()=>{await open(page,scene.id,scene.route);const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,text:document.body.innerText.trim().length,dialogs:[...document.querySelectorAll('.desktop-modal')].map(e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom,height:innerHeight};})}));assert(metrics.scrollWidth<=metrics.width+2,'horizontal overflow '+JSON.stringify(metrics));assert(metrics.text>0,'empty scene');assert(metrics.dialogs.every(r=>r.top>=-1&&r.bottom<=r.height+1),'dialog outside viewport');if(['onboarding-2','swipe-preferences','swipe','wish-results','booking-payment','chats','trip-chat','notifications','profile','problem','hotelier-invite','loyalty-program'].includes(scene.id))await page.screenshot({path:path.join(out,`short-${scene.id}-pass6.png`)});});}await page.close();}));
}else{
 const page=await browser.newPage({viewport:{width:1024,height:720}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await check('long-chat-scroll-and-reading-position',async()=>{
  await open(page,'trip-chat','trip-chat');const input=page.getByRole('textbox',{name:'Сообщение отелю'}),scroll=page.locator('.hotel-chat-flow .desktop-scroll');
  for(let i=0;i<7;i++){await input.fill(`Сообщение ${i+1}. Подскажите, пожалуйста, какие услуги доступны во время проживания и как заказать завтрак в номер?`);await input.press('Enter');await page.waitForTimeout(1300);}
  await page.waitForTimeout(500);const bottom=await scroll.evaluate(e=>({gap:e.scrollHeight-e.clientHeight-e.scrollTop,range:e.scrollHeight-e.clientHeight}));assert(bottom.range>700,'fixture must overflow');assert(bottom.gap<5,'new message is not visible');
  const header=await page.locator('.hotel-chat-header').boundingBox(),composer=await page.locator('.hotel-chat-composer').boundingBox();assert(header.y>=72&&composer.y+composer.height<=720,'chat controls clipped');
  await input.fill('Спасибо!');await input.press('Enter');await scroll.hover();await page.mouse.wheel(0,-5000);await page.waitForTimeout(1700);assert((await scroll.evaluate(e=>e.scrollTop))<100,'reply stole reading position');
  await input.fill('Где парковка?');await input.press('Enter');await page.waitForTimeout(1700);assert((await scroll.evaluate(e=>e.scrollHeight-e.clientHeight-e.scrollTop))<5,'sending must reveal the newest message');
  await page.screenshot({path:path.join(out,'chat-long-pass6.png')});
 });
 await check('hotel-notifications-return-context',async()=>{
  await page.getByRole('button',{name:'Уведомления отеля',exact:true}).click();await expect(page).toHaveURL(/#notifications$/);await expect(page.getByRole('heading',{name:'Уведомления',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Назад',exact:true}).click();await expect(page).toHaveURL(/#trip-chat$/);await expect(page.locator('.hotel-chat-identity')).toContainText('Mantera');
 });
 await check('unread-chat-state',async()=>{await open(page,'chats','chats');await page.locator('.chat-thread-row').first().click();await page.getByRole('textbox',{name:'Сообщение отелю'}).fill('Когда завтрак?');await page.getByRole('textbox',{name:'Сообщение отелю'}).press('Enter');await page.locator('.hotel-chat-header').getByRole('button',{name:'Назад',exact:true}).click();await expect(page).toHaveURL(/#chats$/);await expect(page.locator('.chat-thread-row.is-unread')).toHaveCount(1);await page.screenshot({path:path.join(out,'chat-unread-pass6.png')});await page.locator('.chat-thread-row.is-unread').click();await expect(page.locator('.desktop-chat-sidebar .chat-thread-row.is-unread')).toHaveCount(0);});
 await check('favorite-map-escape',async()=>{await open(page,'favorite-map','favorite-map');await expect(page.getByRole('dialog',{name:'Карта отелей'})).toBeVisible();await page.keyboard.press('Escape');await expect(page).toHaveURL(/#favorite-list$/);await expect(page.getByRole('dialog')).toHaveCount(0);});
 await check('wish-map-escape',async()=>{await open(page,'wish-results','wish-search');await page.getByRole('button',{name:'Развернуть карту',exact:true}).click();await expect(page.getByRole('dialog',{name:'Карта отелей'})).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page).toHaveURL(/#wish-search$/);});
 await check('reduced-motion-onboarding-and-map',async()=>{await page.emulateMedia({reducedMotion:'reduce'});await open(page,'launch','welcome');await expect(page.locator('.launch-preview .onboarding-splash')).toBeVisible();await expect(page.getByRole('status',{name:'Запуск Ключей'})).toContainText('Ключи от всех отелей');await open(page,'onboarding-2','welcome');await expect(page.locator('.onboarding-flow')).toHaveAttribute('data-reduced-motion','true');const running=await page.locator('.onboarding-flow').evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length);assert.equal(running,0);await open(page,'results-map','results-map');await expect(page.getByRole('dialog',{name:'Карта отелей'})).toBeVisible();await page.keyboard.press('Escape');await expect(page).toHaveURL(/#results$/);});
 await check('long-profile-name-and-toast',async()=>{await page.emulateMedia({reducedMotion:'no-preference'});await open(page,'edit','edit');await page.getByRole('textbox',{name:'Имя',exact:true}).fill('Александра Мария Екатерина Анастасия');await page.getByRole('button',{name:'Сохранить',exact:true}).click();await page.waitForTimeout(500);await page.screenshot({path:path.join(out,'long-name-pass6.png')});const metrics=await page.evaluate(()=>{const toast=document.querySelector('.toast').getBoundingClientRect();return{width:innerWidth,scrollWidth:document.documentElement.scrollWidth,toastCenter:toast.x+toast.width/2};});assert(metrics.scrollWidth<=metrics.width,'long name overflows header');assert(Math.abs(metrics.toastCenter-metrics.width/2)<2,'toast is not centered');});
 await check('mobile-map-regression',async()=>{await page.setViewportSize({width:1280,height:1100});await page.goto('http://127.0.0.1:5173/?catalogue=results-map#results-map');await page.getByRole('button',{name:'Назад к списку отелей',exact:true}).waitFor();await expect(page.locator('.desktop-map-dialog')).toHaveCount(0);await page.getByRole('button',{name:'Назад к списку отелей',exact:true}).click();await expect(page).toHaveURL(/#results$/);await expect(page.getByRole('button',{name:'Развернуть карту',exact:true})).toBeVisible();});
 await check('no-browser-errors',async()=>assert.deepEqual(errors,[]));await page.close();
}
}finally{await browser.close();await fs.writeFile(path.join(out,`browser-${mode}-pass6.json`),JSON.stringify(results,null,2));}
console.log(`${results.filter(r=>r.passed).length}/${results.length} passed`);if(results.some(r=>!r.passed))process.exitCode=1;
