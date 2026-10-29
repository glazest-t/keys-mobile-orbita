import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,decodeCommerce} from '../app/src/booking/model.ts';
import {needsSwipePreferences,saveSwipePreferences} from '../app/src/booking/swipePreferences.ts';
import {swipeDiscovery} from '../app/src/booking/swipeDiscovery.ts';
const owner='first-swipe';
const fixture=()=>{const s=initialCommerce();return {...s,search:{...s.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]}};};
test('Первый вход показывает предпочтения, черновик сохраняется, завершённый шаг не повторяется',()=>{
 const s=fixture();assert.ok(needsSwipePreferences(s,owner));
 const draft=saveSwipePreferences(s,owner,['spa','food','spa','unknown']);
 assert.deepEqual(draft.swipePreferences[owner].themes,['spa','food']);
 assert.ok(needsSwipePreferences(decodeCommerce(JSON.stringify(draft)),owner));
 const done=decodeCommerce(JSON.stringify(saveSwipePreferences(draft,owner,['spa'],true)));
 assert.equal(needsSwipePreferences(done,owner),false);
 assert.ok(needsSwipePreferences(done,'other'));
 assert.deepEqual(done.search,s.search);assert.deepEqual(done.bookings,s.bookings);
 assert.deepEqual(done.payment,s.payment);
});
test('Можно продолжить без выбора, предпочтения не отсекают доступные отели и не обходят фильтры',()=>{
 const s=fixture(),empty=saveSwipePreferences(s,owner,[],true);
 assert.equal(needsSwipePreferences(empty,owner),false);
 assert.deepEqual(swipeDiscovery(empty,owner),swipeDiscovery(s,owner));
 const selected=saveSwipePreferences(s,owner,['spa'],true);
 const plain=swipeDiscovery(s,owner),ranked=swipeDiscovery(selected,owner);
 assert.equal(ranked.offers.find(o=>o.h.id==='orbit-sea').score,plain.offers.find(o=>o.h.id==='orbit-sea').score+1);
 assert.deepEqual(ranked.offers.map(o=>o.h.id).sort(),plain.offers.map(o=>o.h.id).sort());
 assert.equal(swipeDiscovery({...selected,priceRangeMinor:{min:null,max:100}},owner).offers.length,0);
});

test('Editing preferences re-ranks unseen hotels without deleting history, favorites or search',async()=>{
 const {applySwipePreferences}=await import('../app/src/booking/swipePreferences.ts');
 const {answerSwipe}=await import('../app/src/booking/swipeDiscovery.ts');
 let s=saveSwipePreferences(fixture(),owner,[],true);
 const view=swipeDiscovery(s,owner);
 s=answerSwipe(s,owner,view.current.h.id,'skip',view.history.turn);
 assert.equal(swipeDiscovery(s,owner).current.h.id,'pine-sochi');
 const next=applySwipePreferences(s,owner,['food']);
 assert.equal(swipeDiscovery(next,owner).current.h.id,'lighthouse-sochi');
 assert.deepEqual(next.swipeHistories[owner].seen,s.swipeHistories[owner].seen);
 assert.deepEqual(next.swipeHistories[owner].answers,s.swipeHistories[owner].answers);
 assert.equal(next.swipeHistories[owner].turn,s.swipeHistories[owner].turn+1);
 assert.deepEqual(next.favoriteLibraries,s.favoriteLibraries);
 assert.deepEqual(next.search,s.search);
 assert.equal(needsSwipePreferences(next,owner),false);
 const unchanged=applySwipePreferences(next,owner,['food']);
 assert.deepEqual(unchanged.swipeHistories,next.swipeHistories);
});
