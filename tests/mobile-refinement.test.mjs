import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,requestCode,verifyCode,completeName,decodeState} from '../app/src/state.ts';
import {formatMoney} from '../app/src/booking/model.ts';
import {activateTripScenario} from '../app/src/booking/demoTripScenarios.ts';
import {initialCommerce} from '../app/src/booking/model.ts';
import {breakfastSummary} from '../app/src/booking/breakfastSummary.ts';
const owner='+79990000001';
test('Новый профиль получает один шаг стиля, повторный вход сохраняет просмотр',()=>{
 let s=completeName(verifyCode(requestCode(initialState(),owner),'123456'),'Анна');
 assert.equal(s.users[owner].travelStyleIntro,'pending');
 s.users[owner].travelStyleIntro='seen';s.activePhone=null;
 s=verifyCode(requestCode(decodeState(JSON.stringify(s)),owner),'123456');
 assert.equal(s.users[owner].travelStyleIntro,'seen');
 // A pre-existing profile without the flag is not treated as newly registered.
 delete s.users[owner].travelStyleIntro;s.activePhone=null;
 s=verifyCode(requestCode(s,owner),'123456');
 assert.equal(s.users[owner].travelStyleIntro,undefined);
});
test('Денежные значения округляются до рубля, в том числе скидки и ноль',()=>{
 for(const [minor,expected] of [[123449,1234],[123450,1235],[0,0],[99,1],[-123450,-1235]]){
  const actual=formatMoney(minor);assert.ok(!actual.includes(','));
  assert.equal(actual,new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:0}).format(expected));
 }
});
test('Завтрак: включён, ожидает оплаты, оплачен, отменён и доставка',()=>{
 const s=activateTripScenario(initialCommerce(),owner,'staying','breakfast-summary');const b=s.bookings[0];
 assert.equal(breakfastSummary(b).present,false);
 assert.equal(breakfastSummary({...b,draft:{...b.draft,services:['sea-breakfast']}}).label,'Оплачен');
 const r={id:'x',kind:'breakfast',status:'confirmed',date:b.draft.search.checkOut,time:'09:00',persons:1,mode:'room',comment:'',amountMinor:150000,createdAt:b.createdAt};
 const added={...b,serviceRequests:[r]};assert.equal(breakfastSummary(added).label,'Ожидает оплаты');
 assert.equal(breakfastSummary(added).details,'09:00 · Доставка в номер');
 assert.equal(breakfastSummary({...b,serviceRequests:[{...r,status:'paid',operation:{status:'confirmed'}}]}).label,'Оплачен');
 assert.equal(breakfastSummary({...b,serviceRequests:[{...r,status:'cancelled'}]}).present,false);
 const included={...b,draft:{...b.draft,rateId:'sea-standard-breakfast'}};
 assert.equal(breakfastSummary(included).label,'Включён');
 assert.match(breakfastSummary(included).details,/07:00–11:00.*Гренадин.*1 этаж/);
});
