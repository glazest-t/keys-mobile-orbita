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

commerce=startDraft({...commerce,search:{...commerce.search,adults:1}},'pine-sochi','qa-pine');Object.assign(commerce.draft,{contact,method:'at_hotel',usePoints:false});commerce=commitBooking(commerce,phone,quoteDraft(commerce,phone),'success','2026-10-22T12:00:00Z');commerce.selectedBooking='qa-record';
const dir=new URL('../docs/iteration-4/qa-d1-d3/',import.meta.url);await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1106,height:1166}});page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('keys-orbita-booking-v1')));
const shot=async(name)=>{await page.waitForTimeout(700);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:fileURLToPath(new URL(name+'.png',dir))});};
const tap=async(locator)=>{await page.waitForTimeout(650);await locator.evaluate(e=>{const carousel=e.closest('.mobile-carousel');if(carousel){const b=e.getBoundingClientRect(),r=carousel.getBoundingClientRect();if(b.right>r.right)carousel.scrollLeft+=b.right-r.right+10;}const scroll=e.closest('.mobile-scroll');if(scroll){const b=e.getBoundingClientRect(),r=scroll.getBoundingClientRect();if(b.bottom>r.bottom-100)scroll.scrollTop+=(b.bottom-r.bottom+120);if(b.top<r.top)scroll.scrollTop+=(b.top-r.top-20);}});await page.evaluate(()=>window.scrollTo(0,0));const b=await locator.boundingBox();assert.ok(b);await page.mouse.click(b.x+b.width/2,b.y+b.height/2);await page.waitForTimeout(650);};
const route=async(hash)=>{await page.goto('http://127.0.0.1:5173/?qa-trip-services#'+hash);await page.waitForTimeout(700);};
const main=()=>page.locator('.trip-page[aria-hidden="false"]');
try {
 await page.goto('http://127.0.0.1:5173/');await page.evaluate(({auth,commerce})=>{localStorage.setItem('keys-orbita-demo-v1',JSON.stringify(auth));localStorage.setItem('keys-orbita-booking-v1',JSON.stringify(commerce));},{auth,commerce});
 await route('booking-record');
 const details=()=>page.locator('.record-content[aria-hidden="false"]');
 await details().getByText('Номер брони',{exact:true}).waitFor();await shot('d1-top');
 assert.equal(await details().locator('.record-payment-total strong').evaluate(e=>getComputedStyle(e).fontSize),'14px');
 assert.equal(await details().getByText('При заселении',{exact:true}).count(),0);
 await details().evaluate(e=>{const s=e.closest('.mobile-scroll');s.scrollTop=s.scrollHeight;});await shot('d1-bottom');
 const open=async()=>{await tap(details().getByRole('button',{name:'Отменить бронирование',exact:true}));await page.getByRole('dialog').waitFor();};
 await open();await shot('d3-free');const panel=page.getByRole('dialog');assert.match(await panel.innerText(),/К возврату через СБП/);assert.match(await panel.innerText(),/Баллы отеля вернутся/);
 await tap(panel.getByRole('button',{name:'Оставить бронь',exact:true}));assert.deepEqual((await state()).bookings,commerce.bookings);
 await open();await tap(panel.getByRole('button',{name:'Отменить бронь',exact:true}));await details().getByText('Отменена',{exact:true}).waitFor();const after=await state();assert.equal(after.bookings[0].operation.refundCashMinor,commerce.bookings[0].operation.paidCashMinor);await page.reload();await details().getByText('Отменена',{exact:true}).waitFor();assert.deepEqual((await state()).payment,after.payment);
 await page.evaluate(c=>localStorage.setItem('keys-orbita-booking-v1',JSON.stringify({...c,selectedBooking:'qa-pine'})),commerce);await page.reload();await details().getByText('При заселении',{exact:true}).waitFor();await open();await shot('d3-at-hotel');assert.equal(await panel.locator('.cancellation-points').count(),0);await tap(panel.getByRole('button',{name:'Оставить бронь',exact:true}));
 await page.evaluate(c=>localStorage.setItem('keys-orbita-booking-v1',JSON.stringify(c)),commerce);await page.clock.setFixedTime(new Date('2026-11-12T12:00:00+03:00'));await page.reload();await details().getByText('Номер брони',{exact:true}).waitFor();await open();await shot('d3-penalty');assert.match(await panel.innerText(),/Удержание — одна ночь/);const penaltyText=await panel.locator('.cancellation-summary>div').nth(1).innerText();assert.ok(!penaltyText.includes('\n0'));
 await tap(panel.getByRole('button',{name:'Отменить бронь',exact:true}));await details().getByText('Отменена',{exact:true}).waitFor();assert.ok((await state()).bookings[0].operation.penaltyMinor>0);
 assert.deepEqual(errors,[]);console.log('PASS: d1 typography/payment states; d3 free refund, separate wallets, keep/confirm, persistence, at-hotel zero wallets, late one-night penalty.');
} catch(e){await shot('failure');throw e;} finally {await browser.close();}
