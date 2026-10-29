import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,decodeCommerce,quoteDraft} from '../app/src/booking/model.ts';
import {favoriteLibrary,favoriteItems,favoriteNavigation,setFavorite,saveFavoriteList,deleteFavoriteList,saveFavoriteNote,saveFavoriteSearch,startFavoriteBooking,favoriteOffers} from '../app/src/booking/favorites.ts';
const owner='+79001234567';
const fixture=()=>{const s=ensureAccount(initialCommerce(),owner);s.search={city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2,childrenAges:[]};return s;};
test('Старое избранное доступно без миграции хранилища и раздельно по владельцам',()=>{
 const s={...fixture(),savedHotels:{[owner]:['orbit-sea','pine-sochi'],other:['orbit-city']}};
 assert.deepEqual(favoriteItems(s,owner,'inbox'),['orbit-sea','pine-sochi']);
 const n=setFavorite(saveFavoriteList(s,owner,'sea','Море'),owner,'orbit-sea','sea');
 assert.deepEqual(favoriteItems(n,owner,'inbox'),['pine-sochi']);assert.deepEqual(favoriteItems(n,'other','inbox'),['orbit-city']);
 assert.deepEqual(s.savedHotels[owner],['orbit-sea','pine-sochi']);assert.deepEqual(decodeCommerce(JSON.stringify(n)),n);
});
test('Названия нормализуются, пустые и дубликаты не создаются; переименование сохраняет состав',()=>{
 let s=saveFavoriteList(fixture(),owner,'a','  Море   осенью ');s=setFavorite(s,owner,'orbit-sea','a');
 assert.equal(favoriteLibrary(s,owner).lists[1].name,'Море осенью');
 assert.throws(()=>saveFavoriteList(s,owner,'b','море осенью'),/уже есть/);
 assert.throws(()=>saveFavoriteList(s,owner,'b',' '),/Введите/);assert.throws(()=>saveFavoriteList(s,owner,'b','x'.repeat(61)),/60/);
 assert.throws(()=>saveFavoriteList(s,owner,'inbox','Другое'),/нельзя/);
 s=saveFavoriteList(s,owner,'a','Отпуск');assert.deepEqual(favoriteItems(s,owner,'a'),['orbit-sea']);
});
test('Перенос сохраняет заметку, повторное сохранение не дублирует отель',()=>{
 let s=saveFavoriteList(fixture(),owner,'a','Отпуск');s=setFavorite(s,owner,'orbit-sea','inbox');s=saveFavoriteNote(s,owner,'orbit-sea','Красивый пляж');
 s=setFavorite(s,owner,'orbit-sea','a');s=setFavorite(s,owner,'orbit-sea','a');
 assert.deepEqual(favoriteItems(s,owner,'inbox'),[]);assert.deepEqual(s.savedHotels[owner],['orbit-sea']);assert.equal(favoriteLibrary(s,owner).notes['orbit-sea'],'Красивый пляж');
 assert.throws(()=>setFavorite(s,owner,'orbit-sea','missing'),/не найден/);
});
test('Удаление списка оставляет отели и заметки; удаление сердца не меняет бронь и платёж',()=>{
 let s=setFavorite(saveFavoriteList(fixture(),owner,'a','Море'),owner,'orbit-sea','a');s=saveFavoriteNote(s,owner,'orbit-sea','Заметка');s=favoriteNavigation(s,owner,{selectedId:'a',returnTo:'trips'});
 const bookings=s.bookings,payment=s.payment;
 s=deleteFavoriteList(s,owner,'a');assert.deepEqual(favoriteItems(s,owner,'inbox'),['orbit-sea']);assert.equal(favoriteLibrary(s,owner).selectedId,'inbox');assert.equal(favoriteLibrary(s,owner).notes['orbit-sea'],'Заметка');
 assert.throws(()=>deleteFavoriteList(s,owner,'inbox'),/нельзя/);
 s=setFavorite(s,owner,'orbit-sea',null);assert.deepEqual(s.savedHotels[owner],[]);assert.equal(favoriteLibrary(s,owner).notes['orbit-sea'],undefined);assert.equal(s.bookings,bookings);assert.equal(s.payment,payment);
});
test('Заметка ограничена 1000 символами, пустое сохранение удаляет только заметку',()=>{
 let s=setFavorite(fixture(),owner,'orbit-sea','inbox');s=saveFavoriteNote(s,owner,'orbit-sea','я'.repeat(1000));assert.equal(favoriteLibrary(s,owner).notes['orbit-sea'].length,1000);
 assert.throws(()=>saveFavoriteNote(s,owner,'orbit-sea','я'.repeat(1001)),/1000/);assert.throws(()=>saveFavoriteNote(s,'other','orbit-sea','Текст'),/не в избранном/);
 s=saveFavoriteNote(s,owner,'orbit-sea','  ');assert.equal(favoriteLibrary(s,owner).notes['orbit-sea'],undefined);assert.deepEqual(s.savedHotels[owner],['orbit-sea']);
});
test('Цена рассчитывается на даты списка; поиск и его фильтры независимы',()=>{
 let s=setFavorite({...fixture(),searchFilters:['Несуществующий'],collection:'discount',maxNightly:1},owner,'orbit-sea','inbox');
 const before=favoriteOffers(s,owner,'inbox')[0].quote;assert.ok(before);
 const search={...s.search,checkOut:'2026-11-17'};s=saveFavoriteSearch(s,owner,'inbox',search);
 const after=favoriteOffers(s,owner,'inbox')[0].quote;assert.equal(after.lodgingMinor,before.lodgingMinor*2);assert.equal(s.search.checkOut,'2026-11-15');assert.deepEqual(s.searchFilters,['Несуществующий']);
 assert.throws(()=>saveFavoriteSearch(s,owner,'inbox',{...search,checkOut:search.checkIn}),/выезд/);
});
test('Недоступный на даты отель остаётся в списке, вместо неправильной цены возвращается null',()=>{
 let s=setFavorite(fixture(),owner,'orbit-sea','inbox');s=saveFavoriteSearch(s,owner,'inbox',{...s.search,checkIn:'2028-01-01',checkOut:'2028-01-03'});
 assert.equal(favoriteOffers(s,owner,'inbox').length,1);assert.equal(favoriteOffers(s,owner,'inbox')[0].quote,null);assert.throws(()=>startFavoriteBooking(s,owner,'inbox','orbit-sea','new'),/нет доступных/);
});
test('Отель наследует параметры списка; возврат и цена сохраняются после reload',()=>{
 let s=setFavorite(saveFavoriteList(fixture(),owner,'a','Море'),owner,'orbit-sea','a');s=saveFavoriteSearch(s,owner,'a',{...s.search,adults:1,checkOut:'2026-11-16'});
 const n=decodeCommerce(JSON.stringify(startFavoriteBooking(s,owner,'a','orbit-sea','draft')));
 assert.equal(n.draft.returnTo,'favorite-list');assert.equal(n.draft.favoriteListId,'a');assert.equal(n.draft.search.adults,1);assert.equal(n.draft.search.checkOut,'2026-11-16');assert.deepEqual(n.search,s.search);
 assert.equal(quoteDraft(n,owner).cashDueMinor,favoriteOffers(s,owner,'a')[0].quote.cashDueMinor);
 assert.throws(()=>startFavoriteBooking(s,'other','a','orbit-sea','draft'),/не найден/);
});
