import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking,cancelBooking,decodeCommerce} from '../app/src/booking/model.ts';
import {previewAmendment,commitAmendment} from '../app/src/booking/amendment.ts';
import {hasHotelProgram,setHotelProgram,connectHotelProgram} from '../app/src/rewards/loyalty.ts';
import {pointHistory} from '../app/src/rewards/points.ts';
const owner='+79001234567',other='+79007654321',now='2026-10-28T12:00:00Z';
function base(){let s=ensureAccount(initialCommerce(),owner);s.search={...s.search,checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2};return s;}
function book(s=base()) {s=startDraft(s,'orbit-sea','rewards');s.draft={...s.draft,usePoints:true,contact:{name:'Анна',surname:'Примерова',email:'anna@example.test',phone:owner}};return commitBooking(s,owner,quoteDraft(s,owner),'success',now);}
test('Подключение и отключение карты ограничено отелем и владельцем, пароли не сохраняются',()=>{
 let s=ensureAccount(base(),other),before=structuredClone(s);
 s=setHotelProgram(s,owner,'orbit-sea',false);
 assert.equal(hasHotelProgram(s,owner,'orbit-sea'),false);assert.equal(hasHotelProgram(s,owner,'kazan-apart'),true);assert.equal(hasHotelProgram(s,other,'orbit-sea'),true);
 const connected=connectHotelProgram(s,owner,'orbit-sea','demo@example.test','fake-password');
 assert.equal(hasHotelProgram(decodeCommerce(JSON.stringify(connected)),owner,'orbit-sea'),true);
 assert.equal(JSON.stringify(connected).includes('fake-password'),false);assert.equal(JSON.stringify(connected).includes('demo@example.test'),false);
 assert.deepEqual(connected.payment,before.payment);assert.deepEqual(connected.bookings,before.bookings);
 assert.throws(()=>connectHotelProgram(s,owner,'orbit-sea','invalid','1234'),/почту/);assert.throws(()=>connectHotelProgram(s,owner,'orbit-sea','demo@example.test',''),/пароль/);
 assert.throws(()=>setHotelProgram(s,owner,'not-existing',true),/недоступна/);
});
test('Карта пересчитывает только новый черновик, Friendly Rate сохраняет исключение',()=>{
 let s=book(),original=structuredClone(s.bookings[0]);s=startDraft(s,'orbit-sea','next');const member=quoteDraft(s,owner);s=setHotelProgram(s,owner,'orbit-sea',false);const notMember=quoteDraft(s,owner);
 assert.ok(notMember.cashDueMinor>member.cashDueMinor);assert.deepEqual(s.bookings[0],original);
 s.accounts[owner].hotelierStatus='approved';s=startDraft(s,'orbit-sea','fr',owner);s.draft.usePoints=true;
 const fr=quoteDraft(s,owner),connected=quoteDraft(setHotelProgram(s,owner,'orbit-sea',true),owner);assert.equal(fr.hotelDiscountMinor,0);assert.equal(fr.applied.hotelPoints,0);assert.deepEqual(fr,connected);
});
test('История списаний и отмены согласована с кошельком и не дублируется',()=>{
 let s=book();const before=JSON.stringify(s);assert.equal(pointHistory(s,owner).length,1);assert.equal(pointHistory(s,owner)[0].amount,-4860);assert.deepEqual(pointHistory(s,other),[]);assert.equal(JSON.stringify(s),before);
 s=cancelBooking(s,owner,'rewards',now);const history=pointHistory(s,owner);assert.equal(history.length,2);assert.equal(history.reduce((n,e)=>n+e.amount,4860),s.payment.balances['keys:'+owner]);
 assert.deepEqual(pointHistory(cancelBooking(s,owner,'rewards',now),owner),history);
});
test('История сохраняет первоначальное списание и возврат при сокращении поездки',()=>{
 let s=base();s.payment.balances['keys:'+owner]=50000;s.payment.balances['hotel:orbit-sea:'+owner]=20000;s=book(s);
 const input={search:{...s.bookings[0].draft.search,checkOut:'2026-11-14'},services:[]};
 s=commitAmendment(s,owner,previewAmendment(s,owner,'rewards',input,now),'short','success',now);
 assert.equal(pointHistory(s,owner).reduce((n,e)=>n+e.amount,50000),s.payment.balances['keys:'+owner]);
 s=cancelBooking(s,owner,'rewards',now);
 for(const [wallet,initial] of [['keys:'+owner,50000],['hotel:orbit-sea:'+owner,20000]])assert.equal(pointHistory(s,owner,wallet).reduce((n,e)=>n+e.amount,initial),s.payment.balances[wallet]);
});
test('Баланс без платежных операций не превращается в выдуманное начисление',()=>{const s=base();assert.equal(s.payment.balances['keys:'+owner],4860);assert.deepEqual(pointHistory(s,owner),[]);});

test('Отключённая карта сохраняет кошелёк, но не списывает его в новой брони',()=>{
 let s=startDraft(base(),'orbit-sea','card-off');s.draft.usePoints=true;
 assert.ok(quoteDraft(s,owner).applied.hotelPoints>0);
 s=setHotelProgram(s,owner,'orbit-sea',false);assert.equal(quoteDraft(s,owner).applied.hotelPoints,0);assert.equal(s.payment.balances['hotel:orbit-sea:'+owner],1240);
 assert.ok(quoteDraft(setHotelProgram(s,owner,'orbit-sea',true),owner).applied.hotelPoints>0);
});

test('Приветственные 1000 баллов начисляются один раз, в общий кошелёк своего пользователя',async()=>{
 const {ensureWelcomePoints}=await import('../app/src/rewards/points.ts');
 const initial=base(),before=structuredClone(initial),s=ensureWelcomePoints(initial,owner,now);
 assert.equal(s.payment.balances['keys:'+owner],5860);
 assert.equal(s.payment.balances['hotel:orbit-sea:'+owner],1240);
 assert.deepEqual(initial,before);assert.deepEqual(s.payment.operations,initial.payment.operations);
 assert.deepEqual(pointHistory(s,owner).map(e=>[e.kind,e.amount,e.at]),[['welcome',1000,now]]);
 assert.deepEqual(pointHistory(s,other),[]);assert.deepEqual(pointHistory(s,owner,'hotel:orbit-sea:'+owner),[]);
 assert.equal(ensureWelcomePoints(s,owner),s);
 const restored=decodeCommerce(JSON.stringify(s));assert.equal(ensureWelcomePoints(restored,owner),restored);
 assert.deepEqual(pointHistory(restored,owner),pointHistory(s,owner));
 assert.equal(ensureWelcomePoints(initial,other),initial);
});
test('Приветственные баллы можно потратить и вернуть; просмотр и повторный вход не пополняют баланс',async()=>{
 const {ensureWelcomePoints}=await import('../app/src/rewards/points.ts');
 let s=book(ensureWelcomePoints(base(),owner,now));
 assert.equal(s.payment.balances['keys:'+owner],0);
 assert.equal(ensureWelcomePoints(s,owner),s);
 assert.equal(pointHistory(s,owner).reduce((sum,e)=>sum+e.amount,4860),0);
 s=cancelBooking(s,owner,'rewards',now);
 assert.equal(s.payment.balances['keys:'+owner],5860);
 assert.equal(pointHistory(s,owner).filter(e=>e.kind==='welcome').length,1);
 assert.equal(pointHistory(s,owner).reduce((sum,e)=>sum+e.amount,4860),5860);
});

test('Демоистория объясняет исходный баланс, сохраняется и не начисляет его повторно',async()=>{
 const {ensureDemoPointsHistory,ensureWelcomePoints,pointEntryDescription}=await import('../app/src/rewards/points.ts');
 const initial=ensureWelcomePoints(base(),owner,now),before=structuredClone(initial);
 const s=ensureDemoPointsHistory(initial,owner,now),history=pointHistory(s,owner);
 assert.deepEqual(initial,before);assert.deepEqual(s.payment,initial.payment);
 assert.equal(history.length,11);assert.equal(history.reduce((n,e)=>n+e.amount,0),s.payment.balances['keys:'+owner]);
 assert.equal(history.at(-1).kind,'welcome');assert.ok(history.every(e=>e.at<=now));
 assert.deepEqual(pointHistory(s,other),[]);assert.deepEqual(pointHistory(s,owner,'hotel:orbit-sea:'+owner),[]);
 assert.equal(ensureDemoPointsHistory(s,owner),s);
 const restored=decodeCommerce(JSON.stringify(s));assert.equal(ensureDemoPointsHistory(restored,owner),restored);
 assert.deepEqual(pointHistory(restored,owner),history);
 assert.equal(pointEntryDescription(history.find(e=>e.kind==='invite')),'Бонус за приглашённого друга');
 const booked=book(s);assert.equal(pointHistory(booked,owner).reduce((n,e)=>n+e.amount,0),booked.payment.balances['keys:'+owner]);
 const cancelled=cancelBooking(booked,owner,'rewards',now);assert.equal(pointHistory(cancelled,owner).reduce((n,e)=>n+e.amount,0),cancelled.payment.balances['keys:'+owner]);
});

test('Программа только баллов: без скидки, отдельный кошелёк, списание и возврат',async()=>{
 const {ensureDemoHotelPoints,hotelPrograms,supportsHotelPoints}=await import('../app/src/rewards/loyalty.ts');
 const hotelId='orbit-forest',wallet=`hotel:${hotelId}:${owner}`;
 let s=ensureDemoHotelPoints(base(),owner);
 assert.ok(hotelPrograms.some(h=>h.id===hotelId&&h.hotelDiscountBasisPoints===0));assert.equal(supportsHotelPoints(hotelId),true);
 assert.equal(s.payment.balances[wallet],2500);assert.equal(s.payment.balances['keys:'+owner],4860);
 assert.equal(ensureDemoHotelPoints(s,owner),s);
 s=startDraft(s,hotelId,'points-only');s.draft.usePoints=true;s.draft.contact={name:'Анна',surname:'Примерова',email:'anna@example.test',phone:owner};
 const q=quoteDraft(s,owner);assert.equal(q.hotelDiscountMinor,0);assert.equal(q.applied.hotelPoints,2500);
 s=commitBooking(s,owner,q,'success',now);assert.equal(s.payment.balances[wallet],0);assert.equal(ensureDemoHotelPoints(decodeCommerce(JSON.stringify(s)),owner).payment.balances[wallet],0);
 s=cancelBooking(s,owner,'points-only',now);assert.equal(s.payment.balances[wallet],2500);
 s=setHotelProgram(s,owner,hotelId,false);s=startDraft(s,hotelId,'points-off');s.draft.usePoints=true;assert.equal(quoteDraft(s,owner).applied.hotelPoints,0);
 s=connectHotelProgram(s,owner,hotelId,'anna@example.test','demo');assert.equal(quoteDraft(s,owner).applied.hotelPoints,2500);
 s.accounts[owner].hotelierStatus='approved';s=startDraft(s,hotelId,'points-fr',owner);s.draft.usePoints=true;assert.equal(quoteDraft(s,owner).applied.hotelPoints,0);
});
