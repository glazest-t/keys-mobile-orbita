// Search accordion regression: run with mobile :5173 and desktop :5180 dev servers.
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');process.chdir(root);await fs.mkdir('.desktop-work/qa',{recursive:true});
const require=createRequire(process.cwd()+'/app/package.json');
const {chromium,expect}=require('@playwright/test');
let executablePath;const cache=path.join(os.homedir(),'Library/Caches/ms-playwright');for(const n of (await fs.readdir(cache)).filter(x=>x.startsWith('chromium_headless_shell-')).sort().reverse()){const candidate=path.join(cache,n,'chrome-headless-shell-mac-x64/chrome-headless-shell');try{await fs.access(candidate);executablePath=candidate;break;}catch{}}
const browser=await chromium.launch({headless:true,executablePath});
try{for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',...(width<500?{isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'}:{})});
 await page.goto(`http://127.0.0.1:${width<500?5173:5180}/?variant=november&catalogue=trip-staying#trips`,{waitUntil:'domcontentloaded'});
 await expect(page.locator('.stay-card')).toBeVisible({timeout:15000});
 const open=()=>page.getByRole('button',{name:width<500?'Открыть настройки прототипа':'Сценарии',exact:true}).click();
 const close=()=>page.getByRole('button',{name:width<500?'Закрыть настройки':'Сценарии ×',exact:true}).click();
 await open();await page.locator('.trip-scenario-controls>summary').click();await page.getByRole('button',{name:'Брони ещё нет',exact:true}).click();
 await expect(page.getByRole('button',{name:'Брони не было',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Бронь не подгрузилась',exact:true}).click();
 await expect(page.getByRole('button',{name:'Бронь не подгрузилась',exact:true})).toHaveAttribute('aria-pressed','true');
 await page.screenshot({path:root+`/.desktop-work/qa/empty-trip-settings-${width}.png`});
 await close();await page.getByRole('button',{name:'У меня есть бронь',exact:true}).click();
 await expect(page.getByRole('textbox',{name:'Номер бронирования',exact:true})).toBeVisible();
 await page.waitForTimeout(600);await page.screenshot({path:root+`/.desktop-work/qa/empty-trip-add-${width}.png`});
 await page.getByRole('textbox',{name:'Номер бронирования',exact:true}).fill('KEYS-2026');await page.getByRole('textbox',{name:'Код из ваучера',exact:true}).fill('wrong');
 await page.getByRole('button',{name:'Добавить бронь',exact:true}).click();await expect(page.getByText('Неверный код из ваучера',{exact:true})).toBeVisible();
 await page.getByRole('textbox',{name:'Код из ваучера',exact:true}).fill('1234');await page.getByRole('button',{name:'Добавить бронь',exact:true}).click();await expect(page.locator('.upcoming-card')).toBeVisible();
 await open();await page.getByRole('button',{name:'Брони ещё нет',exact:true}).click();await page.getByRole('button',{name:'Брони не было',exact:true}).click();await close();
 await expect(page.getByRole('button',{name:'У меня есть бронь',exact:true})).toHaveCount(0);
 await page.locator('.k-empty').count().catch(()=>0);
 await page.getByRole('button',{name:'Найти отель',exact:true}).last().click();await expect(page).toHaveURL(/#find$/);
 console.log('PASS',width,'empty variants, direct add, voucher error, added booking, unchanged search');await page.close();
}}finally{await browser.close();}
