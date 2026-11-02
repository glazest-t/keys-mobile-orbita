import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {preferenceIllustrations,preferenceIllustrationFor} from '../app/src/booking/preferenceIllustrations.ts';
import {swipeThemes} from '../app/src/booking/swipePreferences.ts';
test('Утверждённые 32 иконки имеют уникальные ID и области без подписей',()=>{
 assert.equal(preferenceIllustrations.length,32);
 assert.equal(new Set(preferenceIllustrations.map(i=>i.id)).size,32);
 for(const icon of preferenceIllustrations){
  assert.ok(existsSync(new URL(`../app/public/assets/preferences/set-1-${icon.sheet}.png`,import.meta.url)));
  const [x,y,w,h]=icon.rect;
  assert.ok(x>=0&&y>=0&&w>0&&h>0&&x+w<=1536&&y+h<=1024);
  assert.equal(preferenceIllustrationFor(icon.id),icon);
 }
});
test('Иконки соответствуют предпочтениям, морю не приписывается частный пляж',()=>{
 for(const label of swipeThemes.flatMap(t=>t.features))assert.ok(preferenceIllustrationFor(label),label);
 const samples={'Море рядом · 200 м':'water','Свой пляж':'beach','Тихое расположение':'quiet','Бассейн в отеле':'pool','Подходит для отдыха с детьми':'kids','Рядом зелень и прогулочные зоны':'nature','Места для прогулок рядом':'park','В отеле есть завтраки':'breakfast','В номере есть рабочее место':'work','Спа в отеле':'spa','Дизайнерские интерьеры':'design'};
 for(const [label,id] of Object.entries(samples))assert.equal(preferenceIllustrationFor(label)?.id,id);
 assert.equal(preferenceIllustrationFor('Неизвестная особенность'),undefined);
});
