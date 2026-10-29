import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,decodeCommerce,quoteDraft} from '../app/src/booking/model.ts';
import {newPreferenceDraft,preferenceDraft,savePreferences,preferenceError,preferenceOffers,startPreferenceBooking,matchedPreferences} from '../app/src/booking/preferences.ts';
const owner='+79001234567';
const fixture=()=>{const s=ensureAccount(initialCommerce(),owner);s.search={...s.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2,childrenAges:[]};return s;};
const draft=s=>({...newPreferenceDraft(s.search),mode:'city',city:'Сочи',cityQuery:'Сочи',party:'couple',stage:'results',interests:['pool','spa','quiet']});
test('Ответы, набранный город, шаг и результаты сохраняются отдельно от поиска и владельца',()=>{
 const s=fixture(),before=structuredClone(s),d={...draft(s),stage:'topic',topic:'water',cityQuery:'Соч'};
 const next=savePreferences(s,owner,d),restored=decodeCommerce(JSON.stringify(next));
 assert.deepEqual(preferenceDraft(restored,owner),d);assert.deepEqual(next.search,s.search);assert.deepEqual(s,before);
 assert.deepEqual(preferenceDraft(restored,'other'),newPreferenceDraft(s.search));
 assert.deepEqual(preferenceOffers(restored,owner,d),preferenceOffers(s,owner,d));
});
test('Рекомендации ранжируются по проверяемым совпадениям, а не вымышленным процентам',()=>{
 const s=fixture(),d=draft(s),offers=preferenceOffers(s,owner,d);
 assert.equal(offers[0].h.id,'orbit-sea');assert.equal(offers[0].matched.length,3);
 assert.equal(matchedPreferences('pine-sochi',d).matched.length,1);
 assert.equal(matchedPreferences('pine-sochi',d).total,3);
 assert.deepEqual(matchedPreferences('pine-sochi',d).missing,['Бассейн','Спа']);
 const family={...d,party:'kids'};assert.equal(matchedPreferences('orbit-city',family).total,4);
 assert.ok(!matchedPreferences('orbit-city',family).matched.some(m=>m.id==='kids'));
});
test('Бюджет за ночь включает точную границу, учитывает скидку и не зависит от старых фильтров',()=>{
 const s=fixture(),d=draft(s),offer=preferenceOffers(s,owner,d)[0];const budget=offer.q.lodgingMinor/offer.q.nights;
 assert.ok(preferenceOffers(s,owner,{...d,budgetMinor:budget}).some(x=>x.h.id===offer.h.id));
 assert.ok(!preferenceOffers(s,owner,{...d,budgetMinor:budget-1}).some(x=>x.h.id===offer.h.id));
 assert.deepEqual(preferenceOffers({...s,collection:'discount',searchFilters:['несуществующее'],minRating:5,maxNightly:1},owner,d),preferenceOffers(s,owner,d));
 assert.equal(preferenceOffers(s,owner,{...d,budgetMinor:1}).length,0);
});
test('Город нужно выбрать; неправильные даты не запускают расчёт',()=>{
 const s=fixture(),d=draft(s);
 assert.match(preferenceError({...d,city:'',cityQuery:'Сочи'}),/Выберите город/);
 assert.match(preferenceError({...d,party:''}),/с кем/);
 assert.equal(preferenceOffers(s,owner,{...d,search:{...d.search,checkOut:d.search.checkIn}}).length,0);
 assert.ok(preferenceOffers(s,owner,{...d,mode:'any',city:''}).length>=preferenceOffers(s,owner,d).length);
});
test('Бронирование берёт контекст подбора и сохраняет обычный поиск, компанию не подменяет гостями',()=>{
 const s=fixture(),d={...draft(s),party:'kids',search:{...s.search,checkIn:'2026-11-14',checkOut:'2026-11-16',adults:1}};
 const next=savePreferences(s,owner,d),offer=preferenceOffers(next,owner,d)[0];
 const booking=startPreferenceBooking(next,owner,offer.h.id,'new');
 assert.deepEqual(booking.search,s.search);assert.equal(booking.draft.search.adults,1);assert.deepEqual(booking.draft.search.childrenAges,[]);
 assert.deepEqual(booking.draft.preferenceMatches,matchedPreferences(offer.h.id,d).matched.map(m=>m.text));
 assert.equal(booking.draft.search.checkIn,'2026-11-14');assert.equal(booking.draft.returnTo,'preferences');
 assert.equal(quoteDraft(booking,owner).cashDueMinor,offer.q.cashDueMinor);
 assert.throws(()=>startPreferenceBooking(next,'other',offer.h.id,'bad'),/с кем/);
 assert.throws(()=>startPreferenceBooking(next,owner,'missing','bad'),/недоступен/);
});
test('Явная сортировка меняет порядок и сохраняет набор доступных отелей',()=>{
 const s=fixture(),d=draft(s),byPrice=preferenceOffers(s,owner,{...d,sort:'price'});
 assert.ok(byPrice.every((v,i)=>i===0||v.q.lodgingMinor>=byPrice[i-1].q.lodgingMinor));
 assert.deepEqual(byPrice.map(v=>v.h.id).sort(),preferenceOffers(s,owner,d).map(v=>v.h.id).sort());
});

test('Новый подбор не наследует скрытые ограничения обычного поиска',()=>{
 const s=fixture();s.search.withPet=true;s.search.businessTrip=true;s.search.byCar=true;
 const d=newPreferenceDraft(s.search);
 assert.equal(d.search.withPet,false);assert.equal(d.search.businessTrip,false);assert.equal(d.search.byCar,false);
 assert.equal(s.search.withPet,true);
});
