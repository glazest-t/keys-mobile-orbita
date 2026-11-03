import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancelBooking} from '../app/src/booking/model.ts';
import {isPartiallyPaid,quoteBookingBalance,payBookingBalance} from '../app/src/booking/bookingBalance.ts';
import {previewAmendment,commitAmendment} from '../app/src/booking/amendment.ts';
const owner='+79990000002',now='2026-11-03T12:00:00Z';
function setup(plan='percent30',points=false){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15'};s=startDraft(s,'orbit-sea','balance');s.draft={...s.draft,method:'online',paymentOption:'card',cardPaymentPlan:plan,usePoints:points,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}};return commitBooking(s,owner,quoteDraft(s,owner),'success',now);}
for(const plan of ['night','percent30'])for(const points of [false,true])test(`Остаток ${plan}, баллы ${points}: успех, повтор, отмена`,()=>{
 const s=setup(plan,points),b=s.bookings[0],q=quoteBookingBalance(b),before=structuredClone(s);
 assert.equal(isPartiallyPaid(b),true);
 const paid=payBookingBalance(s,owner,q,'complete','success',now),done=paid.bookings[0];
 assert.deepEqual(s,before);assert.equal(done.operation.paidCashMinor,b.operation.paidCashMinor+q.amountMinor);assert.equal(done.operation.dueAtHotelMinor,0);assert.equal(isPartiallyPaid(done),false);
 assert.equal(done.operation.paidCashMinor+done.operation.pointsMinor,done.quote.orderTotalMinor);
 assert.deepEqual(paid.payment.balances,s.payment.balances);assert.deepEqual(paid.payment.operations[done.operation.id],done.operation);
 assert.equal(payBookingBalance(paid,owner,q,'complete','success',now),paid);
 assert.throws(()=>payBookingBalance(paid,owner,q,'new','success',now));
 const cancelled=cancelBooking(paid,owner,b.id,now);assert.equal(cancelled.bookings[0].operation.refundCashMinor,done.operation.paidCashMinor);
});
test('Ошибка, чужая бронь, отмена и устаревшая сумма не списывают средства',()=>{
 const s=setup(),q=quoteBookingBalance(s.bookings[0]),before=structuredClone(s);
 assert.throws(()=>payBookingBalance(s,owner,q,'fail','failure',now));assert.deepEqual(s,before);
 assert.throws(()=>payBookingBalance(s,'stranger',q,'wrong','success',now));
 assert.throws(()=>payBookingBalance(s,owner,{...q,amountMinor:q.amountMinor+100},'stale','success',now));
 assert.throws(()=>payBookingBalance(s,owner,{...q,revision:q.revision+1},'stale','success',now));
 assert.throws(()=>payBookingBalance(cancelBooking(s,owner,q.bookingId,now),owner,q,'cancelled','success',now));
 assert.equal(payBookingBalance(s,owner,q,'fail','success',now).bookings[0].operation.dueAtHotelMinor,0);
});
test('Полная оплата и нулевой остаток не предлагают доплату',()=>{
 const s=setup('full');assert.equal(isPartiallyPaid(s.bookings[0]),false);assert.throws(()=>quoteBookingBalance(s.bookings[0]));
});
test('После доплаты изменение дат не возвращает бронь к предоплате',()=>{
 const s=setup(),paid=payBookingBalance(s,owner,quoteBookingBalance(s.bookings[0]),'done','success',now),b=paid.bookings[0];
 const p=previewAmendment(paid,owner,b.id,{search:{...b.draft.search,checkOut:'2026-11-16'},services:b.draft.services},now);
 assert.equal(p.dueAtHotel,0);assert.ok(p.extraPaid>0);
 const changed=commitAmendment(paid,owner,p,'extend','success',now);assert.equal(isPartiallyPaid(changed.bookings[0]),false);
});
test('Доплата брони не оплачивает отдельные услуги в отеле',()=>{
 const s=setup();s.bookings[0].serviceRequests=[{id:'late',kind:'late',status:'confirmed',settlement:'at_hotel',amountMinor:300000}];
 const paid=payBookingBalance(s,owner,quoteBookingBalance(s.bookings[0]),'done','success',now);
 assert.deepEqual(paid.bookings[0].serviceRequests,s.bookings[0].serviceRequests);
});
