import test from 'node:test';
import assert from 'node:assert/strict';
import {displayBirthDate,storeBirthDate,deleteBirthDate} from '../app/src/travelers/birthDate.ts';
import {initialState,blankTraveler,validateTraveler,saveTraveler} from '../app/src/state.ts';
const traveler=()=>({...blankTraveler('guest'),name:'Анна',surname:'Соколова',phone:'9991234567'});
test('Дата показывается в российском формате, хранится в ISO и поддерживает частичный ввод',()=>{
 assert.equal(displayBirthDate('1990-05-20'),'20.05.1990');assert.equal(storeBirthDate('20051990'),'1990-05-20');
 assert.equal(storeBirthDate('20.05.1990'),'1990-05-20');assert.equal(storeBirthDate('1990-05-20'),'1990-05-20');
 assert.equal(displayBirthDate('2005'),'20.05');assert.equal(storeBirthDate('20.0'),'20.0');assert.equal(displayBirthDate(''),'');
 assert.deepEqual(deleteBirthDate('20.05.1990',3,3,true),{value:'20.51.990',caret:1});
 assert.deepEqual(deleteBirthDate('20.05.1990',0,10,true),{value:'',caret:0});
});
test('Проверяются календарная дата, будущая и неполная даты',()=>{
 assert.equal(validateTraveler({...traveler(),birthDate:storeBirthDate('29.02.2024')},'2026-10-29').birthDate,undefined);
 for(const birth of ['29.02.2023','31.04.2000','30.10.2026','20.05.19'])assert.ok(validateTraveler({...traveler(),birthDate:storeBirthDate(birth)},'2026-10-29').birthDate);
});
test('Телефон обязателен, при сохранении нормализуется, данные другого гостя сохраняются',()=>{
 const owner='+79990000001',t=traveler(),primary={...traveler(),id:'primary',phone:owner,primary:true};
 const s={...initialState(),activePhone:owner,users:{[owner]:{phone:owner,name:'Анна',travelers:[primary]}}};
 assert.ok(validateTraveler({...t,phone:''}).phone);assert.ok(validateTraveler({...t,phone:'123'}).phone);
 assert.throws(()=>saveTraveler(s,{...t,phone:''}));
 const saved=saveTraveler(s,{...t,birthDate:storeBirthDate('20.05.1990'),citizenship:'Россия'});
 assert.deepEqual(saved.users[owner].travelers[0],primary);assert.equal(saved.users[owner].travelers[1].phone,'+79991234567');assert.equal(saved.users[owner].travelers[1].birthDate,'1990-05-20');
});

test('Международные контакты сохраняются с кодом страны без подмены на +7',()=>{
 const owner='+79990000001',t=traveler();
 const s={...initialState(),activePhone:owner,users:{[owner]:{phone:owner,name:'Анна',travelers:[]}}};
 for(const [phone,expected] of [['+44 7700 900123','+447700900123'],['+1 (202) 555-0123','+12025550123'],['00375 29 1234567','+375291234567'],['8 (999) 123-45-67','+79991234567']]){
  assert.equal(validateTraveler({...t,phone}).phone,undefined);
  const saved=saveTraveler(s,{...t,phone});assert.equal(saved.users[owner].travelers[0].phone,expected);assert.equal(saved.activePhone,owner);
 }
 for(const phone of ['+0 123456789','+44abc7700900123','++447700900123','+7 1234567','+1234567890123456'])assert.ok(validateTraveler({...t,phone}).phone);
});
