import test from 'node:test';
import assert from 'node:assert/strict';
import {accessibleRoute} from '../app/src/access.ts';
test('Условия доступны до регистрации; чтение условий не открывает личные разделы',()=>{
 assert.equal(accessibleRoute('terms',false),'terms');
 for(const route of ['trips','profile','booking-flow','chats','rewards'])assert.equal(accessibleRoute(route,false),'phone');
 assert.equal(accessibleRoute('terms',true),'terms');
});
