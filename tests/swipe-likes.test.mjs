import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,decodeCommerce} from '../app/src/booking/model.ts';
import {saveSwipeLike,SWIPE_LIST,favoriteLibrary,favoriteItems,saveFavoriteList,setFavorite,saveFavoriteNote} from '../app/src/booking/favorites.ts';
const owner='swipe-test';
test('Лайк автоматически создаёт подборку; повторный лайк не удаляет отель и не дублирует список',()=>{
 const initial=initialCommerce(),once=saveSwipeLike(initial,owner,'orbit-sea'),twice=saveSwipeLike(once,owner,'orbit-sea');
 assert.deepEqual(twice,once);assert.deepEqual(favoriteItems(twice,owner,SWIPE_LIST),['orbit-sea']);
 assert.equal(favoriteLibrary(twice,owner).lists.filter(l=>l.name==='Подбор по свайпу').length,1);
 assert.deepEqual(initial.savedHotels,undefined);assert.deepEqual(twice.search,initial.search);
 assert.deepEqual(favoriteItems(decodeCommerce(JSON.stringify(twice)),owner,SWIPE_LIST),['orbit-sea']);
});
test('Готовая одноимённая подборка используется без дубликата и сохраняет свои параметры',()=>{
 const initial=initialCommerce(),customSearch={...initial.search,adults:1};
 const s=saveFavoriteList(initial,owner,'existing','Подбор по свайпу',customSearch),next=saveSwipeLike(s,owner,'orbit-sea');
 assert.deepEqual(favoriteItems(next,owner,'existing'),['orbit-sea']);assert.equal(favoriteLibrary(next,owner).lists.some(l=>l.id===SWIPE_LIST),false);
 assert.deepEqual(favoriteLibrary(next,owner).lists.find(l=>l.id==='existing').search,favoriteLibrary(s,owner).lists.find(l=>l.id==='existing').search);
});
test('Лайк сохранённого отеля переносит его с заметкой, не меняя другие аккаунты и контекст ручного сохранения',()=>{
 let s=saveFavoriteList(initialCommerce(),owner,'other-list','Мои отели');s=setFavorite(s,owner,'orbit-sea','other-list');s=saveFavoriteNote(s,owner,'orbit-sea','Тихий номер');
 const next=saveSwipeLike(s,owner,'orbit-sea');assert.deepEqual(favoriteItems(next,owner,SWIPE_LIST),['orbit-sea']);assert.deepEqual(favoriteItems(next,owner,'other-list'),[]);
 assert.equal(favoriteLibrary(next,owner).notes['orbit-sea'],'Тихий номер');assert.equal(favoriteLibrary(next,owner).selectedId,favoriteLibrary(s,owner).selectedId);assert.deepEqual(favoriteItems(next,'another',SWIPE_LIST),[]);
});
