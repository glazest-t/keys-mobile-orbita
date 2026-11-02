import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,initialCommerce,ensureAccount} from '../app/src/booking/model.ts';
import {hotelPreferenceFeatures,basicHotelPreferences} from '../app/src/booking/hotelPreferences.ts';
import {swipeThemes,matchedSwipePreferences,saveSwipePreferences,swipePreferenceScore} from '../app/src/booking/swipePreferences.ts';
import {discoveryOffers} from '../app/src/booking/offers.ts';
import {preferenceIllustrationFor} from '../app/src/booking/preferenceIllustrations.ts';
const owner='preference-coverage';
test('Каждый из 53 отелей даёт минимум три критерия для каждого из 10 стилей',()=>{
 assert.equal(catalog.hotels.length,53);assert.equal(swipeThemes.length,10);
 for(const h of catalog.hotels){
  const features=hotelPreferenceFeatures(h.id);assert.ok(features.length>=3,h.id);
  for(const theme of swipeThemes){const matches=matchedSwipePreferences(h.id,[theme.id]);assert.ok(matches.length>=3,h.id+':'+theme.id);assert.equal(matches.length,new Set(matches).size);assert.ok(matches.every(f=>features.includes(f)));assert.ok(matches.every(f=>preferenceIllustrationFor(f)),matches.join(', '));}
 }
 assert.deepEqual(matchedSwipePreferences('unknown',['family']),[]);
});
test('Общие критерии не выдают отсутствующие бассейн и спа и не увеличивают рейтинг',()=>{
 const s=saveSwipePreferences(initialCommerce(),owner,['spa'],true);
 assert.ok(!hotelPreferenceFeatures('pine-sochi').includes('Бассейн'));
 assert.ok(!matchedSwipePreferences('pine-sochi',['spa']).includes('Спа'));
 assert.ok(swipePreferenceScore(s,owner,'orbit-sea')>swipePreferenceScore(s,owner,'pine-sochi'));
 assert.deepEqual(matchedSwipePreferences('orbit-sea',['spa','spa']),matchedSwipePreferences('orbit-sea',['spa']));
 assert.ok(matchedSwipePreferences('orbit-sea',['spa']).indexOf('Спа')<matchedSwipePreferences('orbit-sea',['spa']).indexOf('Чистота'));
});
test('Рекомендованная выдача учитывает те же предпочтения; сортировка цен остаётся явной',()=>{
 let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]};
 s=saveSwipePreferences(s,owner,['spa'],true);const before=structuredClone(s),offers=discoveryOffers(s,owner);
 assert.ok(offers.length>1);
 offers.forEach((o,i)=>{assert.ok(matchedSwipePreferences(o.h.id,['spa']).length>=3);if(i)assert.ok(swipePreferenceScore(s,owner,offers[i-1].h.id)>=swipePreferenceScore(s,owner,o.h.id));});
 const prices=discoveryOffers({...s,searchSort:'price'},owner);prices.forEach((o,i)=>{if(i)assert.ok(prices[i-1].q.lodgingMinor<=o.q.lodgingMinor);});
 assert.deepEqual(s,before);assert.equal(basicHotelPreferences('orbit-sea').length,3);
});
