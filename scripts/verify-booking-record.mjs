// Run with Node --experimental-strip-types. Uses an isolated Chrome profile.
import {chromium} from '../app/node_modules/@playwright/test/index.mjs';
import {fileURLToPath} from 'node:url';
import {mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {initialState,blankTraveler} from '../app/src/state.ts';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking} from '../app/src/booking/model.ts';
const phone='+79001234567',contact={name:'Анна',surname:'Примерова',phone,email:'anna@example.test'};
const auth={...initialState(),onboarded:true,activePhone:phone,users:{[phone]:{phone,name:'Анна',travelers:[{...blankTraveler('primary'),...contact,primary:true}]}}};
let commerce=ensureAccount(initialCommerce(),phone);commerce.search={...commerce.search,adults:2,checkIn:'2026-11-13',checkOut:'2026-11-15'};commerce=startDraft(commerce,'orbit-sea','qa-record');Object.assign(commerce.draft,{contact,usePoints:true,stayWishes:{options:['Тихий номер'],note:'Подальше от лифта'},additionalGuest:{name:'Иван',surname:'Примеров'}});commerce=commitBooking(commerce,phone,quoteDraft(commerce,phone),'success','2026-10-22T12:00:00Z');
const dir=new URL('../docs/iteration-4/qa-record/',import.meta.url);await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1106,height:1166}});page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('keys-orbita-booking-v1')));
const active=()=>page.locator('.record-content[aria-hidden="false"]');
const scroll=async(bottom=true)=>{await active().locator('..').evaluate((e,bottom)=>{const s=e.closest('.mobile-scroll');s.scrollTop=bottom?s.scrollHeight:0;},bottom);await page.waitForTimeout(200);};
const tap=async(locator)=>{const b=await locator.boundingBox();assert.ok(b);await page.mouse.click(b.x+b.width/2,b.y+b.height/2);};
const shot=async(name)=>{await page.waitForTimeout(650);await page.screenshot({path:fileURLToPath(new URL(name+'.png',dir))});};
const edit=async()=>{await scroll();await tap(active().getByRole('button',{name:'Изменить бронь',exact:true}));await active().getByRole('heading',{name:'Изменить бронь',exact:true}).waitFor();};
const dates=async(end)=>{await scroll(false);await tap(active().getByRole('button',{name:/^Даты/}));const dialog=page.getByRole('dialog');await dialog.getByRole('button',{name:'13 ноября 2026 г.',exact:true}).click();await dialog.getByRole('button',{name:`${end} ноября 2026 г.`,exact:true}).click();await dialog.getByRole('button',{name:'Выбрать даты',exact:true}).click();await page.waitForTimeout(250);};
try{
 await page.goto('http://127.0.0.1:5173/');await page.evaluate(({auth,commerce})=>{localStorage.setItem('keys-orbita-demo-v1',JSON.stringify(auth));localStorage.setItem('keys-orbita-booking-v1',JSON.stringify(commerce));},{auth,commerce});await page.goto('http://127.0.0.1:5173/?qa-record#booking-record');await active().getByText('Номер брони',{exact:true}).waitFor();await shot('details');
 await edit();await shot('change');await dates(16);assert.equal((await state()).bookings[0].draft.search.checkOut,'2026-11-15');
 await page.getByRole('button',{name:'Следующая оплата: успех',exact:true}).click();await tap(page.getByRole('button',{name:/^Доплатить/}));await page.getByRole('alert').filter({hasText:'Доплата не прошла'}).waitFor();assert.equal((await state()).bookings[0].revision,undefined);await shot('payment-failure');
 await tap(page.getByRole('button',{name:/^Доплатить/}));await active().getByText('Номер брони',{exact:true}).waitFor();assert.equal((await state()).bookings[0].revision,1);assert.equal((await state()).bookings[0].draft.search.checkOut,'2026-11-16');
 await edit();await dates(14);await scroll();await shot('refund');await tap(page.getByRole('button',{name:'Сохранить изменения',exact:true}));await active().getByText('Номер брони',{exact:true}).waitFor();
 await page.reload();await active().getByText('Номер брони',{exact:true}).waitFor();const saved=await state();assert.equal(saved.bookings.length,1);assert.equal(saved.bookings[0].revision,2);assert.equal(saved.bookings[0].draft.search.checkOut,'2026-11-14');assert.equal(saved.bookings[0].draft.stayWishes.note,'Подальше от лифта');assert.deepEqual(saved.payment.balances,commerce.payment.balances);
 await scroll();await tap(active().getByRole('button',{name:'Скачать документы',exact:true}));await active().locator('.document-list').waitFor();await page.waitForTimeout(650);assert.match(await active().innerText(),/14 нояб/);const download=page.waitForEvent('download');await tap(active().getByRole('button',{name:'Скачать: Подтверждение брони',exact:true}));const file=await download;assert.match((await readFile(await file.path())).subarray(0,8).toString(),/%PDF/);await tap(page.getByRole('button',{name:'Назад',exact:true}));await active().getByText('Номер брони',{exact:true}).waitFor();await page.waitForTimeout(650);await scroll();
 await tap(active().getByRole('button',{name:'Отменить бронирование',exact:true}));await page.getByRole('dialog').getByRole('button',{name:'Отменить бронь',exact:true}).click();await active().getByText('Отменена',{exact:true}).waitFor();assert.equal((await state()).bookings[0].operation.status,'cancelled');assert.equal((await state()).payment.balances['keys:'+phone],4860);assert.equal((await state()).payment.balances['hotel:orbit-sea:'+phone],1240);await scroll(false);await shot('cancelled');
 assert.deepEqual(errors,[]);console.log('PASS: details, staged dates, failed surcharge + retry, refund, persistence, independent booking, document download, cancellation; no page errors.');
}finally{await browser.close();}
