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

const checks=[];
async function open(page,id,route=id,port=5180){
 await page.goto(`http://127.0.0.1:${port}/?catalogue=${id}#${route}`);
 await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');
}
try {
 const p=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const [id,route] of [['room-equipment','booking-flow'],['room-rate','booking-flow'],['hotel-price','booking-flow'],['points-rules','points'],['program-level','loyalty-program/orbit-sea'],['service-order','trip-services'],['trip-wifi','trips']]){
  await open(p,id,route);
  const dialog=p.getByRole('dialog');await expect(dialog).toBeVisible();
  await expect(dialog.locator('.k-button').filter({hasText:/^(Понятно|Готово|Закрыть)$/})).toHaveCount(0);
  if(id==='room-rate')await expect(dialog.getByRole('button',{name:'Выбрать',exact:true})).toBeVisible();
  if(id==='service-order')await expect(dialog.getByRole('button',{name:/Отменить заказ|Отменить заявку/})).toBeVisible();
  if(id==='trip-wifi')await expect(dialog.getByRole('button',{name:'Подключиться',exact:true})).toBeVisible();
  if(['room-equipment','hotel-price','program-level'].includes(id))await dialog.screenshot({path:`.desktop-work/qa/info-${id}.png`});
  await dialog.locator('.desktop-modal-close').click();await expect(p.getByRole('dialog')).toHaveCount(0);
  checks.push(id);console.log('PASS',id);
 }
 await open(p,'edit');await p.getByRole('button',{name:/Дата рождения/}).click();
 await expect(p.getByRole('dialog').getByRole('button',{name:'Готово',exact:true})).toBeVisible();
 checks.push('editable-form-keeps-save');
 await open(p,'room-equipment','booking-flow',5173);
 await expect(p.getByRole('dialog').getByRole('button',{name:'Понятно',exact:true})).toBeVisible();
 checks.push('mobile-keeps-dismiss');
 expect(errors).toEqual([]);console.log('PASS',checks.length,'checks');
}finally{await browser.close();await fs.writeFile('.desktop-work/qa/info-dialogs-check.json',JSON.stringify(checks,null,2));}
