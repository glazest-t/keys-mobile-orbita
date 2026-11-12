import test from 'node:test';
import assert from 'node:assert/strict';
import '../app/src/prototypeText.ts';
import {tripEditorialText} from '../prototype/domain/tripEditorialText.mjs';
import {catalogService} from '../app/src/booking/hotelServiceCatalog.ts';
import {nearbyPlaces} from '../app/src/booking/nearby.ts';
import {chatAnswer} from '../app/src/booking/chatAssistant.ts';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking} from '../app/src/booking/model.ts';
import {sendStayReview} from '../app/src/booking/stayReview.ts';

function context(query,route,run){
 const previous=Object.getOwnPropertyDescriptor(globalThis,'location');
 try{globalThis.location={href:`https://example.test/?${query}#${route}`};return run();}
 finally{if(previous)Object.defineProperty(globalThis,'location',previous);else delete globalThis.location;}
}
const edited=run=>context('variant=november&text=edited','trips',run);
test('Trip workbook is isolated from standard, full and unrelated routes',()=>{
 for(const [query,route]of [['variant=november&text=standard','trips'],['variant=full&text=edited','trips'],['variant=november&text=edited','profile-history'],['variant=november&text=edited','find'],['variant=november&text=edited','phone']]){
  context(query,route,()=>assert.equal(tripEditorialText('qa','original','edited'),'original'));
 }
 for(const route of ['trips','booking-record','trip-services','trip-review','trip-breakfast','trip-chat'])context('variant=november&text=edited',route,()=>assert.equal(tripEditorialText('qa','original','edited'),'edited'));
});
test('Catalogue descriptions resolve after switching copy edition without reimporting',()=>{
 const item=catalogService('breakfast-buffet');
 context('variant=november&text=standard','trips',()=>assert.equal(item.description,'Завтрак в ресторане отеля'));
 edited(()=>assert.equal(item.description,'Завтрак в ресторане'));
 context('variant=full&text=edited','trips',()=>assert.equal(item.description,'Завтрак в ресторане отеля'));
});
test('Nearby editing is limited to named Mantera places and preserves place data',()=>{
 const original=context('variant=november&text=standard','trip-nearby',()=>structuredClone(nearbyPlaces('orbit-sea')));
 const next=context('variant=november&text=edited','trip-nearby',()=>structuredClone(nearbyPlaces('orbit-sea')));
 assert.equal(next.length,8);
 for(let i=0;i<next.length;i++){
  assert.notEqual(next[i].about,original[i].about);
  assert.deepEqual({...next[i],about:original[i].about},original[i]);
 }
 assert.deepEqual(edited(()=>nearbyPlaces('orbit-city')),context('variant=november&text=standard','trips',()=>nearbyPlaces('orbit-city')));
});
function fixture(){
 const owner='+79001234567';let s=ensureAccount(initialCommerce(),owner);
 s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15'};
 s=startDraft(s,'orbit-sea','trip-copy-test');
 Object.assign(s.draft,{method:'online',usePoints:false,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}});
 return commitBooking(s,owner,quoteDraft(s,owner),'success','2026-10-22T12:00:00Z');
}
test('Parking reply preserves action and facts; copy does not alter booking data',()=>{
 const s=fixture(),b=s.bookings[0],before=structuredClone(s);
 const original=context('variant=november&text=standard','trip-chat',()=>chatAnswer(b,'Парковка'));
 const reply=edited(()=>chatAnswer(b,'Парковка'));
 assert.equal(reply.text,'Въезд с ул. Голубая. О правилах и стоимости парковки подскажут в чате');
 assert.equal(reply.action,original.action);
 assert.deepEqual(s,before);
 const input={rating:5,liked:[],improve:[],text:'Хорошо',photos:[],anonymous:false};
 edited(()=>assert.throws(()=>sendStayReview(s,b.owner,b.id,input),{message:'Оценить проживание можно после выезда'}));
 assert.deepEqual(s,before);
});
