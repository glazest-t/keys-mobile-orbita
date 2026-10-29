import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancelBooking,cancellationPreview,decodeCommerce,catalog} from '../app/src/booking/model.ts';
import {requestBreakfastStay,requestBreakfast,requestEarly} from '../app/src/booking/serviceRequests.ts';
import {respondToService,serviceQuote,payService,cancelPaidService,serviceCancellation} from '../app/src/booking/serviceSettlement.ts';
import {tripFacts} from '../app/src/booking/trip.ts';
import {previewAmendment} from '../app/src/booking/amendment.ts';
const owner='+79001234567',now='2026-10-22T12:00:00Z',id='services';
function fixture(early=false,friendly=false){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,adults:2,checkIn:'2026-11-13',checkOut:'2026-11-15'};s=startDraft(s,'orbit-sea',id);s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};s.draft.usePoints=false;if(friendly){s.accounts[owner].hotelierStatus='approved';s.draft.rateId=catalog.rates.find(r=>r.roomId===s.draft.roomId&&r.id.includes('friendly')).id;}s=commitBooking(s,owner,quoteDraft(s,owner),'success',now);if(early){const legacy=requestEarly(s,owner,id,'09:00','r',now);legacy.bookings[0].serviceRequests[0].status='pending';delete legacy.bookings[0].serviceRequests[0].settlement;return legacy;}return requestBreakfast(s,owner,id,{mode:'room',date:'2026-11-14',time:'08:00',persons:2,comment:''},'r',now);}
function paid(s,usePoints=true){s=respondToService(s,owner,id,'r','confirm',now);return payService(s,owner,id,'r',serviceQuote(s,owner,id,'r',usePoints,now),'sbp','success',now);}
const r=s=>s.bookings[0].serviceRequests[0];
test('Подтверждение отеля не списывает деньги; оплата идемпотентна и переживает сохранение',()=>{const s=fixture();assert.throws(()=>serviceQuote(s,owner,id,'r',true,now));const confirmed=respondToService(s,owner,id,'r','confirm',now);assert.deepEqual(s.payment,confirmed.payment);const q=serviceQuote(confirmed,owner,id,'r',true,now),next=payService(confirmed,owner,id,'r',q,'sbp','success',now);assert.equal(r(next).status,'paid');assert.equal(q.applied.pointsMinor,360000);assert.equal(q.cashDueMinor,0);assert.equal(payService(next,owner,id,'r',q,'sbp','success',now),next);assert.equal(r(decodeCommerce(JSON.stringify(next))).status,'paid');});
test('Ошибка оплаты и устаревший баланс не изменяют состояние',()=>{const s=respondToService(fixture(),owner,id,'r','confirm',now),before=structuredClone(s),q=serviceQuote(s,owner,id,'r',true,now);assert.throws(()=>payService(s,owner,id,'r',q,'sbp','failure',now));assert.deepEqual(s,before);const changed=structuredClone(s);changed.payment.balances['hotel:orbit-sea:'+owner]=0;assert.throws(()=>payService(changed,owner,id,'r',q,'sbp','success',now));assert.throws(()=>payService(s,'other',id,'r',q,'sbp','success',now));});
test('FR исключает баллы отеля, сохраняя баллы Ключей',()=>{const s=respondToService(fixture(false,true),owner,id,'r','confirm',now),q=serviceQuote(s,owner,id,'r',true,now);assert.equal(q.applied.hotelPoints,0);assert.equal(q.applied.keysPoints,3600);});
test('Завтрак: граница возврата ровно 20:00 мск накануне; кошельки возвращаются раздельно и один раз',()=>{const s=paid(fixture());assert.equal(r(s).cancellation.freeUntil,'2026-11-13T17:00:00.000Z');assert.equal(serviceCancellation(r(s),'2026-11-13T17:00:00Z').pointsReturn,3600);assert.equal(serviceCancellation(r(s),'2026-11-13T17:00:00.001Z').pointsReturn,0);const next=cancelPaidService(s,owner,id,'r','2026-11-13T17:00:00Z');assert.equal(next.payment.balances['hotel:orbit-sea:'+owner],1240);assert.equal(next.payment.balances['keys:'+owner],4860);assert.equal(cancelPaidService(next,owner,id,'r',now),next);});
// Compatibility with historical paid orders created before hotel settlement was introduced.
test('Старый ранний заезд меняет время только после оплаты; срок возврата — сутки',()=>{let s=fixture(true);s=respondToService(s,owner,id,'r','confirm',now);assert.equal(tripFacts(s.bookings[0]).checkInTime,'15:00');s=payService(s,owner,id,'r',serviceQuote(s,owner,id,'r',false,now),'card','success',now);assert.equal(tripFacts(s.bookings[0]).checkInTime,'09:00');assert.equal(r(s).cancellation.freeUntil,'2026-11-12T06:00:00.000Z');const cancelled=cancelPaidService(s,owner,id,'r','2026-11-12T06:00:00.001Z');assert.equal(r(cancelled).operation.refundCashMinor,0);assert.equal(r(cancelled).operation.penaltyMinor,250000);assert.equal(tripFacts(cancelled.bookings[0]).checkInTime,'15:00');});
test('Отмена всей брони учитывает отдельную услугу, сохраняет её операцию и не возвращает дважды',()=>{const s=paid(fixture(),false),preview=cancellationPreview(s.bookings[0],now);assert.equal(preview.serviceCashReturn,360000);const next=cancelBooking(s,owner,id,now);assert.equal(next.bookings[0].operation.refundCashMinor,s.bookings[0].operation.paidCashMinor+360000);assert.equal(next.payment.operations[r(s).operation.id].status,'cancelled');assert.equal(cancelBooking(next,owner,id,now),next);const early=paid(fixture(true),true),late=cancellationPreview(early.bookings[0],'2026-11-12T07:00:00Z');assert.equal(late.servicePenalty,250000);assert.equal(late.serviceCashReturn,0);});
test('Выполненный заказ уходит в историю и не возвращается; отказ не создаёт оплату',()=>{let s=paid(fixture(true));const started='2026-11-13T09:00:00+03:00';s=respondToService(s,owner,id,'r','complete',started);assert.equal(tripFacts(s.bookings[0]).checkInTime,'09:00');assert.throws(()=>cancelPaidService(s,owner,id,'r',started));assert.equal(serviceCancellation(r(s),started).pointsReturn,0);const f=fixture(),declined=respondToService(f,owner,id,'r','decline',now);assert.deepEqual(f.payment,declined.payment);assert.throws(()=>serviceQuote(declined,owner,id,'r',true,now));});
test('Оплаченные услуги не теряются при несовместимом изменении брони',()=>{const s=paid(fixture());assert.throws(()=>previewAmendment(s,owner,id,{search:{...s.bookings[0].draft.search,checkOut:'2026-11-16'},services:[]},now),/добавленные услуги/);});

test('Заказ на всё проживание: у каждого дня собственный срок возврата и журнал оплаты',()=>{
 let s=fixture();s.bookings[0].serviceRequests=[];
 s=requestBreakfastStay(s,owner,id,{mode:'buffet',date:'2026-11-14',time:'08:00',persons:2,comment:''},'stay',now);
 const ids=s.bookings[0].serviceRequests.map(r=>r.id);
 for(const requestId of ids){s=respondToService(s,owner,id,requestId,'confirm',now);s=payService(s,owner,id,requestId,serviceQuote(s,owner,id,requestId,false,now),'sbp','success',now);}
 const day1=s.bookings[0].serviceRequests[0],day2=s.bookings[0].serviceRequests[1];
 assert.notEqual(day1.operation.id,day2.operation.id);
 assert.equal(serviceCancellation(day1,'2026-11-13T17:00:01Z').cashReturn,0);
 assert.equal(serviceCancellation(day2,'2026-11-13T17:00:01Z').cashReturn,300000);
 const preview=cancellationPreview(s.bookings[0],now);assert.equal(preview.serviceCashReturn,600000);
 const cancelled=cancelPaidService(s,owner,id,ids[1],'2026-11-13T17:00:01Z');assert.equal(cancelled.bookings[0].serviceRequests[0].status,'paid');assert.equal(cancelled.bookings[0].serviceRequests[1].status,'cancelled');
});

test('Повторный оплаченный завтрак имеет независимую оплату, отказ и отмену',()=>{
 const original=paid(fixture(),false),first=structuredClone(r(original));
 let s=requestBreakfast(original,owner,id,{mode:'room',date:'2026-11-14',time:'08:00',persons:2,comment:'',additional:true},'extra',now);
 s=respondToService(s,owner,id,'extra','confirm',now);
 const q=serviceQuote(s,owner,id,'extra',false,now);
 assert.throws(()=>payService(s,owner,id,'extra',q,'sbp','failure',now));
 assert.deepEqual(r(s),first);
 s=payService(s,owner,id,'extra',q,'sbp','success',now);
 assert.notEqual(s.bookings[0].serviceRequests[1].operation.id,first.operation.id);
 assert.equal(payService(s,owner,id,'extra',q,'sbp','success',now),s);
 s=cancelPaidService(s,owner,id,'extra',now);
 assert.deepEqual(r(s),first);
 assert.equal(s.bookings[0].serviceRequests[1].status,'cancelled');
});
