import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePrototypeText,getPrototypeText,setPrototypeText,subscribePrototypeText,selectPrototypeText,PROTOTYPE_TEXT_KEY} from '../app/src/prototypeText.ts';
import {prototypeVersionUrl} from '../app/src/prototypeVersion.ts';
test('Copy links override saved mode, with original copy as default',()=>{
 assert.equal(resolvePrototypeText('https://example.test/',null),'standard');
 assert.equal(resolvePrototypeText('https://example.test/','standard'),'standard');
 assert.equal(resolvePrototypeText('https://example.test/?text=edited','standard'),'edited');
 assert.equal(resolvePrototypeText('https://example.test/?text=unknown','invalid'),'standard');
});
test('Changing copy edition preserves route, edition, scenario and user data; works without storage',()=>{
 const values=new Map([['booking','existing data']]);
 const previous=Object.fromEntries(['location','history','localStorage','window'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const location={href:'http://127.0.0.1:5173/?variant=november&catalogue=trip-upcoming#trips'};
 const state={booking:'123'};
 try{
  Object.assign(globalThis,{location,history:{state,replaceState(next,unused,url){assert.equal(next,state);location.href=String(url);}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},window:new EventTarget()});
  let events=0;const stop=subscribePrototypeText(()=>events++);setPrototypeText('standard');
  assert.equal(getPrototypeText(),'standard');assert.equal(values.get(PROTOTYPE_TEXT_KEY),'standard');assert.equal(values.get('booking'),'existing data');
  const url=new URL(location.href);assert.equal(url.hash,'#trips');assert.equal(url.searchParams.get('variant'),'november');assert.equal(url.searchParams.get('catalogue'),'trip-upcoming');
  assert.equal(new URL(prototypeVersionUrl(url.href,'/',true,true)).searchParams.get('text'),'standard');assert.equal(events,1);stop();
  globalThis.localStorage={getItem(){throw Error('disabled');},setItem(){throw Error('disabled');}};
  setPrototypeText('edited');assert.equal(getPrototypeText(),'edited');assert.equal(events,1);
 }finally{for(const[key,descriptor]of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});

test('Edited copy is isolated from original and falls back until a revision is supplied',()=>{
 assert.equal(selectPrototypeText('standard','Original','Revised'),'Original');
 assert.equal(selectPrototypeText('edited','Original','Revised'),'Revised');
 assert.equal(selectPrototypeText('edited','Original'),'Original');
});
