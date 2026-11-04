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


try{
 for(const mobile of [true,false]){
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const activate=async locator=>mobile?locator.tap():locator.click();
  await page.goto(`http://127.0.0.1:${mobile?5173:5180}/?catalogue=booking-confirmation`);await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
  for(const name of ['К поездке','Поделиться бронью','В календарь','Отменить бронирование'])await expect(page.getByRole('button',{name,exact:true})).toHaveCount(1);
  await expect(page.getByRole('button',{name:/^Изменить( бронь)?$/})).toHaveCount(0);
  if(mobile){await expect(page.locator('.record-header').getByRole('button',{name:'Поделиться бронью',exact:true})).toHaveCount(1);await expect(page.locator('.trip-detail-bottom-actions').getByRole('button',{name:'Отменить бронирование',exact:true})).toHaveCount(1);const footer=page.locator('.trip-detail-fixed-actions');await expect(footer.getByRole('button',{name:'К поездке',exact:true})).toHaveCount(1);await expect(footer.getByRole('button',{name:'В календарь',exact:true})).toHaveCount(1);await expect(footer.getByRole('button',{name:'Отменить бронирование',exact:true})).toHaveCount(0);}
  await page.screenshot({path:`.desktop-work/qa/confirmation-header-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  const downloadEvent=page.waitForEvent('download');await activate(page.getByRole('button',{name:'В календарь',exact:true}));const download=await downloadEvent;
  expect(download.suggestedFilename()).toBe('keys-trip.ics');const ics=await fs.readFile(await download.path(),'utf8');expect(ics).toContain('BEGIN:VEVENT');expect(ics).toContain('DTSTART;VALUE=DATE:');expect(ics).toContain('DTEND;VALUE=DATE:');expect(ics).toContain('SUMMARY:Поездка');
  await activate(page.getByRole('button',{name:'Поделиться бронью',exact:true}));await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('.booking-qr img')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
  await activate(page.getByRole('button',{name:'Отменить бронирование',exact:true}));await expect(page.getByRole('dialog')).toBeVisible();await activate(page.getByRole('button',{name:'Оставить бронь',exact:true}));
  await expect(page.getByRole('dialog')).toHaveCount(0);await page.getByRole('button',{name:'В календарь',exact:true}).scrollIntoViewIfNeeded();
  await page.screenshot({path:`.desktop-work/qa/confirmation-actions-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  await activate(page.getByRole('button',{name:'К поездке',exact:true}));await expect(page).toHaveURL(/#trips$/);
  await page.evaluate(()=>{location.hash='booking-record';});await expect(page.locator('.record-flow')).toBeVisible();
  await expect(page.getByRole('button',{name:'К поездке',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'В календарь',exact:true})).toHaveCount(0);await expect(page.locator('.record-header').getByRole('button',{name:'Поделиться бронью',exact:true})).toHaveCount(1);
  await activate(page.getByRole('button',{name:'Поделиться бронью',exact:true}));await expect(page.locator('.booking-qr img')).toBeVisible();await page.keyboard.press('Escape');
  await page.screenshot({path:`.desktop-work/qa/details-share-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  await page.goto(`http://127.0.0.1:${mobile?5173:5180}/?catalogue=history-trip`);await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
  await expect(page.getByRole('button',{name:'Поделиться бронью',exact:true})).toHaveCount(0);
  await activate(page.getByRole('button',{name:'Назад',exact:true}));await activate(page.getByRole('button',{name:/Подробнее о поездке: Mantera/}));
  await expect(page.locator('.app-header').getByRole('button',{name:'Поделиться бронью',exact:true})).toHaveCount(1);
  await activate(page.getByRole('button',{name:'Поделиться бронью',exact:true}));await expect(page.locator('.booking-qr img')).toBeVisible();await page.keyboard.press('Escape');
  await page.screenshot({path:`.desktop-work/qa/history-share-${mobile?'mobile':'desktop'}.png`,fullPage:true});
  expect(errors).toEqual([]);
  console.log('PASS',mobile?'mobile':'desktop','confirmation tools, calendar download, sharing, cancellation, ordinary details');await page.close();
 }
}finally{await browser.close();}
