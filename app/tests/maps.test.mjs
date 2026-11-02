import test from 'node:test';
import assert from 'node:assert/strict';
import locations from '../../spec/map-locations.json' with {type:'json'};
import hotels from '../../spec/demo-data.json' with {type:'json'};
import {hotelLocation,locationBounds,cityCenter,twoGisPlaceUrl} from '../src/maps/locations.ts';
test('На реальной карте только сопоставленные объекты каталога, долгота перед широтой',()=>{
 const ids=new Set(hotels.hotels.map(h=>h.id));
 for(const [id,p] of Object.entries(locations)){
  assert.ok(ids.has(id),id);assert.equal(p.coordinates.length,2);
  assert.ok(p.coordinates.every(Number.isFinite));
  assert.ok(p.coordinates[0]>29&&p.coordinates[0]<50,id+' longitude');
  assert.ok(p.coordinates[1]>43&&p.coordinates[1]<61,id+' latitude');
  assert.match(p.source,/^https:\/\/2gis.ru\/firm\/\d+$/);
 }
 assert.deepEqual(hotelLocation('orbit-sea').coordinates,[39.937345,43.410643]);
 assert.equal(hotelLocation('pine-sochi'),undefined);
 assert.equal(twoGisPlaceUrl('not-a-hotel'),undefined);
});
test('Карта охватывает разные города и не придумывает координаты пустому списку',()=>{
 assert.equal(locationBounds([]),null);
 assert.deepEqual(locationBounds([[37.6,55.7],[30.3,59.9],[39.9,43.4]]),{southWest:[30.3,43.4],northEast:[39.9,59.9]});
 assert.deepEqual(cityCenter('Сочи'),[39.7231,43.5855]);
});
