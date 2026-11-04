import test from 'node:test';
import assert from 'node:assert/strict';
import {coordinateOrigin,parseHotelRoute,parseLineString,routeRequest,routeDuration,routeDistance,resolveRouteOrigin,fetchHotelRoute} from '../app/src/maps/routing.ts';
const line='LINESTRING(39.94 43.44, 39.93 43.41)';
test('Геолокация: широта/долгота из UI преобразуются в порядок карты, некорректные координаты отклоняются',()=>{
 assert.deepEqual(coordinateOrigin('Моё местоположение · 43.44862, 39.94196'),{coordinates:[39.94196,43.44862],name:'Моё местоположение'});
 assert.equal(coordinateOrigin('99, 181'),undefined);assert.equal(coordinateOrigin('Вокзал Адлер'),undefined);
});
test('Авто и такси, пеший маршрут и транспорт используют соответствующие API и координаты',()=>{
 for(const mode of ['driving','taxi','walking']){const r=routeRequest([39,43],[40,44],mode);assert.equal(r.body.transport,mode);assert.equal(r.body.output,'detailed');assert.deepEqual(r.body.points[0],{lon:39,lat:43,type:'walking'});}
 const transit=routeRequest([39,43],[40,44],'transit');assert.equal(transit.endpoint,'public_transport/2.0');assert.deepEqual(transit.body.target.point,{lon:40,lat:44});assert.ok(transit.body.transport.includes('bus'));
});
test('Геометрия не соединяет отдельные сегменты выдуманной прямой; повреждённые линии не рисуются',()=>{
 assert.equal(parseLineString('LINESTRING(999 43, 40 44)').length,0);assert.equal(parseLineString('POINT(39 43)').length,0);
 const data={result:[{total_distance:200,total_duration:90,maneuvers:[{outcoming_path:{geometry:[{selection:line},{selection:'LINESTRING(39.91 43.40, 39.90 43.39)'}]}}]}]};
 const r=parseHotelRoute(data,'driving');assert.equal(r.segments.length,2);assert.equal(r.duration,90);assert.equal(r.distance,200);
 assert.throws(()=>parseHotelRoute({result:[]},'walking'),/Не удалось найти/);
});
test('Общественный транспорт: одна альтернатива на участок и самый быстрый полноценный вариант',()=>{
 const r=parseHotelRoute([{total_distance:1000,total_duration:600,movements:[{alternatives:[{geometry:[{selection:line}]},{geometry:[{selection:line}]}]}]}],'transit');
 assert.equal(r.segments.length,1);assert.equal(routeDuration(3599),'1 ч');assert.equal(routeDuration(3700),'1 ч 2 мин');assert.equal(routeDistance(800),'800 м');
});
test('Пустой поиск и отказ API не создают фиктивную точку или маршрут',async()=>{
 const original=global.fetch;
 try{
  global.fetch=async()=>new Response(JSON.stringify({result:{items:[]}}),{status:200});
  await assert.rejects(resolveRouteOrigin('Неизвестный адрес','Сочи','demo',new AbortController().signal),/Не нашли/);
  global.fetch=async()=>new Response('',{status:429});
  await assert.rejects(fetchHotelRoute([10,20],[11,21],'taxi','demo',new AbortController().signal),/временно занят/);
 }finally{global.fetch=original;}
});
