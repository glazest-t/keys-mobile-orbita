import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancelBooking,decodeCommerce,catalog} from '../app/src/booking/model.ts';
import {breakfastStayQuote,requestBreakfastStay,breakfastQuote,cancelServiceRequest,pendingRequests,requestBreakfast,requestEarly,requestStatus} from '../app/src/booking/serviceRequests.ts';
import {tripFacts} from '../app/src/booking/trip.ts';
const owner='+79001234567',now='2026-10-22T12:00:00Z';
function fixture(hotel='orbit-sea',breakfast=false){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,adults:2,checkIn:'2026-11-13',checkOut:'2026-11-15'};s=startDraft(s,hotel,'service-trip');if(breakfast)s.draft.rateId=catalog.rates.find(r=>r.roomId===s.draft.roomId&&r.mealPlan==='breakfast').id;s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};return commitBooking(s,owner,quoteDraft(s,owner),'success',now);}
const input={mode:'buffet',date:'2026-11-14',time:'08:00',persons:2,comment:'Без сахара'};
test('d6 сразу добавляет ранний заезд без оплаты; повтор идемпотентен',()=>{
 const s=fixture(),next=requestEarly(s,owner,'service-trip','09:00','early-1',now);assert.equal(pendingRequests(next.bookings[0]).length,0);assert.equal(next.bookings[0].serviceRequests[0].status,'confirmed');assert.equal(tripFacts(next.bookings[0]).checkInTime,'09:00');assert.deepEqual(next.payment,s.payment);assert.deepEqual(next.bookings[0].quote,s.bookings[0].quote);assert.deepEqual(next.draft,s.draft);assert.equal(requestEarly(next,owner,'service-trip','09:00','early-1',now),next);assert.equal(decodeCommerce(JSON.stringify(next)).bookings[0].serviceRequests.length,1);
});
test('Изменение и отмена раннего запроса не оставляют две активные заявки',()=>{
 let s=requestEarly(fixture(),owner,'service-trip','09:00','first',now);assert.throws(()=>requestEarly(s,owner,'service-trip','12:00','second',now),/уже добавлена/);s=cancelServiceRequest(s,owner,'service-trip','first');s=requestEarly(s,owner,'service-trip','12:00','second',now);assert.equal(s.bookings[0].serviceRequests.filter(r=>r.status==='confirmed').length,1);assert.equal(tripFacts(s.bookings[0]).checkInTime,'12:00');s=cancelServiceRequest(s,owner,'service-trip','second');assert.equal(pendingRequests(s.bookings[0]).length,0);assert.equal(cancelServiceRequest(s,owner,'service-trip','second'),s);
});
test('Ранний заезд проверяет владельца, время, настройки и уже купленную услугу',()=>{
 const s=fixture();assert.throws(()=>requestEarly(s,'other','service-trip','09:00','x',now));assert.throws(()=>requestEarly(s,owner,'service-trip','08:00','x',now));assert.throws(()=>requestEarly(s,owner,'service-trip','09:00','x','2026-11-13T10:00:00Z'));assert.throws(()=>requestEarly(fixture('pine-sochi'),owner,'service-trip','09:00','x',now));s.bookings[0].draft.services.push('sea-early');assert.throws(()=>requestEarly(s,owner,'service-trip','09:00','x',now));
});
test('sv2 рассчитывает сумму в копейках; заявка не списывает деньги, дубликат даты отклоняется',()=>{
 const s=fixture();assert.equal(breakfastQuote(s.bookings[0],input,now),300000);const next=requestBreakfast(s,owner,'service-trip',input,'b1',now);assert.deepEqual(next.payment,s.payment);assert.deepEqual(next.bookings[0].quote,s.bookings[0].quote);assert.equal(next.bookings[0].serviceRequests[0].amountMinor,300000);assert.equal(requestBreakfast(next,owner,'service-trip',input,'b1',now),next);assert.throws(()=>requestBreakfast(next,owner,'service-trip',input,'b2',now));assert.equal(pendingRequests(next.bookings[0]).length,1);
});
test('Включённый завтрак нельзя заказать повторно; доставка — отдельная доступная услуга',()=>{
 const b=fixture('orbit-sea',true).bookings[0];assert.throws(()=>breakfastQuote(b,input,now));assert.equal(breakfastQuote(b,{...input,mode:'room'},now),360000);assert.equal(breakfastQuote(fixture('pine-sochi').bookings[0],input,now),300000);
});
test('Завтрак ограничен датами проживания, временем, количеством гостей и длиной комментария',()=>{
 const b=fixture().bookings[0];for(const change of [{date:'2026-11-13'},{date:'2026-11-16'},{date:'2026-02-30'},{time:'12:00'},{persons:0},{persons:3},{persons:1.5},{comment:'а'.repeat(501)}])assert.throws(()=>breakfastQuote(b,{...input,...change},now));assert.equal(breakfastQuote(b,{...input,date:'2026-11-15',persons:1},now),150000);assert.throws(()=>breakfastQuote(b,input,'2026-11-14T09:00:00Z'));
});
test('После смены дат нужна проверка заявки; отмена брони прекращает активные запросы',()=>{
 let s=requestBreakfast(fixture(),owner,'service-trip',input,'b1',now);const b=structuredClone(s.bookings[0]);b.draft.search.checkOut='2026-11-13';assert.equal(requestStatus(b,b.serviceRequests[0]),'review');s=cancelBooking(s,owner,'service-trip',now);assert.equal(pendingRequests(s.bookings[0]).length,0);assert.throws(()=>requestBreakfast(s,owner,'service-trip',input,'b2',now));
});

test('Завтраки на всё проживание: все утра, общий итог, атомарная запись и идемпотентность',()=>{
 const s=fixture(),q=breakfastStayQuote(s.bookings[0],input,now);
 assert.deepEqual(q,{dates:['2026-11-14','2026-11-15'],amountMinor:600000});
 const next=requestBreakfastStay(s,owner,'service-trip',input,'stay',now);
 assert.equal(next.bookings[0].serviceRequests.length,2);assert.equal(next.bookings[0].revision,(s.bookings[0].revision||0)+1);
 assert.deepEqual(next.payment,s.payment);assert.equal(requestBreakfastStay(next,owner,'service-trip',input,'stay',now),next);
 assert.deepEqual(decodeCommerce(JSON.stringify(next)).bookings[0].serviceRequests,next.bookings[0].serviceRequests);
 assert.throws(()=>requestBreakfastStay(s,owner,'service-trip',{...input,persons:3},'bad',now));assert.equal(s.bookings[0].serviceRequests?.length||0,0);
});
test('Всё проживание исключает уже заказанные, оплаченные, выполненные и прошедшие завтраки',()=>{
 const original=requestBreakfast(fixture(),owner,'service-trip',input,'one',now);
 for(const status of ['pending','confirmed','paid','completed']){const s=structuredClone(original);s.bookings[0].serviceRequests[0].status=status;assert.deepEqual(breakfastStayQuote(s.bookings[0],input,now),{dates:['2026-11-15'],amountMinor:300000});assert.throws(()=>breakfastQuote(s.bookings[0],input,now));}
 const cancelled=cancelServiceRequest(original,owner,'service-trip','one');assert.equal(breakfastStayQuote(cancelled.bookings[0],input,now).dates.length,2);
 assert.deepEqual(breakfastStayQuote(fixture().bookings[0],input,'2026-11-14T06:00:00Z').dates,['2026-11-15']);
 assert.throws(()=>breakfastStayQuote(original.bookings[0],input,'2026-11-15T08:00:00Z'));
});
test('Заказ на все дни сохраняет ограничения отеля, включённого питания и владельца',()=>{
 assert.throws(()=>requestBreakfastStay(fixture(),'other','service-trip',input,'all',now));
 assert.throws(()=>breakfastStayQuote(fixture('orbit-sea',true).bookings[0],input,now));
 assert.equal(breakfastStayQuote(fixture('pine-sochi').bookings[0],input,now).amountMinor,600000);
 assert.equal(breakfastStayQuote(fixture('orbit-sea',true).bookings[0],{...input,mode:'room'},now).amountMinor,720000);
});

test('Добавить ещё создаёт отдельные завтраки, включая уже оплаченный день и включённый тариф',()=>{
 const original=requestBreakfast(fixture(),owner,'service-trip',input,'first',now);
 original.bookings[0].serviceRequests[0].status='paid';
 const repeat={...input,additional:true};
 const next=requestBreakfast(original,owner,'service-trip',repeat,'extra',now);
 assert.equal(next.bookings[0].serviceRequests.length,2);
 assert.equal(next.bookings[0].serviceRequests[0].status,'paid');
 assert.equal(next.bookings[0].serviceRequests[1].status,'pending');
 assert.deepEqual(next.payment,original.payment);
 assert.equal(requestBreakfast(next,owner,'service-trip',repeat,'extra',now),next);
 assert.equal(breakfastStayQuote(next.bookings[0],repeat,now).dates.length,2);
 assert.equal(breakfastQuote(fixture('orbit-sea',true).bookings[0],repeat,now),300000);
 assert.throws(()=>breakfastQuote(next.bookings[0],repeat,'2026-11-16T10:00:00Z'));
});
