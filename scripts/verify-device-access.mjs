import {chromium,expect} from '../app/node_modules/@playwright/test/index.mjs';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/Users/tatyana.glazyrina/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-x64/chrome-headless-shell'});
const page=await browser.newPage({viewport:process.env.ACCESS_MOBILE?{width:390,height:844}:{width:1106,height:1166},reducedMotion:'reduce'});page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const out='docs/iteration-7/qa-device-access'+(process.env.ACCESS_MOBILE?'/mobile':'');await mkdir(out,{recursive:true});
async function shot(name){await page.waitForTimeout(700);await page.screenshot({path:`${out}/${name}.png`});}
async function pin(value){const input=page.locator('.pin-code-field input').first();if(await input.getAttribute('readonly')!==null){for(const digit of value)await page.getByRole('group',{name:'Цифровая клавиатура PIN-кода'}).getByRole('button',{name:digit,exact:true}).click();}else await input.fill(value);}
async function button(name){await page.getByRole('button',{name,exact:true}).click();}
async function setup(value){await pin(value);await button('Продолжить');await pin(value);await button('Сохранить PIN-код');}
try{
 await page.addInitScript(()=>{if(!localStorage.getItem('keys-orbita-demo-v1'))localStorage.setItem('keys-orbita-demo-v1',JSON.stringify({version:1,onboarded:true,activePhone:'+79995550123',request:null,verifiedPhone:null,returnTo:'profile',users:{'+79995550123':{phone:'+79995550123',name:'Анна',travelers:[]}}}));});
 await page.goto('http://127.0.0.1:5173/#profile-security',{waitUntil:'domcontentloaded',timeout:60000});
 await page.getByRole('switch',{name:'Вход по биометрии'}).click();
 await expect(page.getByRole('heading',{name:'Придумайте PIN-код'})).toBeVisible();await shot('01-biometric-pin');
 await pin('4321');await button('Продолжить');await pin('4320');await button('Сохранить PIN-код');await expect(page.getByRole('alert')).toContainText('не совпали');
 await pin('4321');await button('Сохранить PIN-код');await expect(page.getByRole('dialog',{name:'Вход по биометрии'})).toBeVisible();await shot('02-biometric-enable');
 await button('Не сейчас');await expect(page.getByRole('switch',{name:'Вход по биометрии'})).toHaveAttribute('aria-checked','false');
 await button('Не распознано');await page.getByRole('switch',{name:'Вход по биометрии'}).click();await button('Подтвердить');await expect(page.getByRole('heading',{name:'Не удалось распознать'})).toBeVisible();await shot('03-biometric-failure');await button('Не сейчас');
 await button('Недоступна');await page.getByRole('switch',{name:'Вход по биометрии'}).click();await button('Подтвердить');await expect(page.getByRole('heading',{name:'Биометрия недоступна'})).toBeVisible();await button('Не сейчас');
 await button('Успех');await page.getByRole('switch',{name:'Вход по биометрии'}).click();await button('Подтвердить');await expect(page.getByRole('switch',{name:'Вход по биометрии'})).toHaveAttribute('aria-checked','true');
 await button('Не распознано');await button('Заблокировать приложение');await expect(page.getByRole('heading',{name:'Не удалось распознать'})).toBeVisible();await button('Ввести PIN-код');await shot('04-pin-login');
 await pin('0000');await expect(page.getByRole('alert')).toContainText('Неверный');await pin('4321');await expect(page.getByText('Код верный',{exact:true})).toBeVisible();await expect(page.getByRole('switch',{name:'Вход по биометрии'})).toBeVisible();
 await page.getByRole('button',{name:'Изменить PIN-код',exact:false}).click();await pin('4321');await expect(page.getByRole('heading',{name:'Придумайте PIN-код'})).toBeVisible();await setup('5678');await expect(page.getByRole('switch',{name:'Вход по биометрии'})).toBeVisible();
 await button('Успех');await page.reload();await expect(page.locator('.device-lock-screen')).toBeVisible();await expect(page.getByRole('switch',{name:'Вход по биометрии'})).toBeVisible();
 await page.getByRole('switch',{name:'Вход по биометрии'}).click();await button('Заблокировать приложение');
 // Changing the route must not expose profile contents while locked.
 await page.evaluate(()=>{location.hash='profile';});await expect(page.locator('.device-lock-screen')).toBeVisible();
 await pin('4321');await expect(page.getByRole('alert')).toContainText('Неверный');await pin('5678');await expect(page.locator('.device-lock-screen')).toHaveCount(0);
 await page.evaluate(()=>{location.hash='profile-security';});await button('Отключить PIN-код');await pin('0000');await expect(page.getByRole('alert')).toContainText('Неверный');await pin('5678');await expect(page.getByRole('button',{name:'Установить PIN-код',exact:false})).toBeVisible();
 await page.reload();await expect(page.locator('.device-lock-screen')).toHaveCount(0);
 await page.getByRole('button',{name:'Установить PIN-код',exact:false}).click();await setup('2468');await expect(page.getByRole('button',{name:'Заблокировать приложение',exact:true})).toBeVisible();await button('Заблокировать приложение');
 for(let i=0;i<5;i++){await pin('0000');await expect(page.locator('.pin-code-field input').first()).toHaveValue('');}
 await expect(page.getByRole('alert')).toContainText('Слишком много');await shot('05-pin-blocked');await button('Не помню PIN-код');
 await expect(page).toHaveURL(/#phone$/);await page.getByRole('button',{name:/Получить код/}).click();await expect(page).toHaveURL(/#code$/);await page.locator('.sms-code-field input').first().fill('123456');
 await expect(page.getByRole('button',{name:'Установить PIN-код',exact:false})).toBeVisible();await expect(page.getByRole('switch',{name:'Вход по биометрии'})).toHaveAttribute('aria-checked','false');
 await shot('06-security-reset');if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: setup/mismatch/cancel, biometric success/failure/unavailable, PIN wrong/success/change/off, reload, hash guard, lockout, SMS recovery; no browser errors.');
}catch(e){await shot('error');console.error(await page.locator('.keys-app').innerText());throw e;}finally{await browser.close();}
