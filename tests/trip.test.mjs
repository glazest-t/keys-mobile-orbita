import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,decodeCommerce} from '../app/src/booking/model.ts';
import {ownTrips,selectedTrip,tripFacts,sendTripMessage} from '../app/src/booking/trip.ts';
const owner='+79001234567';
function fixture(){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15'};s=startDraft(s,'orbit-sea','trip-test');s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};return commitBooking(s,owner,quoteDraft(s,owner),'success','2026-10-22T12:00:00Z');}
test('Поездки изолированы по владельцу, выбранная отменённая бронь не подменяет активную',()=>{
 const s=fixture(),b=s.bookings[0];s.bookings.push({...b,id:'foreign',owner:'another'}, {...structuredClone(b),id:'cancelled',operation:{...b.operation,status:'cancelled'}});s.selectedBooking='foreign';
 assert.equal(ownTrips(s,owner).length,2);assert.equal(selectedTrip(s,owner).id,b.id);s.selectedBooking='cancelled';assert.equal(selectedTrip(s,owner).id,b.id);assert.equal(selectedTrip(s,'nobody'),undefined);
});
test('Время заезда, завтраки и остаток оплаты берутся из текущей брони',()=>{
 const b=fixture().bookings[0];assert.equal(tripFacts(b).checkInTime,'15:00');b.draft.services=['sea-early','sea-late','sea-breakfast'];b.operation.dueAtHotelMinor=123400;const f=tripFacts(b);assert.equal(f.checkInTime,'10:00');assert.equal(f.checkOutTime,'15:00');assert.equal(f.breakfastAdded,true);assert.equal(f.due,123400);
});
test('Локальная переписка сохраняется отдельно от оплаты и черновика, повтор не дублирует сообщение',()=>{
 const s=fixture(),before=structuredClone(s),next=sendTripMessage(s,owner,'trip-test','  Где вход?  ','m1');assert.deepEqual(s,before);assert.deepEqual(next.payment,s.payment);assert.deepEqual(next.bookings,s.bookings);assert.deepEqual(next.draft,s.draft);assert.equal(next.tripMessages['trip-test'][0].text,'Где вход?');assert.equal(sendTripMessage(next,owner,'trip-test','повтор','m1'),next);assert.deepEqual(decodeCommerce(JSON.stringify(next)).tripMessages,next.tripMessages);
});
test('Пустое, слишком длинное и чужое сообщение не сохраняется',()=>{
 const s=fixture();assert.throws(()=>sendTripMessage(s,'another','trip-test','Привет','m1'));assert.throws(()=>sendTripMessage(s,owner,'trip-test','  ','m1'));assert.throws(()=>sendTripMessage(s,owner,'trip-test','а'.repeat(1001),'m1'));assert.equal(s.tripMessages,undefined);
});
