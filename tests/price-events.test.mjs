import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,decodeCommerce,commitBooking,catalog} from '../app/src/booking/model.ts';
import {savePriceWatch,watchKey,priceWatchEntries,startWatchBooking,replacePriceWatch} from '../app/src/booking/priceWatch.ts';
import {applyPriceEvent,userPriceNotices,readPriceNotices,openPriceNotice} from '../app/src/booking/priceEvents.ts';
import {roomQuote,roomOffers} from '../app/src/booking/roomOffers.ts';
const owner='anna';
function setup(options={}){const base=ensureAccount(initialCommerce(),owner);base.search={...base.search,checkIn:'2026-11-13',checkOut:'2026-11-15'};const s=startDraft(base,'orbit-sea','draft');const priceMinor=quoteDraft(s,owner).lodgingMinor;return savePriceWatch(s,owner,s.draft,{priceMinor,mode:'any',targetMinor:null,push:true,active:true,...options});}
test('Событие -5500 согласует список, отель, тариф и новую бронь; сохранение после reload',()=>{
 const s=setup(),key=watchKey(owner,s.draft),old=quoteDraft(s,owner).lodgingMinor,next=applyPriceEvent(s,owner,key,-550000,'drop');
 assert.equal(priceWatchEntries(next,owner)[0].currentMinor,old-550000);assert.equal(quoteDraft(next,owner).lodgingMinor,old-550000);assert.equal(roomQuote(next,owner,s.draft.rateId).lodgingMinor,old-550000);
 const booking=startWatchBooking(decodeCommerce(JSON.stringify(next)),owner,key,'new');assert.equal(quoteDraft(booking,owner).cashDueMinor,old-550000);assert.equal(next.priceWatches[key].priceMinor,old);assert.deepEqual(next.search,s.search);assert.deepEqual(next.bookings,s.bookings);
});
test('Событие идемпотентно, увеличение меняет цену без уведомления',()=>{
 const s=setup(),key=watchKey(owner,s.draft),next=applyPriceEvent(s,owner,key,-550000,'drop');assert.equal(applyPriceEvent(next,owner,key,-550000,'drop'),next);assert.equal(next.priceNotices.length,1);
 const up=applyPriceEvent(next,owner,key,550000,'up');assert.equal(quoteDraft(up,owner).lodgingMinor,quoteDraft(s,owner).lodgingMinor);assert.equal(up.priceNotices.length,1);
});
test('Пауза не уведомляет, push=false не отключает внутреннюю историю',()=>{
 for(const active of [false,true]){const s=setup({active,push:false}),next=applyPriceEvent(s,owner,watchKey(owner,s.draft),-550000,'drop');assert.equal(next.priceNotices.length,active?1:0);}
});
test('Моя цена уведомляет только при пересечении порога, не при любом снижении',()=>{
 const s=setup({mode:'target',targetMinor:2000000}),key=watchKey(owner,s.draft),first=applyPriceEvent(s,owner,key,-100000,'first');assert.equal(first.priceNotices.length,0);
 const crossed=applyPriceEvent(first,owner,key,-600000,'crossed');assert.equal(crossed.priceNotices.length,1);
 const further=applyPriceEvent(crossed,owner,key,-100000,'further');assert.equal(further.priceNotices.length,1);
});
test('Уведомления и изменение предложения изолированы по владельцу/дате/тарифу',()=>{
 const s=setup(),key=watchKey(owner,s.draft),next=applyPriceEvent(s,owner,key,-550000,'drop');assert.throws(()=>applyPriceEvent(next,'other',key,-1,'foreign'),/не найдено/);assert.equal(userPriceNotices(next,'other').length,0);
 assert.equal(quoteDraft(next,'other').lodgingMinor,quoteDraft(s,'other').lodgingMinor);
 const shifted={...next,draft:{...next.draft,search:{...next.draft.search,checkIn:'2026-11-14',checkOut:'2026-11-16'}}};assert.equal(quoteDraft(shifted,owner).lodgingMinor,quoteDraft(s,owner).lodgingMinor);
});
test('Прочтение и возврат из уведомления сохраняются; удаление наблюдения не ломает историю',()=>{
 const s=setup(),key=watchKey(owner,s.draft),next=applyPriceEvent(s,owner,key,-550000,'drop');const opened=openPriceNotice({...next,priceWatches:{}},owner,'drop','notice-draft');
 assert.equal(opened.draft.returnTo,'notifications');assert.equal(opened.draft.id,'notice-draft');assert.equal(opened.priceNotices[0].read,true);assert.equal(quoteDraft(opened,owner).lodgingMinor,next.priceNotices[0].currentMinor);assert.deepEqual(opened.priceWatches,{});
 assert.equal(readPriceNotices(next,'other').priceNotices[0].read,false);assert.equal(readPriceNotices(next,owner).priceNotices[0].read,true);assert.throws(()=>openPriceNotice(next,'other','drop','x'),/не найдено/);
});
test('Недопустимое событие и будущая история не показываются как наступившие',()=>{
 const s=setup(),key=watchKey(owner,s.draft);for(const delta of [0,NaN,1.2,-999999999])assert.throws(()=>applyPriceEvent(s,owner,key,delta,'bad'));
 const next=applyPriceEvent(s,owner,key,-1,'future','2099-01-01T00:00:00.000Z');assert.equal(userPriceNotices(next,owner).length,0);assert.equal(readPriceNotices(next,owner).priceNotices[0].read,false);
});
test('Замена номера сохраняет одно наблюдение и не меняет черновик/поиск',()=>{
 const s=setup(),nextDraft={...s.draft,roomId:'sea-deluxe',rateId:'sea-deluxe-flexible'},offer=roomOffers(s,owner).find(o=>o.room.id!==s.draft.roomId);assert.ok(offer);
 nextDraft.roomId=offer.room.id;nextDraft.rateId=offer.rates[0].rate.id;const options={mode:'any',targetMinor:null,push:true,active:false,priceMinor:offer.rates[0].quote.lodgingMinor};
 const next=replacePriceWatch(s,owner,s.draft,nextDraft,options);assert.equal(Object.keys(next.priceWatches).length,1);assert.equal(next.priceWatches[watchKey(owner,s.draft)],undefined);assert.equal(next.priceWatches[watchKey(owner,nextDraft)].active,false);assert.equal(next.draft,s.draft);
 const collision=savePriceWatch(s,owner,nextDraft,options);assert.throws(()=>replacePriceWatch(collision,owner,s.draft,nextDraft,options),/уже отслеживаются/);
});
test('После достижения цели можно сохранить push, не меняя ранее установленный порог',()=>{
 const s=setup({mode:'target',targetMinor:2500000}),key=watchKey(owner,s.draft),next=applyPriceEvent(s,owner,key,-550000,'drop');
 const saved=savePriceWatch(next,owner,next.draft,{...next.priceWatches[key],priceMinor:quoteDraft(next,owner).lodgingMinor,push:false});assert.equal(saved.priceWatches[key].targetMinor,2500000);
});

test('Изменение предложения не меняет подтверждённую бронь и её оплату',()=>{
 let s=setup();s.draft.contact={name:'Анна',surname:'Примерова',email:'anna@example.test',phone:'+79990000001'};
 s=commitBooking(s,owner,quoteDraft(s,owner),'success','2026-10-27T12:00:00.000Z');
 const booked=structuredClone(s.bookings),payment=structuredClone(s.payment),next=applyPriceEvent(s,owner,watchKey(owner,s.draft),-550000,'after-booking');
 assert.deepEqual(next.bookings,booked);assert.deepEqual(next.payment,payment);
 assert.notEqual(quoteDraft(next,owner).lodgingMinor,next.bookings[0].quote.lodgingMinor);
});
test('Friendly Rate и цена без программы отеля пересчитываются без лишней скидки',()=>{
 for(const friendly of [false,true]){let s=setup();s.accounts[owner]={loyalty:false,hotelierStatus:'approved'};
 if(friendly){const rate=catalog.rates.find(r=>r.roomId===s.draft.roomId&&r.kind==='friendly_rate');s.draft={...s.draft,rateId:rate.id};s=savePriceWatch(s,owner,s.draft,{mode:'any',active:true,push:true,targetMinor:null,priceMinor:quoteDraft(s,owner).lodgingMinor});}
 const old=quoteDraft(s,owner),next=applyPriceEvent(s,owner,watchKey(owner,s.draft),-550001,'precise');
 const q=quoteDraft(next,owner);assert.equal(q.lodgingMinor,old.lodgingMinor-550001);assert.equal(q.hotelDiscountMinor,0);
 }
});
