import test from 'node:test';
import assert from 'node:assert/strict';
import {paymentLayout} from '../app/src/booking/paymentLayout.ts';
const methods=['sbp','card','at_hotel','sberpay','tpay','yandexpay'];
test('All six methods fit at 770px without an overflow control',()=>{
 const result=paymentLayout(methods,770);
 assert.deepEqual(result,{visible:methods,overflow:[]});
});
test('A reserved overflow slot contains only the methods that did not fit',()=>{
 const result=paymentLayout(methods,769);
 assert.deepEqual(result.visible,methods.slice(0,4));
 assert.deepEqual(result.overflow,['tpay','yandexpay']);
 assert.deepEqual([...result.visible,...result.overflow],methods);
});
test('At narrow desktop widths three primary methods and overflow fit',()=>{
 const result=paymentLayout(methods,596);
 assert.deepEqual(result.visible,['sbp','card','at_hotel']);
 assert.deepEqual(result.overflow,['sberpay','tpay','yandexpay']);
});
test('A narrow container still exposes all methods through overflow',()=>{
 assert.deepEqual(paymentLayout(methods,120),{visible:[],overflow:methods});
});
test('Online-only mode fits five methods at 640px and never adds pay-at-hotel',()=>{
 const online=methods.filter(id=>id!=='at_hotel');
 assert.deepEqual(paymentLayout(online,640),{visible:online,overflow:[]});
});
