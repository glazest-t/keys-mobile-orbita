import test from 'node:test';
import assert from 'node:assert/strict';
import { calculatePayment, confirmPayment, cancelFreeBooking, readWallets } from '../prototype/domain/payment.mjs';

const state = () => ({ balances: { 'keys:demo':4860, 'hotel:mantera:demo':1240, 'hotel:maidens:demo':900 }, operations:{} });
const request = (overrides={}) => ({ hotelId:'mantera', lodgingMinor:9443000,
  services:[{id:'early-arrival',quantity:1,unitPriceMinor:250000}],
  wallets:readWallets(state(),'demo','mantera'),usePoints:true,...overrides });

test('Проживание и услуги входят в одну сумму списания; кошельки видны отдельно', () => {
  const quote=calculatePayment(request());
  assert.equal(quote.orderTotalMinor,9693000);
  assert.deepEqual(quote.applied,{hotelPoints:1240,keysPoints:4860,pointsMinor:610000});
  assert.equal(quote.cashDueMinor,9083000);
});
test('Выключенный тумблер не списывает ни один кошелёк', () => {
  const quote=calculatePayment(request({usePoints:false}));
  assert.equal(quote.applied.pointsMinor,0);
  assert.equal(quote.cashDueMinor,9693000);
});
test('Баллы покрывают 100% заказа, включая услуги; лишние остаются', () => {
  const quote=calculatePayment(request({lodgingMinor:50000,services:[{id:'food',quantity:2,unitPriceMinor:25000}]}));
  assert.equal(quote.cashDueMinor,0);
  assert.deepEqual(quote.applied,{hotelPoints:1000,keysPoints:0,pointsMinor:100000});
  assert.deepEqual(quote.remaining,{hotelPoints:240,keysPoints:4860});
});
test('Можно оплатить отдельный заказ услуги целиком баллами', () => {
  const quote=calculatePayment(request({lodgingMinor:0,services:[{id:'food',quantity:2,unitPriceMinor:149000}]}));
  assert.equal(quote.applied.pointsMinor,298000);
  assert.equal(quote.cashDueMinor,0);
});
test('Баллы другого отеля не тратятся', () => {
  const quote=calculatePayment(request({wallets:{hotelId:'maidens',hotelPoints:99999,keysPoints:200}}));
  assert.equal(quote.applied.hotelPoints,0);
  assert.equal(quote.applied.keysPoints,200);
});
test('Нулевые балансы и копейки не создают отрицательную доплату', () => {
  assert.equal(calculatePayment(request({wallets:{hotelId:'mantera',hotelPoints:0,keysPoints:0}})).cashDueMinor,9693000);
  const quote=calculatePayment(request({lodgingMinor:1099,services:[]}));
  assert.equal(quote.applied.pointsMinor,1000);
  assert.equal(quote.cashDueMinor,99);
});
test('Ошибочные суммы, количество и повторные услуги отклоняются', () => {
  for(const lodgingMinor of [-1,1.5,NaN,Number.MAX_SAFE_INTEGER+1])assert.throws(()=>calculatePayment(request({lodgingMinor})));
  assert.throws(()=>calculatePayment(request({services:[{id:'x',quantity:0,unitPriceMinor:1}]})));
  assert.throws(()=>calculatePayment(request({services:[{id:'x',quantity:1,unitPriceMinor:1},{id:'x',quantity:1,unitPriceMinor:1}]})));
  assert.throws(()=>calculatePayment(request({usePoints:'yes'})));
});
test('Неуспешная оплата не меняет баланс и не создаёт подтверждение', () => {
  const initial=state();const quote=calculatePayment(request());
  const result=confirmPayment(initial,{userId:'demo',bookingId:'one',quote,method:'online',outcome:'failure'});
  assert.strictEqual(result.state,initial);assert.equal(result.operation,null);
});
test('Повтор подтверждения не списывает баллы повторно', () => {
  const quote=calculatePayment(request());
  const first=confirmPayment(state(),{userId:'demo',bookingId:'one',quote,method:'online'});
  const second=confirmPayment(first.state,{userId:'demo',bookingId:'one',quote,method:'online'});
  assert.equal(second.duplicate,true);assert.strictEqual(second.state,first.state);
  assert.equal(first.operation.paidCashMinor,9083000);
  assert.equal(first.operation.dueAtHotelMinor,0);
  assert.equal(first.state.balances['hotel:maidens:demo'],900);
});
test('Изменившийся баланс требует нового расчёта', () => {
  const quote=calculatePayment(request());const changed=state();changed.balances['keys:demo']=1000;
  assert.throws(()=>confirmPayment(changed,{userId:'demo',bookingId:'one',quote,method:'online'}),{code:'QUOTE_CHANGED'});
});
test('Оплата при заселении создаёт задолженность, а не онлайн-платёж', () => {
  const quote=calculatePayment(request());
  const result=confirmPayment(state(),{userId:'demo',bookingId:'one',quote,method:'at_hotel'});
  assert.equal(result.operation.paidCashMinor,0);assert.equal(result.operation.dueAtHotelMinor,9083000);
});
test('Бесплатная отмена возвращает фактические деньги и каждый кошелёк один раз', () => {
  const quote=calculatePayment(request());const initial=state();
  const paid=confirmPayment(initial,{userId:'demo',bookingId:'one',quote,method:'online'});
  const cancelled=cancelFreeBooking(paid.state,{userId:'demo',bookingId:'one',freeCancellationAllowed:true});
  assert.deepEqual(cancelled.state.balances,initial.balances);
  assert.equal(cancelled.operation.refundCashMinor,9083000);
  assert.equal(cancelled.operation.returnedPointsMinor,610000);
  const retry=cancelFreeBooking(cancelled.state,{userId:'demo',bookingId:'one',freeCancellationAllowed:true});
  assert.strictEqual(retry.state,cancelled.state);assert.equal(retry.duplicate,true);
  assert.throws(()=>confirmPayment(cancelled.state,{userId:'demo',bookingId:'one',quote,method:'online'}),{code:'BOOKING_CANCELLED'});
});
test('Отмена неоплаченного в отеле заказа не возвращает неуплаченные деньги', () => {
  const quote=calculatePayment(request());
  const booked=confirmPayment(state(),{userId:'demo',bookingId:'one',quote,method:'at_hotel'});
  const cancelled=cancelFreeBooking(booked.state,{userId:'demo',bookingId:'one',freeCancellationAllowed:true});
  assert.equal(cancelled.operation.refundCashMinor,0);assert.equal(cancelled.operation.dueAtHotelMinor,0);
});
test('Платную отмену нельзя выдать за бесплатную', () => {
  const quote=calculatePayment(request());
  const booked=confirmPayment(state(),{userId:'demo',bookingId:'one',quote,method:'online'});
  assert.throws(()=>cancelFreeBooking(booked.state,{userId:'demo',bookingId:'one',freeCancellationAllowed:false}),{code:'PENALTY_REVIEW_REQUIRED'});
});
