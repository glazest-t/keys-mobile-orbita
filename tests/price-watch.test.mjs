import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,startDraft,decodeCommerce} from '../app/src/booking/model.ts';
import {watchKey,savePriceWatch} from '../app/src/booking/priceWatch.ts';
const initial=()=>startDraft(initialCommerce(),'orbit-sea','watch-test');
const watch={mode:'target',targetMinor:2000000,push:true,active:true,priceMinor:9000000};
test('Слежение сохраняет порог, push и состояние после загрузки',()=>{const s=initial();const next=decodeCommerce(JSON.stringify(savePriceWatch(s,'anna',s.draft,watch)));assert.deepEqual(next.priceWatches[watchKey('anna',s.draft)],watch);assert.equal(s.priceWatches,undefined);});
test('Слежение разделено по пользователям, датам, гостям и тарифам',()=>{const s=initial(),d=s.draft,key=watchKey('anna',d);assert.notEqual(key,watchKey('max',d));assert.notEqual(key,watchKey('anna',{...d,rateId:'friendly'}));assert.notEqual(key,watchKey('anna',{...d,search:{...d.search,checkOut:'2026-11-18'}}));assert.notEqual(key,watchKey('anna',{...d,search:{...d.search,adults:1}}));assert.equal(key,watchKey('anna',{...d,id:'another-session'}));});
test('Невалидный или не меньший порог не сохраняется',()=>{const s=initial();for(const targetMinor of [0,-1,NaN,Infinity,1.2,watch.priceMinor,watch.priceMinor+1])assert.throws(()=>savePriceWatch(s,'anna',s.draft,{...watch,targetMinor}),/ниже текущей/);});
test('Любое снижение очищает порог; выключение не удаляет настройки',()=>{const s=initial();const any=savePriceWatch(s,null,s.draft,{...watch,mode:'any'});assert.equal(any.priceWatches[watchKey(null,s.draft)].targetMinor,null);const paused=savePriceWatch(any,null,s.draft,{...watch,active:false});assert.equal(paused.priceWatches[watchKey(null,s.draft)].active,false);assert.equal(paused.priceWatches[watchKey(null,s.draft)].targetMinor,watch.targetMinor);});

import {priceWatchEntries,setWatchActive,removePriceWatch,startWatchBooking} from '../app/src/booking/priceWatch.ts';
test('Список читает прежние ключи, отделяет владельцев и не затрагивает поиск',()=>{
 const s=initial(),before=JSON.stringify(s.search);let next=savePriceWatch(s,'anna',s.draft,watch);next=savePriceWatch(next,'max',s.draft,{...watch,active:false});next.priceWatches.bad={...watch};
 const entries=priceWatchEntries(decodeCommerce(JSON.stringify(next)),'anna');assert.equal(entries.length,1);assert.equal(entries[0].draft.hotelId,s.draft.hotelId);assert.deepEqual(entries[0].draft.search,s.draft.search);assert.ok(entries[0].currentMinor>0);assert.equal(JSON.stringify(next.search),before);
});
test('Пауза и возобновление сохраняют настройки; чужое наблюдение защищено',()=>{
 const s=initial(),key=watchKey('anna',s.draft),saved=savePriceWatch(s,'anna',s.draft,watch),paused=setWatchActive(saved,'anna',key,false);
 assert.equal(paused.priceWatches[key].active,false);assert.equal(saved.priceWatches[key].active,true);assert.equal(paused.priceWatches[key].targetMinor,watch.targetMinor);
 assert.equal(setWatchActive(paused,'anna',key,true).priceWatches[key].active,true);
 assert.throws(()=>setWatchActive(saved,'max',key,false),/не найдено/);assert.throws(()=>removePriceWatch(saved,'max',key),/не найдено/);
});
test('Переход в отель использует номер, тариф, даты наблюдения и сохраняет обычный поиск',()=>{
 const s=initial(),key=watchKey('anna',s.draft),saved=savePriceWatch(s,'anna',s.draft,watch);saved.search={...saved.search,city:'Москва',adults:1};
 const opened=startWatchBooking(saved,'anna',key,'new-draft');assert.equal(opened.search.city,'Москва');assert.equal(opened.draft.search.city,s.draft.search.city);assert.equal(opened.draft.id,'new-draft');assert.equal(opened.draft.roomId,s.draft.roomId);assert.equal(opened.draft.rateId,s.draft.rateId);assert.equal(opened.draft.returnTo,'price-watches');assert.equal(opened.draft.services.length,0);assert.equal(opened.draft.usePoints,false);
});
test('Прошедшие даты и закрытый Friendly Rate нельзя возобновить или открыть как доступные',()=>{
 const s=initial(),old={...s.draft,search:{...s.draft.search,checkIn:'2020-01-01',checkOut:'2020-01-03'}},key=watchKey('anna',old),saved=savePriceWatch(s,'anna',old,{...watch,active:false});
 assert.equal(priceWatchEntries(saved,'anna')[0].currentMinor,null);assert.throws(()=>setWatchActive(saved,'anna',key,true),/Даты/);assert.throws(()=>startWatchBooking(saved,'anna',key,'x'),/Даты/);
 const friendly={...s.draft,rateId:'sea-friendly-rate'},fr=savePriceWatch(s,'anna',friendly,watch);assert.match(priceWatchEntries(fr,'anna')[0].unavailable,/статус/);
});
test('Удаление затрагивает только выбранное наблюдение и сохраняется после загрузки',()=>{
 const s=initial(),key=watchKey('anna',s.draft),saved=savePriceWatch(savePriceWatch(s,'anna',s.draft,watch),'max',s.draft,watch),removed=removePriceWatch(saved,'anna',key);
 assert.equal(priceWatchEntries(decodeCommerce(JSON.stringify(removed)),'anna').length,0);assert.equal(priceWatchEntries(removed,'max').length,1);assert.ok(saved.priceWatches[key]);
});
test('Редактирование настроек после изменения цены сохраняет исходную цену для сравнения',()=>{
 const s=initial(),key=watchKey('anna',s.draft),saved=savePriceWatch(s,'anna',s.draft,{...watch,mode:'any',priceMinor:3000000});
 const edited=savePriceWatch(saved,'anna',s.draft,{...watch,mode:'target',priceMinor:2700000,targetMinor:2500000,push:false});
 assert.equal(edited.priceWatches[key].priceMinor,3000000);assert.equal(edited.priceWatches[key].targetMinor,2500000);assert.equal(edited.priceWatches[key].push,false);
 assert.throws(()=>savePriceWatch(saved,'anna',s.draft,{...watch,priceMinor:2700000,targetMinor:2800000}),/ниже текущей/);
});
