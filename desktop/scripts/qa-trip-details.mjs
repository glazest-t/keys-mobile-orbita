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

const report=[];
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
async function open(id,port=5173){await page.goto(`http://127.0.0.1:${port}/?catalogue=${id}`);await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');}
async function layout(label){
 await expect(page.locator('.mobile-trip-detail')).toBeVisible();
 await expect(page.locator('[data-native-phone=true]')).toBeVisible();
 const bad=await page.locator('.mobile-trip-detail').evaluate(root=>[...root.querySelectorAll('section,button')].filter(e=>{const r=e.getBoundingClientRect(),p=root.getBoundingClientRect();return r.width>0&&(r.right>p.right+2||r.left<p.left-2);}).map(e=>e.className));
 expect(bad).toEqual([]);report.push(label);console.log('PASS',label);
}
try{
 await open('booking-confirmation');await layout('confirmation-390');
 await page.getByRole('button',{name:'Документы поездки',exact:true}).tap();await expect(page.locator('.record-documents')).toBeVisible();await expect(page.locator('.trip-detail-fixed-actions')).toHaveCount(0);
 await page.getByRole('button',{name:'Назад',exact:true}).tap();await layout('confirmation-documents-return');
 await open('history-trip');await layout('completed-history');
 await page.getByRole('button',{name:'Документы поездки',exact:true}).tap();await expect(page.locator('.record-documents')).toBeVisible();await expect(page.locator('.trip-detail-fixed-actions')).toHaveCount(0);
 await page.getByRole('button',{name:'Назад',exact:true}).tap();await expect(page).toHaveURL(/profile-trip/);await layout('history-documents-return');
 await page.getByRole('button',{name:'Назад',exact:true}).tap();
 await page.getByRole('button',{name:/Подробнее о поездке: Mantera/}).tap();await layout('upcoming-history');
 await expect(page.locator('.trip-detail-fixed-actions')).toBeVisible();
 const actionButtons=await page.locator('.trip-detail-fixed-actions button').evaluateAll(items=>items.map(e=>({text:e.textContent,top:e.getBoundingClientRect().top,width:e.getBoundingClientRect().width})));
 expect(actionButtons.map(b=>b.text)).toEqual(['Изменить','Отменить']);expect(actionButtons[0].top).toBe(actionButtons[1].top);expect(Math.abs(actionButtons[0].width-actionButtons[1].width)).toBeLessThan(2);
 const footerBefore=await page.locator('.trip-detail-fixed-actions').boundingBox();
 await page.locator('.trip-detail-payment').scrollIntoViewIfNeeded();
 const footerAfter=await page.locator('.trip-detail-fixed-actions').boundingBox();
 expect(Math.abs(footerBefore.y-footerAfter.y)).toBeLessThan(2);
 const paymentStyle=await page.locator('.trip-detail-payment').evaluate(e=>({background:getComputedStyle(e).backgroundImage,last:e===e.parentElement.querySelector('section:last-of-type')}));
 expect(paymentStyle).toEqual({background:'none',last:true});
 const header=page.locator('.trip-detail-payment-heading');await expect(header.getByText('Оплачено',{exact:true})).toBeVisible();
 await page.screenshot({path:'.desktop-work/qa/trip-details-fixed-actions.png',fullPage:true});
 report.push('payment-last-neutral-status-heading-fixed-footer');
 await expect(page.getByRole('button',{name:'Открыть бронь',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Изменить',exact:true}).tap();await expect(page.locator('.record-edit')).toBeVisible();await expect(page.locator('.trip-detail-fixed-actions')).toHaveCount(0);
 await page.getByRole('button',{name:'Назад',exact:true}).tap();await expect(page).toHaveURL(/profile-trip/);await layout('history-edit-return');
 await page.getByRole('button',{name:'Отменить',exact:true}).tap();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Оставить бронь',exact:true}).tap();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.getByRole('button',{name:'Назад',exact:true}).tap();await page.getByRole('button',{name:/Подробнее о поездке: Сосновый бор/}).tap();await layout('cancelled-history');
 await expect(page.getByRole('heading',{name:'Возврат',exact:true})).toBeVisible();await expect(page.getByRole('button',{name:'Оплатить',exact:true})).toHaveCount(0);
 await open('booking-partial-payment');await layout('partial-payment');
 await expect(page.getByText('Частично оплачено',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Оплатить',exact:true}).tap();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:/^Оплатить .*₽$/}).tap();await expect(page.getByText('Бронь полностью оплачена',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Готово',exact:true}).tap();await expect(page.getByText('Частично оплачено',{exact:true})).toHaveCount(0);report.push('balance-payment-success');
 await page.setViewportSize({width:320,height:740});await open('history-trip');await layout('history-320');
 await page.screenshot({path:'.desktop-work/qa/trip-details-mobile-320.png',fullPage:true});
 await page.getByRole('heading',{name:'Контакты отеля',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'.desktop-work/qa/trip-details-mobile-lower.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await open('booking-confirmation');await page.screenshot({path:'.desktop-work/qa/trip-details-confirmation-mobile.png',fullPage:true});
 await page.setViewportSize({width:1280,height:900});await open('history-trip',5180);await expect(page.locator('.desktop-trip-detail')).toBeVisible();await expect(page.locator('.mobile-trip-detail')).toHaveCount(0);report.push('desktop-preserved');
 expect(errors).toEqual([]);console.log('PASS',report.length,'checks');
}finally{await browser.close();await fs.writeFile('.desktop-work/qa/trip-details-mobile-report.json',JSON.stringify({report,errors},null,2));}
