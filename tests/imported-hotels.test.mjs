import roomsManifest from '../docs/references/ozon-rooms-2026-10-27/manifest.json' with {type:'json'};
import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import imported from '../spec/imported-hotels.json' with {type:'json'};
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,catalog} from '../app/src/booking/model.ts';
import {discoveryOffers} from '../app/src/booking/offers.ts';
import {roomVisual} from '../app/src/booking/roomVisuals.ts';
import {hotelVisual} from '../app/src/booking/presentation.ts';
import {hotelFacets} from '../app/src/booking/searchFacets.ts';
const owner='import-qa';
const state=()=>{const s=ensureAccount(initialCommerce(),owner);return {...s,search:{...s.search,city:'Москва',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2,childrenAges:[]}};};
test('40 imported hotels are searchable, bookable and retain their nightly price and photos',()=>{
 assert.equal(Object.keys(imported.hotels).length,40);

 for(const [id,source] of Object.entries(imported.hotels)){
  const initial=state();initial.search.city=catalog.hotels.find(h=>h.id===id).city;
  const offered=discoveryOffers(initial,owner);
  assert.ok(offered.some(o=>o.h.id===id),id);
  let s=startDraft(initial,id,'test-'+id);
  const q=quoteDraft(s,owner);assert.equal(q.lodgingMinor,Math.round(roomsManifest[id].rooms.find(r=>r.roomId===s.draft.roomId).rates.find(r=>r.rateId===s.draft.rateId).sourceStayMinor/roomsManifest[id].rooms.find(r=>r.roomId===s.draft.roomId).rates.find(r=>r.rateId===s.draft.rateId).sourceNights)*2-q.hotelDiscountMinor,id);
  s.draft.contact={name:'Анна',surname:'Примерова',phone:'+79990000001',email:'qa@example.test'};
  s=commitBooking(s,owner,q,'success');assert.equal(s.bookings.at(-1).draft.hotelId,id);
  assert.ok(hotelVisual(id).photos.every(p=>existsSync(new URL('../app/public'+p,import.meta.url))),id);
  const visual=roomVisual(s.draft.roomId);assert.ok(visual.photos.every(p=>existsSync(new URL('../app/public'+p.src,import.meta.url))),id);
  assert.ok(!hotelFacets(id).amenities.some(a=>a.startsWith('+')),id);
 }
});
test('Unknown stars are not advertised as unstarred and sort after known stars',()=>{
 const s=state();s.searchSort='stars-asc';const offers=discoveryOffers(s,null),unknown=offers.findIndex(o=>hotelVisual(o.h.id).stars<0);
 assert.ok(unknown>0);assert.ok(offers.slice(unknown).every(o=>hotelVisual(o.h.id).stars<0));
 s.searchFilters=['Звездность отеля: Без звёзд'];assert.ok(discoveryOffers(s,null).every(o=>hotelVisual(o.h.id).stars===0));
});
test('ibis retains verified photos and breakfast; every imported room has its own photos',()=>{
 const ibis=catalog.hotels.find(h=>h.id==='moscow-ibis-moskva-kievskaya');assert.ok(ibis);
 const room=catalog.rooms.find(r=>r.hotelId===ibis.id);assert.equal(roomVisual(room.id).area,16);assert.equal(roomVisual(room.id).photos.length,3);
 const breakfast=catalog.rates.find(r=>r.hotelId===ibis.id&&r.mealPlan==='breakfast');assert.equal(breakfast.nightlyMinor*2,roomsManifest[ibis.id].rooms[0].rates.find(r=>r.rateId===breakfast.id).sourceStayMinor);
 for(const [id,visual] of Object.entries(imported.rooms)){assert.ok(visual.photos.length>=2,id);assert.ok(visual.photos.every(p=>!p.src.includes('placeholder')),id);}
});
