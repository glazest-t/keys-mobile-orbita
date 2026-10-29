import test from 'node:test';
import assert from 'node:assert/strict';
import {accessibleRoute} from '../src/access.ts';
test('Без сессии доступны только знакомство, приглашение и вход',()=>{for(const route of ['welcome','phone','code','name','hotelier-invite'])assert.equal(accessibleRoute(route,false),route);for(const route of ['find','results','trips','booking-flow','booking-record','trip-chat','trip-breakfast','results-map','destination','search-dates','swipe','profile','hotelier','rewards','chats','kit','unknown'])assert.equal(accessibleRoute(route,false),'phone');});
test('Сессия открывает целевой маршрут, её потеря закрывает его',()=>{for(const route of ['find','booking-flow','trips','profile']){assert.equal(accessibleRoute(route,true),route);assert.equal(accessibleRoute(route,false),'phone');}});
