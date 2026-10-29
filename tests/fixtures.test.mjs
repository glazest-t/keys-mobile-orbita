import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { calculateBookingQuote, getKeyAvailability } from '../prototype/domain/booking.mjs';
import { readWallets, confirmPayment, cancelFreeBooking } from '../prototype/domain/payment.mjs';
const data = JSON.parse(readFileSync(new URL('../spec/demo-data.json', import.meta.url)));

for (const example of data.quoteCases) {
  test(`Связанные демоданные: расчёт → оплата → бесплатная отмена, ${example.id}`, () => {
    const rate = data.rates.find(r => r.id === example.rateId);
    const hotel = data.hotels.find(h => h.id === rate.hotelId);
    const quote = calculateBookingQuote({ hotelId: hotel.id, nights: example.nights, rate,
      hotelierStatus: data.user.hotelierStatus, hotelDiscountBasisPoints: hotel.hotelDiscountBasisPoints,
      services: example.serviceIds.map(id => ({ ...data.services.find(s => s.id === id), quantity: 1 })),
      wallets: readWallets(data.paymentState, data.user.id, hotel.id), usePoints: example.usePoints });
    assert.equal(quote.orderTotalMinor, example.expected.orderTotalMinor);
    assert.equal(quote.cashDueMinor, example.expected.cashDueMinor);
    assert.equal(quote.applied.hotelPoints, example.expected.hotelPoints);
    assert.equal(quote.applied.keysPoints, example.expected.keysPoints);
    const paid = confirmPayment(data.paymentState, { userId: data.user.id, bookingId: example.id, quote, method: 'online' });
    const cancelled = cancelFreeBooking(paid.state, { userId: data.user.id, bookingId: example.id, freeCancellationAllowed: true });
    assert.deepEqual(cancelled.state.balances, data.paymentState.balances);
    assert.equal(cancelled.operation.refundCashMinor, example.expected.cashDueMinor);
  });
}

test('Демоданные связаны с существующими отелями, номерами и тарифами', () => {
  for (const collection of ['hotels','rooms','rates','services']) {
    assert.equal(new Set(data[collection].map(x => x.id)).size, data[collection].length);
  }
  for (const room of data.rooms) assert.ok(data.hotels.some(h => h.id === room.hotelId));
  for (const rate of data.rates) assert.ok(data.rooms.some(r => r.id === rate.roomId && r.hotelId === rate.hotelId));
  for (const service of data.services) assert.ok(data.hotels.some(h => h.id === service.hotelId));
  for (const available of data.availability) assert.ok(data.rooms.some(r => r.id === available.roomId));
  const nights = (Date.parse(data.search.checkOut) - Date.parse(data.search.checkIn)) / 86400000;
  assert.equal(nights, data.quoteCases[0].nights);
});

test('Демонстрация поездки скрывает ключ до заселения и после выезда', () => {
  for (const stay of data.stayCases) assert.equal(getKeyAvailability(stay).visible, stay.expectedVisible, stay.id);
});
