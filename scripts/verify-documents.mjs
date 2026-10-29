// Run with Node --experimental-strip-types. Uses an isolated Chrome profile.
import {chromium} from '../app/node_modules/@playwright/test/index.mjs';
import {fileURLToPath} from 'node:url';
import {mkdir,readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {unzipSync} from '../app/node_modules/fflate/esm/index.mjs';
import {PDFDocument} from '../app/node_modules/pdf-lib/cjs/index.js';
import {initialState,blankTraveler} from '../app/src/state.ts';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking} from '../app/src/booking/model.ts';
const phone='+79001234567',contact={name:'Анна',surname:'Примерова',phone,email:'anna@example.test'};
const auth={...initialState(),onboarded:true,activePhone:phone,users:{[phone]:{phone,name:'Анна',travelers:[{...blankTraveler('primary'),...contact,primary:true}]}}};
let commerce=ensureAccount(initialCommerce(),phone);commerce.search={...commerce.search,adults:2,checkIn:'2026-11-13',checkOut:'2026-11-15'};commerce=startDraft(commerce,'orbit-sea','qa-record');Object.assign(commerce.draft,{contact,usePoints:true,stayWishes:{options:['Тихий номер'],note:'Подальше от лифта'},additionalGuest:{name:'Иван',surname:'Примеров'}});commerce=commitBooking(commerce,phone,quoteDraft(commerce,phone),'success','2026-10-22T12:00:00Z');

commerce=startDraft({...commerce,search:{...commerce.search,adults:1}},'pine-sochi','qa-pine');Object.assign(commerce.draft,{contact,method:'at_hotel',usePoints:false});commerce=commitBooking(commerce,phone,quoteDraft(commerce,phone),'success','2026-10-22T12:00:00Z');commerce.selectedBooking='qa-record';
const dir=new URL('../docs/iteration-4/qa-documents/',import.meta.url);await mkdir(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true}),page=await browser.newPage({viewport:{width:1106,height:1166}});page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('keys-orbita-booking-v1')));
const shot=async(name)=>{await page.waitForTimeout(700);await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:fileURLToPath(new URL(name+'.png',dir))});};
const tap=async(locator)=>{await page.waitForTimeout(650);await locator.evaluate(e=>{const carousel=e.closest('.mobile-carousel');if(carousel){const b=e.getBoundingClientRect(),r=carousel.getBoundingClientRect();if(b.right>r.right)carousel.scrollLeft+=b.right-r.right+10;}const scroll=e.closest('.mobile-scroll');if(scroll){const b=e.getBoundingClientRect(),r=scroll.getBoundingClientRect();if(b.bottom>r.bottom-100)scroll.scrollTop+=(b.bottom-r.bottom+120);if(b.top<r.top)scroll.scrollTop+=(b.top-r.top-20);}});await page.evaluate(()=>window.scrollTo(0,0));const b=await locator.boundingBox();assert.ok(b);await page.mouse.click(b.x+b.width/2,b.y+b.height/2);await page.waitForTimeout(650);};
const route=async(hash)=>{await page.goto('http://127.0.0.1:5173/?qa-trip-services#'+hash);await page.waitForTimeout(700);};
const main=()=>page.locator('.trip-page[aria-hidden="false"]');
try {
 await page.goto('http://127.0.0.1:5173/');await page.evaluate(({auth,commerce})=>{localStorage.setItem('keys-orbita-demo-v1',JSON.stringify(auth));localStorage.setItem('keys-orbita-booking-v1',JSON.stringify(commerce));},{auth,commerce});await route('booking-record');
 const active=()=>page.locator('.record-content[aria-hidden="false"]');
 await tap(active().getByRole('button',{name:'Скачать документы',exact:true}));await active().locator('.document-list').waitFor();assert.equal(await active().getByText('Чек на проживание',{exact:true}).count(),0);await shot('d2');
 await tap(active().getByRole('button',{name:/^Подтверждение брони/}));await page.locator('.document-preview[aria-hidden="false"]').waitFor();await shot('confirmation-preview');
 await page.route('**/brand/fonts/Onest-Variable.ttf',r=>r.abort());await tap(page.getByRole('button',{name:'Скачать PDF',exact:true}));await page.getByRole('alert').filter({hasText:'Не удалось подготовить'}).waitFor();await page.unroute('**/brand/fonts/Onest-Variable.ttf');
 const pdfEvent=page.waitForEvent('download');await tap(page.getByRole('button',{name:'Скачать PDF',exact:true}));const pdf=await pdfEvent;await pdf.saveAs(fileURLToPath(new URL('confirmation.pdf',dir)));assert.ok((await PDFDocument.load(await readFile(await pdf.path()))).getPageCount()>0);
 await tap(page.getByRole('button',{name:'Назад к документам',exact:true}));
 const zipEvent=page.waitForEvent('download');await tap(page.getByRole('button',{name:'Скачать всё · ZIP',exact:true}));const zip=await zipEvent;assert.equal(Object.keys(unzipSync(await readFile(await zip.path()))).length,1);
 await tap(page.getByRole('button',{name:'Отправить всё на почту',exact:true}));const dialog=page.getByRole('dialog');await dialog.waitFor();await dialog.getByRole('textbox',{name:'Электронная почта'}).fill('bad');await page.keyboard.press('Tab');await page.waitForTimeout(650);await tap(dialog.getByRole('button',{name:'Скачать письмо',exact:true}));await dialog.getByRole('alert').waitFor();await dialog.getByRole('textbox',{name:'Электронная почта'}).fill('anna@example.test');await page.keyboard.press('Tab');await shot('email');const mailEvent=page.waitForEvent('download');await tap(dialog.getByRole('button',{name:'Скачать письмо',exact:true}));const mail=await mailEvent;const eml=await readFile(await mail.path(),'utf8');assert.match(eml,/X-Unsent: 1/);assert.match(eml,/application\/zip/);await tap(dialog.getByRole('button',{name:'Готово',exact:true}));
 await tap(page.getByRole('button',{name:'Назад',exact:true}));await active().getByText('Номер брони',{exact:true}).waitFor();await tap(active().getByRole('button',{name:'Скачать документы',exact:true}));await active().locator('.document-list').waitFor();assert.equal(await active().count(),1);
 assert.deepEqual((await state()).bookings,commerce.bookings);
 await page.evaluate(c=>localStorage.setItem('keys-orbita-booking-v1',JSON.stringify({...c,selectedBooking:'qa-pine'})),commerce);await page.reload();await tap(active().getByRole('button',{name:'Скачать документы',exact:true}));await active().locator('.document-list').waitFor();assert.equal(await active().getByRole('button',{name:'Скачать: Чек на проживание',exact:true}).count(),0);await shot('d2-unpaid');
 assert.deepEqual(errors,[]);console.log('PASS: d2/preview/back/reopen, PDF font failure + retry, Cyrillic PDF, ZIP without receipt, email validation + local EML, receipt absent for paid and unpaid bookings, bookings unchanged.');
} catch(e){await shot('failure');console.log(page.url());throw e;}finally{await browser.close();}
