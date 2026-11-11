import test from 'node:test';
import assert from 'node:assert/strict';
import {createSpeechInput} from '../app/src/assistant/speechInput.ts';
function fixture(){
 let rec;const text=[],states=[],errors=[];
 class Recognition {constructor(){rec=this;this.aborted=0;}start(){this.onstart?.();}stop(){this.onend?.();}abort(){this.aborted++;}result(...words){this.onresult?.({results:words.map(transcript=>({0:{transcript},isFinal:false}))});}}
 const input=createSpeechInput({Recognition,onText:t=>text.push(t),onState:s=>states.push(s),onError:e=>errors.push(e)});
 return {input,text,states,errors,get rec(){return rec;}};
}
test('Диктовка дополняет черновик; обновления промежуточного текста не дублируются',()=>{const f=fixture();f.input.start('Нужен отель');assert.equal(f.rec.lang,'ru-RU');f.rec.result('в Со');f.rec.result('в Сочи','с бассейном');assert.deepEqual(f.text,['Нужен отель в Со','Нужен отель в Сочи с бассейном']);f.input.stop();assert.equal(f.states.at(-1),'idle');assert.equal(f.text.at(-1),'Нужен отель в Сочи с бассейном');});
test('После выхода запоздалый результат не меняет черновик',()=>{const f=fixture();f.input.start('');const old=f.rec,late=old.onresult;f.input.cancel();late({results:[{0:{transcript:'поздний ответ'}}]});assert.equal(f.text.length,0);assert.equal(old.aborted,1);assert.equal(old.onresult,null);f.input.start('Новый');f.rec.result('текст');assert.equal(f.text.at(-1),'Новый текст');f.input.cancel();});
test('Отказ микрофона и ошибка сети возвращают управление без потери исходного текста',()=>{for(const error of ['not-allowed','network','audio-capture']){const f=fixture();f.input.start('Мой текст');f.rec.onerror({error});assert.equal(f.states.at(-1),'idle');assert.equal(f.text.length,0);assert.ok(f.errors.at(-1).length>10);assert.equal(f.rec.onresult,null);}});
test('Отсутствие API и тишина объясняются, сообщение не отправляется',()=>{const errors=[];const input=createSpeechInput({onText:()=>assert.fail(),onState:()=>{},onError:e=>errors.push(e)});input.start('');assert.match(errors.at(-1),/недоступен/);const f=fixture();f.input.start('');f.rec.onend();assert.match(f.errors.at(-1),/расслышать/);assert.equal(f.states.at(-1),'idle');});
test('Диктовка соблюдает лимит сообщения и останавливает микрофон',()=>{const f=fixture();f.input.start('а'.repeat(1995));f.rec.result('длинное продолжение');assert.equal(f.text.at(-1).length,2000);assert.equal(f.states.at(-1),'idle');assert.match(f.errors.at(-1),/2000/);const g=fixture();g.input.start('а'.repeat(2000));assert.equal(g.rec,undefined);assert.match(g.errors.at(-1),/2000/);});
