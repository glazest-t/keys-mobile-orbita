import {chromium,expect} from '../app/node_modules/@playwright/test/index.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1106,height:1166},reducedMotion:'reduce'});
page.setDefaultTimeout(12000);page.setDefaultNavigationTimeout(20000);
const dir='docs/iteration-4/qa-mobile-auth';await mkdir(dir,{recursive:true});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:true});
const goto=hash=>page.goto('http://127.0.0.1:5173/'+hash,{waitUntil:'domcontentloaded'});
const auth=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('keys-orbita-demo-v1')));
try{
 for(const route of ['find','results','booking-flow','trips','profile','rewards','swipe','kit']){
  await goto('#'+route);await expect(page.getByRole('textbox',{name:'Номер телефона',exact:true})).toBeVisible();
  await expect(page.getByRole('navigation',{name:'Главные разделы'})).toHaveCount(0);
  await expect(button('Продолжить без входа')).toHaveCount(0);
 }
 console.log('PASS: protected direct routes');
 await goto('#welcome');await button('Пропустить').click();await button('Начать').click();await expect(page.getByRole('textbox',{name:'Номер телефона',exact:true})).toBeVisible();
 await page.screenshot({path:dir+'/login-required.png'});
 await page.getByRole('textbox',{name:'Номер телефона',exact:true}).fill('9001112233');await button('Получить код').click();
 await page.getByRole('textbox',{name:'Код из СМС',exact:true}).fill('123456');await button('Подтвердить').click();
 await expect(page.getByRole('heading',{name:'Как вас зовут?'})).toBeVisible();assert.equal((await auth()).activePhone,null);
 await page.getByRole('textbox',{name:'Ваше имя',exact:true}).fill('Анна');await button('Продолжить').click();
 await expect(page.getByRole('heading',{name:'Куда поедем?'})).toBeVisible();assert.equal((await auth()).activePhone,'+79001112233');
 await expect(page.getByRole('heading',{name:'Недавние поиски'})).toHaveCount(0);await page.screenshot({path:dir+'/empty-history.png'});
 console.log('PASS: onboarding requires login; verified new profile opens search; empty history hidden');
 await button('Найти отель').click();await expect(button('Назад к поиску')).toBeVisible();await button('Назад к поиску').click();
 await expect(page.getByRole('heading',{name:'Недавние поиски'})).toHaveCount(1);
 await page.reload({waitUntil:'domcontentloaded'});await expect(page.getByRole('heading',{name:'Куда поедем?'})).toBeVisible();
 await button('Профиль').click();await button('Выйти из профиля').click();await button('Выйти').click();
 await expect(page.getByRole('textbox',{name:'Номер телефона',exact:true})).toBeVisible();assert.equal((await auth()).activePhone,null);
 await page.goBack({waitUntil:'domcontentloaded'});await expect(page.getByRole('textbox',{name:'Номер телефона',exact:true})).toBeVisible();
 await goto('#find');await expect(page.getByRole('textbox',{name:'Номер телефона',exact:true})).toBeVisible();
 assert.deepEqual(errors,[]);console.log('PASS: history after search, session reload, logout and browser Back cannot bypass login; no page errors');
}catch(e){console.error('FAILED AT',page.url(),await page.locator('body').innerText());await page.screenshot({path:dir+'/failure.png'});throw e;}finally{await browser.close();}
