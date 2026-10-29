import test from 'node:test';
import assert from 'node:assert/strict';
import {initialCommerce,ensureAccount,decodeCommerce} from '../app/src/booking/model.ts';
import {newPreferenceDraft,savePreferences,preferenceDraft,matchedPreferences,preferenceOffers} from '../app/src/booking/preferences.ts';
import {holidayIdeas,nextHolidayIdea,answerHolidayIdea,undoHolidayIdea,selectedPreferenceIds,togglePreferenceInterest,parsePreferenceWish,applyPreferenceWish} from '../app/src/booking/preferenceIdeas.ts';
const owner='+79001234567';
const fixture=()=>{const s=ensureAccount(initialCommerce(),owner);s.search={...s.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:2,childrenAges:[]};return s;};
const draft=()=>({...newPreferenceDraft(fixture().search),party:'couple',stage:'themes'});
test('Новая лента, старый черновик и адаптивная следующая идея',()=>{
 const d=draft();assert.equal(d.discoveryMode,'ideas');assert.equal(nextHolidayIdea(d).id,'slow-breakfast');
 const old={...d,discoveryMode:undefined,interests:['pool']};assert.deepEqual(selectedPreferenceIds(old),['pool']);assert.equal(nextHolidayIdea(old).id,'warm-spa');
 const next=answerHolidayIdea(d,'slow-breakfast','want');assert.equal(nextHolidayIdea(next).id,'dinner');assert.deepEqual(selectedPreferenceIds(d),[]);
});
test('Ответы идемпотентны, пропуск не выбирает интерес, история отменяется',()=>{
 const d=draft(),liked=answerHolidayIdea(d,'slow-breakfast','want');assert.equal(answerHolidayIdea(liked,'slow-breakfast','no'),liked);
 const skipped=answerHolidayIdea(liked,'dinner','skip');assert.deepEqual(selectedPreferenceIds(skipped),['breakfast']);assert.deepEqual(undoHolidayIdea(skipped).ideaAnswers,liked.ideaAnswers);
 let all=d;for(const idea of holidayIdeas)all=answerHolidayIdea(all,idea.id,'no');assert.equal(nextHolidayIdea(all),undefined);assert.ok(nextHolidayIdea(undoHolidayIdea(all)));assert.deepEqual(selectedPreferenceIds(all),[]);
});
test('Источники пожеланий независимы; удалённый чип не возвращается из лайка',()=>{
 let d={...draft(),interests:['spa']};d=answerHolidayIdea(d,'evening-pool','want');d=applyPreferenceWish({...d,wishText:'Бассейн и море'},['pool','sea']);
 assert.deepEqual(new Set(selectedPreferenceIds(d)),new Set(['spa','pool','sea']));
 d=togglePreferenceInterest(d,'pool');assert.ok(!selectedPreferenceIds(d).includes('pool'));
 d=applyPreferenceWish({...d,wishText:'Тихий отель'},['quiet']);assert.deepEqual(new Set(selectedPreferenceIds(d)),new Set(['spa','quiet']));
 d=togglePreferenceInterest(d,'pool');assert.ok(selectedPreferenceIds(d).includes('pool'));
});
test('Разбор текста принимает только известные признаки и границы слов',()=>{
 assert.deepEqual(new Set(parsePreferenceWish('Хочу тихий отель у моря, с бассейном и завтраками').interests),new Set(['quiet','sea','pool','breakfast']));
 assert.deepEqual(parsePreferenceWish('Спасибо, лесенка и свадьба').interests,[]);
 assert.deepEqual(parsePreferenceWish('Без шума').interests,['quiet']);
 assert.ok(parsePreferenceWish('Нужен бассейн с подогревом').unhandled.length);
 assert.ok(parsePreferenceWish('До 5000 рублей и парковка').unhandled.length);
 assert.throws(()=>parsePreferenceWish('а'.repeat(501)),/500/);
});
test('Отрицания не превращаются в положительные пожелания',()=>{
 assert.deepEqual(parsePreferenceWish('Не хочу бассейн и спа').interests,[]);
 assert.deepEqual(parsePreferenceWish('Бассейн не нужен').interests,[]);
 assert.deepEqual(parsePreferenceWish('Не бассейн').interests,[]);
 assert.deepEqual(parsePreferenceWish('Без бассейна, хочу море').interests,['sea']);
 assert.equal(parsePreferenceWish('Без бассейна, хочу море').unhandled.length,1);
 assert.deepEqual(new Set(parsePreferenceWish('Не только бассейн, но и спа').interests),new Set(['pool','spa']));
});
test('Отмена идеи сохраняет последующее ручное удаление другого пожелания',()=>{
 let d={...draft(),interests:['spa']};d=answerHolidayIdea(d,'evening-pool','want');d=togglePreferenceInterest(d,'spa');
 assert.deepEqual(selectedPreferenceIds(undoHolidayIdea(d)),[]);
});
test('Текст не применяется до подтверждения, нельзя добавить нераспознанный признак',()=>{
 const d={...draft(),interests:['spa'],wishText:'Бассейн'};assert.deepEqual(selectedPreferenceIds(d),['spa']);
 assert.throws(()=>applyPreferenceWish(d,['sea']),/Проверьте/);assert.throws(()=>applyPreferenceWish({...d,wishText:' '},[]),/Опишите/);
 assert.deepEqual(selectedPreferenceIds(applyPreferenceWish(d,[])),['spa']);
});
test('История и текст восстанавливаются, владельцы и обычный поиск независимы',()=>{
 const s=fixture(),d=applyPreferenceWish({...answerHolidayIdea(draft(),'evening-pool','want'),wishText:'Спа'},['spa']);
 const restored=decodeCommerce(JSON.stringify(savePreferences(s,owner,d)));
 assert.deepEqual(preferenceDraft(restored,owner),d);assert.deepEqual(restored.search,s.search);assert.equal(preferenceDraft(restored,'other').wishText,undefined);assert.equal(undoHolidayIdea(preferenceDraft(restored,owner)).ideaAnswers['evening-pool'],undefined);
});
test('Лайки и подтверждённый текст участвуют в общем подборе и объяснениях',()=>{
 const s=fixture(),base=draft(),d=applyPreferenceWish({...answerHolidayIdea(base,'evening-pool','want'),wishText:'Спа'},['spa']);
 assert.deepEqual(preferenceOffers(s,owner,d),preferenceOffers(s,owner,{...base,interests:['pool','spa']}));
 assert.equal(matchedPreferences('orbit-sea',d).matched.length,2);assert.equal(matchedPreferences('pine-sochi',d).matched.length,0);
 assert.deepEqual(d.search,base.search);assert.equal(preferenceOffers(s,owner,{...d,budgetMinor:1}).length,0);
});
