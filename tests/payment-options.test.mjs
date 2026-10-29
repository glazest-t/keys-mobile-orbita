import test from 'node:test';
import assert from 'node:assert/strict';
import {paymentSelection,visibleWallets,extraPaymentOptions} from '../app/src/booking/paymentOptions.ts';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking} from '../app/src/booking/model.ts';

test('Нулевые кошельки скрыты независимо друг от друга',()=>{
 assert.deepEqual(visibleWallets({keysPoints:0,hotelPoints:0},false),[]);
 assert.deepEqual(visibleWallets({keysPoints:0,hotelPoints:1240},false).map(w=>w.id),['hotel']);
 assert.deepEqual(visibleWallets({keysPoints:4860,hotelPoints:0},false).map(w=>w.id),['keys']);
});
test('На FR положительный баланс отеля не становится доступным для списания',()=>{
 const rows=visibleWallets({keysPoints:0,hotelPoints:1240},true);
 assert.equal(rows.length,1);assert.equal(rows.some(w=>w.available),false);
});
test('Дополнительные способы сохраняются в брони и используют онлайн-расчёт',()=>{
 const owner='+79001234567';
 for(const option of extraPaymentOptions){
  let s=ensureAccount(initialCommerce(),owner);
  s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15'};
  s=startDraft(s,'orbit-sea','pay-'+option.id);
  s.draft={...s.draft,...paymentSelection(option.id),contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}};
  const q=quoteDraft(s,owner),paid=commitBooking(s,owner,q,'success','2026-10-22T12:00:00Z');
  assert.equal(paid.bookings[0].draft.paymentOption,option.id);
  assert.equal(paid.bookings[0].operation.paidCashMinor,q.cashDueMinor);
  assert.equal(paid.bookings[0].operation.dueAtHotelMinor,0);
 }
 assert.equal(paymentSelection('at_hotel').method,'at_hotel');
});

test('Новая бронь использует онлайн-оплату по СБП по умолчанию',()=>{
 const owner='+79001234567';const s=ensureAccount(initialCommerce(),owner);
 s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15'};
 const draft=startDraft(s,'orbit-sea','default-sbp').draft;
 assert.equal(draft.method,'online');assert.equal(draft.paymentOption,'sbp');
 assert.equal(paymentSelection('card').paymentOption,'card');
});
