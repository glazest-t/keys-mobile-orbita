import type {PreferenceDraft} from './preferences.ts';

export type IdeaAnswer='want'|'no'|'skip';
export const holidayIdeas=[
 {id:'slow-breakfast',interest:'breakfast',theme:'food',cover:'breakfast',tag:'В отеле',title:'Начать день с завтрака',text:'Без спешки, пока город просыпается.'},
 {id:'evening-pool',interest:'pool',theme:'water',cover:'pool',tag:'В отеле',title:'Отдохнуть у бассейна',text:'Вода, шезлонг и время для себя.'},
 {id:'warm-spa',interest:'spa',theme:'water',cover:'hammam',tag:'Для себя',title:'Устроить день спа',text:'Согреться и отпустить повседневные заботы.'},
 {id:'sea-air',interest:'sea',theme:'water',cover:'yacht',tag:'Рядом с отелем',title:'Быть ближе к морю',text:'Выходить к воде и встречать закат.'},
 {id:'sleep-well',interest:'quiet',theme:'rest',cover:'sleep',tag:'В отеле',title:'Просто выспаться',text:'Тихое место и утро без будильника.'},
 {id:'green-retreat',interest:'greenery',theme:'nature',cover:'waterfall',tag:'На природе',title:'Побыть среди зелени',text:'Сменить городской ритм на прогулки.'},
 {id:'slow-walks',interest:'walks',theme:'nature',cover:'terrace',tag:'Рядом с отелем',title:'Гулять без плана',text:'Оставить время для новых впечатлений.'},
 {id:'dinner',interest:'restaurant',theme:'food',cover:'gastro',tag:'В отеле',title:'Остаться на ужин',text:'Попробовать что-нибудь новое в ресторане отеля.'},
 {id:'beautiful-stay',interest:'design',theme:'self',cover:'sleep',tag:'Для себя',title:'Пожить в красивом месте',text:'Интерьеры, которые хочется рассматривать.'},
] as const;
export const WISH_LIMIT=500;
export function selectedPreferenceIds(d:PreferenceDraft){
 const liked=holidayIdeas.filter(i=>d.ideaAnswers?.[i.id]==='want').map(i=>i.interest);
 return [...new Set([...d.interests,...liked,...(d.wishInterests||[])])].filter(id=>!d.dismissedInterests?.includes(id));
}
export function togglePreferenceInterest(d:PreferenceDraft,id:string):PreferenceDraft{
 const selected=selectedPreferenceIds(d).includes(id);
 return {...d,interests:selected?d.interests.filter(i=>i!==id):[...new Set([...d.interests,id])],dismissedInterests:selected?[...new Set([...(d.dismissedInterests||[]),id])]:(d.dismissedInterests||[]).filter(i=>i!==id)};
}
export function nextHolidayIdea(d:PreferenceDraft){
 const chosen=selectedPreferenceIds(d),likedThemes=holidayIdeas.filter(i=>chosen.includes(i.interest)).map(i=>i.theme);
 return holidayIdeas.filter(i=>!d.ideaAnswers?.[i.id]).map((idea,index)=>({idea,index,weight:chosen.includes(idea.interest)?-2:likedThemes.includes(idea.theme)?2:d.party==='kids'&&idea.theme==='nature'?1:0})).sort((a,b)=>b.weight-a.weight||a.index-b.index)[0]?.idea;
}
export function answerHolidayIdea(d:PreferenceDraft,id:string,answer:IdeaAnswer):PreferenceDraft{
 const idea=holidayIdeas.find(i=>i.id===id);if(!idea)throw Error('Идея не найдена');
 if(d.ideaAnswers?.[id])return d;
 return {...d,ideaHistory:[...(d.ideaHistory||[]),{id,answers:{...d.ideaAnswers},dismissed:[...(d.dismissedInterests||[])]}],ideaAnswers:{...d.ideaAnswers,[id]:answer},dismissedInterests:answer==='want'?(d.dismissedInterests||[]).filter(i=>i!==idea.interest):d.dismissedInterests};
}
export function undoHolidayIdea(d:PreferenceDraft):PreferenceDraft{
 const last=d.ideaHistory?.at(-1);if(!last)return d;
 const interest=holidayIdeas.find(i=>i.id===last.id)?.interest;
 const restoreDismissal=interest&&d.ideaAnswers?.[last.id]==='want'&&last.dismissed.includes(interest)&&!d.interests.includes(interest);
 return {...d,ideaAnswers:last.answers,dismissedInterests:restoreDismissal?[...new Set([...(d.dismissedInterests||[]),interest])]:d.dismissedInterests,ideaHistory:d.ideaHistory!.slice(0,-1)};
}

const patterns:[string,RegExp][]=[
 ['pool',/бассейн[а-яё]*/gu],['spa',/спа|хаммам[а-яё]*/gu],['sea',/мор[еяю]|пляж[а-яё]*/gu],
 ['breakfast',/завтрак[а-яё]*/gu],['restaurant',/ресторан[а-яё]*/gu],['quiet',/тишин[а-яё]*|тих[а-яё]*|выспаться|без\s+шума/gu],
 ['greenery',/зелень|зелени|зелен[а-яё]*|лес(?:а|у|ом|е|ной|ные|ных)?|сад(?:а|у|ом|е|ы|ов)?/gu],['walks',/прогул[а-яё]*|гулять/gu],['design',/дизайн[а-яё]*|интерьер[а-яё]*/gu],
];
/** Conservative, local keyword parser. Unrecognised/negative requirements stay visible for clarification. */
export function parsePreferenceWish(text:string){
 if(text.length>WISH_LIMIT)throw Error('Не больше 500 символов');
 const found=new Set<string>(),unhandled:string[]=[];
 const fragments=text.trim().split(/[.,;!?\n]+|\s+но\s+/u).map(s=>s.trim()).filter(Boolean);
 for(const fragment of fragments){
  const normalized=fragment.toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/не только\s+/g,'');
  let rest=normalized,recognized=false,negative=false;
  for(const [id,re] of patterns){
   for(const match of normalized.matchAll(re)){
    const start=match.index!,end=start+match[0].length;
    if(/[а-яa-z]/u.test(normalized[start-1]||'')||/[а-яa-z]/u.test(normalized[end]||''))continue;
    const before=normalized.slice(0,start);
    const cues=[...before.matchAll(/(?:^|\s)(без|не(?:\s+(?:хочу|нуж[а-я]*|надо|люблю))?|избег[а-я]*|никак[а-я]*|хочу|нуж[а-я]*)\s/gu)];
    const cue=cues.at(-1)?.[1]||'';
    if(cue==='без'||cue==='не'||cue.startsWith('не ')||cue.startsWith('избег')||cue.startsWith('никак')||/^\s+(?:мне\s+)?не\s+(?:нуж[а-я]*|надо|хочу)/u.test(normalized.slice(end))){negative=true;continue;}
    found.add(id);recognized=true;rest=rest.replace(match[0],' ');
   }
  }
  const residue=rest.split(/[^а-яa-z0-9]+/u).filter(w=>w&&!['хочу','хотим','хотелось','бы','мне','нам','нужен','нужна','нужно','нужны','отель','отеля','отеле','отдых','отдыха','с','со','и','или','рядом','у','на','в','для','чтобы','были','был','была','было','есть','свои','красивые','красивый','красивыми','хороший','хорошие','желательно','пожалуйста','важно','поближе','к','также','еще','очень','без','шума'].includes(w));
  if(!recognized||negative||residue.length)unhandled.push(fragment);
 }
 return {interests:[...found],unhandled};
}
export function applyPreferenceWish(d:PreferenceDraft,accepted:string[]):PreferenceDraft{
 const text=d.wishText?.trim()||'';if(!text)throw Error('Опишите свой отдых');
 const parsed=parsePreferenceWish(text),ids=[...new Set(accepted)];
 if(ids.some(id=>!parsed.interests.includes(id)))throw Error('Проверьте распознанные пожелания');
 return {...d,wishAppliedText:text,wishInterests:ids,dismissedInterests:(d.dismissedInterests||[]).filter(id=>!ids.includes(id))};
}
