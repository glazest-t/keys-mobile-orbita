import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,decodeCommerce} from '../app/src/booking/model.ts';
import {activateTripScenario,restoreTripData} from '../app/src/booking/demoTripScenarios.ts';
import {historyTrips,historyBooking,removeTrip,restoreTripByNumber,tripStatus} from '../app/src/profile/history.ts';
import {addTripByNumber} from '../app/src/profile/historyDemo.ts';
import {ownTrips} from '../app/src/booking/trip.ts';
const owner='+79001234567',other='+79007654321';
const fixture=()=>activateTripScenario(initialCommerce(),owner,'history','history');
test('История: три статуса, поиск, вкладки и сохранение исходного набора',()=>{
 const original=ensureAccount(initialCommerce(),owner),s=activateTripScenario(original,owner,'history','history');
 assert.deepEqual(new Set(historyTrips(s,owner).map(tripStatus)),new Set(['Предстоящая','Завершена','Отменена']));
 for(const filter of ['Предстоящие','Завершённые','Отменённые'])assert.equal(historyTrips(s,owner,'',filter).length,1);
 assert.equal(historyTrips(s,owner,'Петербург')[0].number,'KEYS-102');assert.equal(historyTrips(s,other).length,0);
 assert.deepEqual(restoreTripData(decodeCommerce(JSON.stringify(s))),original);
});
test('Удаление скрывает поездку, не отменяет её и не меняет оплату; восстановление после reload',()=>{
 const s=fixture(),b=s.bookings[0],finance=structuredClone(s.payment);const hidden=removeTrip(s,owner,b.id);
 assert.equal(historyTrips(hidden,owner).length,2);assert.equal(ownTrips(hidden,owner).some(v=>v.id===b.id),false);assert.equal(historyBooking(hidden,owner,b.id),undefined);
 assert.equal(hidden.bookings[0].operation.status,'confirmed');assert.deepEqual(hidden.payment,finance);assert.deepEqual(hidden.bookings,s.bookings);
 const restored=restoreTripByNumber(decodeCommerce(JSON.stringify(hidden)),owner,' keys-101 ');assert.equal(historyTrips(restored,owner).length,3);assert.deepEqual(restored.payment,finance);
 assert.throws(()=>removeTrip(s,other,b.id),/не найдена/);assert.throws(()=>restoreTripByNumber(hidden,other,b.number),/не найдена/);assert.throws(()=>restoreTripByNumber(s,owner,b.number),/уже есть/);
});
test('Демо-импорт по номеру: неизвестный, дубликат, возврат удалённого, финансы и другие владельцы',()=>{
 const s=fixture(),balances=structuredClone(s.payment.balances);assert.throws(()=>addTripByNumber(s,owner,'bad'),/не найдена/);assert.throws(()=>addTripByNumber(s,owner,''),/Введите/);
 const next=addTripByNumber(s,owner,'keys-2026');assert.equal(next.bookings.length,4);assert.deepEqual(next.payment.balances,balances);
 assert.throws(()=>addTripByNumber(next,owner,'KEYS-2026'),/уже есть/);
 const b=next.bookings.at(-1),restored=addTripByNumber(removeTrip(next,owner,b.id),owner,'KEYS-2026');assert.equal(restored.bookings.length,4);assert.equal(historyTrips(restored,owner).length,4);
 const both=addTripByNumber(ensureAccount(next,other),other,'KEYS-2026');assert.equal(historyTrips(both,other).length,1);assert.notEqual(both.bookings.at(-1).id,b.id);
});
test('Удаление общей брони действует только на список текущего участника',()=>{
 const s=fixture(),b=s.bookings[0];s.bookingManagers={[b.id]:[other]};const next=removeTrip(s,other,b.id);
 assert.equal(historyTrips(next,other).length,0);assert.equal(historyTrips(next,owner).length,3);assert.deepEqual(next.bookingManagers,s.bookingManagers);
});
