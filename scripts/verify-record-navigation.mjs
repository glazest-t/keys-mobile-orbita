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
const dir=new URL('../docs/iteration-4/qa-record-actions/',import.meta.url);await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1106,height:1166}});page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.stack);});
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('keys-orbita-booking-v1')));
const shot=async(name)=>{await page.waitForTimeout(700);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:fileURLToPath(new URL(name+'.png',dir))});};
const tap=async(locator)=>{await page.waitForTimeout(650);await locator.evaluate(e=>{const carousel=e.closest('.mobile-carousel');if(carousel){const b=e.getBoundingClientRect(),r=carousel.getBoundingClientRect();if(b.right>r.right)carousel.scrollLeft+=b.right-r.right+10;}const scroll=e.closest('.mobile-scroll');if(scroll){const b=e.getBoundingClientRect(),r=scroll.getBoundingClientRect();if(b.bottom>r.bottom-100)scroll.scrollTop+=(b.bottom-r.bottom+120);if(b.top<r.top)scroll.scrollTop+=(b.top-r.top-20);}});await page.evaluate(()=>window.scrollTo(0,0));const b=await locator.boundingBox();assert.ok(b);await page.mouse.click(b.x+b.width/2,b.y+b.height/2);await page.waitForTimeout(650);};
const route=async(hash)=>{await page.goto('http://127.0.0.1:5173/?qa-trip-services#'+hash);await page.waitForTimeout(700);};
const main=()=>page.locator('.trip-page[aria-hidden="false"]');
try{
 await page.goto('http://127.0.0.1:5173/');await page.evaluate(({auth,commerce})=>{localStorage.setItem('keys-orbita-demo-v1',JSON.stringify(auth));localStorage.setItem('keys-orbita-booking-v1',JSON.stringify(commerce));},{auth,commerce});
 await route('trips');await tap(page.getByRole('button',{name:'Детали брони',exact:true}));
 const active=()=>page.locator('.record-content[aria-hidden="false"]');
 await active().getByText('Номер брони',{exact:true}).waitFor();await shot('details-header');
 await active().evaluate(e=>{const s=e.closest('.mobile-scroll');s.scrollTop=s.scrollHeight;});await shot('actions');
 const styles=await page.locator('.record-actions button').evaluateAll(es=>es.map(e=>({height:e.offsetHeight,bg:getComputedStyle(e).backgroundColor,color:getComputedStyle(e).color,radius:getComputedStyle(e).borderRadius})));
 assert.deepEqual(styles.map(s=>s.height),[52,44,44]);assert.equal(styles[0].bg,'rgb(47, 91, 255)');assert.equal(styles[2].color,'rgb(229, 72, 77)');assert.ok(styles.every(s=>s.radius==='14px'));
 await tap(active().getByRole('button',{name:'Скачать документы',exact:true}));await active().locator('.document-list').waitFor();const download=page.waitForEvent('download');await tap(active().getByRole('button',{name:'Скачать: Подтверждение брони',exact:true}));await download;await tap(page.getByRole('button',{name:'Назад',exact:true}));await active().getByText('Номер брони',{exact:true}).waitFor();
 await tap(active().getByRole('button',{name:'Изменить бронь',exact:true}));await active().getByRole('heading',{name:'Изменить бронь'}).waitFor();
 await tap(active().getByRole('button',{name:/^Гости/}));await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await page.waitForTimeout(650);assert.equal(await page.getByRole('dialog').count(),0);
 await tap(page.getByRole('button',{name:'Назад',exact:true}));await active().getByText('Номер брони',{exact:true}).waitFor();
 await tap(active().getByRole('button',{name:'Отменить бронирование',exact:true}));await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');await page.waitForTimeout(650);
 await tap(page.getByRole('button',{name:'Назад',exact:true}));assert.match(page.url(),/#trips$/);assert.equal(await page.locator('.record-flow').count(),0);
 await tap(page.getByRole('button',{name:/^Все услуги отеля/}));await tap(page.getByRole('button',{name:/^Завтрак/}));await page.locator('.breakfast-hero').waitFor();
 await tap(page.getByRole('button',{name:'В номер',exact:true}));await tap(page.getByRole('button',{name:'Добавить завтрак',exact:true}));
 await tap(page.getByRole('button',{name:'Назад',exact:true}));assert.equal(await page.locator('.breakfast-page[aria-hidden="false"].breakfast-order').count(),0);
 await tap(page.getByRole('button',{name:'Назад',exact:true}));assert.match(page.url(),/#trip-services$/);await page.getByRole('heading',{name:'Добавьте к поездке',exact:true}).waitFor();
 await tap(page.getByRole('button',{name:'Назад',exact:true}));assert.match(page.url(),/#trips$/);
 await tap(page.getByRole('button',{name:'Как заселиться',exact:true}));await tap(main().getByRole('button',{name:'Построить маршрут',exact:true}));
 await tap(page.locator('.route-addresses').getByRole('button',{name:/^Изменить/}));await page.locator('.origin-page').waitFor();await tap(page.getByRole('button',{name:'Отмена',exact:true}));await page.locator('.route-addresses').waitFor();
 await tap(page.getByRole('button',{name:'Назад',exact:true}));await main().locator('.arrival-time').waitFor();await tap(page.getByRole('button',{name:'Назад',exact:true}));assert.match(page.url(),/#trips$/);
 await route('chats');await tap(page.locator('.trip-chat-list button').first());await page.locator('.trip-chat-assistant').waitFor();await tap(page.getByRole('button',{name:'Назад',exact:true}));assert.match(page.url(),/#chats$/);
 assert.deepEqual(errors,[]);assert.deepEqual((await state()).bookings,commerce.bookings);
 console.log('PASS: d1 action sizes/colors/download; details/edit/sheet back; services → breakfast → order back chain; guide → route → origin back chain; chat returns to chats; bookings unchanged.');
}catch(e){await shot('failure');console.log('Failure URL',page.url());throw e;}finally{await browser.close();}
