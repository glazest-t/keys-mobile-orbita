import {chromium,expect} from '../app/node_modules/@playwright/test/index.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1106,height:1166},reducedMotion:'reduce'});page.setDefaultTimeout(12000);
const dir='docs/iteration-3/qa-phone-mask';await mkdir(dir,{recursive:true});
try{
 await page.goto('http://127.0.0.1:5173/#phone',{waitUntil:'domcontentloaded'});
 const input=page.getByRole('textbox',{name:'Номер телефона',exact:true});
 await input.pressSequentially('9001234567');await expect(input).toHaveValue('(900) 123-45-67');
 await input.press('Backspace');await expect(input).toHaveValue('(900) 123-45-6');
 await input.fill('');await input.focus();await page.keyboard.insertText('+7 (900) 123-45-67');await expect(input).toHaveValue('(900) 123-45-67');
 await input.evaluate(e=>e.setSelectionRange(6,6));await input.press('Backspace');await expect(input).toHaveValue('(901) 234-56-7');
 await input.fill('8 900 123-45-67');await expect(input).toHaveValue('(900) 123-45-67');
 await input.evaluate(e=>e.setSelectionRange(6,7));await page.keyboard.insertText('9');await expect(input).toHaveValue('(900) 923-45-67');assert.equal(await input.evaluate(e=>e.selectionStart),7);
 await input.fill('9001234567');await page.screenshot({path:dir+'/phone-mask.png'});
 await page.getByRole('button',{name:'Получить код',exact:true}).click();await expect(page.getByRole('heading',{name:'Введите код'})).toBeVisible();
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('keys-orbita-demo-v1')).request.phone),'+79001234567');
 console.log('PASS: typing, deletion, full-number insertion, 8 prefix, selected replacement/caret, normalized SMS request');
}finally{await browser.close();}
