import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,decodeCommerce,cancelBooking} from '../app/src/booking/model.ts';
import {hotelLevels,hotelProgramProgress,hotelProgramDiscount,ensureDemoHotelPoints,settleHotelLoyalty,setHotelProgram} from '../app/src/rewards/loyalty.ts';
import {confirmCheckout} from '../app/src/booking/stayBill.ts';
import {pointHistory} from '../app/src/rewards/points.ts';
const owner='+79001234567',other='+79007654321',at='2026-10-29T12:00:00Z',year=new Date().toLocaleDateString('en-CA',{timeZone:'Europe/Moscow'}).slice(0,4);
function base(amount=0,hotel='orbit-sea'){
 let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2};
 s.hotelLoyaltySeeds={[owner]:{[hotel]:{year,amountMinor:amount}}};return s;
}
function book(s=base(),hotel='orbit-sea'){
 s=startDraft(s,hotel,'levels',owner);s.draft={...s.draft,usePoints:false,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}};
 return commitBooking(s,owner,quoteDraft(s,owner),'success',at);
}
function checkedOut(s){return {...s,bookings:s.bookings.map(b=>({...b,stay:{eventId:'checkin',status:'checked_out',checkedOutAt:at}}))};}
test('Все типы программы: скидка, баллы и сочетание; собственные правила',()=>{
 assert.equal(hotelLevels('orbit-sea').length,5);
 assert.ok(hotelLevels('orbit-sea').every(l=>l.discountBasisPoints&&l.earnBasisPoints));
 assert.ok(hotelLevels('orbit-forest').every(l=>!l.discountBasisPoints&&l.earnBasisPoints));
 assert.ok(hotelLevels('kazan-apart').every(l=>l.discountBasisPoints&&!l.earnBasisPoints));
 assert.deepEqual(hotelLevels('orbit-city'),[]);
});
test('Границы уровней, максимум, годовой период и отдельный прогресс владельцев и отелей',()=>{
 for(const [amount,level] of [[0,'Гость'],[3999999,'Гость'],[4000000,'Ценитель'],[8000000,'Знаток'],[15000000,'Эксперт'],[30000000,'Легенда']]){
  const s=base(amount);assert.equal(hotelProgramProgress(s,owner,'orbit-sea').current.name,level);
  assert.equal(hotelProgramProgress(s,other,'orbit-sea').spentMinor,0);
  assert.equal(hotelProgramProgress(s,owner,'orbit-forest').spentMinor,0);
 }
 const p=hotelProgramProgress(base(30000000),owner,'orbit-sea');assert.equal(p.next,undefined);assert.equal(p.progress,1);
 assert.equal(hotelProgramProgress(base(8000000),owner,'orbit-sea',`${+year+1}-01-01T00:00:00Z`).current.name,'Гость');
});
test('Уровень меняет новую цену, но не сохранённую бронь; отключённая карта не даёт скидку',()=>{
 let s=book();const original=structuredClone(s.bookings[0]);s=startDraft(s,'orbit-sea','new');const low=quoteDraft(s,owner);
 s.hotelLoyaltySeeds[owner]['orbit-sea'].amountMinor=30000000;const high=quoteDraft(s,owner);
 assert.ok(high.hotelDiscountMinor>low.hotelDiscountMinor);assert.deepEqual(s.bookings[0],original);
 assert.equal(hotelProgramDiscount(setHotelProgram(s,owner,'orbit-sea',false),owner,'orbit-sea'),0);
});
test('Friendly Rate не использует ни скидку, ни начисление, ни прогресс отеля',()=>{
 let s=base(30000000);s.accounts[owner].hotelierStatus='approved';s=book(s);
 assert.equal(s.bookings[0].quote.hotelDiscountMinor,0);assert.equal(s.bookings[0].hotelLoyalty,undefined);
 s=checkedOut(s);assert.equal(settleHotelLoyalty(s,owner,'levels'),s);
});
test('Выезд начисляет баллы по сохранённому уровню ровно один раз; кошельки раздельны',()=>{
 let s=book(base(7900000));const initial=s.payment.balances['hotel:orbit-sea:'+owner],keys=s.payment.balances['keys:'+owner];
 assert.equal(s.bookings[0].hotelLoyalty.earnBasisPoints,500);
 assert.equal(settleHotelLoyalty(s,owner,'levels'),s);
 s=checkedOut(s);s=settleHotelLoyalty(s,owner,'levels');const award=s.hotelLoyaltyAwards[owner][0];
 assert.equal(award.points,Math.floor(s.bookings[0].quote.lodgingMinor*500/1000000));
 assert.equal(s.payment.balances['hotel:orbit-sea:'+owner],initial+award.points);
 assert.equal(s.payment.balances['keys:'+owner],keys);
 assert.equal(hotelProgramProgress(s,owner,'orbit-sea').current.name,'Знаток');
 assert.equal(settleHotelLoyalty(s,owner,'levels'),s);
 const restored=decodeCommerce(JSON.stringify(s));assert.equal(settleHotelLoyalty(restored,owner,'levels'),restored);
 assert.equal(pointHistory(s,owner,'hotel:orbit-sea:'+owner).filter(e=>e.kind==='stay').length,1);
 s.payment.balances['hotel:orbit-sea:'+owner]=0;assert.equal(hotelProgramProgress(s,owner,'orbit-sea').current.name,'Знаток');
});
test('Отменённая бронь не учитывается, полный расчёт баллами не даёт нового начисления',()=>{
 let s=book();s=cancelBooking(s,owner,'levels',at);s=checkedOut(s);assert.equal(settleHotelLoyalty(s,owner,'levels'),s);
 s=base();s.payment.balances['keys:'+owner]=1000000;s=startDraft(s,'orbit-sea','levels');s.draft={...s.draft,usePoints:true,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}};
 s=commitBooking(s,owner,quoteDraft(s,owner),'success',at);s=settleHotelLoyalty(checkedOut(s),owner,'levels');assert.equal(s.hotelLoyaltyAwards[owner][0].points,0);assert.equal(s.hotelLoyaltyAwards[owner][0].qualifyingMinor,0);
});
test('Подтверждение выезда вызывает начисление; повтор выезда и миграция не дублируют баланс',()=>{
 let s=book();s.bookings[0].stay={eventId:'in',status:'in_house',checkedInAt:'2026-11-13T12:00:00Z'};
 s=confirmCheckout(s,owner,'levels','out',Date.parse('2026-11-15T12:00:00Z'));
 assert.equal(s.hotelLoyaltyAwards[owner].length,1);assert.equal(confirmCheckout(s,owner,'levels','again'),s);
 let demo=ensureDemoHotelPoints(ensureAccount(initialCommerce(),owner),owner);assert.equal(hotelProgramProgress(demo,owner,'orbit-sea').current.name,'Ценитель');assert.equal(ensureDemoHotelPoints(demo,owner),demo);
});
