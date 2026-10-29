import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking} from '../app/src/booking/model.ts';
import {roomOffers,roomQuote,selectRoomRate,emptyRoomFilters,updateRoomSearch} from '../app/src/booking/roomOffers.ts';
const owner='+79001234567';
function base(){const s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2};return startDraft(s,'orbit-sea','room-test');}
test('Категории учитывают вместимость и наличие независимо друг от друга',()=>{const s=base();assert.equal(roomOffers(s,owner).length,3);s.draft.search.adults=3;assert.deepEqual(roomOffers(s,owner).map(o=>o.room.id),['sea-deluxe','sea-suite']);s.draft.search.adults=4;assert.deepEqual(roomOffers(s,owner).map(o=>o.room.id),['sea-suite']);assert.equal(roomOffers(s,owner,{...emptyRoomFilters,bed:'twin'}).length,0);});
test('Обычный гость не видит FR и не может выбрать его напрямую',()=>{const s=base();assert.ok(roomOffers(s,owner).every(o=>o.rates.every(r=>r.rate.kind!=='friendly_rate')));assert.throws(()=>selectRoomRate(s,owner,'sea-friendly-rate'),/отельерам/);s.accounts[owner].hotelierStatus='approved';assert.ok(roomOffers(s,owner)[0].rates.some(r=>r.rate.kind==='friendly_rate'));const selected=selectRoomRate(s,owner,'sea-friendly-rate');selected.draft.usePoints=true;const q=quoteDraft(selected,owner);assert.equal(q.hotelDiscountMinor,0);assert.equal(q.applied.hotelPoints,0);assert.ok(q.applied.keysPoints>0);});
test('Выбор номера сохраняет контакты и услуги, цена карточки равна оформлению',()=>{const s=base();s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};s.draft.services=['sea-transfer'];const q=roomQuote(s,owner,'sea-deluxe-rate');const next=selectRoomRate(s,owner,'sea-deluxe-rate');assert.equal(next.draft.roomId,'sea-deluxe');assert.deepEqual(next.draft.contact,s.draft.contact);assert.deepEqual(next.draft.services,s.draft.services);assert.equal(quoteDraft(next,owner).lodgingMinor,q.lodgingMinor);assert.equal(quoteDraft(next,owner).cashDueMinor,q.lodgingMinor+250000);const paid=commitBooking(next,owner,quoteDraft(next,owner),'success','2026-10-22T12:00:00Z');assert.equal(paid.bookings[0].draft.roomId,'sea-deluxe');});
test('Включённый завтрак не оплачивается повторно как услуга',()=>{const s=base();s.draft.services=['sea-breakfast','sea-transfer'];const next=selectRoomRate(s,owner,'sea-standard-breakfast');assert.deepEqual(next.draft.services,['sea-transfer']);assert.equal(quoteDraft(next,owner).serviceTotalMinor,250000);assert.ok(roomOffers(s,owner,{...emptyRoomFilters,breakfast:true}).every(o=>o.rates.every(r=>r.rate.mealPlan==='breakfast')));});
test('Нельзя выбрать чужой отель или номер без мест; фильтр отмены использует дату',()=>{const s=base();assert.throws(()=>selectRoomRate(s,owner,'forest-standard-rate'),/недоступно/);s.draft.search.checkOut='2026-11-20';assert.throws(()=>selectRoomRate(s,owner,'sea-deluxe-rate'),/недоступно/);const current=base();assert.equal(roomOffers(current,owner,{...emptyRoomFilters,freeCancellation:true},Date.parse('2026-11-12T12:00:00Z')).length,0);});
test('Завтрак из фильтра выдачи сохраняется в начальном предложении',()=>{const s=base();s.searchFilters=['Завтрак включён'];const next=startDraft(s,'orbit-sea','breakfast-entry');assert.equal(next.draft.rateId,'sea-standard-breakfast');assert.equal(quoteDraft(next,owner).lodgingMinor,3268000);});

test('Изменение гостей в выборе номера предлагает подходящую категорию и сохраняет остальной черновик',()=>{const s=base();s.draft.contact.name='Анна';const next=updateRoomSearch(s,owner,{...s.draft.search,adults:3});assert.equal(next.draft.roomId,'sea-deluxe');assert.equal(next.draft.contact.name,'Анна');assert.equal(s.draft.roomId,'sea-standard');assert.throws(()=>updateRoomSearch(s,owner,{...s.draft.search,adults:4,childrenAges:[5]}),/Нет доступных/);});

test('Незавершённые данные второго гостя сохраняются, но не пропускаются в подтверждение', async()=>{
 const {additionalGuestError}=await import('../app/src/booking/model.ts');
 const s=base();s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};
 s.draft.additionalGuest={name:'Иван',surname:''};
 const next=selectRoomRate(s,owner,'sea-deluxe-rate');
 assert.equal(next.draft.additionalGuest.name,'Иван');
 assert.match(additionalGuestError(next.draft),/имя и фамилию/);
 assert.throws(()=>commitBooking(next,owner,quoteDraft(next,owner),'success','2026-10-22T12:00:00Z'),/второго гостя/);
 next.draft.additionalGuest={...next.draft.additionalGuest,surname:'Примеров'};
 const paid=commitBooking(next,owner,quoteDraft(next,owner),'success','2026-10-22T12:00:00Z');
 assert.deepEqual(paid.bookings[0].draft.additionalGuest,{name:'Иван',surname:'Примеров'});
 assert.equal(paid.bookings[0].owner,owner);
 assert.equal(s.draft.additionalGuest.surname,'');
});


test('После изменения состава на одного человека второй гость убирается из черновика',()=>{
 const s=base();s.draft.additionalGuest={name:'Иван',surname:'Примеров'};
 const next=updateRoomSearch(s,owner,{...s.draft.search,adults:1});
 assert.equal(next.draft.additionalGuest,undefined);
 assert.equal(s.draft.additionalGuest.name,'Иван');
});
