import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,decodeCommerce} from '../app/src/booking/model.ts';
import {demoCheckIn,keyAccess,demoResetStay} from '../app/src/booking/stay.ts';
import {stayBill,quoteStayBill,payStayBill,demoCheckoutDay,requestCheckout,confirmCheckout} from '../app/src/booking/stayBill.ts';
import {requestBreakfast,breakfastQuote} from '../app/src/booking/serviceRequests.ts';
import {respondToService,cancelPaidService} from '../app/src/booking/serviceSettlement.ts';
import {documentKinds,tripDocument} from '../app/src/booking/documents.ts';
import {selectedTrip} from '../app/src/booking/trip.ts';
import {walletIds} from '../prototype/domain/payment.mjs';
const owner='+79001234567',now=Date.parse('2026-10-23T10:00:00Z'),at=new Date(now).toISOString();
const input={mode:'room',date:'2026-11-14',time:'08:00',persons:2,comment:''};
function fixture({service=false,method='at_hotel',friendly=false}={}){
 let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,adults:2,checkIn:'2026-11-13',checkOut:'2026-11-15'};
 s=startDraft(s,'orbit-sea','bill-test');s.draft.method=method;s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};
 if(friendly){s.accounts[owner].hotelierStatus='approved';s.draft.rateId=catalog.rates.find(r=>r.roomId===s.draft.roomId&&r.kind==='friendly_rate').id;}
 s=commitBooking(s,owner,quoteDraft(s,owner),'success',at);
 if(service){s=requestBreakfast(s,owner,'bill-test',input,'breakfast',at);s=respondToService(s,owner,'bill-test','breakfast','confirm',at);}
 return demoCheckIn(s,owner,'bill-test','in',now);
}
// Checkout may credit hotel loyalty, but must not debit guests or alter payments.
function assertCheckoutPayment(done,before){
 const award=done.hotelLoyaltyAwards[owner].find(a=>a.bookingId==='bill-test');
 const booking=done.bookings.find(b=>b.id==='bill-test');
 const expectedPoints=Math.floor(Math.max(0,booking.quote.lodgingMinor-booking.quote.applied.pointsMinor)*booking.hotelLoyalty.earnBasisPoints/1000000);
 assert.equal(award.points,expectedPoints);
 assert.deepEqual(done.payment,{...before.payment,balances:{...before.payment.balances,['hotel:orbit-sea:'+owner]:before.payment.balances['hotel:orbit-sea:'+owner]+expectedPoints}});
}
test('Счёт объединяет долг и подтверждённые услуги, pending не становится расходом',()=>{
 let s=fixture({service:true});const b=s.bookings[0];assert.equal(stayBill(b).due,b.operation.dueAtHotelMinor+360000);
 s=requestBreakfast(s,owner,b.id,{...input,date:'2026-11-15'},'pending',at);
 assert.equal(stayBill(s.bookings[0]).pending.length,1);assert.equal(stayBill(s.bookings[0]).due,stayBill(b).due);
 assert.throws(()=>quoteStayBill(s,'foreign',b.id,true,at));
});
test('Единая оплата: деньги/баллы сходятся, услуги не оплачиваются дважды, повтор безопасен',()=>{
 const s=fixture({service:true}),q=quoteStayBill(s,owner,'bill-test',true,at),before=structuredClone(s);
 const next=payStayBill(s,owner,'bill-test',q,'pay-1','sbp','success',at),b=next.bookings[0],bill=stayBill(b);
 assert.deepEqual(s,before);assert.equal(bill.due,0);assert.equal(bill.total,bill.cash+bill.points);
 assert.equal(b.serviceRequests[0].status,'paid');assert.equal(next.payment.operations[b.operation.id].dueAtHotelMinor,0);
 assert.equal(payStayBill(next,owner,b.id,q,'pay-1','sbp','success',at),next);
 assert.deepEqual(decodeCommerce(JSON.stringify(next)),next);
 const ids=walletIds(owner,b.draft.hotelId);assert.equal(s.payment.balances[ids.keys]-next.payment.balances[ids.keys],q.keysPoints);
 assert.equal(s.payment.balances[ids.hotel]-next.payment.balances[ids.hotel],q.hotelPoints);
});
test('Отказ и устаревший расчёт не меняют бронь и кошельки',()=>{
 const s=fixture({service:true}),q=quoteStayBill(s,owner,'bill-test',true,at),before=structuredClone(s);
 assert.throws(()=>payStayBill(s,owner,'bill-test',q,'x','card','failure',at),/не прошла/);assert.deepEqual(s,before);
 const changed={...s,bookings:s.bookings.map(b=>({...b,revision:(b.revision||0)+1}))};
 assert.throws(()=>payStayBill(changed,owner,'bill-test',q,'x','sbp','success',at),/изменился/);
 assert.throws(()=>payStayBill(s,'foreign','bill-test',q,'x','sbp','success',at));
});
test('Полное покрытие баллами и Friendly Rate исключают лишние списания',()=>{
 for(const friendly of [false,true]){let s=fixture({friendly});const ids=walletIds(owner,s.bookings[0].draft.hotelId);
 s={...s,payment:{...s.payment,balances:{...s.payment.balances,[ids.keys]:100000,[ids.hotel]:100000}}};
 const q=quoteStayBill(s,owner,'bill-test',true,at);assert.equal(q.cash,0);if(friendly)assert.equal(q.hotelPoints,0);
 const next=payStayBill(s,owner,'bill-test',q,'p','sbp','success',at);assert.equal(stayBill(next.bookings[0]).due,0);assert.equal(stayBill(next.bookings[0]).cash,0);
 }
});
test('Выезд требует дня выезда, оплаты, решения по заявкам и выполнения услуг',()=>{
 let s=fixture({service:true});assert.throws(()=>requestCheckout(s,owner,'bill-test',now),/последний день/);
 s=demoCheckoutDay(s,owner,'bill-test',now);assert.throws(()=>requestCheckout(s,owner,'bill-test',now),/оплатите/);
 let paid=fixture({service:true});paid=payStayBill(paid,owner,'bill-test',quoteStayBill(paid,owner,'bill-test',true,at),'p','sbp','success',at);
 paid=demoCheckoutDay(paid,owner,'bill-test',now);assert.throws(()=>requestCheckout(paid,owner,'bill-test',now),/выполнение/);
 paid=respondToService(paid,owner,'bill-test','breakfast','complete',at);
 paid=requestCheckout(paid,owner,'bill-test',now);assert.equal(requestCheckout(paid,owner,'bill-test',now),paid);
 const done=confirmCheckout(paid,owner,'bill-test','out',now),b=done.bookings[0];assert.equal(b.stay.status,'checked_out');assert.equal(keyAccess(b,now).visible,false);
 assert.equal(confirmCheckout(done,owner,'bill-test','out',now),done);assert.equal(selectedTrip(done,owner).id,b.id);
 assert.throws(()=>demoResetStay(done,owner,b.id));assert.throws(()=>breakfastQuote(b,input,at));assert.throws(()=>quoteStayBill(done,owner,b.id,true,at));
 assertCheckoutPayment(done,paid);assert.ok(documentKinds(b).includes('invoice'));assert.equal(tripDocument(b,'invoice').status,'Завершена');
});
test('Отель завершает проживание без запроса гостя; результат сохраняется и повтор безопасен',()=>{
 const s=demoCheckoutDay(fixture({method:'online'}),owner,'bill-test',now),before=structuredClone(s);
 assert.equal(s.bookings[0].stay.checkoutRequestedAt,undefined);
 assert.throws(()=>confirmCheckout(s,owner,'bill-test','',now),/подтверждение/);
 const done=confirmCheckout(s,owner,'bill-test','hotel-checkout',now),b=done.bookings[0];
 assert.equal(b.stay.status,'checked_out');assert.equal(b.stay.checkoutRequestedAt,undefined);
 assert.equal(keyAccess(b,now).visible,false);assert.ok(documentKinds(b).includes('invoice'));
 assert.equal(confirmCheckout(done,owner,b.id,'hotel-checkout',now),done);
 assert.deepEqual(decodeCommerce(JSON.stringify(done)),done);assertCheckoutPayment(done,s);assert.deepEqual(s,before);
 const unpaid=demoCheckoutDay(fixture(),owner,'bill-test',now);
 assert.throws(()=>confirmCheckout(unpaid,owner,'bill-test','hotel-checkout',now),/оплатите/);
});
test('Неподтверждённая заявка блокирует выезд, отмена разрешает завершение без списаний',()=>{
 let s=fixture({method:'online'});s=requestBreakfast(s,owner,'bill-test',input,'pending',at);s=demoCheckoutDay(s,owner,'bill-test',now);
 assert.throws(()=>requestCheckout(s,owner,'bill-test',now),/без ответа/);
 s=cancelPaidService(s,owner,'bill-test','pending',at);s=requestCheckout(s,owner,'bill-test',now);assert.ok(s.bookings[0].stay.checkoutRequestedAt);
});
test('Просроченный подтверждённый заказ не списывается молча в общем счёте',()=>{
 const s=demoCheckoutDay(fixture({service:true}),owner,'bill-test',now);
 assert.throws(()=>quoteStayBill(s,owner,'bill-test',true,at),/уточните/);
});
test('Возврат услуги после общей оплаты не затрагивает проживание и сохраняет равенство счёта',()=>{
 const initial=fixture({service:true});
 const paid=payStayBill(initial,owner,'bill-test',quoteStayBill(initial,owner,'bill-test',true,at),'p','sbp','success',at);
 const cancelled=cancelPaidService(paid,owner,'bill-test','breakfast',at),bill=stayBill(cancelled.bookings[0]);
 assert.deepEqual(cancelled.bookings[0].operation,paid.bookings[0].operation);
 assert.equal(bill.total,bill.cash+bill.points+bill.due);
 assert.equal(bill.total,cancelled.bookings[0].quote.orderTotalMinor);
 assert.equal(cancelPaidService(cancelled,owner,'bill-test','breakfast',at),cancelled);
});


test('Просроченную заявку можно отклонить в день выезда и завершить проживание без списаний',()=>{
 let s=fixture({method:'online'});s=requestBreakfast(s,owner,'bill-test',input,'expired',at);
 s=demoCheckoutDay(s,owner,'bill-test',now);const before=structuredClone(s);
 assert.throws(()=>confirmCheckout(s,owner,'bill-test','out',now),/без ответа/);
 assert.throws(()=>respondToService(s,owner,'bill-test','expired','confirm',at),/время прошло/);
 assert.throws(()=>respondToService(s,'other','bill-test','expired','decline',at),/не найден/);
 s=respondToService(s,owner,'bill-test','expired','decline',at);
 assert.equal(s.bookings[0].serviceRequests[0].status,'declined');
 assert.equal(respondToService(s,owner,'bill-test','expired','decline',at),s);
 assert.deepEqual(s.payment,before.payment);
 assert.equal(before.bookings[0].serviceRequests[0].status,'pending');
 const done=confirmCheckout(s,owner,'bill-test','out',now);
 assert.equal(done.bookings[0].stay.status,'checked_out');
 assert.equal(keyAccess(done.bookings[0],now).visible,false);
 assertCheckoutPayment(done,before);
});
