import {checkPin,confirmPin,profileSettings} from '../app/src/profile/settings.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount} from '../app/src/booking/model.ts';
import {prepareDemoEntry,prepareDeviceEntry} from '../app/src/demoEntry.ts';
import {initialState,requestCode,verifyCode,completeName,decodeState} from '../app/src/state.ts';
const existing=()=>completeName(verifyCode(requestCode(initialState(),'9990000001'),'123456'),'Мария');
test('Новая регистрация стартует с онбординга и не заменяет сохранённый профиль',()=>{
 const before=existing(),demo=prepareDemoEntry(before,'new',initialCommerce());
 assert.equal(demo.route,'welcome');assert.equal(demo.state.activePhone,null);assert.equal(demo.state.onboarded,false);
 assert.notEqual('+7'+demo.phone,before.activePhone);assert.deepEqual(demo.state.users,before.users);
 const verified=verifyCode(requestCode(demo.state,demo.phone),'123456');assert.ok(verified.verifiedPhone);assert.equal(verified.activePhone,null);
 const named=completeName(verified,'Анна');assert.equal(Object.keys(named.users).length,2);assert.equal(named.demoRegistrationPhone,undefined);
});
test('Повторный вход использует профиль и после СМС пропускает имя',()=>{
 const before=existing(),demo=prepareDemoEntry(before,'returning-guest',initialCommerce());assert.equal(demo.route,'phone');
 const signed=verifyCode(requestCode(demo.state,demo.phone),'123456');assert.equal(signed.activePhone,before.activePhone);assert.equal(signed.verifiedPhone,null);assert.deepEqual(signed.users,before.users);
});
test('Повторный вход доступен даже в пустом прототипе',()=>{
 const demo=prepareDemoEntry(initialState(),'returning-guest',initialCommerce());assert.equal(Object.keys(demo.state.users).length,1);
 assert.doesNotThrow(()=>decodeState(JSON.stringify(demo.state)));
 assert.ok(verifyCode(requestCode(demo.state,demo.phone),'123456').activePhone);
});
test('Отельер начинает с приглашения и нового номера; статус автоматически не выдаётся',()=>{
 const demo=prepareDemoEntry({...existing(),request:{phone:'+79990000001',issuedAt:1,expiresAt:2,resendAt:2},hotelierOnboarding:true},'hotelier',initialCommerce());
 assert.equal(demo.route,'hotelier-invite');assert.equal(demo.state.request,null);assert.equal(demo.state.activePhone,null);assert.equal(demo.state.hotelierOnboarding,false);
 for(const skip of [false,true]){
 const accepted={...demo.state,hotelierOnboarding:true,returnTo:skip?'trips':'hotelier'};
 const named=completeName(verifyCode(requestCode(accepted,demo.phone),'123456'),'Анна');assert.equal(named.returnTo,skip?'trips':'hotelier');assert.equal(named.hotelierOnboarding,true);
 }
});

test('Сценарии 3 и 4 сохраняют раздельные роли при последовательном переключении',()=>{
 const initial=existing(),base=ensureAccount(initialCommerce(),initial.activePhone);
 const hotelier=prepareDemoEntry(initial,'returning',base);
 const hotelierPhone='+7'+hotelier.phone;
 assert.equal(hotelier.commerce.accounts[hotelierPhone].hotelierStatus,'approved');
 assert.equal(hotelier.commerce.accounts[initial.activePhone].hotelierStatus,'none');
 assert.deepEqual(hotelier.commerce.bookings,base.bookings);
 const signed=verifyCode(requestCode(hotelier.state,hotelier.phone),'123456');assert.equal(signed.verifiedPhone,null);
 const guest=prepareDemoEntry(signed,'returning-guest',hotelier.commerce);
 assert.equal('+7'+guest.phone,initial.activePhone);assert.equal(guest.commerce.accounts['+7'+guest.phone].hotelierStatus,'none');
 assert.equal(guest.commerce.hotelierParticipants?.['+7'+guest.phone],undefined);
 const again=prepareDemoEntry(guest.state,'returning',guest.commerce);
 assert.equal(again.phone,hotelier.phone);assert.equal(Object.keys(again.state.users).length,2);
 assert.deepEqual(again.commerce,guest.commerce);
});
test('Обычный гость не наследует ожидание, отказ или пропущенное подтверждение отельера',()=>{
 for(const status of ['approved','pending','rejected','none']){
  const before=existing(),owner=before.activePhone,base=ensureAccount(initialCommerce(),owner);
  base.accounts[owner].hotelierStatus=status;base.hotelierParticipants={[owner]:true};
  const guest=prepareDemoEntry(before,'returning-guest',base),phone='+7'+guest.phone;
  assert.notEqual(phone,owner);assert.equal(guest.commerce.accounts[phone].hotelierStatus,'none');
  assert.equal(guest.commerce.hotelierParticipants?.[phone],undefined);assert.equal(guest.commerce.accounts[owner].hotelierStatus,status);
  const signed=verifyCode(requestCode(guest.state,guest.phone),'123456');assert.equal(signed.activePhone,phone);assert.equal(signed.verifiedPhone,null);
 }
});
test('Сценарий 3 выбирает существующего подтверждённого отельера без изменения его данных',()=>{
 const before=existing(),base=ensureAccount(initialCommerce(),before.activePhone);base.accounts[before.activePhone].hotelierStatus='approved';
 const demo=prepareDemoEntry(before,'returning',base);assert.equal('+7'+demo.phone,before.activePhone);assert.deepEqual(demo.state.users,before.users);assert.deepEqual(demo.commerce,base);
});

test('Сценарий PIN готов к входу с 1234 без предварительной настройки',async()=>{
 const demo=await prepareDeviceEntry(initialState(),'pin',initialCommerce()),phone=demo.state.activePhone;
 assert.equal(demo.route,'trips');assert.equal(demo.state.request,null);assert.equal(demo.state.users[phone].demoDeviceAccess,true);
 assert.equal(profileSettings(demo.state.users[phone]).biometric,false);assert.equal((await checkPin(demo.state,phone,'1234')).valid,true);assert.equal((await checkPin(demo.state,phone,'0000')).valid,false);
});
test('Биометрия использует тот же демопрофиль, сохраняя личный PIN и брони',async()=>{
 let before=existing();const owner=before.activePhone;before=await confirmPin(before,owner,'5678','5678');const commerce=initialCommerce();
 const first=await prepareDeviceEntry(before,'biometric',commerce),phone=first.state.activePhone;
 assert.notEqual(phone,owner);assert.deepEqual(first.state.users[owner],before.users[owner]);assert.deepEqual(first.commerce.bookings,commerce.bookings);
 assert.equal(profileSettings(first.state.users[phone]).biometric,true);assert.equal((await checkPin(first.state,phone,'1234')).valid,true);
 const again=await prepareDeviceEntry(first.state,'pin',first.commerce);assert.equal(again.state.activePhone,phone);assert.equal(Object.keys(again.state.users).length,2);assert.equal(profileSettings(again.state.users[phone]).biometric,false);
 assert.deepEqual(again.state.users[owner],before.users[owner]);
});
