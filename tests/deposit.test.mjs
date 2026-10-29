import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,decodeCommerce} from '../app/src/booking/model.ts';
import {topUpDeposit,depositBalance} from '../app/src/booking/deposit.ts';
import {demoCheckIn} from '../app/src/booking/stay.ts';
import {requestCatalogService} from '../app/src/booking/hotelServiceCatalog.ts';
import {requestBreakfast} from '../app/src/booking/serviceRequests.ts';
import {respondToService,serviceQuote,payService,payServiceFromDeposit,cancelPaidService,serviceCancellation} from '../app/src/booking/serviceSettlement.ts';
import {quoteStayBill,payStayBill,stayBill,demoCheckoutDay,requestCheckout,confirmCheckout} from '../app/src/booking/stayBill.ts';
const owner='+79001234567',id='deposit-booking',now=Date.parse('2026-10-23T12:00:00Z'),stamp=new Date(now).toISOString();
function fixture(checkedIn=true){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,adults:1,checkIn:'2026-11-13',checkOut:'2026-11-15'};s=startDraft(s,'pine-sochi',id);s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};s.draft.usePoints=false;s=commitBooking(s,owner,quoteDraft(s,owner),'success',stamp);return checkedIn?demoCheckIn(s,owner,id,'stay',now):s;}
const topup=(s,amount=500000,key='topup')=>topUpDeposit(s,owner,id,amount,key,'sbp','success',now);
function service(s,kind='spa',key='service'){s=requestCatalogService(s,owner,id,kind,'2026-11-14','10:00','',key,now);return respondToService(s,owner,id,key,'confirm',stamp);}
const b=s=>s.bookings[0];
test('Пополнение только во время проживания: сумма, права, ошибка, идемпотентность, сохранение и независимость от баллов',()=>{
 const s=fixture(),next=topup(s);assert.equal(depositBalance(b(s)),0);assert.equal(depositBalance(b(next)),500000);assert.deepEqual(next.payment,s.payment);assert.equal(topup(next),next);assert.equal(depositBalance(b(decodeCommerce(JSON.stringify(next)))),500000);
 for(const amount of [0,-1,0.5,99,Infinity,NaN,100000001])assert.throws(()=>topup(s,amount));
 assert.throws(()=>topup(next,600000),/изменились/);assert.throws(()=>topup(fixture(false)),/проживания/);assert.throws(()=>topUpDeposit(s,'other',id,500000,'x','sbp','success',now),/доступа/);assert.throws(()=>topUpDeposit(s,owner,id,500000,'x','sbp','failure',now),/не пополнен/);assert.equal(depositBalance(b(s)),0);
 const manager=structuredClone(s);manager.bookingManagers={[id]:['manager']};assert.equal(depositBalance(b(topUpDeposit(manager,'manager',id,10000,'m','card','success',now))),10000);
});
test('Депозит оплачивает услугу один раз; обычная оплата не расходует депозит',()=>{
 const s=service(topup(fixture())),q=serviceQuote(s,owner,id,'service',false,stamp),paid=payServiceFromDeposit(s,owner,id,'service',q,stamp);
 assert.equal(depositBalance(b(paid)),20000);assert.equal(b(paid).serviceRequests[0].paymentSource,'deposit');assert.equal(stayBill(b(paid)).due,0);assert.equal(payServiceFromDeposit(paid,owner,id,'service',q,stamp),paid);
 const online=payService(s,owner,id,'service',q,'sbp','success',stamp);assert.equal(depositBalance(b(online)),500000);assert.equal(b(online).serviceRequests[0].paymentSource,undefined);
 assert.throws(()=>payServiceFromDeposit(service(fixture()),owner,id,'service',q,stamp),/недостаточно/);assert.throws(()=>payServiceFromDeposit(s,'other',id,'service',q,stamp));
});
test('Баллы покрывают до 100% услуги, депозит списывает только остаток; устаревший расчёт не проходит',()=>{
 const s=service(topup(fixture())),q=serviceQuote(s,owner,id,'service',true,stamp),paid=payServiceFromDeposit(s,owner,id,'service',q,stamp);assert.equal(q.cashDueMinor,0);assert.equal(depositBalance(b(paid)),500000);assert.equal(paid.payment.balances['keys:'+owner],60);
 const stale=structuredClone(s);stale.payment.balances['keys:'+owner]=0;assert.throws(()=>payServiceFromDeposit(stale,owner,id,'service',q,stamp),/изменились/);
});
test('Возврат за услугу возвращается на депозит, не удваивает внешний возврат и не повторяется',()=>{
 let s=service(topup(fixture()));s=payServiceFromDeposit(s,owner,id,'service',serviceQuote(s,owner,id,'service',false,stamp),stamp);const preview=serviceCancellation(b(s).serviceRequests[0],'2026-11-13T12:00:00Z');assert.equal(preview.cashReturn,0);assert.equal(preview.depositReturn,480000);
 const cancelled=cancelPaidService(s,owner,id,'service',stamp);assert.equal(depositBalance(b(cancelled)),500000);assert.equal(cancelPaidService(cancelled,owner,id,'service',stamp),cancelled);assert.equal(stayBill(b(cancelled)).cash,b(s).operation.paidCashMinor);
});
test('Поздняя отмена завтрака удерживает оплату с депозита по условиям услуги',()=>{
 let s=topup(fixture());s=requestBreakfast(s,owner,id,{mode:'room',date:'2026-11-14',time:'08:00',persons:1,comment:''},'breakfast',stamp);s=respondToService(s,owner,id,'breakfast','confirm',stamp);s=payServiceFromDeposit(s,owner,id,'breakfast',serviceQuote(s,owner,id,'breakfast',false,stamp),stamp);
 const realLate=Date.parse('2026-11-13T21:00:00+03:00')-b(s).stay.demoTimeOffsetMs;const cancelled=cancelPaidService(s,owner,id,'breakfast',new Date(realLate).toISOString());assert.equal(depositBalance(b(cancelled)),320000);assert.equal(b(cancelled).serviceRequests[0].operation.penaltyMinor,180000);
});
test('Общий счёт атомарно проверяет депозит; недостаток не списывает первую услугу',()=>{
 let s=service(topup(fixture()));s=service(s,'transfer','second');const q=quoteStayBill(s,owner,id,false,stamp),before=structuredClone(s);assert.throws(()=>payStayBill(s,owner,id,q,'bill','sbp','success',stamp,'deposit'),/остатке/);assert.deepEqual(s,before);
 s=topup(s,300000,'more');const fresh=quoteStayBill(s,owner,id,false,stamp),paid=payStayBill(s,owner,id,fresh,'bill','sbp','success',stamp,'deposit');assert.equal(depositBalance(b(paid)),30000);assert.equal(stayBill(b(paid)).due,0);assert.equal(payStayBill(paid,owner,id,fresh,'bill','sbp','success',stamp,'deposit'),paid);
 const debt=structuredClone(s);b(debt).operation.dueAtHotelMinor=1000;assert.throws(()=>payStayBill(debt,owner,id,quoteStayBill(debt,owner,id,false,stamp),'lodging','sbp','success',stamp,'deposit'));
});
test('При подтверждении выезда остаток возвращается один раз, дальнейшее пополнение закрыто',()=>{
 let s=topup(fixture());s=demoCheckoutDay(s,owner,id,now);s=requestCheckout(s,owner,id,now);assert.throws(()=>topup(s,10000,'pending'));s=confirmCheckout(s,owner,id,'out',now);assert.equal(depositBalance(b(s)),0);assert.equal(b(s).deposit.returned.amountMinor,500000);assert.equal(confirmCheckout(s,owner,id,'out',now),s);assert.throws(()=>topup(s,10000,'closed'));
});

test('Услуги с известной ценой сразу готовы к оплате; поздний выезд сразу добавляется с оплатой в отеле',async()=>{
 const {confirmPricedServices}=await import('../app/src/booking/servicePayment.ts');
 let s=fixture();s=requestCatalogService(s,owner,id,'spa','2026-11-14','10:00','','instant',now);const next=confirmPricedServices(s,owner,id,['instant'],stamp);assert.equal(b(next).serviceRequests[0].status,'confirmed');assert.deepEqual(next.payment,s.payment);assert.equal(serviceQuote(next,owner,id,'instant',false,stamp).cashDueMinor,480000);
 const late=requestCatalogService(s,owner,id,'late','2026-11-15','15:00','','late',now);const ready=confirmPricedServices(late,owner,id,['late'],stamp);assert.equal(b(ready).serviceRequests.find(r=>r.id==='late').settlement,'at_hotel');assert.deepEqual(ready.payment,s.payment);
});
test('Все завтраки оплачиваются одним действием, атомарно и без повторного расхода баллов',async()=>{
 const {requestBreakfastStay}=await import('../app/src/booking/serviceRequests.ts');const {confirmPricedServices,quoteServiceGroup,payServiceGroup}=await import('../app/src/booking/servicePayment.ts');
 let s=topup(fixture());s=requestBreakfastStay(s,owner,id,{mode:'room',date:'2026-11-14',time:'08:00',persons:1,comment:''},'all',stamp);s=confirmPricedServices(s,owner,id,['all'],stamp);
 const q=quoteServiceGroup(s,owner,id,'all',false,stamp);assert.equal(q.total,360000);assert.equal(q.items.length,2);assert.throws(()=>payServiceGroup(s,owner,id,'all',q,'sbp','online','failure',stamp));assert.equal(depositBalance(b(s)),500000);
 const paid=payServiceGroup(s,owner,id,'all',q,'sbp','deposit','success',stamp);assert.equal(depositBalance(b(paid)),140000);assert.ok(b(paid).serviceRequests.every(r=>r.status==='paid'));assert.equal(payServiceGroup(paid,owner,id,'all',q,'sbp','deposit','success',stamp),paid);
 const oneCancelled=cancelPaidService(paid,owner,id,b(paid).serviceRequests[0].id,stamp);assert.equal(depositBalance(b(oneCancelled)),320000);assert.equal(b(oneCancelled).serviceRequests[1].status,'paid');
 const withPoints=quoteServiceGroup(s,owner,id,'all',true,stamp),pointsPaid=payServiceGroup(s,owner,id,'all',withPoints,'sbp','online','success',stamp);assert.equal(withPoints.cash,0);assert.equal(pointsPaid.payment.balances['keys:'+owner],1260);
});
