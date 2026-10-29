import test from 'node:test';
import assert from 'node:assert/strict';
import {nearbyPlaces,filterNearbyPlaces,nearbyPlace} from '../app/src/booking/nearby.ts';

test('Категории списка и карты используют один набор мест и стабильные ID',()=>{
 const all=nearbyPlaces('orbit-sea');assert.equal(all.length,4);assert.equal(new Set(all.map(p=>p.id)).size,4);
 for(const c of ['Еда','Пляж','Культура']){
  const filtered=filterNearbyPlaces('orbit-sea',c);assert.ok(filtered.length);
  assert.ok(filtered.every(p=>p.category===c&&nearbyPlace('orbit-sea',p.id)===p));
 }
 assert.equal(filterNearbyPlaces('orbit-sea','Еда').length,2);
 assert.ok(all.every(p=>p.minutes>0&&p.x>0&&p.x<100&&p.y>0&&p.y<100));
});
test('Другой город и неизвестное место не показывают чужую подборку',()=>{
 assert.deepEqual(nearbyPlaces('orbit-city'),[]);assert.deepEqual(nearbyPlaces('missing'),[]);
 assert.deepEqual(filterNearbyPlaces('orbit-city','Еда'),[]);
 assert.equal(nearbyPlace('orbit-city','fish-fire'),undefined);assert.equal(nearbyPlace('orbit-sea','missing'),undefined);
});
test('Выбор категории не изменяет полный каталог',()=>{
 const before=structuredClone(nearbyPlaces('pine-sochi'));
 filterNearbyPlaces('pine-sochi','Пляж');assert.deepEqual(nearbyPlaces('pine-sochi'),before);
});
