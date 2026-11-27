import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveGuestProfile} from '../app/src/demoGuestProfile.ts';
import {travelStyleMatch,applySwipePreferences} from '../app/src/booking/swipePreferences.ts';
import {catalog,initialCommerce} from '../app/src/booking/model.ts';
import {discoveryOffers} from '../app/src/booking/offers.ts';
import {travelStyleReasonItems} from '../app/src/booking/travelStyleReasons.ts';
import {popularCities} from '../app/src/booking/search.ts';

test('Guest profile scenario uses explicit URL before saved setting and defaults to absent',()=>{
 assert.equal(resolveGuestProfile('https://example.test/',null),false);
 assert.equal(resolveGuestProfile('https://example.test/','yes'),true);
 assert.equal(resolveGuestProfile('https://example.test/?guestProfile=no','yes'),false);
 assert.equal(resolveGuestProfile('https://example.test/?guestProfile=yes','no'),true);
 assert.equal(resolveGuestProfile('https://example.test/?guestProfile=invalid','yes'),true);
 assert.equal(resolveGuestProfile('https://example.test/?catalogue=results-style-kazan','no'),true);
 assert.equal(resolveGuestProfile('https://example.test/?catalogue=results-style-kazan&guestProfile=no','yes'),false);
 assert.equal(resolveGuestProfile('https://example.test/?catalogue=results','no'),false);
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
 assert.equal(ranked.filter(({h})=>h.styleExample).length,6);
 assert.deepEqual(ids(ranked.filter(({h})=>!h.styleExample)),['orbit-sea','lighthouse-sochi','pine-sochi']);
 const scores=ranked.map(({h})=>travelStyleMatch(h.id,themes).percent);
 assert.deepEqual(scores,[...scores].sort((a,b)=>b-a));
 assert.deepEqual(ids(discoveryOffers(state,null,rankByStyle)),ids(ranked));
 assert.deepEqual(ids(discoveryOffers(state,'another-profile',rankByStyle)),ids(discoveryOffers(state,'another-profile')));

 const filtered={...state,minRating:4.7};
 assert.deepEqual(ids(discoveryOffers(filtered,owner,rankByStyle).filter(({h})=>!h.styleExample)),ids(discoveryOffers(filtered,owner)));
 const byPrice={...state,searchSort:'price'};
 const prices=discoveryOffers(byPrice,owner,rankByStyle).map(({q})=>q.lodgingMinor);
 assert.deepEqual(prices,[...prices].sort((a,b)=>a-b));
});

test('Style examples offer real filter combinations and explain the selected rate',()=>{
 const initial=initialCommerce();
 const search={...initial.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]};
 const themes=['spa'],owner='guest';
 const state=applySwipePreferences({...initial,search},owner,themes);
 const filtered={...state,searchFilters:['Питание: Завтрак включён','Общие удобства: Бассейн','Звездность отеля: 4 звезды','Звездность отеля: 5 звёзд']};
 const offers=discoveryOffers(filtered,owner,{rankByStyle:true});
 assert.deepEqual(new Set(offers.map(({h})=>h.id)),new Set(['orbit-sea','sochi-style-spa','sochi-style-family','sochi-style-active']));
 const spa=offers.find(({h})=>h.id==='sochi-style-spa');
 const reasons=travelStyleReasonItems(spa.h.id,themes,'',{commerce:filtered,offer:spa.q});
 assert.equal(travelStyleMatch(spa.h.id,themes).percent,100);
 assert.deepEqual(reasons.map(reason=>reason.feature),['Завтрак','Бассейн','Спа']);
 assert.equal(reasons[0].text,'Завтрак включён в тариф');
 const stars=travelStyleReasonItems(spa.h.id,themes,'',{commerce:{...filtered,searchFilters:filtered.searchFilters.slice(2)},offer:spa.q});
 assert.ok(stars.some(reason=>reason.text==='5 звёзд'));
 assert.ok(!stars.some(reason=>reason.text==='4 звезды'));
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

test('All popular destinations have comparable offers with style and combined filters',()=>{
 const owner='guest',options={rankByStyle:true},themes=['spa'];
 const initial=initialCommerce();
 for(const city of popularCities){
  const search={...initial.search,city,checkIn:'2026-11-13',checkOut:'2026-11-16',adults:2,childrenAges:[]};
  const state=applySwipePreferences({...initial,search},owner,themes);
  const all=discoveryOffers(state,owner,options);
  assert.ok(all.length>=5,city);
  assert.ok(new Set(all.map(({h})=>travelStyleMatch(h.id,themes).percent)).size>=3,city);

  const spa={...state,searchFilters:['Завтрак включён','Бассейн','Спа']};
  const family={...state,search:{...search,childrenAges:[7]},searchFilters:['Завтрак включён','Бассейн']};
  for(const filtered of [spa,family]){
   const offers=discoveryOffers(filtered,owner,options);
   assert.ok(offers.length>=2&&offers.length<all.length,city);
   for(const {h,q} of offers){
    const reasons=travelStyleReasonItems(h.id,themes,'',{commerce:filtered,offer:q});
    assert.equal(reasons[0].text,'Завтрак включён в тариф',h.id);
    assert.ok(reasons.some(item=>item.feature==='Бассейн'),h.id);
   }
  }
 }
});


test('Edited matching reasons promise included breakfast only for a rate that includes it',()=>{
 const hotelId='orbit-sea',themes=['food'];
 const commerce=initialCommerce();
 const reasons=meal=>travelStyleReasonItems(hotelId,themes,'завтраки',{commerce,offer:{
  rateId:catalog.rates.find(rate=>rate.hotelId===hotelId&&(rate.mealPlan==='none')===(meal==='none')).id,
  lodgingMinor:0,nights:1,
 }},'edited');
 assert.ok(reasons('breakfast').some(item=>item.text==='Завтрак включён в стоимость'));
 assert.ok(reasons('none').some(item=>item.text==='Гости хвалят завтраки'));
 assert.ok(reasons('breakfast').some(item=>item.text==='Ресторан на территории: есть авторское и детское меню'));
});
