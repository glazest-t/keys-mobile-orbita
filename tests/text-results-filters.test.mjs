import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,quoteDraft} from '../app/src/booking/model.ts';
import {freeTextDraft,saveFreeText,preferenceOffers,preferenceSearchCommerce,startPreferenceBooking} from '../app/src/booking/preferences.ts';
import {searchOptions} from '../app/src/booking/filterSchema.ts';
const owner='+79001234567';
function fixture(){const s=ensureAccount(initialCommerce(),owner);s.search={...s.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]};return s;}
function draft(s){return {...freeTextDraft(s,owner),stage:'results',wishText:'Бассейн и тишина',wishAppliedText:'Бассейн и тишина',wishInterests:['pool','quiet']};}
function filters(s,d,patch){return {...d,resultFilters:searchOptions({...preferenceSearchCommerce(s,d),...patch})};}
test('Старые промежуточные этапы открывают выдачу без скрытого района',()=>{
 const s=fixture();for(const stage of ['districts','summary']){const old={...draft(s),stage,district:{city:'Сочи',name:'Сириус'},districtReturn:'summary',summaryFromDistrict:true};const next=freeTextDraft({...s,freeTextDrafts:{[owner]:old}},owner);assert.equal(next.stage,'results');assert.equal(next.wishText,old.wishText);assert.equal('district' in next,false);assert.equal(preferenceOffers(s,owner,next).length,3);}
});
test('Общие фильтры сужают пожелания, сброс сохраняет сам запрос',()=>{
 const s=fixture(),d=draft(s),base=preferenceOffers(s,owner,d);const filtered=filters(s,d,{searchFilters:['Общие удобства: Бассейн']});const results=preferenceOffers(s,owner,filtered);assert.equal(base.length,3);assert.equal(results.length,2);assert.ok(results.every(o=>o.matched.some(m=>m.id==='pool')));assert.equal(preferenceOffers(s,owner,{...filtered,resultFilters:undefined}).length,3);
 assert.equal(preferenceOffers(s,owner,filters(s,d,{priceRangeMinor:{min:null,max:1}})).length,0);
});
test('Явная сортировка цены имеет приоритет перед количеством совпадений',()=>{
 const s=fixture(),d=filters(s,draft(s),{searchSort:'price'}),rows=preferenceOffers(s,owner,d);assert.equal(rows[0].h.id,'pine-sochi');assert.ok(rows.every((row,i)=>!i||row.q.lodgingMinor>=rows[i-1].q.lodgingMinor));
});
test('Тариф с завтраком в выдаче совпадает с бронью, обычный поиск независим',()=>{
 const s=fixture();s.searchFilters=['Общие удобства: Спа'];s.searchSort='price-desc';const before=structuredClone(s),d=filters(s,draft(s),{searchFilters:['Питание: Завтрак включён']});const saved=saveFreeText(s,owner,d),offer=preferenceOffers(saved,owner,d)[0];assert.ok(offer);const next=startPreferenceBooking(saved,owner,offer.h.id,'text-booking','text');assert.equal(quoteDraft(next,owner).cashDueMinor,offer.q.cashDueMinor);assert.deepEqual(next.search,s.search);assert.deepEqual(next.searchFilters,s.searchFilters);assert.equal(next.searchSort,s.searchSort);assert.deepEqual(s,before);assert.equal(next.draft.returnTo,'wish-search');
});
