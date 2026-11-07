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
 let release;const gate=new Promise(r=>release=r);let block=true;
 await page.route('**/*',async route=>{if(block&&route.request().resourceType()==='image'&&!route.request().url().endsWith('.svg'))await gate;await route.continue().catch(()=>{});});
 await page.goto(`http://127.0.0.1:${width<500?5173:5180}/?variant=november&catalogue=results#results`,{waitUntil:'domcontentloaded'});
 await expect(page.getByRole('status').filter({hasText:'Подбираем отели'})).toBeVisible();
 await expect(page.locator('.hotel-list-card')).toHaveCount(0);
 await expect(page.getByText('Нет вариантов',{exact:true})).toHaveCount(0);
 await page.screenshot({path:root+`/.desktop-work/qa/search-loading-${width}.png`});
 block=false;release();await expect(page.locator('.search-results-loading')).toHaveCount(0,{timeout:10000});await expect(page.locator('.hotel-list-card').first()).toBeVisible();
 await page.screenshot({path:root+`/.desktop-work/qa/search-loaded-${width}.png`});
 console.log('PASS',width,'loading -> results, no false empty state');await page.close();
}}finally{await browser.close();}
