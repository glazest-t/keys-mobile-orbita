import test from 'node:test';
import assert from 'node:assert/strict';
import {nearbyPlaces,filterNearbyPlaces,nearbyPlace,nearbyJourney} from '../app/src/booking/nearby.ts';
import snapshot from '../spec/nearby-places.json' with {type:'json'};
import locations from '../spec/map-locations.json' with {type:'json'};
import photos from '../spec/nearby-photos.json' with {type:'json'};

function distance(a,b){const [x,y,z,w]=[...a,...b].map(n=>n*Math.PI/180);return 12742000*Math.asin(Math.min(1,Math.sqrt(Math.sin((w-y)/2)**2+Math.cos(y)*Math.cos(w)*Math.sin((z-x)/2)**2)));}
test('Реальные места находятся в радиусе 1500 м именно своего отеля',()=>{
 assert.equal(snapshot.radiusMeters,1500);
 for(const [id,places] of Object.entries(snapshot.hotels)){
  assert.ok(locations[id],id);assert.ok(places.length<=8);assert.equal(new Set(places.map(p=>p.id)).size,places.length);
  for(const p of places){
   const meters=distance(locations[id].coordinates,p.coordinates);
   assert.ok(meters<=1500,id+' '+p.name);assert.ok(Math.abs(meters-p.radialDistanceMeters)<.1);
   assert.match(p.source,/^https:\/\/2gis.ru\/(geo|firm)\/\d+$/);assert.ok(p.name&&p.about&&p.categoryLabel);
   if(p.walk){assert.ok(p.walk.distanceMeters>0);assert.ok(p.walk.durationSeconds>0);}
  }
 }
});
test('Фильтры, карточка и карта используют одни ID без изменения набора',()=>{
 for(const id of Object.keys(snapshot.hotels)){
  const before=structuredClone(nearbyPlaces(id));
  for(const c of ['Музеи','Прогулки','Культура'])assert.ok(filterNearbyPlaces(id,c).every(p=>p.category===c&&nearbyPlace(id,p.id)===p));
  assert.deepEqual(nearbyPlaces(id),before);
 }
});
test('Нет подмены координат: вымышленные и неизвестные отели не получают чужие места',()=>{
 for(const id of ['orbit-city','pine-sochi','missing'])assert.deepEqual(nearbyPlaces(id),[]);
 assert.equal(nearbyPlace('orbit-city',nearbyPlaces('orbit-sea')[0].id),undefined);
});
test('Минуты показываются только при реальном пешеходном маршруте',()=>{
 const p={...nearbyPlaces('orbit-sea')[0],radialDistanceMeters:200,walk:undefined};
 assert.equal(nearbyJourney(p),'200 м по прямой');
 assert.equal(nearbyJourney({...p,walk:{distanceMeters:328,durationSeconds:262}}),'330 м · ≈ 5 мин пешком');
});
test('Фото имеют подтверждённую привязку и атрибуцию',()=>{
 const ids=new Set(Object.values(snapshot.hotels).flat().map(p=>p.id));
 for(const [id,p] of Object.entries(photos)){assert.ok(ids.has(id));assert.match(p.url,/^https:\/\//);assert.match(p.source,/^https:\/\/commons.wikimedia.org\//);assert.ok(p.credit);}
});
