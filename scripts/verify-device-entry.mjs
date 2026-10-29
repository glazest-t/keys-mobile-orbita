import {chromium,expect} from '../app/node_modules/@playwright/test/index.mjs';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,executablePath:'/Users/tatyana.glazyrina/Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-x64/chrome-headless-shell'});
const page=await browser.newPage({viewport:{width:1106,height:1166},reducedMotion:'reduce'});page.setDefaultTimeout(15000);
const errors=[];page.on('pageerror',e=>errors.push(e.message));const dir='docs/iteration-7/qa-device-entry';await mkdir(dir,{recursive:true});
const entry=async n=>{const button=page.getByRole('button',{name:new RegExp('^'+n+'\\. Вход по'),includeHidden:true});await button.click();await expect(button).toBeEnabled();};
const pin=async value=>{for(const digit of value)await page.getByRole('group',{name:'Цифровая клавиатура PIN-кода'}).getByRole('button',{name:digit,exact:true}).click();};
const shot=async name=>{await page.waitForTimeout(650);await page.screenshot({path:`${dir}/${name}.png`});};
try{
 await page.goto('http://127.0.0.1:5173/#phone',{waitUntil:'domcontentloaded',timeout:60000});
 await entry(5);await expect(page.locator('.device-lock-screen')).toBeVisible();await expect(page.getByRole('dialog')).toHaveCount(0);await shot('pin-entry');
 await pin('0000');await expect(page.getByRole('alert')).toContainText('Неверный');await pin('1234');await expect(page.locator('.device-lock-screen')).toHaveCount(0);await expect(page).toHaveURL(/#trips$/);
 await page.getByRole('button',{name:'Не распознано',exact:true}).click();await entry(6);await expect(page.getByRole('heading',{name:'Не удалось распознать'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Ввести PIN-код',exact:true})).toHaveClass(/primary/);await shot('biometric-failure');await page.getByRole('button',{name:'Ввести PIN-код',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);await pin('1234');await expect(page.locator('.device-lock-screen')).toHaveCount(0);
 await page.getByRole('button',{name:'Успех',exact:true}).click();await entry(6);await expect(page.getByText('Вход выполнен',{exact:true})).toBeVisible();await expect(page.locator('.device-lock-screen')).toHaveCount(0);
 await page.getByRole('button',{name:'Недоступна',exact:true}).click();await entry(6);await expect(page.getByRole('heading',{name:'Биометрия недоступна'})).toBeVisible();await page.getByRole('button',{name:'Ввести PIN-код',exact:true}).click();
 // Switching scenarios while locked remounts the entry state cleanly.
 await entry(5);await expect(page.getByRole('dialog')).toHaveCount(0);await pin('1234');await expect(page.locator('.device-lock-screen')).toHaveCount(0);
 await entry(5);await page.getByRole('button',{name:/^4\. Зарегистрированный гость/}).click();await expect(page).toHaveURL(/#phone$/);await expect(page.locator('.device-lock-screen')).toHaveCount(0);
 if(errors.length)throw Error(errors.join('\n'));console.log('PASS: ready PIN/biometric scenarios, incorrect PIN, biometric failure/unavailable fallback, successful recognition, switching scenarios.');
}catch(e){await shot('error');console.error(await page.locator('body').innerText());throw e;}finally{await browser.close();}
