import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePrototypeIcons,getPrototypeIcons,setPrototypeIcons,subscribePrototypeIcons,PROTOTYPE_ICONS_KEY} from '../app/src/prototypeIcons.ts';
import {prototypeVersionUrl} from '../app/src/prototypeVersion.ts';
test('Icon links override storage, with the approved new icons as default',()=>{
 assert.equal(resolvePrototypeIcons('https://example.test/',null),'new');
 assert.equal(resolvePrototypeIcons('https://example.test/','old'),'old');
 assert.equal(resolvePrototypeIcons('https://example.test/?icons=new','old'),'new');
 assert.equal(resolvePrototypeIcons('https://example.test/?icons=unknown','invalid'),'new');
});
test('Changing icons preserves route, edition, scenario and user data; works without storage',()=>{
 const values=new Map([['booking','existing data']]);
 const previous=Object.fromEntries(['location','history','localStorage','window'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const location={href:'http://127.0.0.1:5173/?variant=november&catalogue=trip-upcoming#trips'};
 const state={booking:'123'};
 try{
  Object.assign(globalThis,{location,history:{state,replaceState(next,unused,url){assert.equal(next,state);location.href=String(url);}},localStorage:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)},window:new EventTarget()});
  let events=0;const stop=subscribePrototypeIcons(()=>events++);setPrototypeIcons('old');
  assert.equal(getPrototypeIcons(),'old');assert.equal(values.get(PROTOTYPE_ICONS_KEY),'old');assert.equal(values.get('booking'),'existing data');
  const url=new URL(location.href);assert.equal(url.hash,'#trips');assert.equal(url.searchParams.get('variant'),'november');assert.equal(url.searchParams.get('catalogue'),'trip-upcoming');
  assert.equal(new URL(prototypeVersionUrl(url.href,'/',true,true)).searchParams.get('icons'),'old');assert.equal(events,1);stop();
  globalThis.localStorage={getItem(){throw Error('disabled');},setItem(){throw Error('disabled');}};
  setPrototypeIcons('new');assert.equal(getPrototypeIcons(),'new');assert.equal(events,1);
 }finally{for(const[key,descriptor]of Object.entries(previous)){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
});
