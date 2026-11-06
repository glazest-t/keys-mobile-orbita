import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePrototypeVariant,getPrototypeVariant,setPrototypeVariant,subscribePrototypeVariant,PROTOTYPE_VARIANT_KEY} from '../app/src/prototypeVariant.ts';
import {prototypeVersionUrl} from '../app/src/prototypeVersion.ts';

test('Edition defaults and explicit share links override saved selection',()=>{
 assert.equal(resolvePrototypeVariant('https://example.test/',null),'full');
 assert.equal(resolvePrototypeVariant('https://example.test/','november'),'november');
 assert.equal(resolvePrototypeVariant('https://example.test/?variant=full','november'),'full');
 assert.equal(resolvePrototypeVariant('https://example.test/?variant=unknown','invalid'),'full');
});

test('Selection preserves scenario, route, history and existing demo data',()=>{
 const values=new Map([['keys-orbita-booking-v1','existing bookings']]);
 const previous=Object.fromEntries(['location','history','localStorage','window'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const location={href:'http://127.0.0.1:5173/?catalogue=destination#booking-flow'};
 const state={previousRoute:'results'};
 try{
  Object.assign(globalThis,{location,history:{state,replaceState(next,unused,url){assert.equal(next,state);location.href=String(url);}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},window:new EventTarget()});
  let notifications=0;const stop=subscribePrototypeVariant(()=>notifications++);
  setPrototypeVariant('november');
  assert.equal(getPrototypeVariant(),'november');
  assert.equal(values.get(PROTOTYPE_VARIANT_KEY),'november');
  assert.equal(values.get('keys-orbita-booking-v1'),'existing bookings');
  assert.equal(new URL(location.href).hash,'#booking-flow');
  assert.equal(new URL(location.href).searchParams.get('catalogue'),'destination');
  assert.match(prototypeVersionUrl(location.href,'/',true,true),/5180\/\?catalogue=destination&variant=november#booking-flow$/);
  assert.equal(notifications,1);stop();
  globalThis.localStorage={getItem(){throw Error('disabled');},setItem(){throw Error('disabled');}};
  setPrototypeVariant('full');assert.equal(getPrototypeVariant(),'full');
 }finally{for(const [key,descriptor] of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
