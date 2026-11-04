// Phone touch regression: run node app/scripts/qa-native-scroll.mjs with the mobile dev server running.
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
const ua='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
try {for(const width of [390,320]) {
 const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true,userAgent:ua,reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const cdp=await page.context().newCDPSession(page);
 async function swipe(x,y,dx,dy){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+dx*i/12,y:y+dy*i/12}]});await page.waitForTimeout(22);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(650);}
 await page.goto('http://127.0.0.1:5173/?catalogue=results#results');await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 await expect(page.locator('[data-native-phone="true"]')).toBeVisible();
 const preview=page.locator('.source-map .gis-map').first();await expect(preview).toHaveAttribute('data-map-status','ready',{timeout:20000});
 const mapRect=await preview.boundingBox();await swipe(mapRect.x+20,mapRect.y+100,0,-100);
 await expect.poll(()=>page.locator('.mobile-scroll:visible').first().evaluate(e=>e.scrollTop)).toBeGreaterThan(30);
 await page.locator('.mobile-scroll:visible').first().evaluate(e=>e.scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(200);
 console.log('PASS',width,'collapsed map yields vertical scroll');
 const photo=page.locator('.hotel-photo-carousel').first();await expect(photo).toBeVisible();let b=await photo.boundingBox();
 await swipe(b.x+b.width-35,b.y+80,-b.width+70,5);
 await expect.poll(()=>photo.evaluate(e=>e.scrollLeft)).toBeGreaterThan(100);
 await expect(page.locator('.hotel-card-photos .photo-counter').first()).toHaveText(/^2 \/ /);
 const scroll=page.locator('.mobile-scroll:visible').first();const before=await scroll.evaluate(e=>e.scrollTop);
 b=await photo.boundingBox();await swipe(b.x+b.width/2,b.y+140,10,-220);
 await expect.poll(()=>scroll.evaluate(e=>e.scrollTop)).toBeGreaterThan(before+80);
 await expect(page.locator('.hotel-list-card-info').first()).toBeVisible();
 if(!page.url().endsWith('#results'))throw Error('Swipe opened a hotel');
 await expect(scroll).toHaveAttribute('data-dragging','false');await expect(scroll).toHaveAttribute('data-overscroll','0.00');
 await page.screenshot({path:`${root}/.desktop-work/qa/native-scroll-results-${width}.png`});
 console.log('PASS',width,'native vertical scroll from photo, horizontal paging, no accidental open');
 await page.goto('http://127.0.0.1:5173/?catalogue=booking-hotel#booking-flow');await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
 const hero=page.locator('.hotel-hero-carousel:visible');await expect(hero).toBeVisible();b=await hero.boundingBox();
 await swipe(b.x+b.width-35,b.y+150,-b.width+70,5);
 await expect.poll(()=>hero.evaluate(e=>e.scrollLeft)).toBeGreaterThan(100);await expect(page.locator('.hero-caption')).toContainText('2 /');
 const parent=hero.locator('xpath=ancestor::div[@data-testid="mobile-scroll"][1]');await expect(parent).toHaveAttribute('data-dragging','false');
 await page.screenshot({path:`${root}/.desktop-work/qa/native-scroll-hotel-${width}.png`});
 await page.locator('.hero-photo').nth(1).tap();await expect(page.locator('.hotel-photo-grid')).toBeVisible();
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS',width,'hotel hero swipe, counter and tap to gallery');await page.close();
}}finally{await browser.close();}
