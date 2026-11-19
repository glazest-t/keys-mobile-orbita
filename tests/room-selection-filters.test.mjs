import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,startDraft} from '../app/src/booking/model.ts';
import {roomOffers,selectRoomRate,updateRoomSearch} from '../app/src/booking/roomOffers.ts';
import {activeRoomFilters,emptyRoomSelectionFilters,roomFiltersFromSearch,updateRoomFilters} from '../app/src/booking/roomFilters.ts';
const setup=(searchFilters=[])=>startDraft({...initialCommerce(),search:{city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]},searchFilters},'orbit-sea','room-filters');
const now=Date.parse('2026-11-01T12:00:00Z');
test('Фильтры поиска копируются в номер, включая прежние короткие названия',()=>{
 const state=setup(['С завтраком','Выбор кровати: Одна двуспальная','Оплата: Оплата на месте','Оплата: Бесплатная отмена']);
 assert.deepEqual(activeRoomFilters(state),{meals:['Завтрак включён'],beds:['Одна двуспальная'],views:[],payments:['at_hotel'],cancellations:['free']});
 const offers=roomOffers(state,null,undefined,now);
 assert.ok(offers.length);assert.ok(offers.every(o=>o.rates.every(r=>r.rate.mealPlan==='breakfast')));
 state.searchFilters=[];assert.deepEqual(activeRoomFilters(state).meals,['Завтрак включён']);
});
test('Условия разных групп пересекаются на одном номере и тарифе; значения внутри группы — альтернативы',()=>{
 let state=updateRoomFilters(setup(),{...emptyRoomSelectionFilters(),meals:['Завтрак включён'],beds:['Две односпальные'],views:['Вид на море']});
 assert.deepEqual(roomOffers(state,null).map(o=>o.room.id),['sea-deluxe']);
 assert.ok(roomOffers(state,null).every(o=>o.rates.every(r=>r.rate.mealPlan==='breakfast')));
 state=updateRoomFilters(state,{...activeRoomFilters(state),beds:['Две односпальные','Одна двуспальная'],meals:['Завтрак включён','Без питания']});
 assert.deepEqual(roomOffers(state,null).map(o=>o.room.id),['sea-deluxe','sea-suite']);
 assert.ok(roomOffers(state,null).flatMap(o=>o.rates).some(r=>r.rate.mealPlan==='none'));
});
test('Отмена учитывает дату; текущие тарифы поддерживают онлайн и оплату в отеле',()=>{
 for(const payment of ['online','at_hotel']){
  const state=updateRoomFilters(setup(),{...emptyRoomSelectionFilters(),payments:[payment],cancellations:['free']});
  assert.ok(roomOffers(state,null,undefined,now).length);
  assert.equal(roomOffers(state,null,undefined,Date.parse('2026-11-12T12:00:00Z')).length,0);
  const penalty=updateRoomFilters(state,{...activeRoomFilters(state),cancellations:['penalty']});
  assert.equal(roomOffers(penalty,null,undefined,now).length,0);
  assert.ok(roomOffers(penalty,null,undefined,Date.parse('2026-11-12T12:00:00Z')).length);
 }
});
test('Изменение, возврат и сброс фильтров сохраняют поисковые условия отелей',()=>{
 const state=setup(['С завтраком']);
 const changed=updateRoomFilters(state,{...activeRoomFilters(state),views:['Вид на море']});
 const chosen=selectRoomRate(changed,null,roomOffers(changed,null)[0].rates[0].rate.id);
 const restored=JSON.parse(JSON.stringify(chosen));assert.deepEqual(activeRoomFilters(restored),activeRoomFilters(changed));
 const dated=updateRoomSearch(restored,null,{...restored.draft.search,adults:3});assert.deepEqual(activeRoomFilters(dated),activeRoomFilters(changed));
 const reset=updateRoomFilters(dated,emptyRoomSelectionFilters());assert.deepEqual(reset.searchFilters,['С завтраком']);
 assert.ok(roomOffers(reset,null).flatMap(o=>o.rates).some(r=>r.rate.mealPlan==='none'));
 assert.deepEqual(activeRoomFilters(state).views,[]);
});
test('Старые черновики получают выбранные условия; кухня не подменяется завтраком',()=>{
 const state=setup(['С завтраком']);delete state.draft.roomFilters;
 assert.deepEqual(activeRoomFilters(state),roomFiltersFromSearch(state.searchFilters));
 const kitchen=updateRoomFilters(setup(),{...emptyRoomSelectionFilters(),meals:['Собственная кухня']});
 assert.equal(roomOffers(kitchen,null).length,0);
 const unknown=updateRoomFilters(setup(),{...emptyRoomSelectionFilters(),views:['Неизвестный вид']});
 assert.equal(roomOffers(unknown,null).length,0);
});
