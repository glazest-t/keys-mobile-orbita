import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,catalog} from '../app/src/booking/model.ts';
import {roomOffers,selectRoomRate} from '../app/src/booking/roomOffers.ts';
import {ensureDemoHotelPoints} from '../app/src/rewards/loyalty.ts';
import {rateAppearance,canBookRate} from '../app/src/booking/rateAccess.ts';
const owner='+79990000003',closed=catalog.rates.find(r=>r.id==='sea-standard-connoisseur');
function setup(){return startDraft(ensureAccount(initialCommerce(),owner),'orbit-sea','access');}
test('Стиль тарифа определяется доступом, а не процентом скидки',()=>{
 const s=setup(),q=quoteDraft(s,owner);assert.ok(q.hotelDiscountMinor>0);
 assert.equal(rateAppearance(catalog.rates.find(r=>r.id===s.draft.rateId)),'');
 assert.equal(rateAppearance(closed),'loyalty');assert.equal(rateAppearance({kind:'friendly_rate',hotelId:'orbit-sea'}),'friendly');
});
test('Закрытый тариф скрыт и недоступен ниже уровня и без программы',()=>{
 const s=setup();assert.equal(canBookRate(s,owner,closed),false);assert.ok(roomOffers(s,owner).every(o=>o.rates.every(r=>r.rate.id!==closed.id)));
 assert.throws(()=>selectRoomRate(s,owner,closed.id),/уровня/);
 assert.throws(()=>quoteDraft({...s,draft:{...s.draft,rateId:closed.id}},owner),/уровня/);
 const eligible=ensureDemoHotelPoints(s,owner);assert.ok(canBookRate(eligible,owner,closed));
 eligible.hotelMemberships={[owner]:{'orbit-sea':false}};assert.equal(canBookRate(eligible,owner,closed),false);
});
test('Ценитель видит закрытый и обычные тарифы; Friendly Rate только при подтверждении',()=>{
 const s=ensureDemoHotelPoints(setup(),owner),offers=roomOffers(s,owner)[0].rates;
 assert.ok(offers.some(r=>r.rate.id===closed.id));assert.ok(offers.some(r=>r.rate.kind==='standard'));
 const selected=selectRoomRate(s,owner,closed.id);assert.equal(quoteDraft(selected,owner).rateKind,'hotel_loyalty');
 assert.ok(offers.every(r=>r.rate.kind!=='friendly_rate'));
 s.accounts[owner].hotelierStatus='approved';assert.ok(roomOffers(s,owner)[0].rates.some(r=>r.rate.kind==='friendly_rate'));
});
