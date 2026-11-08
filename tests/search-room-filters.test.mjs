import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,startDraft,catalog} from '../app/src/booking/model.ts';
import {discoveryOffers,clearFilters,filterCount} from '../app/src/booking/offers.ts';
import {matchesRoom,roomArea} from '../app/src/booking/searchFacets.ts';
import {roomVisual} from '../app/src/booking/roomVisuals.ts';
import {roomBeds} from '../app/src/booking/roomOffers.ts';
import {searchOptions,updateSearchOptions,token,roomAreaGroup} from '../app/src/booking/filterSchema.ts';
const state=(filters=[])=>({...initialCommerce(),search:{city:'Казань',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]},searchFilters:filters});
test('Типы кроватей выбираются как альтернативы; дополнительные кровати не становятся twin',()=>{
 const bunk=token('Выбор кровати','Двухъярусная'),sofa=token('Выбор кровати','Диван-кровать');
 assert.equal(matchesRoom(state([bunk]),'kazan-hostel-room'),true);
 assert.equal(matchesRoom(state([bunk]),'kazan-country-room'),false);
 assert.equal(matchesRoom(state([bunk,sofa]),'kazan-country-room'),true);
 assert.ok(roomBeds('kazan-hostel-room').includes('bunk'));
 assert.ok(roomBeds('sea-suite').includes('cot'));
});
test('Площадь едина с карточками, граница включительна, комнаты и кровати совпадают на одном номере',()=>{
 for(const r of catalog.rooms){const area=roomArea(r.id);assert.equal(area,roomVisual(r.id).area);assert.equal(matchesRoom(state([token(roomAreaGroup,String(area))]),r.id),true);assert.equal(matchesRoom(state([token(roomAreaGroup,String(area+1))]),r.id),false);}
 const s=state([token('Комнаты','2 спальни и больше'),token('Комнаты','Две ванные и больше'),token('Выбор кровати','Диван-кровать'),token(roomAreaGroup,'90')]);
 const offers=discoveryOffers(s,null);assert.deepEqual(offers.map(x=>x.h.id),['kazan-country']);
 const d=startDraft(s,offers[0].h.id,'area-test');assert.equal(matchesRoom(s,d.draft.roomId),true);
 assert.equal(matchesRoom(state([token('Комнаты','Своя ванная')]),'kazan-hostel-room'),false);
});
test('Площадь применяется, сохраняется в настройках и сбрасывается вместе с фильтрами',()=>{
 const draft=state([token(roomAreaGroup,'48')]);const applied=updateSearchOptions(state(),searchOptions(draft));
 assert.deepEqual(applied.searchFilters,draft.searchFilters);assert.equal(filterCount(applied),1);
 assert.equal(clearFilters(applied).searchFilters.length,0);
 assert.deepEqual(discoveryOffers(state([token(roomAreaGroup,'9999')]),null),[]);
});
