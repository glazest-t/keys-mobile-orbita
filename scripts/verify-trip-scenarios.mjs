import {chromium,expect} from '../app/node_modules/@playwright/test/index.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {initialState} from '../app/src/state.ts';
import {initialCommerce,ensureAccount} from '../app/src/booking/model.ts';
const phone='+79005550001',dir='docs/iteration-5/qa-trip-scenarios';
const auth={...initialState(),onboarded:true,activePhone:phone,users:{[phone]:{phone,name:'Анна',travelers:[]}}};
const original={...ensureAccount(initialCommerce(),phone),savedHotels:{[phone]:['pine-sochi']}};
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1106,height:1166}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(12000);await mkdir(dir,{recursive:true});
await page.addInitScript(({auth,original})=>{if(!localStorage.getItem('qa-scenarios')){
 localStorage.setItem('keys-orbita-demo-v1',JSON.stringify(auth));localStorage.setItem('keys-orbita-booking-v1',JSON.stringify(original));localStorage.setItem('qa-scenarios','1');
}},{auth,original});
const controls=page.getByRole('group',{name:'Сценарий поездки'});
const choose=async label=>{await controls.getByRole('button',{name:new RegExp('^'+label)}).click();await expect(page).toHaveURL(/#trips$/);await expect(controls.getByRole('button',{name:new RegExp('^'+label)})).toHaveAttribute('aria-pressed','true');};
try{
 await page.goto('http://127.0.0.1:5173/#find',{waitUntil:'domcontentloaded'});
 await choose('Брони ещё нет');await expect(page.getByRole('heading',{name:'Здесь появится ваша поездка'})).toBeVisible();await expect(page.getByRole('button',{name:'Открыть дверь',exact:true})).toHaveCount(0);await page.mouse.move(1000,100);await page.screenshot({path:dir+'/empty.png'});
 await choose('До заезда');await expect(page.getByRole('heading',{name:'Скоро поездка'})).toBeVisible();await expect(page.getByRole('button',{name:'Открыть дверь',exact:true})).toHaveCount(0);await page.screenshot({path:dir+'/upcoming.png'});
 await choose('Во время проживания');await expect(page.getByRole('heading',{name:'Ваше проживание'})).toBeVisible();await page.getByRole('button',{name:'Открыть дверь',exact:true}).click();await expect(page.getByRole('button',{name:'Дверь открыта',exact:true})).toBeVisible();await page.screenshot({path:dir+'/staying.png'});
 await choose('День выезда');await expect(page.getByRole('heading',{name:'Последний день'})).toBeVisible();await expect(page.getByRole('button',{name:'Открыть дверь',exact:true})).toBeVisible();await page.screenshot({path:dir+'/departure.png'});
 await choose('После выезда');await expect(page.getByRole('heading',{name:'До встречи!'})).toBeVisible();await expect(page.getByRole('button',{name:'Оценить поездку на 5 из 5'})).toBeVisible();await expect(page.getByRole('button',{name:'Открыть дверь',exact:true})).toHaveCount(0);await page.screenshot({path:dir+'/completed.png'});
 await page.reload({waitUntil:'domcontentloaded'});await expect(page.getByRole('heading',{name:'До встречи!'})).toBeVisible();
 await choose('До заезда');await expect(page.getByRole('heading',{name:'Скоро поездка'})).toBeVisible();
 await page.getByTestId('device-picker').click();await page.getByRole('menuitemradio',{name:'Pixel 10',exact:true}).click();await choose('День выезда');await expect(page.getByRole('heading',{name:'Последний день'})).toBeVisible();await page.screenshot({path:dir+'/pixel-departure.png'});
 await page.getByRole('button',{name:'Вернуться к своим данным',exact:true}).click();await expect(page.getByRole('heading',{name:'Здесь появится ваша поездка'})).toBeVisible();
 const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('keys-orbita-booking-v1')));assert.deepEqual(restored,original);assert.deepEqual(errors,[]);
 console.log('PASS: five presets, direct navigation, key before/during/after stay, checkout-day view, review, reload, reverse order, Pixel, exact restoration.');
}finally{await browser.close();}
