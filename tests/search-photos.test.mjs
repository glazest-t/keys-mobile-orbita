import test from 'node:test';
import assert from 'node:assert/strict';
import {waitForSearchPhotos} from '../app/src/booking/searchPhotos.ts';

test('Фото выдачи: ожидание, ошибки, отмена и ограничение времени',async()=>{
 const previous=globalThis.Image;let images=[];
 globalThis.Image=class {constructor(){this.complete=false;images.push(this);}set src(value){this.url=value;if(value==='cached')this.complete=true;}};
 try{
  let finished=false;const controller=new AbortController();
  const pending=waitForSearchPhotos(['first','second'],controller.signal).then(()=>finished=true);
  await Promise.resolve();assert.equal(finished,false);
  images[0].onload();await Promise.resolve();assert.equal(finished,false);
  images[1].onerror();await pending;assert.equal(finished,true);
  assert.equal(images[0].onload,null);
  await waitForSearchPhotos(['cached'],controller.signal);
  images=[];const stopped=new AbortController();const p=waitForSearchPhotos(['slow'],stopped.signal);stopped.abort();await p;assert.equal(images[0].onload,null);
  images=[];await waitForSearchPhotos(['never-finishes'],controller.signal,10);assert.equal(images[0].onerror,null);
  await waitForSearchPhotos([],controller.signal);
 }finally{globalThis.Image=previous;}
});
