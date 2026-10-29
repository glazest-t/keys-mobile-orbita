import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,startDraft,quoteDraft,catalog} from '../app/src/booking/model.ts';
import {submitVerification,resolveVerification,clearVerification,syncVerification,verificationClaim,invitationLink,invitationData} from '../app/src/hotelier/verification.ts';
import {initialState,requestCode,verifyCode,completeName,completeRegistrationTour,registrationContinuation,finishHotelierEntry,decodeState} from '../app/src/state.ts';
import {accessibleRoute} from '../app/src/access.ts';
const owner='+79001234567',other='+79007654321',base=()=>ensureAccount(initialCommerce(),owner);
test('Подтвердить позже снимает ожидание заявки без потери данных; старый ответ не выдаёт статус',()=>{
 const pending=submitVerification(base(),owner,'anna@hotel.test','postpone');
 const claim=verificationClaim(pending.hotelierVerifications[owner]);
 const postponed=clearVerification(pending,owner);
 assert.equal(postponed.accounts[owner].hotelierStatus,'none');
 assert.equal(postponed.hotelierVerifications[owner],undefined);
 assert.equal(postponed.hotelierParticipants[owner],true);
 assert.equal(postponed.hotelierEmailDrafts[owner],'anna@hotel.test');
 assert.deepEqual(postponed.bookings,pending.bookings);
 assert.deepEqual(postponed.payment,pending.payment);
 assert.throws(()=>resolveVerification(postponed,owner,claim,'approved'),/устарел|недоступен/i);
 const oldApproval=resolveVerification(pending,owner,claim,'approved');
 assert.equal(syncVerification(postponed,oldApproval,owner),postponed);
 const retry=submitVerification(postponed,owner,'anna@hotel.test','retry-postpone');
 assert.notEqual(retry.hotelierVerifications[owner].token,claim.token);
});
test('Приглашение → SMS → имя → рабочая почта; приглашение не даёт роль',()=>{
 assert.equal(accessibleRoute('hotelier-invite',false),'hotelier-invite');assert.equal(accessibleRoute('hotelier',false),'phone');
 const auth=completeName(verifyCode(requestCode({...initialState(),returnTo:'hotelier'},owner),'123456'),'Анна');assert.equal(auth.returnTo,'hotelier');assert.equal(auth.activePhone,owner);
 assert.equal(base().accounts[owner].hotelierStatus,'none');assert.throws(()=>submitVerification(initialCommerce(),owner,'anna@hotel.test','r1'),/войдите/);
 assert.throws(()=>submitVerification(base(),owner,'bad','r1'),/email/);
 const next=submitVerification(base(),owner,' Anna@Hotel.test ','r1');assert.equal(next.hotelierVerifications[owner].email,'anna@hotel.test');assert.equal(next.accounts[owner].hotelierStatus,'pending');
});
test('Только актуальная проверка выдаёт роль, изменение почты отменяет старую',()=>{
 const pending=submitVerification(base(),owner,'a@hotel.test','r1');assert.throws(()=>submitVerification(pending,owner,'b@hotel.test','r2'),/уже отправлен/);
 const changed=submitVerification(clearVerification(pending,owner),owner,'b@hotel.test','r2');assert.throws(()=>resolveVerification(changed,owner,verificationClaim(pending.hotelierVerifications[owner]),'approved'),/устарел/);
 assert.throws(()=>resolveVerification(changed,other,verificationClaim(changed.hotelierVerifications[owner]),'approved'),/устарел/);
 const rejected=resolveVerification(changed,owner,verificationClaim(changed.hotelierVerifications[owner]),'rejected');assert.equal(rejected.accounts[owner].hotelierStatus,'rejected');
 const retry=submitVerification(clearVerification(rejected,owner),owner,'c@hotel.test','r3'),approved=resolveVerification(retry,owner,verificationClaim(retry.hotelierVerifications[owner]),'approved');assert.equal(approved.accounts[owner].hotelierStatus,'approved');assert.throws(()=>resolveVerification(approved,owner,verificationClaim(approved.hotelierVerifications[owner]),'rejected'),/обработан/);
});
test('Ответ другой вкладки сохраняет текущую бронь, баланс и другого пользователя',()=>{
 const pending=submitVerification(ensureAccount(base(),other),owner,'a@hotel.test','r1'),approved=resolveVerification(pending,owner,verificationClaim(pending.hotelierVerifications[owner]),'approved');
 const local={...pending,search:{...pending.search,city:'Москва'},payment:{...pending.payment,balances:{...pending.payment.balances,['keys:'+owner]:123}}};
 const next=syncVerification(local,approved,owner);assert.equal(next.accounts[owner].hotelierStatus,'approved');assert.equal(next.search.city,'Москва');assert.deepEqual(next.payment,local.payment);assert.deepEqual(next.accounts[other],local.accounts[other]);assert.equal(syncVerification(next,approved,owner),next);
 const changed=submitVerification(clearVerification(pending,owner),owner,'b@hotel.test','r2');assert.equal(syncVerification(changed,approved,owner),changed);
});
test('Friendly Rate закрыт до одобрения и после отказа, обычный тариф доступен всегда',()=>{
 const pending=submitVerification(base(),owner,'a@hotel.test','r1'),fr=catalog.rates.find(r=>r.kind==='friendly_rate'),regular=catalog.rates.find(r=>r.roomId===fr.roomId&&r.kind==='standard');
 for(const state of [base(),pending,resolveVerification(pending,owner,verificationClaim(pending.hotelierVerifications[owner]),'rejected')]){const draft=startDraft(state,fr.hotelId,'draft').draft;assert.throws(()=>quoteDraft({...state,draft:{...draft,roomId:fr.roomId,rateId:fr.id}},owner),/Friendly|отельер|статус/i);assert.ok(quoteDraft({...state,draft:{...draft,roomId:fr.roomId,rateId:regular.id}},owner).cashDueMinor>=0);}
 const approved=resolveVerification(pending,owner,verificationClaim(pending.hotelierVerifications[owner]),'approved'),draft=startDraft(approved,fr.hotelId,'draft').draft;assert.ok(quoteDraft({...approved,draft:{...draft,roomId:fr.roomId,rateId:fr.id}},owner).cashDueMinor>=0);
});

test('Подтверждение требует совпадения id, token, телефона и email',()=>{
 const pending=submitVerification(base(),owner,'a@hotel.test','r1'),claim=verificationClaim(pending.hotelierVerifications[owner]);
 for(const field of ['id','token','phone','email'])assert.throws(()=>resolveVerification(pending,owner,{...claim,[field]:'wrong'},'approved'),/устарел/);
 const rejected=resolveVerification(pending,owner,claim,'rejected'),retry=submitVerification(rejected,owner,'a@hotel.test','r2');
 assert.notEqual(retry.hotelierVerifications[owner].token,claim.token);assert.throws(()=>resolveVerification(retry,owner,claim,'approved'),/устарел/);
});
test('Приглашение передаёт автора, но не токен проверки и не статус',()=>{
 const url=invitationLink('http://localhost:5173/?hotel-verification=secret&token=private#hotelier','  Анна   Иванова ','Мой отель');
 assert.deepEqual(invitationData(url),{name:'Анна Иванова',hotel:'Мой отель'});assert.equal(new URL(url).hash,'#hotelier-invite');
 for(const key of ['token','hotel-verification','status'])assert.equal(new URL(url).searchParams.has(key),false);
});
test('Приглашённый существующий пользователь проходит имя без потери профиля',()=>{
 const account=completeName(verifyCode(requestCode(initialState(),owner),'123456'),'Анна');account.users[owner].travelers[0].surname='Примерова';
 const verified=verifyCode(requestCode({...account,activePhone:null,hotelierOnboarding:true,returnTo:'hotelier-offer'},owner),'123456');
 assert.equal(verified.activePhone,null);assert.equal(verified.verifiedPhone,owner);
 const complete=completeName(verified,'  Анна   Мария  ');assert.equal(complete.users[owner].name,'Анна Мария');assert.equal(complete.users[owner].travelers[0].surname,'Примерова');assert.equal(complete.returnTo,'hotelier-offer');
});

test('Два вида приглашения: только ссылка коллеги ведёт в подтверждение, секреты не передаются',async()=>{
 const {appInvitationLink}=await import('../app/src/hotelier/verification.ts');
 const base='http://localhost:5173/?token=secret&hotel-verification=private#hotelier';
 const colleague=new URL(appInvitationLink(base,'Анна','Отель','hotelier'));
 const traveler=new URL(appInvitationLink(base,'Анна','Отель','traveler'));
 assert.equal(colleague.hash,'#hotelier-invite');assert.equal(traveler.hash,'#phone');
 assert.equal(traveler.searchParams.get('scenario'),'friend-invite');
 for(const link of [colleague,traveler])for(const key of ['token','hotel-verification','status'])assert.equal(link.searchParams.has(key),false);
 assert.equal(accessibleRoute('hotelier-offer',true),'hotelier');assert.equal(accessibleRoute('hotelier-offer',false),'phone');
});
test('Пропуск подтверждения сохраняет интерес и автора, но не создаёт запрос и не даёт FR',async()=>{
 const {registerHotelierInterest}=await import('../app/src/hotelier/verification.ts');
 const s=registerHotelierInterest(base(),owner,{name:'Ирина',hotel:'Отель'});
 const restored=JSON.parse(JSON.stringify(s));
 assert.equal(restored.hotelierParticipants[owner],true);assert.equal(restored.accounts[owner].hotelierStatus,'none');
 assert.equal(restored.hotelierVerifications?.[owner],undefined);assert.equal(restored.hotelierInviters[owner].name,'Ирина');
 assert.equal(catalog.rates.find(r=>r.id===startDraft(restored,'orbit-sea','skip',owner).draft.rateId).kind,'standard');
});
test('В каждом отеле есть FR −35%; открывается только владельцу подтверждённого статуса',async()=>{
 const {selectRoomRate,roomOffers,updateRoomSearch}=await import('../app/src/booking/roomOffers.ts');
 const {ratePrice}=await import('../app/src/booking/friendlyRate.ts');
 const state=ensureAccount(base(),other);state.accounts[owner].hotelierStatus='approved';
 assert.equal(new Set(catalog.rates.filter(r=>r.kind==='friendly_rate').map(r=>r.hotelId)).size,53);
 for(const regular of catalog.rates.filter(r=>r.kind==='standard')){
  const fr=catalog.rates.find(r=>r.baseRateId===regular.id);assert.ok(fr,regular.id);
  assert.equal(fr.nightlyMinor,Math.round(regular.nightlyMinor*.65));assert.equal(fr.mealPlan,regular.mealPlan);
 }
 const approved=startDraft(state,'orbit-sea','new-fr',owner),regular=startDraft(state,'orbit-sea','regular',other);
 assert.equal(catalog.rates.find(r=>r.id===approved.draft.rateId).kind,'friendly_rate');assert.equal(catalog.rates.find(r=>r.id===regular.draft.rateId).kind,'standard');
 const q=quoteDraft(approved,owner),price=ratePrice(q);assert.equal(price.percent,35);assert.equal(price.baseMinor-price.discountMinor,q.lodgingMinor);assert.equal(q.hotelDiscountMinor,0);
 assert.ok(roomOffers(approved,owner).every(o=>o.rates[0].rate.kind==='friendly_rate'));
 const publicRate=catalog.rates.find(r=>r.id===approved.draft.rateId).baseRateId;
 const chosen=selectRoomRate(approved,owner,publicRate);assert.equal(chosen.draft.rateId,publicRate);
 assert.equal(updateRoomSearch(chosen,owner,chosen.draft.search).draft.rateId,publicRate);
 approved.draft.usePoints=true;const paid=quoteDraft(approved,owner);assert.equal(paid.applied.hotelPoints,0);assert.ok(paid.applied.keysPoints>0);
 assert.throws(()=>selectRoomRate(regular,other,approved.draft.rateId),/отельерам/);
});


test('После регистрации по приглашению онбординг сохраняет ветку подтверждения или пропуска',()=>{
 for(const target of ['hotelier','trips']){
  const invited={...initialState(),hotelierOnboarding:true,hotelierInviter:{name:'Юра Костин',hotel:'Travelline'},returnTo:target};
  const registered=completeName(verifyCode(requestCode(invited,owner),'123456'),'Анна');
  assert.equal(registered.hotelierTourTarget,target);assert.equal(registered.activePhone,owner);
  const reloaded=decodeState(JSON.stringify(registered));assert.equal(reloaded.hotelierTourTarget,target);
  assert.equal(registrationContinuation(reloaded),target==='hotelier'?'hotelier':'welcome');
  const ready=target==='hotelier'?finishHotelierEntry(reloaded):reloaded;
  assert.equal(registrationContinuation(ready),'welcome');
  assert.equal(ready.hotelierTourTarget,'trips');
  const finished=completeRegistrationTour(ready);assert.equal(finished.hotelierTourTarget,undefined);
  assert.equal(finished.returnTo,target);assert.equal(finished.hotelierOnboarding,target==='trips');
  assert.deepEqual(finished.hotelierInviter,invited.hotelierInviter);assert.equal(finished.activePhone,owner);
 }
 const ordinary=completeName(verifyCode(requestCode(initialState(),owner),'123456'),'Анна');
 assert.equal(ordinary.hotelierTourTarget,undefined);
});

test('Повторное подтверждение из профиля не запускает вступительный онбординг',()=>{
 const s={...initialState(),activePhone:owner,hotelierReturnTo:'profile'};
 assert.equal(finishHotelierEntry(s).hotelierTourTarget,undefined);
});
