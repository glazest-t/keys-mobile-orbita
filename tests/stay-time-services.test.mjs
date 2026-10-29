import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancelBooking,decodeCommerce} from '../app/src/booking/model.ts';
import {addStayTimeService,stayTimeServiceOptions,showTimeService} from '../app/src/booking/stayTimeServices.ts';
import {tripFacts} from '../app/src/booking/trip.ts';
import {demoCheckIn,keyAccess,stayAccessUntil} from '../app/src/booking/stay.ts';
import {stayBill,quoteStayBill} from '../app/src/booking/stayBill.ts';
import {cancelPaidService,serviceQuote,settleTimeServiceAtHotel,respondToService} from '../app/src/booking/serviceSettlement.ts';
import {previewAmendment} from '../app/src/booking/amendment.ts';
import {serviceCancellationAvailability} from '../app/src/booking/serviceLifecycle.ts';
import {requestStatus} from '../app/src/booking/serviceRequests.ts';
const owner='+79990000001',now=Date.parse('2026-10-27T09:00:00Z'),stamp=new Date(now).toISOString();
function fixture(hotel='orbit-sea'){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2};s=startDraft(s,hotel,'time-booking');s.draft.contact={name:'Анна',surname:'Примерова',email:'anna@example.test',phone:owner};s.draft.usePoints=false;return commitBooking(s,owner,quoteDraft(s,owner),'success',stamp);}
const add=(s,kind='arrival',time='09:00',id=kind)=>addStayTimeService(s,owner,'time-booking',kind,time,id,now);
test('Старая отметка completed у будущего времени не скрывает отмену и не оставляет долг',()=>{
 for(const kind of ['arrival','departure']){
  const s=add(fixture(),kind,kind==='arrival'?'09:00':'18:00'),b=s.bookings[0],r=b.serviceRequests[0];r.status='completed';
  assert.equal(requestStatus(b,r,now),'confirmed');assert.equal(serviceCancellationAvailability(b,r,now).allowed,true);
  const cancelled=cancelPaidService(s,owner,b.id,r.id,stamp);
  assert.equal(cancelled.bookings[0].serviceRequests[0].status,'cancelled');assert.equal(stayBill(cancelled.bookings[0]).due,0);
  assert.equal(tripFacts(cancelled.bookings[0])[kind==='arrival'?'checkInTime':'checkOutTime'],kind==='arrival'?'15:00':'12:00');
  assert.deepEqual(cancelled.payment,s.payment);assert.equal(cancelPaidService(cancelled,owner,b.id,r.id,stamp),cancelled);
 }
});
test('Оплаченный будущий поздний выезд со старой отметкой выполнения возвращается один раз',()=>{
 const s=settleTimeServiceAtHotel(add(fixture(),'departure','18:00'),owner,'time-booking','departure'),b=s.bookings[0],r=b.serviceRequests[0];r.status='completed';
 assert.equal(requestStatus(b,r,now),'paid');assert.equal(serviceCancellationAvailability(b,r,now).allowed,true);
 const cancelled=cancelPaidService(s,owner,b.id,r.id,stamp),operation=cancelled.bookings[0].serviceRequests[0].operation;
 assert.equal(operation.refundCashMinor,600000);assert.equal(operation.penaltyMinor,0);assert.equal(cancelPaidService(cancelled,owner,b.id,r.id,stamp),cancelled);
});
test('Отмена времени использует часы проживания; после начала и выезда недоступна',()=>{
 const s=demoCheckIn(add(fixture(),'departure','18:00'),owner,'time-booking','check-in',now),b=s.bookings[0],r=b.serviceRequests[0];r.status='completed';
 assert.equal(serviceCancellationAvailability(b,r,now).allowed,true);
 const boundary=Date.parse('2026-11-15T18:00:00+03:00')-b.stay.demoTimeOffsetMs;
 assert.equal(serviceCancellationAvailability(b,r,boundary-1).allowed,true);assert.equal(serviceCancellationAvailability(b,r,boundary).allowed,false);
 assert.throws(()=>cancelPaidService(s,owner,b.id,r.id,new Date(boundary).toISOString()),/уже началась/);
 b.stay.status='checked_out';assert.equal(serviceCancellationAvailability(b,r,now).allowed,false);
 const early=demoCheckIn(add(fixture()),owner,'time-booking','check-in',now),eb=early.bookings[0];assert.equal(serviceCancellationAvailability(eb,eb.serviceRequests[0],now-1000).allowed,false);
});
test('Демоконтроль не может заранее завершить ранний заезд или поздний выезд',()=>{
 for(const kind of ['arrival','departure']){const s=add(fixture(),kind,kind==='arrival'?'09:00':'18:00');assert.throws(()=>respondToService(s,owner,'time-booking',kind,'complete',stamp),/ещё не наступило/);}
});
test('Общая доступность отмены: бесплатная, оплаченная, выполненная, отклонённая услуга',()=>{
 const b=fixture().bookings[0],r={kind:'catalog',serviceId:'cleaning',status:'confirmed',date:'2026-11-14',time:'10:00',amountMinor:0};
 assert.equal(serviceCancellationAvailability(b,r,now).allowed,true);
 assert.equal(serviceCancellationAvailability(b,{...r,status:'paid',operation:{status:'confirmed'}},now).allowed,true);
 for(const status of ['completed','declined','cancelled'])assert.equal(serviceCancellationAvailability(b,{...r,status},now).allowed,false);
 assert.equal(serviceCancellationAvailability(b,{...r,date:'bad-date'},now).allowed,false);
});
test('Время применяется сразу, стоимость попадает в счёт без платежа и списания баллов',()=>{
 const s=fixture(),next=add(add(s),'departure','18:00'),b=next.bookings[0];
 assert.equal(tripFacts(b).checkInTime,'09:00');assert.equal(tripFacts(b).checkOutTime,'18:00');assert.equal(keyAccess(b,now).visible,false);
 assert.equal(stayBill(b).due,850000);assert.equal(stayBill(b).hotelDue,850000);assert.equal(stayBill(b).onlineDue,0);
 assert.deepEqual(next.payment,s.payment);assert.deepEqual(b.quote,s.bookings[0].quote);assert.deepEqual(next.draft,s.draft);
 assert.ok(b.serviceRequests.every(r=>r.status==='confirmed'&&r.settlement==='at_hotel'&&!r.operation));
 assert.equal(tripFacts(decodeCommerce(JSON.stringify(next)).bookings[0]).checkOutTime,'18:00');assert.equal(add(next),next);
 assert.throws(()=>add(next,'arrival','12:00','duplicate'),/уже добавлена/);
});
test('Недоступные настройки, даты, заселение и завершённая поездка скрывают услуги и блокируют добавление',()=>{
 const s=fixture();s.bookings[0].timeServiceAvailability={arrival:false,departure:false};for(const kind of ['arrival','departure']){assert.equal(showTimeService(s.bookings[0],kind,now),false);assert.equal(stayTimeServiceOptions(s.bookings[0],kind,now).length,0);assert.throws(()=>add(s,kind,kind==='arrival'?'09:00':'15:00'));}
 assert.equal(showTimeService(fixture('pine-sochi').bookings[0],'arrival',now),false);
 const staying=demoCheckIn(fixture(),owner,'time-booking','check-in',now);assert.equal(showTimeService(staying.bookings[0],'arrival',now),false);assert.throws(()=>add(staying),/заселён/);
 const b=fixture().bookings[0];assert.equal(showTimeService(b,'departure',Date.parse('2026-11-15T18:00:00+03:00')),false);
 staying.bookings[0].stay.status='checked_out';assert.equal(showTimeService(staying.bookings[0],'departure',now),false);assert.throws(()=>add(staying,'departure','18:00'));
});
test('Поздний выезд продлевает ключ без оплаты; отмена до начала убирает начисление и продление',()=>{
 let s=demoCheckIn(fixture(),owner,'time-booking','check-in',now);s=add(s,'departure','18:00');const b=s.bookings[0],real17=Date.parse('2026-11-15T17:00:00+03:00')-b.stay.demoTimeOffsetMs;
 assert.equal(Date.parse(stayAccessUntil(b)),Date.parse('2026-11-15T18:00:00+03:00'));assert.equal(keyAccess(b,real17).available,true);
 const cancelled=cancelPaidService(s,owner,b.id,'departure',stamp);assert.equal(stayBill(cancelled.bookings[0]).due,0);assert.equal(keyAccess(cancelled.bookings[0],real17).available,false);assert.deepEqual(cancelled.payment,s.payment);
});
test('Оплата в отеле закрывает долг один раз; онлайн-оплата услуги недоступна',()=>{
 let s=add(fixture());assert.throws(()=>serviceQuote(s,owner,'time-booking','arrival',false,stamp),/оплачивается в отеле/);
 s=demoCheckIn(s,owner,'time-booking','check-in',now);assert.equal(quoteStayBill(s,owner,'time-booking',false,stamp).items.length,0);
 const paid=settleTimeServiceAtHotel(s,owner,'time-booking','arrival'),r=paid.bookings[0].serviceRequests[0];assert.equal(stayBill(paid.bookings[0]).due,0);assert.equal(r.operation.method,'at_hotel');assert.equal(r.operation.paidCashMinor,250000);assert.deepEqual(paid.payment.balances,s.payment.balances);assert.equal(settleTimeServiceAtHotel(paid,owner,'time-booking','arrival'),paid);
});
test('Чужая бронь защищена, полное управление разрешено, включённая услуга не дублируется',()=>{
 const s=fixture();assert.throws(()=>addStayTimeService(s,'other','time-booking','arrival','09:00','x',now),/доступа/);
 s.bookingManagers={'time-booking':['manager']};assert.equal(addStayTimeService(s,'manager','time-booking','arrival','09:00','x',now).bookings[0].serviceRequests.length,1);
 s.bookings[0].draft.services=['sea-early'];assert.throws(()=>add(s),/уже добавлена/);
});
test('Изменение дат не теряет начисления; отмена брони убирает неоплаченные услуги без возврата',()=>{
 const s=add(fixture());assert.throws(()=>previewAmendment(s,owner,'time-booking',{search:{...s.bookings[0].draft.search,checkOut:'2026-11-16'},services:[]},stamp),/отмените добавленные услуги/);
 const cancelled=cancelBooking(s,owner,'time-booking',stamp);assert.equal(cancelled.bookings[0].serviceRequests[0].status,'cancelled');assert.equal(stayBill(cancelled.bookings[0]).hotelDue,0);
});
test('Выполненная услуга может ждать оплаты в отеле, её нельзя отменить после начала',()=>{
 let s=add(fixture());const startedAt='2026-11-13T09:00:00+03:00';s=respondToService(s,owner,'time-booking','arrival','complete',startedAt);assert.equal(stayBill(s.bookings[0]).due,250000);assert.throws(()=>cancelPaidService(s,owner,'time-booking','arrival',startedAt));
 const paid=settleTimeServiceAtHotel(s,owner,'time-booking','arrival');assert.equal(paid.bookings[0].serviceRequests[0].status,'completed');assert.equal(stayBill(paid.bookings[0]).due,0);
 const started=add(fixture());assert.throws(()=>cancelPaidService(started,owner,'time-booking','arrival','2026-11-13T09:00:00+03:00'),/началась/);
});
