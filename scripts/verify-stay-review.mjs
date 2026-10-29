// Isolated browser storage; the user's current trip and deposit are untouched.
import {chromium} from '../app/node_modules/@playwright/test/index.mjs';
import {fileURLToPath} from 'node:url';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {initialState,blankTraveler} from '../app/src/state.ts';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking} from '../app/src/booking/model.ts';
import {demoCheckIn} from '../app/src/booking/stay.ts';
import {demoCheckoutDay,requestCheckout,confirmCheckout} from '../app/src/booking/stayBill.ts';
const phone='+79001234567',id='qa-review',now=Date.parse('2026-10-23T12:00:00Z'),contact={name:'Анна',surname:'Примерова',phone,email:'anna@example.test'};
const auth={...initialState(),onboarded:true,activePhone:phone,users:{[phone]:{phone,name:'Анна',travelers:[{...blankTraveler('primary'),...contact,primary:true}]}}};
let commerce=ensureAccount(initialCommerce(),phone);commerce.search={...commerce.search,adults:1,checkIn:'2026-11-13',checkOut:'2026-11-15'};commerce=startDraft(commerce,'pine-sochi',id);commerce.draft.contact=contact;commerce=commitBooking(commerce,phone,quoteDraft(commerce,phone),'success',new Date(now).toISOString());commerce=demoCheckIn(commerce,phone,id,'in',now);
const inHouse=structuredClone(commerce);commerce=demoCheckoutDay(commerce,phone,id,now);commerce=requestCheckout(commerce,phone,id,now);commerce=confirmCheckout(commerce,phone,id,'out',now);
const dir=new URL('../docs/iteration-5/qa-review/',import.meta.url);await mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,timeout:60000,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE}:{})}),page=await browser.newPage({viewport:{width:1106,height:1166}});page.setDefaultTimeout(10000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('keys-orbita-booking-v1')));
const shot=async name=>{await page.waitForTimeout(450);await page.screenshot({path:fileURLToPath(new URL(name+'.png',dir))});};
const tap=async locator=>{await page.waitForTimeout(350);await locator.evaluate(e=>{const scroll=e.closest('.mobile-scroll');if(scroll){const b=e.getBoundingClientRect(),r=scroll.getBoundingClientRect();const footer=document.querySelector('.flow-fixed-footer')?.getBoundingClientRect();const bottom=Math.min(r.bottom,footer?.top||r.bottom)-24;if(b.bottom>bottom)scroll.scrollTop+=b.bottom-bottom+24;if(b.top<r.top)scroll.scrollTop+=b.top-r.top-16;}});await page.waitForTimeout(650);await page.evaluate(()=>window.scrollTo(0,0));const b=await locator.boundingBox();assert.ok(b);await page.mouse.click(b.x+b.width/2,b.y+b.height/2);await page.waitForTimeout(400);};
async function seed(data,route){await page.goto('http://127.0.0.1:5173');await page.evaluate(({auth,data})=>{localStorage.setItem('keys-orbita-demo-v1',JSON.stringify(auth));localStorage.setItem('keys-orbita-booking-v1',JSON.stringify(data));},{auth,data});await page.goto('http://127.0.0.1:5173/?qa-review#'+route);}
try{
 await seed(inHouse,'trip-bill');await page.locator('.bill-total').waitFor();assert.equal(await page.getByRole('button',{name:/Пополнить/}).count(),1);assert.equal(await page.locator('.bill-deposit-badge').evaluate(e=>e.tagName),'SPAN');await shot('bill-single-topup');await tap(page.getByRole('button',{name:'Пополнить депозит',exact:true}));await page.getByRole('dialog').waitFor();assert.match(await page.getByRole('dialog').innerText(),/Пополнить/);
 await seed(commerce,'trips');await tap(page.getByRole('button',{name:'Оценить поездку на 4 из 5',exact:true}));await page.locator('.review-rating').waitFor();assert.equal(await page.getByRole('button',{name:'Отправить отзыв',exact:true}).isDisabled(),false);await tap(page.getByRole('button',{name:'Оценка 4 из 5',exact:true}));await tap(page.getByRole('button',{name:'Номер',exact:true}));await tap(page.getByRole('button',{name:'Wi-Fi',exact:true}));await shot('review-rating');
 await page.getByLabel('Расскажите подробнее').fill('Тихий номер, внимательный персонал.');await tap(page.getByRole('heading',{name:'Что понравилось',exact:true}));
 const file=page.getByLabel('Фотографии к отзыву', {exact:true});
 await file.setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('test')});await page.getByRole('alert').filter({hasText:'Выберите JPG'}).waitFor();
 const photo=await page.locator('.review-hotel img').screenshot();
 await file.setInputFiles({name:'hotel.png',mimeType:'image/png',buffer:photo});await page.getByAltText('Фото к отзыву 1').waitFor();await tap(page.getByRole('button',{name:'Удалить фото 1',exact:true}));assert.equal(await page.getByAltText('Фото к отзыву 1').count(),0);
 await file.setInputFiles(Array.from({length:6},(_,i)=>({name:'hotel'+i+'.png',mimeType:'image/png',buffer:photo})));await page.getByRole('alert').filter({hasText:'до пяти'}).waitFor();
 await file.setInputFiles({name:'hotel.png',mimeType:'image/png',buffer:photo});await page.getByAltText('Фото к отзыву 1').waitFor();await tap(page.getByRole('button',{name:'Отправить отзыв',exact:true}));await page.getByText('Спасибо за отзыв!',{exact:true}).waitFor();await shot('review-success');
 let saved=await state();assert.equal(saved.bookings[0].review.rating,4);assert.equal(saved.bookings[0].review.photos.length,1);assert.equal(saved.bookings[0].review.text,'Тихий номер, внимательный персонал.');assert.deepEqual(saved.payment,commerce.payment);await tap(page.getByRole('button',{name:'Готово',exact:true}));assert.ok(page.url().endsWith('#trips'));await page.reload();await tap(page.getByRole('button',{name:'Ваш отзыв: 4 из 5 — посмотреть',exact:true}).first());await page.getByText('Тихий номер, внимательный персонал.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Отправить отзыв',exact:true}).count(),0);await shot('review-saved');
 await seed(inHouse,'trip-review');await page.getByText('Оставить отзыв можно после завершения проживания.',{exact:true}).waitFor();assert.equal(await page.getByRole('button',{name:'Отправить отзыв',exact:true}).count(),0);assert.deepEqual(errors,[]);console.log('Browser QA passed: one top-up, rating, tags, text, photo validation/add/remove, save, reload, return, pre-checkout guard; no page errors.');
}catch(e){await shot('failure');throw e;}finally{await browser.close();}
