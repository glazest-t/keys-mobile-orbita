import test from 'node:test';
import assert from 'node:assert/strict';
import {entryEditorialText} from '../app/src/entryEditorialText.ts';
import {initialState,requestCode,verifyCode,completeName} from '../app/src/state.ts';
import {initialCommerce,ensureAccount} from '../app/src/booking/model.ts';
import {submitVerification,resolveVerification,verificationClaim,hotelierLabels} from '../app/src/hotelier/verification.ts';

function inEdition(query,run){const previous=Object.getOwnPropertyDescriptor(globalThis,'location');try{globalThis.location={href:'https://example.test/?'+query};return run();}finally{if(previous)Object.defineProperty(globalThis,'location',previous);else delete globalThis.location;}}
test('Entry addendum applies only to edited November and labels update without reimporting',()=>{
 for(const query of ['variant=full&text=edited','variant=november&text=standard','variant=full&text=standard'])inEdition(query,()=>{
  assert.equal(entryEditorialText('qa','old','new'),'old');assert.equal(hotelierLabels.approved,'Отельер · Friendly Rate');
 });
 inEdition('variant=november&text=edited',()=>{assert.equal(entryEditorialText('qa','old','new'),'new');assert.equal(hotelierLabels.approved,'Отельер · Friendly Rates');assert.equal(hotelierLabels.rejected,'Запрос отклонён');});
});
test('Edited auth errors preserve validation boundaries, timers and successful registration data',()=>{
 function exercise(edited){return inEdition(`variant=november&text=${edited?'edited':'standard'}`,()=>{
  const start=initialState();
  assert.throws(()=>requestCode(start,'123',1000),{message:edited?'Должно быть 10 цифр после +7':'Введите 10 цифр номера после +7'});
  const sent=requestCode(start,'9001234567',1000);
  assert.throws(()=>requestCode(sent,'9001234567',sent.request.resendAt-1),{message:edited?'Попробуйте ещё раз':'Подождите перед повторной отправкой'});
  assert.throws(()=>verifyCode(sent,'000000',2000),{message:edited?'Неверный код':'Код не подходит. Проверьте шесть цифр'});
  assert.throws(()=>verifyCode(sent,'123456',sent.request.expiresAt),{message:edited?'Запросите новый код':'Срок кода истёк. Запросите новый'});
  const verified=verifyCode(sent,'123456',sent.request.expiresAt-1);
  assert.throws(()=>completeName(verified,'А'),{message:edited?'Должно быть от 2 до 40 букв':'Введите имя: от 2 до 40 букв'});
  return {sent,resend:requestCode(sent,'9001234567',sent.request.resendAt),registered:completeName(verified,'Анна')};
 });}
 assert.deepEqual(exercise(true),exercise(false));
});
test('Verification edition changes errors without changing account linkage or security checks',()=>{
 const owner='+79001234567',base=ensureAccount(initialCommerce(),owner);
 function exercise(edited){return inEdition(`variant=november&text=${edited?'edited':'standard'}`,()=>{
  assert.throws(()=>submitVerification(base,owner,'bad','id',1000,'token'),{message:edited?'Проверьте почту':'Проверьте рабочий email'});
  assert.throws(()=>submitVerification(base,'','a@hotel.test','id',1000,'token'),{message:edited?'Сначала подтвердите телефон':'Сначала войдите по телефону'});
  const pending=submitVerification(base,owner,'a@hotel.test','id',1000,'token'),claim=verificationClaim(pending.hotelierVerifications[owner]);
  assert.throws(()=>resolveVerification(pending,owner,{...claim,token:'wrong'},'approved',2000),{message:edited?'Не удалось подтвердить запрос. Попробуйте ещё раз':'Запрос недоступен: уже обработан или устарел'});
  return resolveVerification(pending,owner,claim,'approved',2000);
 });}
 assert.deepEqual(exercise(true),exercise(false));
});
