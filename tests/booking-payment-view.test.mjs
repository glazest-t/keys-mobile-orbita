import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancelBooking,catalog} from '../app/src/booking/model.ts';
import {bookingCostLines,bookingPaymentView} from '../app/src/booking/bookingPaymentView.ts';
import {payBookingBalance,quoteBookingBalance} from '../app/src/booking/bookingBalance.ts';
const owner='+79990000002',now='2026-11-03T12:00:00Z';
function setup({method='online',plan='full',points=false,services=[]}={}){
 let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15'};s=startDraft(s,'orbit-sea','summary-test');
 s.draft={...s.draft,method,paymentOption:'card',cardPaymentPlan:plan,usePoints:points,services,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}};
 return commitBooking(s,owner,quoteDraft(s,owner),'success',now);
}
for(const config of [{},{plan:'percent30'},{method:'at_hotel'},{points:true},{plan:'night',points:true}])test('Оплата: сумма, баллы, деньги и остаток сходятся '+JSON.stringify(config),()=>{
 const b=setup(config).bookings[0],v=bookingPaymentView(b),before=structuredClone(b);
 assert.equal(v.total,v.cash+v.points+v.due);
 assert.equal(v.status,v.due===0?'Оплачено':v.cash+v.points>0?'Оплачено частично':'Не оплачено');
 const cost=bookingCostLines(b.draft,b.quote);assert.equal(cost.price.baseMinor-cost.price.discountMinor+cost.services.reduce((n,s)=>n+s.amount,0),b.quote.orderTotalMinor);assert.deepEqual(b,before);
});
test('В составе брони учтены завтрак, заезд и выезд без повторного начисления',()=>{
 const services=catalog.services.filter(s=>s.hotelId==='orbit-sea'&&(s.stayTime||s.id==='sea-breakfast')).map(s=>s.id);
 const b=setup({services}).bookings[0],lines=bookingCostLines(b.draft,b.quote);
 assert.equal(lines.services.reduce((n,s)=>n+s.amount,0),b.quote.serviceTotalMinor);
 assert.equal(bookingPaymentView(b).total,b.quote.orderTotalMinor);
});
test('При смене цен каталога используется сохранённый итог услуг',()=>{
 const b=setup({services:['sea-breakfast']}).bookings[0];b.quote.serviceTotalMinor+=100;
 const lines=bookingCostLines(b.draft,b.quote);assert.equal(lines.services.length,1);assert.equal(lines.services[0].amount,b.quote.serviceTotalMinor);
});
function request(id,status='confirmed',amountMinor=150000){return {id,kind:'breakfast',mode:'buffet',status,settlement:'at_hotel',date:'2026-11-14',time:'08:00',persons:1,comment:'',amountMinor,createdAt:now};}
test('Дополнительные завтраки сгруппированы; ожидающие и отменённые заявки не входят в остаток',()=>{
 const b=setup().bookings[0];b.serviceRequests=[request('one'),{...request('two'),date:'2026-11-15'},request('wait','pending'),request('cancel','cancelled')];
 const v=bookingPaymentView(b);assert.equal(v.serviceDue,300000);assert.equal(v.total,b.quote.orderTotalMinor+300000);assert.equal(v.groups.filter(g=>g.status==='При заселении').length,1);assert.equal(v.total,v.cash+v.points+v.due);
});
test('Оплата остатка брони не закрывает неоплаченные услуги',()=>{
 let s=setup({plan:'percent30'});s.bookings[0].serviceRequests=[request('extra')];s=payBookingBalance(s,owner,quoteBookingBalance(s.bookings[0]),'balance','success',now);
 const v=bookingPaymentView(s.bookings[0]);assert.equal(v.due,150000);assert.equal(v.status,'Оплачено частично');assert.equal(v.total,v.cash+v.points+v.due);
});
test('Отменённая бронь показывает удержание к оплате, не старый остаток',()=>{
 let s=setup({method:'at_hotel'});s=cancelBooking(s,owner,s.bookings[0].id,now);
 const b=s.bookings[0],v=bookingPaymentView(b);assert.equal(v.status,'Бронь отменена');assert.equal(v.due,b.operation.penaltyDueMinor||0);
});
test('Полная оплата баллами: деньги и остаток равны нулю',()=>{
 const b=setup().bookings[0];b.operation.pointsMinor=b.quote.orderTotalMinor;b.operation.paidCashMinor=0;b.operation.dueAtHotelMinor=0;
 b.quote.applied={hotelPoints:0,keysPoints:b.quote.orderTotalMinor/100,pointsMinor:b.quote.orderTotalMinor};b.quote.cashDueMinor=0;
 const v=bookingPaymentView(b);assert.equal(v.status,'Оплачено');assert.equal(v.total-v.points,0);assert.equal(v.due,0);
});
test('Отмена учитывает возврат денег и баллов за дополнительные услуги',()=>{
 const b=setup().bookings[0];b.operation={...b.operation,status:'cancelled',refundCashMinor:200000,returnedPointsMinor:10000,penaltyMinor:50000};
 b.serviceRequests=[{...request('refund','cancelled'),operation:{...b.operation,id:'service',paidCashMinor:150000,pointsMinor:0,refundCashMinor:100000,returnedPointsMinor:0,penaltyMinor:50000}}];
 const v=bookingPaymentView(b);assert.equal(v.refundCash,300000);assert.equal(v.returnedPoints,10000);assert.equal(v.penalty,100000);
});
