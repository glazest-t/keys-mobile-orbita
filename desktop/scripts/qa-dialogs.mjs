// Desktop dialog action regression checks; run from desktop with npm run test:dialogs.
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));process.chdir(root);await fs.mkdir('.desktop-work/qa',{recursive:true});
const require=createRequire(process.cwd()+'/app/package.json');
const {chromium,expect}=require('@playwright/test');
let executablePath;const cache=path.join(os.homedir(),'Library/Caches/ms-playwright');for(const n of (await fs.readdir(cache)).filter(x=>x.startsWith('chromium_headless_shell-')).sort().reverse()){const candidate=path.join(cache,n,'chrome-headless-shell-mac-x64/chrome-headless-shell');try{await fs.access(candidate);executablePath=candidate;break;}catch{}}
const browser=await chromium.launch({headless:true,executablePath});

const checks=[];
async function open(page,id,route=id){await page.goto(`http://127.0.0.1:5180/?catalogue=${id}#${route}`);await page.waitForFunction(()=>document.documentElement.dataset.catalogueStatus==='ready');}
async function verify(page,name){await page.waitForTimeout(150);const modal=page.locator('.desktop-modal');const groups=await modal.locator('.dialog-actions').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return [...e.querySelectorAll(':scope > .k-button')].filter(b=>b.getBoundingClientRect().height).map(b=>{const bRect=b.getBoundingClientRect();const c=getComputedStyle(b);return {text:b.textContent,y:bRect.y,x:bRect.x,right:bRect.right,height:bRect.height,bg:c.backgroundColor,class:b.className,within:bRect.left>=r.left-1&&bRect.right<=r.right+1,left:r.left};});}));expect(groups.length).toBeGreaterThan(0);for(const group of groups){if(group.length)expect(Math.abs(group[0].x-group[0].left)).toBeLessThan(2);for(const b of group){expect(b.class).toMatch(/primary|secondary/);expect(b.within).toBeTruthy();expect(Math.abs(b.y-group[0].y)).toBeLessThan(2);expect(Math.abs(b.height-group[0].height)).toBeLessThan(2);if(b.class.includes('primary'))expect(b.bg).toBe('rgb(47, 91, 255)');}}checks.push({name,groups});console.log('PASS',name);await modal.screenshot({path:'.desktop-work/qa/'+name+'.png'});}
try{const p=await browser.newPage({viewport:{width:1024,height:800},reducedMotion:'reduce'});
for(const [id,route] of [['record-cancel','booking-record'],['price-watch-delete','price-watches'],['service-payment','trip-services'],['service-order','trip-services'],['trip-wifi','trips']]){await open(p,id,route);await verify(p,id);}
await open(p,'edit');await p.getByRole('button',{name:/Дата рождения/}).click();await verify(p,'date-actions');await p.getByRole('dialog').getByRole('button',{name:'Отмена',exact:true}).click();await expect(p.locator('.desktop-modal')).toHaveCount(0);
await p.getByRole('textbox',{name:'Имя',exact:true}).fill('Мария');await p.getByRole('button',{name:'Поездки',exact:true}).click();await verify(p,'discard-actions');await p.getByRole('dialog').getByRole('button',{name:'Продолжить редактирование'}).click();await expect(p.getByRole('textbox',{name:'Имя',exact:true})).toHaveValue('Мария');
await open(p,'profile');await p.getByRole('button',{name:'Выйти',exact:true}).click();await verify(p,'logout-actions');await p.getByRole('dialog').getByRole('button',{name:'Остаться'}).click();await expect(p.locator('.desktop-modal')).toHaveCount(0);
await p.getByRole('button',{name:'Добавить фото профиля'}).click();await verify(p,'photo-actions');await p.locator('input[type=file]').setInputFiles('.desktop-work/qa/date-actions.png');await expect(p.getByRole('dialog').getByRole('button',{name:'Удалить фото'})).toBeVisible();await verify(p,'photo-three-actions');await p.keyboard.press('Escape');
await p.goto('http://127.0.0.1:5173/?catalogue=edit#edit');await p.waitForTimeout(1400);await p.getByRole('button',{name:/Дата рождения/}).click();await p.waitForTimeout(600);await expect(p.locator('.dialog-actions')).toHaveCount(0);await expect(p.getByRole('button',{name:'Отмена',exact:true})).toHaveClass(/ghost/);const done=await p.getByRole('button',{name:'Готово',exact:true}).boundingBox(),cancel=await p.getByRole('button',{name:'Отмена',exact:true}).boundingBox();expect(cancel.y).toBeGreaterThan(done.y+done.height-1);checks.push({name:'mobile-unchanged'});console.log('PASS mobile-unchanged');
}finally{await browser.close();await fs.writeFile('.desktop-work/qa/dialogs-check.json',JSON.stringify(checks,null,2));}
