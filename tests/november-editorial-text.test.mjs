import test from 'node:test';
import assert from 'node:assert/strict';
import '../app/src/prototypeText.ts';
import {novemberEditorialText} from '../prototype/domain/novemberEditorialText.mjs';
import {favoriteCountLabel,favoriteListName,favoriteLibrary,saveFavoriteList,setFavorite,saveFavoriteNote,INBOX} from '../app/src/booking/favorites.ts';
import {initialCommerce} from '../app/src/booking/model.ts';
import {restoreTripByNumber} from '../app/src/profile/history.ts';

function edition(query,run){
 const previous=Object.getOwnPropertyDescriptor(globalThis,'location');
 try{globalThis.location={href:'https://example.test/?'+query};return run();}
 finally{if(previous)Object.defineProperty(globalThis,'location',previous);else delete globalThis.location;}
}

test('November workbook changes only edited November copy and preserves previous editions',()=>{
 for(const query of ['variant=full&text=edited','variant=full&text=standard','variant=november&text=standard']){
  edition(query,()=>assert.equal(novemberEditorialText('Т-0817','Отель не найден','Не нашли этот вариант'),'Отель не найден'));
 }
 edition('variant=november&text=edited',()=>{
  assert.equal(novemberEditorialText('Т-0817','Отель не найден','Не нашли этот вариант'),'Не нашли этот вариант');
 });
});

test('Favorite counters keep numbers and Russian plural boundaries',()=>{
 for(const [mode,words] of [['standard',['отель','отеля','отелей']],['edited',['место','места','мест']]]){
  edition(`variant=november&text=${mode}`,()=>{
   for(const [n,index] of [[0,2],[1,0],[2,1],[4,1],[5,2],[11,2],[12,2],[14,2],[21,0],[22,1],[25,2],[101,0],[111,2]]){
    assert.equal(favoriteCountLabel(n),`${n} ${words[index]}`);
   }
  });
 }
});

test('System inbox copy never renames user collections or changes stored favorite state',()=>{
 const owner='copy-test',base=initialCommerce();
 const save=()=>setFavorite(saveFavoriteList(base,owner,'custom','Без подборки'),'copy-test','orbit-sea','custom');
 const original=edition('variant=november&text=standard',save);
 const revised=edition('variant=november&text=edited',save);
 assert.deepEqual(revised,original);
 const before=structuredClone(revised);
 edition('variant=november&text=edited',()=>{
  const library=favoriteLibrary(revised,owner);
  assert.equal(favoriteListName(library.lists.find(l=>l.id===INBOX)),'Без подборки');
  assert.equal(favoriteListName(library.lists.find(l=>l.id==='custom')),'Без подборки');
  assert.equal(favoriteListName({id:'user-list',name:'Без списка'}),'Без списка');
 });
 edition('variant=november&text=standard',()=>assert.equal(favoriteListName(favoriteLibrary(revised,owner).lists.find(l=>l.id===INBOX)),'Без списка'));
 assert.deepEqual(revised,before);
});

test('Editorial errors keep validation and note limits intact',()=>{
 const owner='copy-test',state=setFavorite(initialCommerce(),owner,'orbit-sea',INBOX);
 const before=structuredClone(state);
 for(const mode of ['standard','edited'])edition(`variant=november&text=${mode}`,()=>{
  assert.throws(()=>setFavorite(state,owner,'missing',INBOX),{message:mode==='edited'?'Не нашли этот вариант':'Отель не найден'});
  assert.throws(()=>saveFavoriteNote(state,owner,'orbit-sea','x'.repeat(1001)),{message:mode==='edited'?'Не больше 1 000 символов':'Не больше 1000 символов'});
  assert.equal(favoriteLibrary(saveFavoriteNote(state,owner,'orbit-sea','x'.repeat(1000)),owner).notes['orbit-sea'].length,1000);
  assert.throws(()=>restoreTripByNumber(state,owner,'MISSING'),{message:mode==='edited'?'Не нашли бронь. Проверьте номер и попробуйте ещё раз':'Бронь не найдена. Проверьте номер бронирования'});
 });
 assert.deepEqual(state,before);
});
