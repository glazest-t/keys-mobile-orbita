import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount} from '../app/src/booking/model.ts';
import {discoveryOffers,normalizePriceRange,clearFilters,filterCount} from '../app/src/booking/offers.ts';
const search=()=>{const s=initialCommerce();s.search={...s.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]};return s;};
test('Диапазон цены нормализует обратные, односторонние и пустые границы',()=>{
 assert.deepEqual(normalizePriceRange(1800000,800000),{min:800000,max:1800000});
 assert.deepEqual(normalizePriceRange(null,900000),{min:null,max:900000});
 assert.deepEqual(normalizePriceRange(-1,NaN),{min:0,max:null});
});
test('Цена за ночь фильтрует проживание после скидки, с включёнными границами',()=>{
 const owner='+79001234567';const s=ensureAccount(search(),owner);const offer=discoveryOffers(s,owner).find(v=>v.h.id==='orbit-sea');
 const price=offer.q.lodgingMinor/offer.q.nights;
 assert.ok(offer.q.hotelDiscountMinor>0);
 assert.ok(discoveryOffers({...s,priceRangeMinor:{min:price,max:price}},owner).some(v=>v.h.id==='orbit-sea'));
 assert.ok(!discoveryOffers({...s,priceRangeMinor:{min:null,max:price-1}},owner).some(v=>v.h.id==='orbit-sea'));
});
test('Стиль, рейтинг и удобства сочетаются; пустая выдача допустима',()=>{
 const s=search();assert.deepEqual(discoveryOffers({...s,searchFilters:['У моря','Дизайн'],minRating:4.8},null).map(v=>v.h.id),['lighthouse-sochi']);
 assert.equal(discoveryOffers({...s,searchFilters:['Тихое место','Бассейн'],minRating:4.9},null).length,0);
 assert.ok(discoveryOffers({...s,searchFilters:['С детьми','Гастро']},null).every(v=>['orbit-sea','lighthouse-sochi'].includes(v.h.id)));
});
test('Сброс очищает все ограничения и сохраняет даты, гостей и брони',()=>{
 const s={...search(),searchFilters:['Спа'],minRating:4.8,maxNightly:18000,priceRangeMinor:{min:800000,max:1800000},collection:'discount'};
 assert.equal(filterCount(s),3);const next=clearFilters(s);assert.equal(filterCount(next),0);assert.deepEqual(next.search,s.search);assert.deepEqual(next.bookings,s.bookings);assert.equal(next.collection,undefined);assert.equal(s.minRating,4.8);
});
test('Завтрак в отеле не означает включённое в тариф питание',()=>{
 const s=search();assert.ok(discoveryOffers({...s,searchFilters:['Завтрак']},null).length>0);
 const included=discoveryOffers({...s,searchFilters:['Завтрак включён']},null);
 assert.deepEqual(included.map(v=>v.h.id),['orbit-sea']);
 assert.equal(included[0].q.lodgingMinor,3440000);
});
