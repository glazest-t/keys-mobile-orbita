import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,decodeCommerce,additionalGuestError} from '../app/src/booking/model.ts';
import {bookingGuests,updateGuest,prefillAdditionalGuest,wishSummary} from '../app/src/booking/bookingParty.ts';
import {updateRoomSearch} from '../app/src/booking/roomOffers.ts';
const owner='+79001234567',now='2026-10-22T12:00:00Z';
function base(){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:4};s=startDraft(s,'orbit-sea','party-test');s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};return s;}
test('Старые черновики со вторым гостем читаются без миграции',()=>{const s=base();s.draft.additionalGuest={name:'Иван',surname:'Примеров'};assert.deepEqual(bookingGuests(decodeCommerce(JSON.stringify(s)).draft),[s.draft.additionalGuest]);});
test('Полный состав и пожелания сохраняются отдельным снимком, не меняя цену',()=>{
 const s=base(),q=quoteDraft(s,owner);
 for(const [i,name] of ['Иван','Мария','Алексей'].entries())Object.assign(s.draft,updateGuest(s.draft,i,{name,surname:'Примеров'}));
 s.draft.stayWishes={options:['Тихий номер'],note:'Подальше от лифта'};
 assert.deepEqual(quoteDraft(s,owner),q);
 const paid=commitBooking(s,owner,q,'success',now),b=decodeCommerce(JSON.stringify(paid)).bookings[0];
 assert.equal(bookingGuests(b.draft).length,3);assert.equal(wishSummary(b.draft),'Тихий номер · Подальше от лифта');
 s.draft.otherGuests[0].name='Изменено';s.draft.stayWishes.note='Другое';
 assert.equal(bookingGuests(paid.bookings[0].draft)[1].name,'Мария');assert.equal(paid.bookings[0].draft.stayWishes.note,'Подальше от лифта');
});
test('Неполный третий гость блокирует подтверждение; удаление восстанавливает путь',()=>{
 const s=base();Object.assign(s.draft,updateGuest(s.draft,0,{name:'Иван',surname:'Примеров'}));Object.assign(s.draft,updateGuest(s.draft,1,{name:'Мария',surname:''}));
 assert.match(additionalGuestError(s.draft),/гостя 3/);assert.throws(()=>commitBooking(s,owner,quoteDraft(s,owner),'success',now),/гостя 3/);
 Object.assign(s.draft,updateGuest(s.draft,1,null));assert.equal(additionalGuestError(s.draft),'');
 assert.equal(commitBooking(s,owner,quoteDraft(s,owner),'success',now).bookings.length,1);
});
test('Уменьшение состава убирает лишние контакты, питомец не создаёт место гостя',()=>{
 const s=base();for(let i=0;i<3;i++)Object.assign(s.draft,updateGuest(s.draft,i,{name:'Иван',surname:'Примеров'}));
 const two=updateRoomSearch(s,owner,{...s.draft.search,adults:2});assert.equal(bookingGuests(two.draft).length,1);
 const one=updateRoomSearch(two,owner,{...two.draft.search,adults:1,withPet:true});assert.equal(bookingGuests(one.draft).length,0);
 assert.throws(()=>updateGuest(one.draft,0,{name:'Иван',surname:'Примеров'}),/состав/);assert.equal(bookingGuests(s.draft).length,3);
});
test('Добавление гостя бесшовно подставляет следующего путешественника, не меняя профиль и существующий ввод',()=>{
 const d=base().draft;
 const user={phone:owner,name:d.contact.name,travelers:[{...d.contact,primary:true},{name:'Иван',surname:'Примеров'},{name:'Мария',surname:'Примерова'},{name:'',surname:'Примеров'}]};
 const before=structuredClone(user),first=prefillAdditionalGuest(d,user,0);
 assert.equal(first.additionalGuest.name,'Иван');assert.equal(d.additionalGuest,undefined);assert.deepEqual(user,before);
 const second=prefillAdditionalGuest(first,user,1);assert.equal(second.otherGuests[0].name,'Мария');
 assert.equal(prefillAdditionalGuest(second,user,2),second);
 const edited={...first,additionalGuest:{name:'Другое',surname:''}};
 assert.equal(prefillAdditionalGuest(edited,user,0),edited);
 assert.equal(prefillAdditionalGuest(d,null,0),d);
 assert.equal(prefillAdditionalGuest({...d,search:{...d.search,adults:1}},user,0).additionalGuest,undefined);
});

test('Ошибка оплаты сохраняет гостей и пожелания без создания брони; слишком длинное пожелание отклоняется',()=>{
 const s=base();s.draft.stayWishes={options:[],note:'Тихий номер'};const before=structuredClone(s);
 assert.throws(()=>commitBooking(s,owner,quoteDraft(s,owner),'failure',now),/Оплата не прошла/);assert.deepEqual(s,before);
 s.draft.stayWishes.note='а'.repeat(501);assert.throws(()=>commitBooking(s,owner,quoteDraft(s,owner),'success',now),/500/);
});

test('Бронь для другого: выбор путешественника и владелец независимы; дубль гостя убирается',async()=>{
 const {selectBookingPerson,changeBookingFor,availableBookingTravelers}=await import('../app/src/booking/bookingGuestSelection.ts');
 const {blankTraveler}=await import('../app/src/state.ts');
 const s=base(),user={phone:owner,name:'Анна',travelers:[{...blankTraveler('self'),...s.draft.contact,primary:true},{...blankTraveler('friend'),name:'Иван',surname:'Орлов',phone:'+447700900123',email:'ivan@example.test'},{...blankTraveler('third'),name:'Мария',surname:'Орлова',phone:'+79995550123'}]};
 const original=structuredClone(user),before=quoteDraft(s,owner);
 const empty={...s.draft,...changeBookingFor(s.draft,user,'other')};assert.equal(empty.contact.name,'');assert.equal(empty.bookingFor,'other');assert.equal(empty.contact.email,s.draft.contact.email);
 Object.assign(s.draft,updateGuest(s.draft,0,{name:'Иван',surname:'Орлов'}));Object.assign(s.draft,selectBookingPerson(s.draft,user,user.travelers[1]));
 assert.equal(s.draft.contact.name,'Иван');assert.equal(s.draft.contact.phone,'+447700900123');assert.equal(bookingGuests(s.draft).length,0);assert.equal(s.draft.bookingFor,'other');
 assert.deepEqual(availableBookingTravelers(s.draft,user).map(t=>t.id),['self','third']);
 assert.deepEqual(quoteDraft(s,owner),before);
 const booked=commitBooking(s,owner,quoteDraft(s,owner),'success',now),record=decodeCommerce(JSON.stringify(booked)).bookings[0];
 assert.equal(record.owner,owner);assert.equal(record.draft.contact.name,'Иван');assert.equal(record.draft.guestTravelerId,'friend');assert.deepEqual(user,original);
 const restored={...s.draft,...changeBookingFor(s.draft,user,'self')};assert.equal(restored.contact.name,'Анна');assert.equal(restored.contact.phone,owner);
 assert.throws(()=>selectBookingPerson(s.draft,user,{...user.travelers[1],id:'missing'}),/не найден/);
});
