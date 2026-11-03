import test from 'node:test';import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,nights,catalog} from '../app/src/booking/model.ts';
import {nearbyDateOffers} from '../app/src/booking/nearbyDates.ts';
import {roomOffers,updateRoomSearch} from '../app/src/booking/roomOffers.ts';
import {watchKey} from '../app/src/booking/priceWatch.ts';
const owner='+79990005566';
const base=()=>{const s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2,childrenAges:[]};return startDraft(s,'orbit-sea','nearby',owner);};
test('Соседние даты сохраняют гостей и длительность, цена совпадает с карточками после выбора',()=>{
 const s=base(),snapshot=JSON.stringify(s),offers=nearbyDateOffers(s,owner);
 assert.equal(offers.length,11);assert.equal(offers.filter(o=>o.selected).length,1);
 for(const offer of offers){assert.equal(nights(offer.search),2);assert.equal(offer.search.adults,2);if(offer.priceMinor!==null){const next=updateRoomSearch(s,owner,offer.search);assert.equal(offer.priceMinor,Math.min(...roomOffers(next,owner).flatMap(r=>r.rates.map(v=>v.quote.lodgingMinor))));}}
 assert.equal(JSON.stringify(s),snapshot);
});
test('Дешевле только при меньшей доступной цене, без услуг и списания баллов',()=>{
 const s=base();s.draft.services=['sea-transfer'];s.draft.usePoints=true;
 const before=nearbyDateOffers(s,owner),target=before.find(o=>!o.selected&&o.priceMinor!==null),baseline=before.find(o=>o.selected).priceMinor;
 s.demoOfferPrices={};
 for(const rate of catalog.rates.filter(r=>r.hotelId===s.draft.hotelId))s.demoOfferPrices[watchKey(owner,{...s.draft,search:target.search,roomId:rate.roomId,rateId:rate.id})]=Math.round(baseline*.5);
 const cheaper=nearbyDateOffers(s,owner).find(o=>o.search.checkIn===target.search.checkIn);
 assert.ok(cheaper.priceMinor<baseline);assert.equal(cheaper.cheaper,true);assert.equal(nearbyDateOffers(s,owner).find(o=>o.selected).cheaper,false);
 const equal=before.filter(o=>o.priceMinor===baseline);assert.ok(equal.length);assert.ok(equal.every(o=>!o.cheaper));
});
test('Прошлые даты пропускаются; нет мест — нет цены и метки дешевле',()=>{
 const s=base();const offers=nearbyDateOffers(s,owner,'2026-11-13');assert.ok(offers.every(o=>o.search.checkIn>='2026-11-13'));
 s.draft.search.adults=6;s.draft.search.childrenAges=[5,8,9,10];
 const unavailable=nearbyDateOffers(s,owner);assert.ok(unavailable.length);assert.ok(unavailable.every(o=>o.priceMinor===null&&!o.cheaper));
});
