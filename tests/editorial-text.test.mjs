import test from 'node:test';
import assert from 'node:assert/strict';
import {getPrototypeText} from '../app/src/prototypeText.ts';
import {setEditorialTextResolver} from '../prototype/domain/editorialText.mjs';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancelBooking} from '../app/src/booking/model.ts';
import {tripDocument} from '../app/src/booking/documents.ts';
import {restoreTripByNumber,removeTrip,historyTrips} from '../app/src/profile/history.ts';
import {bookingNumber} from '../app/src/booking/bookingNumber.ts';

const owner='+79001234567';
function fixture(){
 let state=ensureAccount(initialCommerce(),owner);
 state.search={...state.search,checkIn:'2026-11-13',checkOut:'2026-11-15'};
 state=startDraft(state,'orbit-sea','editorial-test');
 Object.assign(state.draft,{method:'online',usePoints:true,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}});
 return commitBooking(state,owner,quoteDraft(state,owner),'success','2026-10-22T12:00:00Z');
}
test('Copy edition changes document labels, preserving booking, amounts and cancellation',()=>{
 const previous=Object.getOwnPropertyDescriptor(globalThis,'location');
 try{
  // Use the real URL-backed resolver registered by prototypeText.
  setEditorialTextResolver(getPrototypeText);
  globalThis.location={href:'https://example.test/?text=standard'};
  const original=fixture(),before=structuredClone(original),doc=tripDocument(original.bookings[0],'confirmation');
  const cancelled=cancelBooking(original,owner,original.bookings[0].id,'2026-10-22T12:00:00Z');
  globalThis.location.href='https://example.test/?text=edited';
  const edited=fixture(),editedDoc=tripDocument(edited.bookings[0],'confirmation');
  assert.deepEqual(edited,original);
  assert.deepEqual(cancelBooking(edited,owner,edited.bookings[0].id,'2026-10-22T12:00:00Z'),cancelled);
  const rows=d=>d.sections.flatMap(s=>s.rows);
  assert.ok(rows(doc).some(([key])=>key==='Списано баллов «Ключей»'));
  assert.ok(rows(editedDoc).some(([key])=>key==='Списано баллов Ключей'));
  assert.ok(rows(editedDoc).some(([key])=>key==='Списано баллов программы отеля'));
  const unchanged=rows(doc).filter(([key])=>!['Заезд','Выезд','Списано баллов «Ключей»','Списано баллов отеля'].includes(key));
  for(const row of unchanged)assert.ok(rows(editedDoc).some(v=>JSON.stringify(v)===JSON.stringify(row)));
  assert.deepEqual(original,before);
 }finally{if(previous)Object.defineProperty(globalThis,'location',previous);else delete globalThis.location;}
});
test('History restore validation is edited, but restoring and filtering keep the same data',()=>{
 try{
  setEditorialTextResolver(()=> 'edited');
  const state=fixture(),b=state.bookings[0],hidden=removeTrip(state,owner,b.id);
  assert.throws(()=>restoreTripByNumber(hidden,owner,''),{message:'Укажите номер брони'});
  assert.throws(()=>restoreTripByNumber(hidden,owner,'UNKNOWN'),{message:'Бронь не найдена. Проверьте, что ввели её правильно'});
  const restored=restoreTripByNumber(hidden,owner,bookingNumber(b));
  assert.deepEqual(restored.bookings,state.bookings);
  assert.deepEqual(restored.payment,state.payment);
  assert.equal(historyTrips(restored,owner,'','Предстоящие').length,1);
  setEditorialTextResolver(()=> 'standard');
  assert.throws(()=>restoreTripByNumber(hidden,owner,''),{message:'Введите номер бронирования'});
 }finally{setEditorialTextResolver(()=> 'standard');}
});
