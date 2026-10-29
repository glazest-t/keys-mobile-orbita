import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,decodeCommerce} from '../app/src/booking/model.ts';
import {bookingTimeOptions,selectedBookingTime,selectBookingTime} from '../app/src/booking/bookingTimes.ts';
import {tripFacts} from '../app/src/booking/trip.ts';
import {demoCheckIn} from '../app/src/booking/stay.ts';
const owner='+79001234567';
function fixture(){const s=startDraft(ensureAccount(initialCommerce(),owner),'orbit-sea','time-test');s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};return s;}
test('Доплаты считаются один раз за услугу, возврат к стандартному времени снимает их',()=>{
 const s=fixture(),base=quoteDraft(s,owner);s.draft.services=['sea-transfer'];
 s.draft=selectBookingTime(s.draft,'arrival','sea-early');s.draft=selectBookingTime(s.draft,'departure','sea-late');
 const q=quoteDraft(s,owner);assert.equal(q.cashDueMinor-base.cashDueMinor,800000);
 s.draft=selectBookingTime(s.draft,'arrival','sea-early');assert.equal(quoteDraft(s,owner).cashDueMinor,q.cashDueMinor);
 s.draft=selectBookingTime(s.draft,'arrival','standard');assert.equal(quoteDraft(s,owner).cashDueMinor,q.cashDueMinor-250000);
 assert.deepEqual(s.draft.services,['sea-transfer','sea-late']);
 s.draft=selectBookingTime(s.draft,'departure','standard');assert.deepEqual(s.draft.services,['sea-transfer']);
});
test('Выбор не меняет исходник, не разрешает чужую услугу или неподдерживаемое время',()=>{
 const s=fixture(),snapshot=structuredClone(s.draft);selectBookingTime(s.draft,'arrival','sea-early');assert.deepEqual(s.draft,snapshot);
 assert.throws(()=>selectBookingTime(s.draft,'arrival','sea-late'));
 assert.throws(()=>selectBookingTime(s.draft,'arrival','09:00'));
 const other={...s.draft,hotelId:'pine-sochi',services:[]};assert.equal(bookingTimeOptions(other.hotelId,'arrival').length,1);
 assert.throws(()=>selectBookingTime(other,'arrival','sea-early'));
 s.draft.services=['sea-early','sea-early'];assert.throws(()=>quoteDraft(s,owner),/один вариант/);
});
test('Оплата, сохранение поездки и период ключа используют выбранное время',()=>{
 let s=fixture();s.draft=selectBookingTime(selectBookingTime(s.draft,'arrival','sea-early'),'departure','sea-late');
 const q=quoteDraft(s,owner);s=commitBooking(s,owner,q,'success','2026-10-26T12:00:00Z');
 s=decodeCommerce(JSON.stringify(s));const b=s.bookings[0];assert.equal(b.operation.paidCashMinor,q.cashDueMinor);
 assert.equal(tripFacts(b).checkInTime,'10:00');assert.equal(tripFacts(b).checkOutTime,'15:00');
 s=demoCheckIn(s,owner,b.id,'check-in',Date.parse('2026-10-26T12:00:00Z'));
 assert.ok(s.bookings[0].stay.accessFrom.includes('T10:00:00'));assert.ok(s.bookings[0].stay.accessUntil.includes('T15:00:00'));
});
test('Доплаты допускают баллы, но выбор времени не списывает кошельки до оплаты',()=>{
 const s=fixture(),balances=structuredClone(s.payment.balances);s.draft.usePoints=true;s.payment.balances['keys:'+owner]=200000;
 s.draft=selectBookingTime(selectBookingTime(s.draft,'arrival','sea-early'),'departure','sea-late');
 const before=structuredClone(s.payment);assert.equal(quoteDraft(s,owner).cashDueMinor,0);assert.deepEqual(s.payment,before);
 assert.equal(selectedBookingTime(s.draft,'arrival').amountMinor,250000);assert.ok(balances['keys:'+owner]>0);
});
