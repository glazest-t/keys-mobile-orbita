import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancelBooking,decodeCommerce} from '../app/src/booking/model.ts';
import {previewAmendment,commitAmendment} from '../app/src/booking/amendment.ts';
const owner='+79001234567',now='2026-10-22T12:00:00Z';
function fixture(method='online',points=true,services=[]){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2};s=startDraft(s,'orbit-sea','amend-test');s.draft={...s.draft,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'},method,usePoints:points,services,additionalGuest:{name:'Иван',surname:'Примеров'},stayWishes:{options:['Тихий номер'],note:'Подальше от лифта'}};return commitBooking(s,owner,quoteDraft(s,owner),'success',now);}
const input=(s,patch={})=>({search:{...s.bookings[0].draft.search,...patch},services:[...s.bookings[0].draft.services]});
test('Продление: предварительный расчёт не меняет бронь; отказ атомарен; повтор списывает только разницу один раз',()=>{
 const s=fixture(),before=structuredClone(s),p=previewAmendment(s,owner,'amend-test',input(s,{checkOut:'2026-11-16'}),now);
 assert.equal(p.extraPaid,1349000);assert.deepEqual(s,before);
 assert.throws(()=>commitAmendment(s,owner,p,'change-1','failure',now),/Исходная бронь/);assert.deepEqual(s,before);
 const next=commitAmendment(s,owner,p,'change-1','success',now),b=next.bookings[0];assert.equal(b.draft.search.checkOut,'2026-11-16');assert.equal(b.operation.paidCashMinor,s.bookings[0].operation.paidCashMinor+1349000);
 assert.deepEqual(next.payment.balances,s.payment.balances);assert.deepEqual(b.draft.stayWishes,s.bookings[0].draft.stayWishes);assert.deepEqual(b.draft.additionalGuest,s.bookings[0].draft.additionalGuest);
 assert.equal(commitAmendment(next,owner,p,'change-1','success',now),next);assert.throws(()=>commitAmendment(next,owner,p,'change-2','success',now),/уже изменилась/);
 assert.equal(decodeCommerce(JSON.stringify(next)).bookings[0].revision,1);
});
test('Сокращение поездки возвращает только разницу; последующая отмена возвращает остаток',()=>{
 const s=fixture(),p=previewAmendment(s,owner,'amend-test',input(s,{checkOut:'2026-11-14'}),now);assert.equal(p.refund,1349000);
 const next=commitAmendment(s,owner,p,'shorter','success',now),cancelled=cancelBooking(next,owner,'amend-test',now);
 assert.equal(cancelled.bookings[0].operation.refundCashMinor+p.refund,s.bookings[0].operation.paidCashMinor);
 assert.equal(cancelled.payment.balances['keys:'+owner],4860);assert.equal(cancelled.payment.balances['hotel:orbit-sea:'+owner],1240);
});
test('При оплате в отеле меняется остаток, бесплатная смена гостей не запускает оплату',()=>{
 const s=fixture('at_hotel'),p=previewAmendment(s,owner,'amend-test',input(s,{adults:1}),now);assert.equal(p.extraPaid,0);assert.equal(p.refund,0);
 const next=commitAmendment(s,owner,p,'guest','failure',now);assert.equal(next.bookings[0].operation.paidCashMinor,0);assert.equal(next.bookings[0].operation.dueAtHotelMinor,s.bookings[0].operation.dueAtHotelMinor);assert.equal(next.bookings[0].draft.additionalGuest,undefined);
 const longer=previewAmendment(next,owner,'amend-test',input(next,{checkOut:'2026-11-16'}),now);assert.equal(longer.extraPaid,0);assert.equal(longer.dueAtHotel,p.dueAtHotel+1349000);
});
test('Лишние баллы возвращаются в исходные кошельки, новые баллы не расходуются',()=>{
 let s=ensureAccount(initialCommerce(),owner);s.payment.balances['keys:'+owner]=50000;s.payment.balances['hotel:orbit-sea:'+owner]=20000;s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2};s=startDraft(s,'orbit-sea','points');s.draft={...s.draft,usePoints:true,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}};s=commitBooking(s,owner,quoteDraft(s,owner),'success',now);
 const p=previewAmendment(s,owner,'points',input(s,{checkOut:'2026-11-14'}),now);assert.equal(p.refund,0);assert.equal(p.hotelReturn,6510);assert.equal(p.keysReturn,6980);
 const next=commitAmendment(s,owner,p,'points-back','success',now),cancelled=cancelBooking(next,owner,'points',now);assert.equal(cancelled.payment.balances['keys:'+owner],50000);assert.equal(cancelled.payment.balances['hotel:orbit-sea:'+owner],20000);
});
test('Проверяются владелец, статус, вместимость, даты, наличие; своя бронь не занимает дополнительное место',()=>{
 const s=fixture();assert.throws(()=>previewAmendment(s,'another','amend-test',input(s),now),/не найдена/);assert.throws(()=>previewAmendment(s,owner,'amend-test',input(s,{adults:3}),now),/недоступен/);assert.throws(()=>previewAmendment(s,owner,'amend-test',input(s,{checkOut:'2026-11-20'}),now),/недоступен/);
 const occupied={...s,bookings:[...s.bookings,{...s.bookings[0],id:'other1'},{...s.bookings[0],id:'other2'}]};assert.doesNotThrow(()=>previewAmendment(occupied,owner,'amend-test',input(s),now));
 occupied.bookings.push({...s.bookings[0],id:'other3'});assert.throws(()=>previewAmendment(occupied,owner,'amend-test',input(s),now),/недоступен/);
 assert.throws(()=>previewAmendment(cancelBooking(s,owner,'amend-test',now),owner,'amend-test',input(s),now),/Отменённую/);assert.throws(()=>previewAmendment(s,owner,'amend-test',input(s),'2026-11-13T12:00:00Z'),/начала заезда/);
});
test('Завтрак пересчитывается по гостям и ночам, ранний заезд включается в разницу; посторонний черновик не меняется',()=>{
 let s=fixture('online',true,['sea-breakfast']);
 const p=previewAmendment(s,owner,'amend-test',input(s,{adults:1}),now);assert.equal(p.quote.serviceTotalMinor,2*150000);
 s=fixture();s=startDraft(s,'pine-sochi','unrelated');
 const original=structuredClone(s.draft),i=input(s);i.services.push('sea-early');const next=commitAmendment(s,owner,previewAmendment(s,owner,'amend-test',i,now),'early','success',now);
 assert.deepEqual(next.draft,original);assert.equal(next.bookings[0].changes[0].paidMinor,250000);
});
test('FR сохраняет забронированный тариф и не подключает программу отеля при изменении',()=>{
 let s=ensureAccount(initialCommerce(),owner);s.accounts[owner].hotelierStatus='approved';s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2};s=startDraft(s,'orbit-sea','friendly');s.draft={...s.draft,rateId:'sea-friendly-rate',usePoints:true,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}};s=commitBooking(s,owner,quoteDraft(s,owner),'success',now);s.accounts[owner].hotelierStatus='none';
 const p=previewAmendment(s,owner,'friendly',input(s,{checkOut:'2026-11-16'}),now);assert.equal(p.quote.hotelDiscountMinor,0);assert.equal(p.quote.applied.hotelPoints,0);assert.equal(p.extraPaid,923000);
 const next=commitAmendment(s,owner,p,'fr-extend','success',now);assert.equal(next.payment.balances['hotel:orbit-sea:'+owner],1240);
});
test('Бесплатная смена состава онлайн-брони не требует оплаты и не трогает деньги',()=>{
 const s=fixture(),p=previewAmendment(s,owner,'amend-test',input(s,{adults:1}),now);assert.equal(p.extraPaid,0);
 const next=commitAmendment(s,owner,p,'free-guest','failure',now);assert.equal(next.bookings[0].operation.paidCashMinor,s.bookings[0].operation.paidCashMinor);assert.deepEqual(next.payment.balances,s.payment.balances);
});
