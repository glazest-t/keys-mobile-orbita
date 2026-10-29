import test from 'node:test';
import assert from 'node:assert/strict';
import promotions from '../spec/hotel-promotions.json' with {type:'json'};
import {catalog,initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking} from '../app/src/booking/model.ts';
import {discoveryOffers} from '../app/src/booking/offers.ts';
import {discountPercent} from '../app/src/booking/promotions.ts';
const owner='promo-qa';
function state(city){const s=ensureAccount(initialCommerce(),owner);s.accounts[owner].loyalty=false;s.search={...s.search,city,checkIn:'2026-11-13',checkOut:'2026-11-16',adults:2,childrenAges:[]};return s;}
test('About 30% of the catalogue has public 10/20/30 percent demo promotions',()=>{
 const entries=Object.entries(promotions.basisPoints);assert.equal(entries.length,Math.round(catalog.hotels.length*.3));assert.deepEqual([...new Set(entries.map(([,v])=>v))].sort(),[1000,2000,3000]);
 for(const [id,bps] of entries){
  const hotel=catalog.hotels.find(h=>h.id===id);assert.ok(hotel);
  let s=startDraft(state(hotel.city),id,'promo-'+id);const q=quoteDraft(s,owner);
  assert.equal(q.hotelDiscountMinor,Math.round(q.baseLodgingMinor*bps/10000));assert.equal(discountPercent(q),bps/100);
  const offer=discoveryOffers(s,owner).find(o=>o.h.id===id);assert.equal(offer.q.lodgingMinor,q.lodgingMinor);
  s.draft.contact={name:'Анна',surname:'Примерова',phone:'+79990000001',email:'qa@example.test'};
  s=commitBooking(s,owner,q,'success');assert.equal(s.bookings.at(-1).operation.paidCashMinor,q.cashDueMinor);
 }
});
test('Hot-deal banner and bonus filter select the same hotels without loyalty',()=>{
 for(const city of ['Москва','Санкт-Петербург']){
  const s=state(city),expected=catalog.hotels.filter(h=>h.city===city&&promotions.basisPoints[h.id]).map(h=>h.id).sort();
  const fromBanner=discoveryOffers({...s,collection:'discount'},owner).map(o=>o.h.id).sort();
  const fromFilter=discoveryOffers({...s,searchFilters:['Бонусы и скидки: Горячие скидки']},owner).map(o=>o.h.id).sort();
  assert.deepEqual(fromBanner,expected);assert.deepEqual(fromFilter,expected);
 }
});
