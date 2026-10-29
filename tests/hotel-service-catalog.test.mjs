import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,decodeCommerce} from '../app/src/booking/model.ts';
import {hotelServices,filterHotelServices,catalogServiceDays,catalogServiceTimes,requestCatalogService} from '../app/src/booking/hotelServiceCatalog.ts';
import {respondToService,serviceQuote,payService,cancelPaidService} from '../app/src/booking/serviceSettlement.ts';
import {demoCheckIn,keyAccess,stayAccessUntil} from '../app/src/booking/stay.ts';
import {stayBill,quoteStayBill,payStayBill} from '../app/src/booking/stayBill.ts';
import {tripFacts} from '../app/src/booking/trip.ts';
const owner='+79001234567',now=Date.parse('2026-10-23T09:00:00Z'),stamp=new Date(now).toISOString(),id='catalog-trip';
function fixture(){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15'};s=startDraft(s,'pine-sochi',id);s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};s.draft.usePoints=false;return commitBooking(s,owner,quoteDraft(s,owner),'success',stamp);}
const request=(s,service='cleaning',requestId='r',date='2026-11-14',time='10:00')=>requestCatalogService(s,owner,id,service,date,time,'',requestId,now);
test('Полный каталог доступен демоотелю: категории, поиск, заявка без списания, сохранение и дубликаты',()=>{
 const s=fixture(),next=request(s);assert.equal(hotelServices.length,12);assert.deepEqual(filterHotelServices('Транспорт','').map(v=>v.id),['transfer','parking']);assert.equal(filterHotelServices('Популярное','ПОДУШКА')[0].id,'pillow');
 assert.deepEqual(next.payment,s.payment);assert.equal(next.bookings[0].serviceRequests[0].status,'pending');assert.equal(request(next),next);assert.equal(request(next,'cleaning','another').bookings[0].serviceRequests.length,2);assert.equal(decodeCommerce(JSON.stringify(next)).bookings[0].serviceRequests[0].serviceId,'cleaning');
 assert.throws(()=>requestCatalogService(s,'other',id,'cleaning','2026-11-14','10:00','','bad',now),/доступа/);
});
test('Даты и время услуг ограничены проживанием; поздний выезд выбирается в день выезда',()=>{
 const s=fixture(),b=s.bookings[0];assert.deepEqual(catalogServiceDays(b,'late',now),['2026-11-15']);assert.deepEqual(catalogServiceTimes(b,'cleaning','2026-11-13',now),['15:00','16:00','17:00','18:00']);assert.deepEqual(catalogServiceTimes(b,'cleaning','2026-11-15',now),['09:00','10:00','11:00','12:00']);
 for(const [date,time] of [['2026-11-12','16:00'],['2026-11-16','10:00'],['2026-11-13','10:00'],['2026-11-15','15:00']])assert.throws(()=>request(s,'cleaning','bad',date,time));
 assert.throws(()=>request(s,'spa','bad','2026-11-15','11:00'));assert.throws(()=>request(s,'late','bad','2026-11-14','15:00'));const done=structuredClone(s);done.bookings[0].stay={status:'checked_out'};assert.throws(()=>request(done),/завершена/);
});
test('Бесплатная услуга подтверждается и выполняется без операции оплаты; отменённая уходит в историю',()=>{
 let s=request(demoCheckIn(fixture(),owner,id,'checkin',now));s=respondToService(s,owner,id,'r','confirm',stamp);assert.equal(stayBill(s.bookings[0]).due,0);assert.equal(quoteStayBill(s,owner,id,false,stamp).items.length,0);
 const before=structuredClone(s.payment),done=respondToService(s,owner,id,'r','complete',stamp);assert.equal(done.bookings[0].serviceRequests[0].status,'completed');assert.deepEqual(done.payment,before);assert.equal(done.bookings[0].serviceRequests[0].operation,undefined);
 const cancelled=cancelPaidService(s,owner,id,'r',stamp);assert.equal(cancelled.bookings[0].serviceRequests[0].status,'cancelled');assert.deepEqual(cancelled.payment,before);assert.throws(()=>respondToService(cancelled,owner,id,'r','confirm',stamp));
});
test('Платная услуга попадает в общий счёт после подтверждения; оплата и возврат не дублируются',()=>{
 let s=request(demoCheckIn(fixture(),owner,id,'checkin',now),'spa');assert.equal(stayBill(s.bookings[0]).due,0);s=respondToService(s,owner,id,'r','confirm',stamp);assert.equal(stayBill(s.bookings[0]).due,480000);
 const q=quoteStayBill(s,owner,id,false,stamp),paid=payStayBill(s,owner,id,q,'payment','sbp','success',stamp);assert.equal(stayBill(paid.bookings[0]).due,0);assert.equal(payStayBill(paid,owner,id,q,'payment','sbp','success',stamp),paid);
 const cancelled=cancelPaidService(paid,owner,id,'r',stamp);assert.equal(cancelled.bookings[0].serviceRequests[0].operation.refundCashMinor,480000);assert.equal(stayBill(cancelled.bookings[0]).due,0);assert.equal(cancelPaidService(cancelled,owner,id,'r',stamp),cancelled);
});
test('Поздний выезд меняет время и доступ ключа без оплаты; отмена возвращает прежний срок',()=>{
 let s=request(fixture(),'late','r','2026-11-15','18:00');assert.equal(stayBill(s.bookings[0]).due,600000);assert.throws(()=>serviceQuote(s,owner,id,'r',false,stamp),/оплачивается в отеле/);assert.equal(tripFacts(s.bookings[0]).checkOutTime,'18:00');
 s=demoCheckIn(s,owner,id,'checkin',now);const b=s.bookings[0];assert.equal(Date.parse(stayAccessUntil(b)),Date.parse('2026-11-15T18:00:00+03:00'));const realAt17=Date.parse('2026-11-15T17:00:00+03:00')-b.stay.demoTimeOffsetMs;assert.equal(keyAccess(b,realAt17).available,true);
 const cancelled=cancelPaidService(s,owner,id,'r',stamp);assert.equal(tripFacts(cancelled.bookings[0]).checkOutTime,'12:00');assert.equal(keyAccess(cancelled.bookings[0],realAt17).available,false);
 const expired=structuredClone(cancelled.bookings[0]);expired.stay.accessUntil=expired.stay.accessFrom;assert.equal(keyAccess(expired,now).available,false);
});
