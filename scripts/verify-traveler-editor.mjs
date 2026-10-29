import {chromium,expect} from '../app/node_modules/@playwright/test/index.mjs';
import {initialState,requestCode,verifyCode,completeName} from '../app/src/state.ts';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1106,height:1166},reducedMotion:'reduce'});page.setDefaultTimeout(10000);
const state=completeName(verifyCode(requestCode(initialState(),'9995550123'),'123456'),'Анна');
const dir='docs/iteration-7/qa-traveler-editor';await mkdir(dir,{recursive:true});
try{
 await page.addInitScript(s=>localStorage.setItem('keys-orbita-demo-v1',JSON.stringify(s)),state);
 await page.goto('http://127.0.0.1:5173/#travelers',{waitUntil:'domcontentloaded'});
 await page.getByRole('button',{name:'Добавить путешественника',exact:true}).click();
 await expect(page.getByText('Данные гостя',{exact:true})).toHaveCount(1);
 await expect(page.getByText(/необязательно/)).toHaveCount(0);
 await page.getByRole('textbox',{name:'Имя',exact:true}).fill('Иван');await page.getByRole('textbox',{name:'Фамилия',exact:true}).fill('Орлов');
 await page.getByRole('button',{name:/Дата рождения/}).click();
 const day=page.getByRole('spinbutton',{name:'День',exact:true}),month=page.getByRole('spinbutton',{name:'Месяц',exact:true}),year=page.getByRole('spinbutton',{name:'Год',exact:true});
 await month.press('ArrowDown');await expect(month).toHaveAttribute('aria-valuetext','февраля');
 await year.press('ArrowDown');await year.press('ArrowDown');await expect(year).toHaveAttribute('aria-valuetext','1992');
 await day.press('End');await expect(day).toHaveAttribute('aria-valuetext','29');
 await year.press('ArrowUp');await expect(day).toHaveAttribute('aria-valuetext','28');
 await year.press('ArrowDown');await expect(day).toHaveAttribute('aria-valuetext','29');
 // Drag month by one row upward; it must select March without dismissing the sheet.
 await page.waitForTimeout(650); const box=await month.boundingBox();await page.mouse.move(box.x+box.width/2,box.y+110);await page.mouse.down();await page.mouse.move(box.x+box.width/2,box.y+66,{steps:8});await page.mouse.up();
 await expect(month).toHaveAttribute('aria-valuetext','марта');
 await month.press('ArrowUp');
 await page.screenshot({path:dir+'/date-wheels.png'});
 await page.getByRole('button',{name:'Готово',exact:true}).click();await expect(page.getByRole('button',{name:'Дата рождения 29.02.1992',exact:true})).toBeVisible();
 // Cancel changes keeps the committed draft date.
 await page.getByRole('button',{name:/Дата рождения/}).click();await year.press('ArrowDown');await page.getByRole('button',{name:'Отмена',exact:true}).click();await expect(page.getByRole('button',{name:'Дата рождения 29.02.1992',exact:true})).toBeVisible();
 const phone=page.getByRole('textbox',{name:'Телефон',exact:true});
 await phone.pressSequentially('9991234567');await expect(phone).toHaveValue('+7 (999) 123-45-67');
 await phone.press('Backspace');await expect(phone).toHaveValue('+7 (999) 123-45-6');
 await phone.fill('+1 (202) 555-0123');await expect(phone).toHaveValue('+1 202 555 0123');
 await phone.fill('+44 7700 900123');await expect(phone).toHaveValue('+44 7700 900 123');
 await page.getByRole('button',{name:'Сохранить',exact:true}).click();await expect(page.getByText('+447700900123',{exact:true})).toBeVisible();await expect(page.getByText('29.02.1992',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Редактировать',exact:true}).click();await expect(page.getByRole('textbox',{name:'Телефон',exact:true})).toHaveValue('+44 7700 900 123');await page.screenshot({path:dir+'/editor.png'});
 await page.getByRole('button',{name:/Дата рождения/}).click();await year.press('End');await month.press('End');await day.press('End');await page.getByRole('button',{name:'Готово',exact:true}).click();
 const today=new Date().toLocaleDateString('ru-RU');await expect(page.getByRole('button',{name:'Дата рождения '+today,exact:true})).toBeVisible();
 console.log('PASS: single title, short labels, wheel drag/keyboard, leap-year bounds, cancel, today limit, international phone save/reopen.');
}finally{await browser.close();}
