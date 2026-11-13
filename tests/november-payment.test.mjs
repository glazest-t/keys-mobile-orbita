import {beforeEach as beforeFixtureTest} from 'node:test';
// November fixture dates must not expire as the real calendar advances.
beforeFixtureTest(t=>t.mock.timers.enable({apis:['Date'],now:new Date('2026-11-01T12:00:00Z')}));
import test from 'node:test';
import assert from 'node:assert/strict';
import {calculatePayment,confirmPayment,cancelFreeBooking,readWallets} from '../prototype/domain/payment.mjs';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking} from '../app/src/booking/model.ts';
const state=()=>({balances:{'keys:demo':5000,'hotel:sea:demo':2000},operations:{}});
const quote=(extra={})=>calculatePayment({hotelId:'sea',lodgingMinor:1000000,wallets:readWallets(state(),'demo','sea'),usePoints:true,...extra});
test('Partial redemption allocates hotel first and confirms only selected points',()=>{
 const q=quote({pointsLimit:2500});assert.deepEqual(q.applied,{hotelPoints:2000,keysPoints:500,pointsMinor:250000});
 const result=confirmPayment(state(),{userId:'demo',bookingId:'one',quote:q,method:'online'});
 assert.equal(result.operation.paidCashMinor,750000);assert.equal(result.state.balances['keys:demo'],4500);
 const cancelled=cancelFreeBooking(result.state,{userId:'demo',bookingId:'one',freeCancellationAllowed:true});
 assert.deepEqual(cancelled.state.balances,state().balances);
});
test('Partial redemption respects zero, balance, order amount and Friendly Rate',()=>{
 assert.equal(quote({pointsLimit:0}).applied.pointsMinor,0);
 assert.equal(quote({pointsLimit:9000}).applied.pointsMinor,700000);
 assert.equal(quote({pointsLimit:9000,lodgingMinor:30000}).applied.pointsMinor,30000);
 const q=quote({pointsLimit:2500,hotelBenefitsAllowed:false});assert.equal(q.applied.hotelPoints,0);assert.equal(q.applied.keysPoints,2500);
 for(const pointsLimit of [-1,1.2,NaN,Infinity])assert.throws(()=>quote({pointsLimit}));
});
test('November quote and booking persist chosen points and citizenship; Full uses original maximum',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'location');
 try{
  globalThis.location={href:'http://localhost/?variant=november'};
  const owner='+79001234567';const s=startDraft(ensureAccount(initialCommerce(),owner),'orbit-sea','november-booking');
  s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test',citizenship:'Россия'};
  s.draft.usePoints=true;s.draft.pointsToUse=500;
  const q=quoteDraft(s,owner);assert.equal(q.applied.pointsMinor,50000);
  const booked=commitBooking(s,owner,q,'success','2026-10-21T12:00:00Z');
  assert.equal(booked.bookings[0].draft.contact.citizenship,'Россия');assert.equal(booked.bookings[0].operation.pointsMinor,50000);
  globalThis.location.href='http://localhost/?variant=full';assert.ok(quoteDraft(s,owner).applied.pointsMinor>50000);
 }finally{if(descriptor)Object.defineProperty(globalThis,'location',descriptor);else delete globalThis.location;}
});

test('November ignores hidden search filters without destroying Full selection',async()=>{
 const {discoveryOffers,filterCount}=await import('../app/src/booking/offers.ts');
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'location');
 try{
  const s={...initialCommerce(),search:{city:'Казань',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]},searchDistrict:{city:'Казань',name:'несуществующий район'},searchFilters:['Сеть отеля: Несуществующая сеть']};
  globalThis.location={href:'http://localhost/?variant=full'};assert.equal(discoveryOffers(s,null).length,0);assert.equal(filterCount(s),2);
  globalThis.location.href='http://localhost/?variant=november';assert.ok(discoveryOffers(s,null).length>0);assert.equal(filterCount(s),0);assert.equal(s.searchFilters.length,1);assert.ok(s.searchDistrict);
 }finally{if(descriptor)Object.defineProperty(globalThis,'location',descriptor);else delete globalThis.location;}
});

test('Voucher code is validated before adding a demo booking',async()=>{
 const {addTripByNumber}=await import('../app/src/profile/historyDemo.ts');const s=ensureAccount(initialCommerce(),'+79001234567');
 assert.throws(()=>addTripByNumber(s,'+79001234567','KEYS-2026','wrong'),/ваучера/);
 assert.throws(()=>addTripByNumber(s,'+79001234567','KEYS-2026',''),/ваучера/);
 const added=addTripByNumber(s,'+79001234567','KEYS-2026','1234');assert.equal(added.bookings.length,1);assert.equal(s.bookings.length,0);
 assert.equal(addTripByNumber(s,'+79001234567','KEYS-2026').bookings.length,1);
});

test('Clearing partial amount returns to maximum redemption',()=>{
 const descriptor=Object.getOwnPropertyDescriptor(globalThis,'location');
 try{
  globalThis.location={href:'http://localhost/?variant=november'};
  const owner='+79001234567',s=startDraft(ensureAccount(initialCommerce(),owner),'orbit-sea','partial-toggle');s.draft.usePoints=true;
  const maximum=quoteDraft(s,owner).applied.pointsMinor;
  s.draft.pointsToUse=500;assert.equal(quoteDraft(s,owner).applied.pointsMinor,50000);
  s.draft.pointsToUse=undefined;assert.equal(quoteDraft(s,owner).applied.pointsMinor,maximum);
  s.draft.usePoints=false;assert.equal(quoteDraft(s,owner).applied.pointsMinor,0);
 }finally{if(descriptor)Object.defineProperty(globalThis,'location',descriptor);else delete globalThis.location;}
});
