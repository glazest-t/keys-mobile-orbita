import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import manifest from '../docs/references/ozon-rooms-2026-10-27/manifest.json' with {type:'json'};
import {catalog,initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking} from '../app/src/booking/model.ts';
import {roomOffers,selectRoomRate} from '../app/src/booking/roomOffers.ts';
import {roomVisual} from '../app/src/booking/roomVisuals.ts';
import {roomFacets} from '../app/src/booking/searchFacets.ts';
const owner='rooms-qa';
function setup(hotelId,adults=2){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,city:catalog.hotels.find(h=>h.id===hotelId).city,checkIn:'2026-11-13',checkOut:'2026-11-15',adults,childrenAges:[]};return startDraft(s,hotelId,'rooms-'+hotelId);}
test('Each imported room has matched source photos, area, beds, amenities and bookable rates',()=>{
 let roomCount=0,rateCount=0;
 for(const [hid,source] of Object.entries(manifest))for(const item of source.rooms){
  roomCount++;const room=catalog.rooms.find(r=>r.id===item.roomId);assert.ok(room, item.roomId);
  const visual=roomVisual(room.id);assert.ok(visual.area>0);assert.ok(visual.description);assert.ok(visual.amenities.length>0);assert.ok(roomFacets(room.id).beds.length);
  assert.ok(visual.photos.length>=2,room.id);assert.ok(visual.photos.every(p=>item.photos.some(v=>v.path===p.src)&&existsSync(new URL('../app/public'+p.src,import.meta.url))),room.id);
  const state=setup(hid,Math.min(2,room.maxGuests));assert.ok(roomOffers(state,owner).some(o=>o.room.id===room.id),room.id);
  for(const record of item.rates){
   rateCount++;let s=selectRoomRate(state,owner,record.rateId);const q=quoteDraft(s,owner),rate=catalog.rates.find(r=>r.id===record.rateId);
   assert.equal(q.baseLodgingMinor,Math.round(record.sourceStayMinor/record.sourceNights)*2);
   assert.equal(s.draft.roomId,room.id);assert.equal(q.rateId,rate.id);
   s.draft.contact={name:'Анна',surname:'Примерова',phone:'+79990000001',email:'rooms@example.test'};
   const booked=commitBooking(s,owner,q,'success');assert.equal(booked.bookings.at(-1).operation.paidCashMinor,q.cashDueMinor);
  }
 }
 assert.equal(roomCount,100);assert.equal(rateCount,160);
});
test('Breakfast and twin-bed filters select actual matching imported room and tariff',()=>{
 let s=setup('spb-valo-network');s.searchFilters=['Питание: Завтрак включён','Выбор кровати: Две односпальные'];s=startDraft(s,'spb-valo-network','filtered');
 assert.equal(catalog.rates.find(r=>r.id===s.draft.rateId).mealPlan,'breakfast');assert.ok(roomFacets(s.draft.roomId).beds.includes('Две односпальные'));
});
