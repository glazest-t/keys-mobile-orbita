import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveGuestProfile} from '../app/src/demoGuestProfile.ts';
import {travelStyleMatch,applySwipePreferences} from '../app/src/booking/swipePreferences.ts';
import {initialCommerce} from '../app/src/booking/model.ts';
import {discoveryOffers} from '../app/src/booking/offers.ts';

test('Guest profile scenario uses explicit URL before saved setting and defaults to absent',()=>{
 assert.equal(resolveGuestProfile('https://example.test/',null),false);
 assert.equal(resolveGuestProfile('https://example.test/','yes'),true);
 assert.equal(resolveGuestProfile('https://example.test/?guestProfile=no','yes'),false);
 assert.equal(resolveGuestProfile('https://example.test/?guestProfile=yes','no'),true);
 assert.equal(resolveGuestProfile('https://example.test/?guestProfile=invalid','yes'),true);
});
test('Style match deduplicates preferences across themes and distinguishes unknown data from no match',()=>{
 assert.deepEqual(travelStyleMatch('orbit-sea',['spa']),{total:4,matched:['Спа','Тихое место','Бассейн'],missing:['Сауна'],percent:75});
 const combined=travelStyleMatch('orbit-sea',['spa','family','spa']);
 assert.equal(combined.total,9);assert.equal(combined.matched.length,6);assert.equal(combined.percent,67);
 assert.equal(travelStyleMatch('unknown-hotel',['spa']).percent,null);
 assert.equal(travelStyleMatch('orbit-sea',[]).percent,null);
});
test('Changing the style updates the same account preferences without changing filters or other accounts',()=>{
 const state=applySwipePreferences(applySwipePreferences(initialCommerce(),'guest-a',['spa']),'guest-b',['family']);
 const next=applySwipePreferences(state,'guest-a',['food']);
 assert.equal(travelStyleMatch('orbit-sea',next.swipePreferences['guest-a'].themes).percent,60);
 assert.deepEqual(next.swipePreferences['guest-b'],state.swipePreferences['guest-b']);
 assert.deepEqual(next.search,state.search);assert.deepEqual(next.searchFilters,state.searchFilters);
});

test('Search results with My Style alone rank by the displayed percentage',()=>{
 const themes=['romantic','spa'];
 const initial=initialCommerce();
 const search={...initial.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]};
 const owner='guest';
 const state=applySwipePreferences({...initial,search},owner,themes);
 const ids=offers=>offers.map(({h})=>h.id);
 const rankByStyle={rankByStyle:true};

 const ranked=discoveryOffers(state,owner,rankByStyle);
 assert.deepEqual(ids(ranked),['orbit-sea','lighthouse-sochi','pine-sochi']);
 assert.deepEqual(ranked.map(({h})=>travelStyleMatch(h.id,themes).percent),[57,29,14]);
 assert.deepEqual(ids(discoveryOffers(state,null,rankByStyle)),ids(ranked));
 assert.deepEqual(ids(discoveryOffers(state,'another-profile',rankByStyle)),ids(discoveryOffers(state,'another-profile')));

 const filtered={...state,minRating:4.7};
 assert.deepEqual(ids(discoveryOffers(filtered,owner,rankByStyle)),ids(discoveryOffers(filtered,owner)));
 const byPrice={...state,searchSort:'price'};
 assert.deepEqual(ids(discoveryOffers(byPrice,owner,rankByStyle)),ids(discoveryOffers(byPrice,owner)));
});

test('Compact reasons follow selected matches, omit unrelated praise and stay within three phrases',async()=>{
 const {travelStyleReasons}=await import('../app/src/booking/travelStyleReasons.ts');
 const spa=travelStyleReasons('orbit-sea',['spa'],'завтраки, спа и близость к морю');
 assert.equal(spa[0],'Гости хвалят спа');
 assert.equal(spa.length,3);
 assert.ok(!spa.some(reason=>/завтрак|саун/.test(reason)));
 assert.deepEqual(travelStyleReasons('pine-sochi',['spa']),['Спокойное место для отдыха']);
 assert.deepEqual(travelStyleReasons('unknown-hotel',['spa']),[]);
 assert.deepEqual(travelStyleReasons('orbit-sea',[]),[]);
 assert.ok(!travelStyleReasons('orbit-sea',['spa']).some(reason=>reason.includes('хвалят')));
});
