import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,decodeCommerce} from '../app/src/booking/model.ts';
import {activateTripScenario,restoreTripData,activeTripScenario,tripScenarios} from '../app/src/booking/demoTripScenarios.ts';
import {keyAccess} from '../app/src/booking/stay.ts';
import {checkoutDay,stayBill} from '../app/src/booking/stayBill.ts';
const owner='+79005550001',now=Date.parse('2026-10-27T12:00:00Z');
test('Все пять сценариев независимы и дают согласованные состояния брони, ключа и счёта',()=>{
 for(const {id} of tripScenarios){
  const s=activateTripScenario(initialCommerce(),owner,id,'demo-'+id,now),b=s.bookings[0];
  assert.equal(activeTripScenario(s,owner,now),id);
  if(id==='empty'){assert.equal(s.bookings.length,0);assert.equal(s.selectedBooking,null);continue;}
  assert.equal(b.operation.status,'confirmed');assert.equal(b.operation.dueAtHotelMinor,0);
  assert.equal(keyAccess(b,now).visible,['staying','departure'].includes(id));
  assert.equal(keyAccess(b,now).available,['staying','departure'].includes(id));
  if(id==='departure')assert.equal(checkoutDay(b,now),true);
  if(id==='completed'){assert.equal(b.stay.status,'checked_out');assert.equal(stayBill(b).due,0);assert.equal(b.review,undefined);}
 }
});
test('Переключение и reload не теряют исходные данные и не вкладывают копии друг в друга',()=>{
 let original=ensureAccount(initialCommerce(),owner);original={...original,savedHotels:{[owner]:['pine-sochi']},recentSearches:[original.search]};
 const copy=structuredClone(original);
 let s=original;
 for(const {id} of [...tripScenarios].reverse())s=activateTripScenario(decodeCommerce(JSON.stringify(s)),owner,id,'demo-'+id,now);
 assert.deepEqual(s.demoTripSession.original,copy);assert.equal(s.demoTripSession.original.demoTripSession,undefined);
 assert.deepEqual(restoreTripData(decodeCommerce(JSON.stringify(s))),copy);assert.deepEqual(original,copy);
 assert.equal(restoreTripData(original),original);
});
test('Действия в примере и другой профиль не меняют резервную копию',()=>{
 const original=initialCommerce(),s=activateTripScenario(original,owner,'staying','one',now);
 s.bookings[0].stay.openings.push({id:'opened',at:new Date(now).toISOString()});
 assert.equal(activeTripScenario(s,'another',now),null);
 const next=activateTripScenario(s,'+79005550002','completed','two',now);
 assert.equal(next.bookings[0].owner,'+79005550002');assert.deepEqual(restoreTripData(next),original);
});
