import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,decodeCommerce} from '../app/src/booking/model.ts';
import {requestBreakfast} from '../app/src/booking/serviceRequests.ts';
import {respondToService,serviceQuote,payService,cancelPaidService} from '../app/src/booking/serviceSettlement.ts';
import {resetDemoServices} from '../app/src/booking/demoServices.ts';
import {stayBill} from '../app/src/booking/stayBill.ts';
const owner='+79001234567',now='2026-10-26T12:00:00Z',id='reset-services';
function fixture(){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,adults:2,checkIn:'2026-11-13',checkOut:'2026-11-15'};s=startDraft(s,'orbit-sea',id);s.draft.contact={name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'};s=commitBooking(s,owner,quoteDraft(s,owner),'success',now);return s;}
function order(s,key){return respondToService(requestBreakfast(s,owner,id,{mode:'room',date:'2026-11-14',time:'08:00',persons:2,comment:'',additional:true},key,now),owner,id,key,'confirm',now);}
test('Сброс удаляет оплаченные и неоплаченные услуги, сохраняя бронь и восстанавливая баллы один раз',()=>{
 const original=fixture();let s=order(original,'paid');s=payService(s,owner,id,'paid',serviceQuote(s,owner,id,'paid',true,now),'sbp','success',now);s=order(s,'unpaid');const before=structuredClone(s),result=resetDemoServices(s);
 assert.deepEqual(s,before);assert.equal(result.bookings[0].serviceRequests.length,0);assert.deepEqual(result.payment,original.payment);assert.deepEqual(result.bookings[0].draft,original.bookings[0].draft);assert.deepEqual(result.bookings[0].operation,original.bookings[0].operation);assert.equal(stayBill(result.bookings[0]).due,0);assert.equal(resetDemoServices(result),result);assert.deepEqual(decodeCommerce(JSON.stringify(result)),result);
});
test('Уже возвращённые баллы не дублируются; удержанные после срока восстанавливаются при демосбросе',()=>{
 for(const at of [now,'2026-11-13T20:00:00Z']){const original=fixture();let s=order(original,'paid');s=payService(s,owner,id,'paid',serviceQuote(s,owner,id,'paid',true,now),'sbp','success',now);s=cancelPaidService(s,owner,id,'paid',at);assert.deepEqual(resetDemoServices(s).payment,original.payment);}
});
test('Сбрасываются все локальные поездки, включая бесплатные и неподтверждённые заявки',()=>{
 let s=order(fixture(),'pending');s.bookings.push({...structuredClone(s.bookings[0]),id:'other',owner:'other',serviceRequests:[{...s.bookings[0].serviceRequests[0],id:'free',amountMinor:0,status:'pending'}]});const next=resetDemoServices(s);assert.ok(next.bookings.every(b=>b.serviceRequests.length===0));assert.equal(next.bookings.length,2);
});
