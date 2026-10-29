import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,decodeCommerce} from '../app/src/booking/model.ts';
import {activateTripScenario} from '../app/src/booking/demoTripScenarios.ts';
import {pushKinds,appNotices,scopedNotices,readScopedNotices,addNotificationExamples,removeNotificationExamples,readAppNotices,notificationDestination,noticeDay} from '../app/src/booking/notifications.ts';
const owner='+79001234567',other='+79007654321',now=Date.now();
const fixture=stage=>activateTripScenario(ensureAccount(initialCommerce(),owner),owner,stage,'notice-trip',now);
test('Пять push-типов: примеры не создают брони, ключи и начисления, повтор не дублирует',()=>{
 const s=fixture('empty'),before=structuredClone(s),next=addNotificationExamples(s,owner,now);
 assert.equal(pushKinds.length,5);assert.equal(appNotices(next,owner,now).length,5);assert.equal(appNotices(addNotificationExamples(next,owner,now),owner,now).length,5);
 assert.deepEqual(next.payment,s.payment);assert.deepEqual(next.bookings,s.bookings);assert.deepEqual(s,before);assert.equal(appNotices(next,other,now).length,0);
 assert.equal(appNotices(removeNotificationExamples(next,owner),owner,now).length,0);
});
test('Прочтение сохраняется, не затрагивает другого владельца и будущие события',()=>{
 let s=addNotificationExamples(fixture('completed'),owner,now);s=addNotificationExamples(s,other,now);
 s.appNotices.push({...s.appNotices[1],id:'future',createdAt:new Date(now+86400000).toISOString(),read:false});
 const id=appNotices(s,owner,now).find(n=>!n.read).id,next=readAppNotices(s,owner,id,now);
 assert.ok(appNotices(decodeCommerce(JSON.stringify(next)),owner,now).find(n=>n.id===id).read);
 const all=readAppNotices(next,owner,undefined,now);assert.ok(appNotices(all,owner,now).every(n=>n.read));assert.ok(appNotices(all,other,now).some(n=>!n.read));assert.equal(all.appNotices.find(n=>n.id==='future').read,false);
});
test('Переход из ключа не открывает дверь до заселения или после выезда',()=>{
 for(const stage of ['upcoming','completed']){const s=addNotificationExamples(fixture(stage),owner,now);assert.throws(()=>notificationDestination(s,owner,`example:${owner}:room-key`,now),/Ключ|ключ/);}
 const s=addNotificationExamples(fixture('staying'),owner,now);assert.deepEqual(notificationDestination(s,owner,`example:${owner}:room-key`,now),{route:'trips',bookingId:'notice-trip'});assert.equal(s.bookings[0].stay.openings.length,0);
});
test('Отзыв ведёт в выбранную завершённую поездку; недоступные брони не подменяются',()=>{
 const s=addNotificationExamples(fixture('completed'),owner,now);assert.deepEqual(notificationDestination(s,owner,`example:${owner}:feedback`,now),{route:'trip-review',bookingId:'notice-trip'});
 assert.throws(()=>notificationDestination({...s,bookings:[]},owner,`example:${owner}:feedback`,now),/недоступна/);
 assert.throws(()=>notificationDestination(s,other,`example:${owner}:feedback`,now),/недоступно/);
 assert.throws(()=>notificationDestination(addNotificationExamples(fixture('upcoming'),owner,now),owner,`example:${owner}:feedback`,now),/после завершения/);
 assert.equal(notificationDestination(s,owner,`example:${owner}:stay-points`,now).route,'rewards');
});
test('История цены сохраняет свой переход, счётчик и групировку по датам',()=>{
 const s=fixture('upcoming');s.priceNotices=[{id:'drop',owner,key:'k',previousMinor:200000,currentMinor:100000,createdAt:new Date(now-1000).toISOString(),draft:s.bookings[0].draft,read:false}];
 const all=appNotices(addNotificationExamples(s,owner,now),owner,now);assert.equal(all.length,6);assert.equal(all.find(n=>n.kind==='price').category,'benefits');assert.deepEqual(notificationDestination(s,owner,'price:drop',now),{route:'booking-flow',priceId:'drop'});assert.equal(readAppNotices(s,owner,'price:drop').priceNotices[0].read,true);
 assert.equal(noticeDay(new Date(now).toISOString(),now),'Сегодня');assert.equal(noticeDay(new Date(now-86400000).toISOString(),now),'Вчера');
});

test('Уведомления отеля: все категории, старые записи и цена; прочтение не затрагивает другие отели',()=>{
 const s=addNotificationExamples(fixture('completed'),owner,now),hotelId=s.bookings[0].draft.hotelId;
 delete s.appNotices[0].hotelId; // прежняя запись связывается по брони
 s.appNotices.push({...s.appNotices[1],id:'other-hotel',hotelId:'pine-sochi'});
 s.priceNotices=[{id:'drop',owner,key:'k',previousMinor:200000,currentMinor:100000,createdAt:new Date(now-1000).toISOString(),draft:s.bookings[0].draft,read:false}];
 assert.equal(scopedNotices(s,owner,hotelId,now).length,6);
 assert.equal(scopedNotices(s,other,hotelId,now).length,0);
 const next=readScopedNotices(s,owner,hotelId,now);
 assert.ok(scopedNotices(next,owner,hotelId,now).every(n=>n.read));
 assert.equal(next.appNotices.find(n=>n.id==='other-hotel').read,false);
 assert.equal(next.priceNotices[0].read,true);
 assert.equal(scopedNotices(next,owner,'unknown-hotel',now).length,0);
});
