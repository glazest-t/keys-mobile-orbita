import {chromium,expect} from '../app/node_modules/@playwright/test/index.mjs';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.PHOTO_QA_BROWSER?{executablePath:process.env.PHOTO_QA_BROWSER}:{channel:'chrome'})});
const page=await browser.newPage({viewport:{width:1106,height:1166},reducedMotion:'reduce'});page.setDefaultTimeout(15000);
try{
 await page.addInitScript(()=>{if(!localStorage.getItem('keys-orbita-demo-v1'))localStorage.setItem('keys-orbita-demo-v1',JSON.stringify({version:1,onboarded:true,activePhone:'+79995550123',request:null,verifiedPhone:null,returnTo:'profile',users:{'+79995550123':{phone:'+79995550123',name:'Анна',travelers:[]}}}));});
 await page.goto('http://127.0.0.1:5173/#profile',{waitUntil:'domcontentloaded',timeout:60000});
 await page.getByRole('button',{name:'Добавить фото профиля',exact:true}).click();
 const input=page.getByLabel('Выбрать фото профиля',{exact:true});
 await input.setInputFiles({name:'invalid.txt',mimeType:'text/plain',buffer:Buffer.from('invalid')});await expect(page.getByRole('alert')).toContainText('JPG');
 const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=600;c.height=400;const x=c.getContext('2d');x.fillStyle='#2f5bff';x.fillRect(0,0,600,400);x.fillStyle='#d2f5e5';x.beginPath();x.arc(300,200,140,0,Math.PI*2);x.fill();return c.toDataURL('image/png').split(',')[1];});
 await input.setInputFiles({name:'avatar.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
 await expect(page.getByRole('button',{name:'Сохранить',exact:true})).toBeEnabled();
 await mkdir('docs/iteration-7/qa-profile-photo',{recursive:true});await page.waitForTimeout(700);await page.screenshot({path:'docs/iteration-7/qa-profile-photo/preview.png'});
 await page.getByRole('button',{name:'Сохранить',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('.profile-photo-avatar img')).toHaveCount(1);
 await page.goto('http://127.0.0.1:5173/#find',{waitUntil:'domcontentloaded',timeout:60000});await expect(page.locator('.profile-avatar-image')).toHaveCount(1);
 await page.goto('http://127.0.0.1:5173/#profile',{waitUntil:'domcontentloaded',timeout:60000});
 await page.reload({waitUntil:'domcontentloaded',timeout:60000});await expect(page.getByRole('button',{name:'Изменить фото профиля',exact:true})).toBeVisible();await expect(page.locator('.profile-photo-avatar img')).toHaveCount(1);
 await page.waitForTimeout(700);await page.screenshot({path:'docs/iteration-7/qa-profile-photo/profile.png'});
 await page.getByRole('button',{name:'Изменить фото профиля',exact:true}).click();await page.getByRole('button',{name:'Удалить фото',exact:true}).click();await page.getByRole('button',{name:'Сохранить',exact:true}).click();
 await page.reload({waitUntil:'domcontentloaded',timeout:60000});await expect(page.getByRole('button',{name:'Добавить фото профиля',exact:true})).toBeVisible();await expect(page.locator('.profile-photo-avatar img')).toHaveCount(0);
 console.log('PASS: invalid format, photo upload and preview, save, both avatars, reload, removal and reload. Isolated profile.');
}finally{await browser.close();}
