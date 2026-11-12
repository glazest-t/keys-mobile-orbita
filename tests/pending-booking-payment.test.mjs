import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,decodeCommerce,cancelBooking} from '../app/src/booking/model.ts';
import {beginBookingPayment,completeBookingPayment,pendingAmount} from '../app/src/booking/pendingPayment.ts';
import {selectedTrip} from '../app/src/booking/trip.ts';
const owner='+79995550055',now='2026-10-27T12:00:00Z';
function draft(){let s=ensureAccount(initialCommerce(),owner);s={...s,search:{...s.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]}};s=startDraft(s,'orbit-sea','pending-test',owner);return {...s,draft:{...s.draft,method:'online',paymentOption:'card',contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}}};}
test('Leaving acquiring keeps one unpaid booking across reload without debiting points',()=>{const s=draft(),q=quoteDraft(s,owner),p=beginBookingPayment(s,owner,q,now);assert.deepEqual(p.payment,s.payment);assert.equal(p.bookings[0].operation.status,'awaiting_payment');assert.equal(p.bookings[0].operation.paidCashMinor,0);assert.equal(p.bookings[0].operation.pointsMinor,0);assert.equal(selectedTrip(decodeCommerce(JSON.stringify(p)),owner).id,'pending-test');assert.equal(beginBookingPayment(p,owner,q,now).bookings.length,1);assert.equal(pendingAmount(p.bookings[0]),q.paymentSchedule.nowMinor);});
test('Successful retry confirms same booking and debits once',()=>{const s=draft(),p=beginBookingPayment(s,owner,quoteDraft(s,owner),now),paid=completeBookingPayment(p,owner,'pending-test','success',now);assert.equal(paid.bookings.length,1);assert.equal(paid.bookings[0].operation.status,'confirmed');assert.equal(paid.bookings[0].operation.paidCashMinor,pendingAmount(p.bookings[0]));assert.equal(completeBookingPayment(paid,owner,'pending-test','success',now),paid);});
test('Failure, changed quote and foreign owner do not confirm or debit pending booking',()=>{const s=draft(),p=beginBookingPayment(s,owner,quoteDraft(s,owner),now),copy=structuredClone(p);assert.throws(()=>completeBookingPayment(p,owner,'pending-test','failure',now));assert.throws(()=>completeBookingPayment(p,'other','pending-test','success',now));const changed={...p,payment:{...p.payment,balances:{...p.payment.balances,['keys:'+owner]:0}}};if(p.bookings[0].quote.applied.keysPoints)assert.throws(()=>completeBookingPayment(changed,owner,'pending-test','success',now));assert.deepEqual(p,copy);});
test('Payment preserves another draft and supports first-night prepayment',()=>{let s=draft();s={...s,draft:{...s.draft,cardPaymentPlan:'night'}};const p=beginBookingPayment(s,owner,quoteDraft(s,owner),now),other={...p,draft:{...p.draft,id:'another-draft'}};const paid=completeBookingPayment(other,owner,'pending-test','success',now);assert.equal(paid.draft.id,'another-draft');assert.ok(paid.bookings[0].operation.dueAtHotelMinor>0);});

test('Unrelated wallet accrual does not invalidate an unchanged cash payment',()=>{const s=draft(),p=beginBookingPayment(s,owner,quoteDraft(s,owner),now);const changed={...p,payment:{...p.payment,balances:{...p.payment.balances,['keys:'+owner]:9999}}};assert.equal(completeBookingPayment(changed,owner,'pending-test','success',now).bookings[0].operation.status,'confirmed');});
test('Changed points applied cannot silently change the payment amount',()=>{let s=draft();s={...s,draft:{...s.draft,usePoints:true}};const p=beginBookingPayment(s,owner,quoteDraft(s,owner),now);assert.ok(p.bookings[0].quote.applied.pointsMinor>0);const changed={...p,payment:{...p.payment,balances:{...p.payment.balances,['keys:'+owner]:0}}};assert.throws(()=>completeBookingPayment(changed,owner,'pending-test','success',now));});

test('Pending booking cancellation uses hotel policy and prevents a later payment',()=>{
 const s=draft(),p=beginBookingPayment(s,owner,quoteDraft(s,owner),now);
 const cancelled=cancelBooking(p,owner,'pending-test',now);
 assert.equal(cancelled.bookings[0].operation.status,'cancelled');
 assert.equal(cancelled.bookings[0].operation.refundCashMinor,0);
 assert.equal(cancelled.bookings[0].operation.penaltyDueMinor,0);
 assert.deepEqual(cancelled.payment.balances,p.payment.balances);
 assert.equal(cancelled.draft,null);
 assert.equal(cancelBooking(cancelled,owner,'pending-test',now),cancelled);
 assert.throws(()=>completeBookingPayment(cancelled,owner,'pending-test','success',now));
 const late=cancelBooking(p,owner,'pending-test','2026-11-12T12:00:00Z');
 assert.ok(late.bookings[0].operation.penaltyDueMinor>0);
 assert.deepEqual(late.payment.balances,p.payment.balances);
});
