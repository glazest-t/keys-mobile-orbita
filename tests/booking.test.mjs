import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateBookingQuote,getKeyAvailability} from '../prototype/domain/booking.mjs';
import {confirmPayment} from '../prototype/domain/payment.mjs';

const request = (overrides={}) => ({hotelId:'mantera',nights:7,
  rate:{id:'flexible',hotelId:'mantera',kind:'standard',nightlyMinor:1420000},
  hotelierStatus:'none',hotelDiscountBasisPoints:500,
  services:[{id:'early-arrival',quantity:1,unitPriceMinor:250000}],
  wallets:{hotelId:'mantera',hotelPoints:1240,keysPoints:4860},usePoints:true,...overrides});

test('Обычный тариф применяет скидку отеля и разрешённые кошельки',()=>{
  const q=calculateBookingQuote(request());
  assert.equal(q.baseLodgingMinor,9940000);assert.equal(q.hotelDiscountMinor,497000);
  assert.equal(q.cashDueMinor,9083000);
});
test('Friendly Rate — отдельная цена без программы отеля, баллы Ключей сохраняются',()=>{
  const q=calculateBookingQuote(request({rate:{id:'friendly',hotelId:'mantera',kind:'friendly_rate',nightlyMinor:923000},hotelierStatus:'approved'}));
  assert.equal(q.lodgingMinor,6461000);assert.equal(q.hotelDiscountMinor,0);
  assert.equal(q.applied.hotelPoints,0);assert.equal(q.applied.keysPoints,4860);
  assert.equal(q.cashDueMinor,6225000);assert.equal(q.remaining.hotelPoints,1240);
  const state={balances:{'keys:demo':4860,'hotel:mantera:demo':1240},operations:{}};
  const result=confirmPayment(state,{userId:'demo',bookingId:'fr',quote:q,method:'online'});
  assert.equal(result.state.balances['hotel:mantera:demo'],1240);
});
test('Статус отельера открывает Friendly Rate, но не принуждает выбирать его',()=>{
  assert.equal(calculateBookingQuote(request({hotelierStatus:'approved'})).rateId,'flexible');
  for(const status of ['none','pending','rejected']) {
    assert.throws(()=>calculateBookingQuote(request({hotelierStatus:status,
      rate:{id:'fr',hotelId:'mantera',kind:'friendly_rate',nightlyMinor:923000}})),{code:'FRIENDLY_RATE_UNAVAILABLE'});
  }
});
test('Нельзя использовать тариф другого отеля, отрицательные ночи или скидку больше цены',()=>{
  assert.throws(()=>calculateBookingQuote(request({nights:0})),{code:'INVALID_NIGHTS'});
  assert.throws(()=>calculateBookingQuote(request({hotelDiscountBasisPoints:10001})),{code:'INVALID_DISCOUNT'});
  assert.throws(()=>calculateBookingQuote(request({rate:{hotelId:'maidens',kind:'standard',nightlyMinor:100}})),{code:'WRONG_RATE_HOTEL'});
});

const key = (overrides={}) => ({bookingStatus:'confirmed',stayStatus:'in_house',roomNumber:'412',
  checkedInAt:'2026-11-12T15:00:00+03:00',keyValidUntil:'2026-11-19T12:00:00+03:00',
  now:'2026-11-13T10:00:00+03:00',...overrides});
test('До заселения ключа нет, даже если бронь подтверждена и оплачена',()=>{
  assert.equal(getKeyAvailability(key({stayStatus:'upcoming'})).visible,false);
  assert.equal(getKeyAvailability(key({checkedInAt:'2026-11-14T15:00:00+03:00'})).visible,false);
});
test('После заселения ключ доступен без онлайн-регистрации',()=>{
  assert.deepEqual(getKeyAvailability(key()),{visible:true,enabled:true,reason:'ready'});
  assert.equal(getKeyAvailability(key({stayStatus:'checkout_due'})).enabled,true);
});
test('Выезд, отмена, отсутствие номера и истечение доступа не позволяют открыть дверь',()=>{
  assert.equal(getKeyAvailability(key({stayStatus:'checked_out'})).visible,false);
  assert.equal(getKeyAvailability(key({bookingStatus:'cancelled'})).visible,false);
  assert.equal(getKeyAvailability(key({roomNumber:null})).enabled,false);
  assert.equal(getKeyAvailability(key({now:'2026-11-19T12:00:00+03:00'})).enabled,false);
  assert.equal(getKeyAvailability(key({keyValidUntil:'invalid'})).enabled,false);
});
