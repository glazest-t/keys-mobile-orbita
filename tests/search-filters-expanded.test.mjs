import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,startDraft,quoteDraft,searchError,catalog,ensureAccount} from '../app/src/booking/model.ts';
import {discoveryOffers,clearFilters,districtsFor} from '../app/src/booking/offers.ts';
import {token,normalizeFilters,priceMode,priceError,convertPriceRange,priceCeiling,compareNumber,sortKey,toggleQuick,updateSearchOptions} from '../app/src/booking/filterSchema.ts';
import {hotelFacets,roomFacets,mealLabel} from '../app/src/booking/searchFacets.ts';
import {rememberSearch,destinationSuggestions} from '../app/src/booking/search.ts';
import {hotelVisual} from '../app/src/booking/presentation.ts';
const state=()=>({...initialCommerce(),search:{city:'Казань',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]}});
const ids=s=>discoveryOffers(s,null).map(v=>v.h.id);
const filtered=(...filters)=>({...state(),searchFilters:filters});
test('Каталог содержит восемь доступных типов с явными характеристиками',()=>{
 const offers=discoveryOffers(state(),null);assert.equal(offers.length,8);assert.equal(new Set(offers.map(v=>hotelFacets(v.h.id).type)).size,8);
 for(const {h,q} of offers){const photos=hotelVisual(h.id).photos;assert.equal(new Set(photos).size,photos.length);const d=startDraft(state(),h.id,'test');assert.ok(roomFacets(d.draft.roomId));assert.equal(quoteDraft(d,null).lodgingMinor,q.lodgingMinor);}
});
test('OR внутри типа, AND между группами; удобства требуют все выбранные',()=>{
 assert.deepEqual(ids(filtered(token('Тип размещения','Квартира'),token('Тип размещения','Загородный дом'))),['kazan-apartment','kazan-country']);
 assert.deepEqual(ids(filtered(token('Тип размещения','Квартира'),token('Тип размещения','Загородный дом'),token('Возможности бронирования','Можно курить'))),['kazan-country']);
 assert.deepEqual(ids(filtered(token('Общие удобства','Бассейн'),token('Общие удобства','Лифт'))),['kazan-city','kazan-health']);
 assert.deepEqual(ids(filtered(token('Парковка','Бесплатная парковка'),token('Общие удобства','Лифт'))),[]);
});
test('Счётчики и оснащение совпадают на одном доступном номере',()=>{
 assert.deepEqual(ids(filtered('Спальни: 3','Ванные комнаты: 2','Кровати: 5')),['kazan-country']);
 const s={...state(),search:{...state().search,city:'Сочи'},searchFilters:['Спальни: 2',token('Выбор кровати','Две односпальные')]};assert.deepEqual(ids(s),[]);
 assert.deepEqual(ids(filtered(token('Удобства в номере','Стиральная машина'),token('Удобства в номере','Балкон'))),['kazan-apartment','kazan-country']);
});
test('Питание OR выбирает соответствующий тариф и сохраняет ту же цену при открытии',()=>{
 for(const label of ['Завтрак включён','Собственная кухня','Завтрак и ужин включены','Полный пансион','Всё включено','Без питания']){
  const s=filtered(token('Питание',label)),offers=discoveryOffers(s,null);assert.ok(offers.length,label);
  for(const {h,q} of offers){const d=startDraft(s,h.id,'test'),rate=catalog.rates.find(v=>v.id===d.draft.rateId);assert.ok(mealLabel(rate.mealPlan)===label||label==='Собственная кухня'&&roomFacets(d.draft.roomId).kitchen);assert.equal(quoteDraft(d,null).lodgingMinor,q.lodgingMinor);}
 }
 assert.equal(ids(filtered(token('Питание','Полный пансион'),token('Питание','Всё включено'))).length,2);
});
test('Цена по умолчанию за всё проживание, точные включительные границы, без баллов',()=>{
 const s=ensureAccount(state(),'owner'),offer=discoveryOffers(s,'owner').find(v=>v.h.id==='kazan-apart'),p=offer.q.lodgingMinor;assert.ok(offer.q.hotelDiscountMinor>0);assert.equal(priceMode(s),'stay');
 assert.ok(discoveryOffers({...s,priceMode:'stay',priceRangeMinor:{min:p,max:p}},'owner').some(v=>v.h.id===offer.h.id));
 assert.ok(!discoveryOffers({...s,priceMode:'stay',priceRangeMinor:{min:null,max:p-100}},'owner').some(v=>v.h.id===offer.h.id));
 assert.equal(priceMode({...s,maxNightly:5000}),'night');
 assert.deepEqual(ids({...s,priceRangeMinor:{min:100000,max:100},priceMode:'stay'}),[]);
});
test('Пересчёт периода, пустые и обратные границы, расширяемая шкала',()=>{
 assert.deepEqual(convertPriceRange({min:1000100,max:null},'night',3),{min:333400,max:null});
 assert.deepEqual(convertPriceRange({min:333400,max:null},'stay',3),{min:1000200,max:null});
 assert.ok(priceError({min:100,max:0}));assert.equal(priceError({min:0,max:0}),'');
 assert.equal(priceCeiling({min:null,max:10100000},'stay'),11000000);assert.equal(priceCeiling({min:null,max:null},'night'),3000000);
});
test('Все шесть сортировок сохраняют состав, равные значения сохраняют порядок',()=>{
 const baseline=ids(state());for(const key of ['recommended','stars-desc','stars-asc','reviews-desc','price','price-desc'])assert.deepEqual([...ids({...state(),searchSort:key})].sort(),[...baseline].sort());
 const ascending=discoveryOffers({...state(),searchSort:'stars-asc'},null);assert.equal(hotelVisual(ascending[0].h.id).stars,0);assert.deepEqual(ascending.slice(0,2).map(v=>v.h.id),['kazan-apartment','kazan-country']);
 const reviews=discoveryOffers({...state(),searchSort:'reviews-desc'},null);assert.equal(reviews[0].h.id,'kazan-apartment');assert.equal(reviews[1].h.id,'kazan-country');
 const prices=discoveryOffers({...state(),searchSort:'price'},null).map(v=>v.q.lodgingMinor);assert.deepEqual(prices,[...prices].sort((a,b)=>a-b));
 assert.equal(sortKey('rating-asc'),'stars-asc');assert.equal(sortKey('Сначала дороже'),'price-desc');
 for(const desc of [false,true]){assert.ok(compareNumber(undefined,0,desc)>0);assert.ok(compareNumber(0,NaN,desc)<0);assert.equal(compareNumber('4,8',4.8,desc),0);}
});
test('Быстрый фильтр синхронизирован с каталогом, 4–5 заменяет прежние звёзды',()=>{
 const a=token('Звездность отеля','4 звезды'),b=token('Звездность отеля','5 звёзд');let s=filtered(token('Звездность отеля','1 звезда'));s=toggleQuick(s,[a,b]);assert.deepEqual(s.searchFilters,[a,b]);s=toggleQuick(s,[a,b]);assert.deepEqual(s.searchFilters,[]);
 assert.deepEqual(normalizeFilters(['С завтраком','Завтрак включён','С бассейном']),['Питание: Завтрак включён','Общие удобства: Бассейн']);
});
test('Районы отсортированы и пересекаются с фильтрами; поиск по району/названию',()=>{
 assert.deepEqual(districtsFor(state()),['Вахитовский','Кировский','Московский','Советский']);
 assert.deepEqual(ids({...filtered(token('Тип размещения','Квартира')),searchDistrict:{city:'Казань',name:'Советский'}}),['kazan-apartment']);
 assert.deepEqual(ids({...filtered(token('Тип размещения','Квартира')),searchDistrict:{city:'Казань',name:'Кировский'}}),[]);
 assert.deepEqual(ids({...state(),search:{...state().search,city:'РАВНОВЕСИЕ'}}),['kazan-health']);
 assert.ok(destinationSuggestions('кировский',state()).some(v=>v.hotelId==='kazan-camp'));
});
test('История восстанавливает фильтры, район, сортировку и период цены',()=>{
 let s=rememberSearch(state(),state().search);s=updateSearchOptions(s,{searchFilters:['Тип размещения: Квартира'],priceMode:'stay',priceRangeMinor:{min:null,max:900000},searchSort:'price-desc',searchDistrict:{city:'Казань',name:'Советский'}});
 const saved=structuredClone(s.recentSearches[0]);s=clearFilters(s);s.searchSort='recommended';s=rememberSearch(s,saved);assert.equal(s.searchSort,'price-desc');assert.equal(s.priceMode,'stay');assert.deepEqual(ids(s),['kazan-apartment']);assert.equal(s.search.filtersSnapshot,undefined);
 const reset=clearFilters(s);assert.equal(reset.searchSort,'price-desc');assert.equal(reset.priceMode,'stay');assert.equal(reset.searchDistrict,undefined);
});
test('Дети требуют разрешения и возраст, новые лимиты гостей не подменяют вместимость',()=>{
 assert.ok(searchError({...state().search,childrenAges:[-1]},'2026-10-27'));assert.equal(searchError({...state().search,adults:6,childrenAges:[0,5,10,17]},'2026-10-27'),'');
 const s={...state(),search:{...state().search,adults:6,childrenAges:[0,5,10,17]}};assert.deepEqual(ids(s),['kazan-country']);
 assert.ok(!ids({...state(),search:{...state().search,childrenAges:[0]}}).includes('kazan-hostel'));
 assert.deepEqual(ids({...state(),search:{...state().search,businessTrip:true,byCar:true}}),ids(state()));
});
test('Эксклюзивность — отдельный признак, бонусы сочетаются по OR',()=>{
 const exclusive=token('Бонусы и скидки','Эксклюзивно только в Ключах');
 assert.deepEqual(ids(filtered(exclusive)),['kazan-apart','kazan-country']);
 const all={...state(),search:{...state().search,city:'Любой город'}};
 const hot=token('Бонусы и скидки','Горячие скидки');
 const exclusiveIds=ids({...all,searchFilters:[exclusive]}),hotIds=ids({...all,searchFilters:[hot]});
 assert.ok(hotIds.length>0);assert.ok(hotIds.some(id=>!exclusiveIds.includes(id)));
 assert.deepEqual(ids({...all,searchFilters:[exclusive,hot]}).sort(),[...new Set([...exclusiveIds,...hotIds])].sort());
 assert.deepEqual(ids(filtered(exclusive,token('Тип размещения','Загородный дом'))),['kazan-country']);
});
