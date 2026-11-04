import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,decodeCommerce} from '../app/src/booking/model.ts';
import {requestBreakfastStay,requestBreakfast} from '../app/src/booking/serviceRequests.ts';
import {requestCatalogService} from '../app/src/booking/hotelServiceCatalog.ts';
import {addServicesForHotelPayment,quoteServiceGroup} from '../app/src/booking/servicePayment.ts';
import {serviceQuote,cancelPaidService,settleTimeServiceAtHotel,serviceStatusPresentation} from '../app/src/booking/serviceSettlement.ts';
import {stayBill} from '../app/src/booking/stayBill.ts';
import {hotelServicePaymentLabel} from '../app/src/booking/serviceHotelPayment.ts';
const owner='+79001234567',id='hotel-pay',now='2026-11-01T12:00:00Z';
function fixture(){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,adults:2,checkIn:'2026-11-13',checkOut:'2026-11-15'};s=startDraft(s,'orbit-sea',id);s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};return commitBooking(s,owner,quoteDraft(s,owner),'success',now);}
const input={mode:'room',date:'2026-11-14',time:'08:00',persons:2,comment:''};
test('Новый заказ добавляется без списания, только к оплате в отеле; повтор безопасен',()=>{
 const original=fixture(),pending=requestBreakfast(original,owner,id,input,'one',now),s=addServicesForHotelPayment(pending,owner,id,['one'],now),b=s.bookings[0],r=b.serviceRequests[0];
 assert.equal(r.status,'confirmed');assert.equal(r.settlement,'at_hotel');assert.equal(r.operation,undefined);assert.deepEqual(s.payment,original.payment);assert.equal(stayBill(b).hotelDue,360000);
 assert.equal(addServicesForHotelPayment(s,owner,id,['one'],now),s);
 assert.equal(decodeCommerce(JSON.stringify(s)).bookings[0].serviceRequests[0].settlement,'at_hotel');
 assert.throws(()=>serviceQuote(s,owner,id,'one',false,now),/оплачивается в отеле/);
 assert.throws(()=>addServicesForHotelPayment(s,'other',id,['one'],now));
 const cancelled=cancelPaidService(s,owner,id,'one',now);assert.equal(stayBill(cancelled.bookings[0]).hotelDue,0);assert.deepEqual(cancelled.payment,s.payment);
});
test('Все завтраки периода сохраняют расчёт и не переходят к онлайн-оплате',()=>{
 const original=fixture(),pending=requestBreakfastStay(original,owner,id,input,'all',now),s=addServicesForHotelPayment(pending,owner,id,['all'],now);
 assert.equal(s.bookings[0].serviceRequests.length,2);assert.ok(s.bookings[0].serviceRequests.every(r=>r.settlement==='at_hotel'&&!r.operation));assert.equal(stayBill(s.bookings[0]).hotelDue,720000);assert.deepEqual(s.payment,original.payment);assert.throws(()=>quoteServiceGroup(s,owner,id,'all',false,now),/Нет заказов к оплате/);
});
test('Спа оплачивается на ресепшене, бесплатная услуга не получает задолженность',()=>{
 let s=fixture();for(const [service,rid] of [['spa','spa'],['cleaning','free']]){s=requestCatalogService(s,owner,id,service,'2026-11-14','10:00','',rid,Date.parse(now));s=addServicesForHotelPayment(s,owner,id,[rid],now);}
 assert.equal(s.bookings[0].serviceRequests.find(r=>r.id==='free').settlement,undefined);assert.equal(stayBill(s.bookings[0]).hotelDue,480000);
 const paid=settleTimeServiceAtHotel(s,owner,id,'spa');assert.equal(stayBill(paid.bookings[0]).hotelDue,0);assert.equal(paid.bookings[0].serviceRequests[0].operation.paidCashMinor,480000);assert.equal(settleTimeServiceAtHotel(paid,owner,id,'spa'),paid);
});
test('Подсказка меняется от заселения к выезду, статус добавления остаётся единым',()=>{
 const s=addServicesForHotelPayment(requestBreakfast(fixture(),owner,id,input,'one',now),owner,id,['one'],now),b=s.bookings[0],r=b.serviceRequests[0];
 assert.equal(hotelServicePaymentLabel(b),'Оплата при заселении');assert.equal(serviceStatusPresentation(b,r).label,'Добавлено');
 const during={...b,stay:{status:'in_house'}};assert.equal(hotelServicePaymentLabel(during),'Оплата при выезде');assert.equal(serviceStatusPresentation(during,r).label,'Добавлено');
 assert.equal(serviceStatusPresentation(during,{...r,operation:{status:'confirmed'},status:'paid'}).label,'Оплачено');
});
