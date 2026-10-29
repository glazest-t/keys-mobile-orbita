import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,decodeCommerce} from '../app/src/booking/model.ts';
import {swipeDiscovery,answerSwipe,restartSwipe,startSwipeBooking} from '../app/src/booking/swipeDiscovery.ts';
import {favoriteItems,SWIPE_LIST} from '../app/src/booking/favorites.ts';
const owner='swipe-order-test';
const fixture=()=>{const s=ensureAccount(initialCommerce(),owner);return {...s,search:{...s.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]}};};
const answer=(s,choice)=>{const v=swipeDiscovery(s,owner);return answerSwipe(s,owner,v.current.h.id,choice,v.history.turn);};
test('Лайк и пропуск по-разному ранжируют непросмотренные отели по известным свойствам',()=>{
 const s=fixture();assert.equal(swipeDiscovery(s,owner).current.h.id,'orbit-sea');
 const like=answer(s,'like'),skip=answer(s,'skip');
 assert.equal(swipeDiscovery(like,owner).current.h.id,'lighthouse-sochi');
 assert.equal(swipeDiscovery(skip,owner).current.h.id,'pine-sochi');
 assert.deepEqual(favoriteItems(like,owner,SWIPE_LIST),['orbit-sea']);
 assert.deepEqual(favoriteItems(skip,owner,SWIPE_LIST),[]);
 assert.equal(s.swipeHistories,undefined);
});
test('Лента не повторяет отели, заканчивается и возобновляется только по действию пользователя',()=>{
 let s=fixture();const seen=[];
 for(let i=0;i<3;i++){seen.push(swipeDiscovery(s,owner).current.h.id);s=answer(s,'skip');}
 assert.equal(new Set(seen).size,3);assert.equal(swipeDiscovery(s,owner).finished,true);
 const again=restartSwipe(s,owner);assert.ok(swipeDiscovery(again,owner).current);
 assert.deepEqual(again.swipeHistories[owner].answers,s.swipeHistories[owner].answers);
});
test('Перезагрузка сохраняет текущую карточку и ответы; другой профиль начинает отдельно',()=>{
 const s=answer(fixture(),'like'),restored=decodeCommerce(JSON.stringify(s));
 assert.deepEqual(swipeDiscovery(restored,owner),swipeDiscovery(s,owner));
 assert.equal(swipeDiscovery(restored,'another').current.h.id,'orbit-sea');
 assert.deepEqual(swipeDiscovery(restored,'another').history.answers,{});
 assert.deepEqual(s.search,fixture().search);assert.deepEqual(s.bookings,fixture().bookings);
});
test('Повторный callback не записывает вторую реакцию; пропуск не удаляет прежний лайк из избранного',()=>{
 const s=fixture(),v=swipeDiscovery(s,owner),liked=answer(s,'like');
 assert.equal(answerSwipe(liked,owner,v.current.h.id,'like',v.history.turn),liked);
 let next=restartSwipe(liked,owner);
 while(swipeDiscovery(next,owner).current?.h.id!=='orbit-sea')next=answer(next,'skip');
 next=answer(next,'skip');assert.deepEqual(favoriteItems(next,owner,SWIPE_LIST),['orbit-sea']);
});
test('Фильтры и бюджет обязательны; смена условий начинает ленту, сохраняя реакции',()=>{
 const liked=answer(fixture(),'like');
 const filtered={...liked,searchFilters:['Спа']};
 assert.deepEqual(swipeDiscovery(filtered,owner).offers.map(o=>o.h.id),['orbit-sea']);
 assert.deepEqual(swipeDiscovery(filtered,owner).history.answers,liked.swipeHistories[owner].answers);
 assert.equal(swipeDiscovery({...filtered,priceRangeMinor:{min:null,max:100}},owner).offers.length,0);
 assert.equal(swipeDiscovery({...liked,search:{...liked.search,adults:100}},owner).current,undefined);
});
test('Детали и бронь сохраняют возврат к свайпу после reload, без изменения прогресса и поиска',()=>{
 const s=answer(fixture(),'like'),id=swipeDiscovery(s,owner).current.h.id;
 const next=decodeCommerce(JSON.stringify(startSwipeBooking(s,owner,id,'swipe-booking')));
 assert.equal(next.draft.returnTo,'swipe');assert.equal(next.draft.hotelId,id);
 assert.deepEqual(next.swipeHistories,s.swipeHistories);assert.deepEqual(next.search,s.search);
 assert.throws(()=>startSwipeBooking({...s,searchFilters:['Спа']},owner,'lighthouse-sochi','bad'),/недоступен/);
});
