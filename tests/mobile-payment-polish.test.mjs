import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancelBooking} from '../app/src/booking/model.ts';
import {previewAmendment,commitAmendment} from '../app/src/booking/amendment.ts';
import {breakfastQuote,requestBreakfast} from '../app/src/booking/serviceRequests.ts';
import {ratingTone} from '../app/src/booking/rating.ts';
const owner='+79990000002',now='2026-10-30T12:00:00Z';
function setup(plan,points=false){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15'};s=startDraft(s,'orbit-sea','prepay');s.draft={...s.draft,method:'online',paymentOption:'card',cardPaymentPlan:plan,usePoints:points,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}};return s;}
for(const plan of ['full','night','percent30'])test(`Карта ${plan}: сумма, остаток, повтор, отмена и баллы`,()=>{
 for(const points of [false,true]){const s=setup(plan,points),q=quoteDraft(s,owner),target=plan==='night'?q.lodgingMinor/q.nights:plan==='percent30'?Math.round(q.orderTotalMinor*.3):q.orderTotalMinor;
 assert.equal(q.paymentSchedule.nowMinor,Math.max(0,target-q.applied.pointsMinor));
 const paid=commitBooking(s,owner,q,'success',now),o=paid.bookings[0].operation;
 assert.equal(o.paidCashMinor,q.paymentSchedule.nowMinor);assert.equal(o.paidCashMinor+o.dueAtHotelMinor+o.pointsMinor,q.orderTotalMinor);
 assert.deepEqual(commitBooking(paid,owner,q,'success',now).payment,paid.payment);
 const cancelled=cancelBooking(paid,owner,'prepay',now);assert.equal(cancelled.bookings[0].operation.refundCashMinor,o.paidCashMinor);assert.deepEqual(cancelled.payment.balances,s.payment.balances);
 }
});
test('Смена метода сбрасывает действие предоплаты, провал платежа не списывает средства',()=>{
 const s=setup('percent30');s.draft.paymentOption='sbp';const q=quoteDraft(s,owner);assert.equal(q.paymentSchedule.nowMinor,q.cashDueMinor);assert.throws(()=>commitBooking(s,owner,q,'failure',now));assert.equal(s.bookings.length,0);
});
test('Предоплата сохраняется при изменении дат, не превращается в полную оплату',()=>{
 const s=setup('percent30'),paid=commitBooking(s,owner,quoteDraft(s,owner),'success',now),b=paid.bookings[0];
 const preview=previewAmendment(paid,owner,b.id,{search:{...b.draft.search,checkOut:'2026-11-16'},services:[]},now);
 const changed=commitAmendment(paid,owner,preview,'extend','success',now),o=changed.bookings[0].operation;
 assert.equal(o.paidCashMinor,Math.round(changed.bookings[0].quote.orderTotalMinor*.3));assert.ok(o.dueAtHotelMinor>0);
});
test('Баллы могут полностью покрыть предоплату: сейчас ноль, остаток в отеле',()=>{
 const s=setup('percent30',true);s.payment.balances[`keys:${owner}`]=10000;const q=quoteDraft(s,owner);assert.equal(q.paymentSchedule.nowMinor,0);assert.ok(q.paymentSchedule.laterMinor>0);
});
test('Шведский стол: часы общие, заказать можно до 11:00, доставка требует свой слот',()=>{
 const s=setup('full'),paid=commitBooking(s,owner,quoteDraft(s,owner),'success',now),b=paid.bookings[0],input={mode:'buffet',date:'2026-11-14',time:'',persons:1,comment:''};
 assert.ok(breakfastQuote(b,input,'2026-11-14T07:59:59Z')>0);
 assert.throws(()=>breakfastQuote(b,input,'2026-11-14T08:00:00Z'));
 assert.throws(()=>breakfastQuote(b,{...input,mode:'room'},now));
 assert.equal(requestBreakfast(paid,owner,b.id,input,'buffet',now).bookings[0].serviceRequests[0].time,'11:00');
});
test('Рейтинг на шкале 5: зелёный от 4, оранжевый от 3, красный ниже',()=>{
 assert.equal(ratingTone('4,0'),'good');assert.equal(ratingTone(3.99),'average');assert.equal(ratingTone(3),'average');assert.equal(ratingTone(2.9),'poor');
});
