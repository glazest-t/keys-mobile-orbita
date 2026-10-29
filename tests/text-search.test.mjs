import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,decodeCommerce,quoteDraft} from '../app/src/booking/model.ts';
import {freeTextDraft,saveFreeText,preferenceDraft,savePreferences,newPreferenceDraft,preferenceError,preferenceOffers,startPreferenceBooking} from '../app/src/booking/preferences.ts';
import {applyPreferenceWish} from '../app/src/booking/preferenceIdeas.ts';
const owner='+79001112233';
const fixture=()=>{const s=ensureAccount(initialCommerce(),owner);s.search={...s.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2,childrenAges:[]};return s;};
test('Текстовый вход берёт параметры поиска без неявного выбора компании',()=>{
 const s=fixture(),d=freeTextDraft(s,owner);assert.equal(d.source,'text');assert.equal(d.city,'Сочи');assert.equal(d.party,'');assert.equal(preferenceError(d),'');assert.deepEqual(d.search,{...s.search,withPet:false,businessTrip:false,byCar:false});
 assert.match(preferenceError(newPreferenceDraft(s.search)),/с кем/);
});
test('Текст и пошаговый опрос сохраняются независимо, включая незавершённый ввод',()=>{
 let s=fixture();const q={...newPreferenceDraft(s.search),party:'couple',stage:'topic',interests:['spa'],wishText:'Тишина'};s=savePreferences(s,owner,q);
 const text={...freeTextDraft(s,owner),wishText:'Море и бассейн',search:{...s.search,adults:1}};
 const next=decodeCommerce(JSON.stringify(saveFreeText(s,owner,text)));
 assert.deepEqual(preferenceDraft(next,owner),q);assert.deepEqual(freeTextDraft(next,owner),text);assert.deepEqual(next.search,s.search);assert.equal(freeTextDraft(next,'other').wishText,undefined);
});
test('Текст не влияет на результат до применения; ограничения дат и бюджета общие',()=>{
 const s=fixture(),d={...freeTextDraft(s,owner),wishText:'Бассейн'};const applied=applyPreferenceWish(d,['pool']);
 assert.ok(preferenceOffers(s,owner,applied).every(o=>o.matched.some(m=>m.id==='pool')));
 assert.equal(preferenceOffers(s,owner,{...applied,budgetMinor:1}).length,0);
 assert.equal(preferenceOffers(s,owner,{...applied,search:{...d.search,checkOut:d.search.checkIn}}).length,0);
 assert.equal(d.wishInterests,undefined);
});
test('Отель получает текстовый контекст и постоянный возврат, обычный поиск и опрос целы',()=>{
 let s=fixture();const q={...newPreferenceDraft(s.search),party:'work',interests:['quiet']};s=savePreferences(s,owner,q);
 const d={...applyPreferenceWish({...freeTextDraft(s,owner),wishText:'Море'},['sea']),stage:'results',search:{...s.search,adults:1,checkIn:'2026-11-14',checkOut:'2026-11-16'}};
 s=saveFreeText(s,owner,d);const offer=preferenceOffers(s,owner,d)[0];const next=startPreferenceBooking(s,owner,offer.h.id,'text-booking','text');
 assert.equal(next.draft.returnTo,'wish-search');assert.deepEqual(next.draft.search,d.search);assert.deepEqual(next.search,s.search);assert.deepEqual(preferenceDraft(next,owner),q);assert.equal(quoteDraft(next,owner).cashDueMinor,offer.q.cashDueMinor);
 const restored=decodeCommerce(JSON.stringify(next));assert.equal(restored.draft.returnTo,'wish-search');assert.deepEqual(freeTextDraft(restored,owner),d);
 assert.throws(()=>startPreferenceBooking(s,owner,'missing','bad','text'),/недоступен/);
});
