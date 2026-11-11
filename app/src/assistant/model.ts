import {catalog,searchError,startDraft,quoteDraft,type Commerce,type Search} from '../booking/model.ts';
import {roomOffers,selectRoomRate} from '../booking/roomOffers.ts';
import {mealIncludesBreakfast} from '../booking/searchFacets.ts';
import {hotelVisual} from '../booking/presentation.ts';
import {newPreferenceDraft,matchedPreferences} from '../booking/preferences.ts';
import {parsePreferenceWish} from '../booking/preferenceIdeas.ts';

export type FinderTrip={search:Search;datesSet:boolean;guestsSet:boolean;budgetMinor:number|null;interests:string[]};
export type FinderMessage={id:string;role:'user'|'assistant';text:string;at:number;status?:'working'|'done'|'stopped'|'error';hotelIds?:string[];hotelReasons?:Record<string,string>;trip?:FinderTrip;followups?:string[]};
export type FinderChat={id:string;title:string;updated:number;draft:string;trip:FinderTrip;messages:FinderMessage[]};
export type FinderLibrary={activeId:string|null;chats:FinderChat[];hints:boolean};
export function finderLibrary(s:Commerce,owner:string):FinderLibrary{return s.finderLibraries?.[owner]||{activeId:null,chats:[],hints:true};}
export function updateFinder(s:Commerce,owner:string,change:(v:FinderLibrary)=>FinderLibrary):Commerce{return {...s,finderLibraries:{...s.finderLibraries,[owner]:change(finderLibrary(s,owner))}};}
export function createFinderChat(s:Commerce,owner:string,id:string,now=Date.now()):Commerce{
 return updateFinder(s,owner,v=>({...v,activeId:id,chats:[{id,title:'Новый диалог',updated:now,draft:'',messages:[],trip:{search:{...s.search,city:'Любой город',adults:2,childrenAges:[],withPet:false,businessTrip:false,byCar:false},datesSet:false,guestsSet:false,budgetMinor:null,interests:[]}},...v.chats]}));
}
export function updateFinderChat(s:Commerce,owner:string,id:string,patch:(c:FinderChat)=>FinderChat):Commerce{return updateFinder(s,owner,v=>({...v,chats:v.chats.map(c=>c.id===id?patch(c):c)}));}
export function deleteFinderChat(s:Commerce,owner:string,id:string):Commerce{return updateFinder(s,owner,v=>{const chats=v.chats.filter(c=>c.id!==id);return {...v,chats,activeId:v.activeId===id?chats[0]?.id||null:v.activeId};});}
export function renameFinderChat(s:Commerce,owner:string,id:string,title:string):Commerce{
 const name=title.trim().replace(/\s+/g,' ');if(!name||name.length>80)throw Error('Введите название до 80 символов');
 return updateFinderChat(s,owner,id,c=>({...c,title:name}));
}
const cities:[RegExp,string][]=[[/сочи|сириус|адлер/iu,'Сочи'],[/москв/iu,'Москва'],[/петербург|питер|спб/iu,'Санкт-Петербург'],[/казан/iu,'Казань'],[/калининград/iu,'Калининград'],[/алта/iu,'Алтай']];
const negativeTerms:Record<string,string>={pool:'бассейн',spa:'спа',sea:'мор',breakfast:'завтрак',restaurant:'ресторан',quiet:'тишин',greenery:'зелен',walks:'прогул',design:'дизайн'};
export function interpretFinderTrip(base:FinderTrip,text:string):FinderTrip{
 const next=structuredClone(base),q=text.toLocaleLowerCase('ru').replace(/ё/g,'е');
 const city=cities.find(([r])=>r.test(q));if(city)next.search.city=city[1];if(/любой город|куда угодно/.test(q))next.search.city='Любой город';
 const parsed=parsePreferenceWish(q.slice(0,500));
 next.interests=[...new Set([...next.interests,...parsed.interests])].filter(id=>!new RegExp(`(?:без|не нужен|не нужна|не нужно)\\s+${negativeTerms[id]||'____'}`,'u').test(q));
 if(/без ограничени.{0,8}бюджет|любой бюджет/.test(q))next.budgetMinor=null;
 else {const budget=q.match(/(?:до|бюджет(?:ом)?(?:\s+до)?)\s*(\d[\d \u00a0]*(?:[.,]\d+)?)\s*(тыс|к\b)?/u);if(budget){const rub=Number(budget[1].replace(/[ \u00a0]/g,'').replace(',','.'))*(budget[2]?1000:1);if(rub>0&&rub<=1000000)next.budgetMinor=Math.round(rub*100);}}
 const adults=q.match(/([1-6])\s*(?:взросл|взр|гост)/u);if(adults){next.search.adults=Number(adults[1]);next.guestsSet=true;}else if(/вдвоем|на двоих|для двоих/.test(q)){next.search.adults=2;next.guestsSet=true;}else if(/один|одна|для одного/.test(q)){next.search.adults=1;next.guestsSet=true;}
 if(/без детей/.test(q))next.search.childrenAges=[];
 else if(/ребен|дет[ьи]/.test(q)){const age=q.match(/(?:ребен[^\d]{0,12}|возраст[^\d]{0,12})(\d{1,2})\s*(?:лет|год|года)/u);next.search.childrenAges=age&&Number(age[1])<18?[Number(age[1])]:next.search.childrenAges.length?next.search.childrenAges:[-1];next.guestsSet=true;}
 const dates=[...q.matchAll(/\b(20\d{2}-\d{2}-\d{2}|\d{1,2}\.\d{1,2}\.20\d{2})\b/g)].map(m=>m[1].includes('.')?m[1].split('.').reverse().map((p,i)=>i?p.padStart(2,'0'):p).join('-'):m[1]);
 if(dates.length>=2){next.search.checkIn=dates[0];next.search.checkOut=dates[1];next.datesSet=true;}
 return next;
}
export function finderSearchCommerce(s:Commerce,trip:FinderTrip):Commerce{return {...s,search:structuredClone(trip.search),searchFilters:[],searchDistrict:undefined,priceRangeMinor:undefined,maxNightly:null,minRating:0,collection:undefined,searchSort:'recommended'};}
export function finderHotelQuote(s:Commerce,owner:string,hotelId:string,trip:FinderTrip){
 if(!trip.datesSet||!trip.guestsSet||searchError(trip.search))return undefined;
 try{return quoteDraft(startDraft(finderSearchCommerce(s,trip),hotelId,'finder-preview',owner),owner);}catch{return undefined;}
}
/** Indicative public catalogue rate only; never passed off as a dated booking quote. */
export function finderStartingPrice(hotelId:string,trip:FinderTrip):number|undefined{
 if(trip.datesSet&&trip.guestsSet)return undefined;
 const rooms=catalog.rooms.filter(r=>r.hotelId===hotelId&&(!trip.guestsSet||r.maxGuests>=trip.search.adults+trip.search.childrenAges.length));
 const amounts=catalog.rates.filter(r=>r.kind==='standard'&&rooms.some(room=>room.id===r.roomId)).map(r=>r.nightlyMinor).filter(n=>Number.isFinite(n)&&n>0);
 return amounts.length?Math.min(...amounts):undefined;
}
/** Up to two room categories, using the same availability, rate access and quote as booking. */
export function finderRoomOffers(s:Commerce,owner:string,hotelId:string,trip:FinderTrip){
 const breakfast=trip.interests.includes('breakfast');
 if(trip.datesSet&&trip.guestsSet){
  if(searchError(trip.search))return [];
  try{
   const preview=startDraft(finderSearchCommerce(s,trip),hotelId,'finder-rooms',owner);
   return roomOffers(preview,owner).flatMap(({room,rates})=>{
    const offer=rates.filter(({rate,quote})=>(!breakfast||mealIncludesBreakfast(rate.mealPlan))&&(trip.budgetMinor===null||quote.lodgingMinor/quote.nights<=trip.budgetMinor)).sort((a,b)=>a.quote.lodgingMinor-b.quote.lodgingMinor)[0];
    return offer?[{room,rate:offer.rate,quote:offer.quote,nightlyMinor:offer.rate.nightlyMinor}]:[];
   }).sort((a,b)=>a.quote.lodgingMinor-b.quote.lodgingMinor).slice(0,2);
  }catch{return [];}
 }
 return catalog.rooms.filter(room=>room.hotelId===hotelId&&(!trip.guestsSet||room.maxGuests>=trip.search.adults+trip.search.childrenAges.length)).flatMap(room=>{
  const rate=catalog.rates.filter(rate=>rate.roomId===room.id&&rate.kind==='standard'&&(!breakfast||mealIncludesBreakfast(rate.mealPlan))&&(trip.budgetMinor===null||rate.nightlyMinor<=trip.budgetMinor)).sort((a,b)=>a.nightlyMinor-b.nightlyMinor)[0];
  return rate?[{room,rate,quote:undefined,nightlyMinor:rate.nightlyMinor}]:[];
 }).sort((a,b)=>a.nightlyMinor-b.nightlyMinor).slice(0,2);
}
export function finderMatches(hotelId:string,trip:FinderTrip){return matchedPreferences(hotelId,{...newPreferenceDraft(trip.search),interests:trip.interests});}
/** Prototype explanation grounded only in the hotel's known facts and the request snapshot. */
export function finderRecommendation(hotelId:string,trip:FinderTrip){
 const hotel=catalog.hotels.find(h=>h.id===hotelId);if(!hotel)return '';
 const matches=finderMatches(hotelId,trip),visual=hotelVisual(hotelId);
 const reasons:Record<string,string>={
  pool:'Вы хотели бассейн — здесь он есть прямо в отеле.',
  spa:'Вы хотели отдых со спа — здесь для этого не нужно выезжать из отеля.',
  sea:`Для вашего отдыха у моря подходит и расположение: ${visual.distance}.`,
  breakfast:'Завтраки есть в отеле — удобно начинать день без поисков кафе. Включено ли питание, зависит от выбранного тарифа.',
  restaurant:'В отеле есть ресторан, поэтому для ужина не обязательно куда-то ехать.',
  quiet:'Вы просили спокойное место — в описании этого отеля отмечено тихое расположение.',
  greenery:'Рядом есть зелень и прогулочные зоны — это подходит под ваше пожелание быть ближе к природе.',
  walks:'Рядом есть места для прогулок, как вы и хотели.',
  design:'Дизайнерские интерьеры отвечают вашему пожеланию пожить в красивом месте.',
  kids:'В описании отмечено, что отель подходит для отдыха с детьми.',
  work:'В номере предусмотрено рабочее место — удобно, если во время поездки нужно поработать.',
 };
 let text=matches.matched.length?matches.matched.slice(0,3).map(m=>reasons[m.id]||m.text+'.').join(' '):trip.search.city!=='Любой город'?`Этот отель находится в выбранном вами направлении — ${hotel.city}.`:`Этот вариант находится в городе ${hotel.city}.`;
 if(matches.matched.length>3)text+=' Также вашим пожеланиям соответствуют: '+matches.matched.slice(3).map(m=>m.text.toLocaleLowerCase('ru')).join(', ')+'.';
 if(matches.missing.length)text+=' По пожеланиям «'+matches.missing.join('», «')+'» в описании нет подтверждения — эти детали стоит уточнить у отеля.';
 else if(!matches.total)text+=' Расскажите, что вам важно в отеле, и я смогу объяснить, насколько он подходит именно вам.';
 return text;
}
export function finderHotels(s:Commerce,owner:string,trip:FinderTrip){
 return catalog.hotels.filter(h=>trip.search.city==='Любой город'||h.city===trip.search.city).map(h=>({h,matches:finderMatches(h.id,trip),quote:finderHotelQuote(s,owner,h.id,trip)})).filter(o=>{
  if(trip.datesSet&&trip.guestsSet&&!o.quote)return false;
  if(trip.budgetMinor!==null){const nightly=o.quote?o.quote.lodgingMinor/o.quote.nights:Math.min(...catalog.rates.filter(r=>catalog.rooms.some(room=>room.id===r.roomId&&room.hotelId===o.h.id)&&r.kind==='standard').map(r=>r.nightlyMinor));if(Number.isFinite(nightly)&&nightly>trip.budgetMinor)return false;}
  return true;
 }).sort((a,b)=>b.matches.matched.length-a.matches.matched.length||hotelVisual(b.h.id).rating-hotelVisual(a.h.id).rating);
}
export function sendFinderMessage(s:Commerce,owner:string,chatId:string,text:string,id:string,now=Date.now()):Commerce{
 const c=finderLibrary(s,owner).chats.find(c=>c.id===chatId);if(!c)throw Error('Диалог не найден');
 const clean=text.trim();if(!clean||clean.length>2000)throw Error('Напишите сообщение до 2000 символов');
 if(c.messages.some(m=>m.status==='working'))throw Error('Дождитесь ответа или остановите его');
 const trip=interpretFinderTrip(c.trip,clean);
 return updateFinderChat(s,owner,chatId,c=>({...c,title:c.messages.length?c.title:clean.slice(0,60),updated:now,draft:'',trip,messages:[...c.messages,{id:id+'-user',role:'user',text:clean,at:now},{id,role:'assistant',text:'',at:now,status:'working',trip}]}));
}
export function completeFinderReply(s:Commerce,owner:string,chatId:string,messageId:string):Commerce{
 const c=finderLibrary(s,owner).chats.find(c=>c.id===chatId),m=c?.messages.find(m=>m.id===messageId);if(!c||!m||m.status!=='working'||!m.trip)return s;
 const trip=m.trip,query=(c.messages[c.messages.indexOf(m)-1]?.text||'').toLocaleLowerCase('ru').replace(/ё/g,'е'),previous=c.messages.slice(0,c.messages.indexOf(m)).filter(x=>x.role==='assistant'&&x.hotelIds?.length).at(-1);
 let hotelIds:string[]=[],text='',followups:string[]=[];
 const error=trip.datesSet?searchError(trip.search):trip.search.childrenAges.some(a=>a<0)?'Укажите возраст каждого ребёнка в параметрах поездки':'';
 if(error)text=error;
 else if(/^(привет|здравствуйте|спасибо|благодарю)[!. ]*$/iu.test(query))text='Расскажите, где хотите отдохнуть и что важно в отеле. Можно написать город, бюджет и пожелания одним сообщением.';
 else if(/расскаж|подробнее|что есть|сравни|какой из|чем отлич/iu.test(query)&&previous){
  const selected=previous.hotelIds!.filter(id=>query.toLocaleLowerCase('ru').includes(catalog.hotels.find(h=>h.id===id)!.name.toLocaleLowerCase('ru')));
  hotelIds=selected.length?selected:previous.hotelIds!.slice(0,/сравни|чем отлич/iu.test(query)?2:1);
  text=hotelIds.map(id=>{const h=catalog.hotels.find(h=>h.id===id)!,v=hotelVisual(id);return `${h.name}\n${v.description}\nУдобства: ${v.amenities.slice(0,6).join(', ')}.`;}).join('\n\n');
 }else{
  let offers=finderHotels(s,owner,trip);if(/дешевле|подешевле/.test(query))offers.sort((a,b)=>(a.quote?.lodgingMinor||hotelBasePrice(a.h.id))-(b.quote?.lodgingMinor||hotelBasePrice(b.h.id)));
  if(/еще варианты|другие варианты/.test(query)&&previous){const seen=new Set(c.messages.flatMap(m=>m.hotelIds||[]));offers=offers.filter(o=>!seen.has(o.h.id));}
  hotelIds=offers.slice(0,3).map(o=>o.h.id);
  text=hotelIds.length?`Вот ${hotelIds.length===1?'вариант':'варианты'}${trip.search.city==='Любой город'?' для вашей поездки':` в городе ${trip.search.city}`}. ${trip.interests.length?'Под карточками — совпадения с пожеланиями и то, что стоит уточнить.':''}`:'По этим условиям вариантов в каталоге прототипа нет. Попробуйте другой город, даты или бюджет.';
  if(hotelIds.length&&!trip.datesSet)text+=' Выберите даты и гостей, чтобы уточнить стоимость проживания.';
  else if(hotelIds.length&&!trip.guestsSet)text+=' Укажите гостей, чтобы рассчитать стоимость.';
 }
 if(hotelIds.length)followups=['Покажи подешевле',hotelIds.length>1?'Сравни эти отели':'Расскажи подробнее','Покажи ещё варианты'];
 else followups=error?[]:['Отель в Сочи у моря','Отель в Москве со спа','Тихий отдых в Санкт-Петербурге'];
 return updateFinderChat(s,owner,chatId,c=>({...c,messages:c.messages.map(x=>x.id===messageId?{...x,text,hotelIds,hotelReasons:Object.fromEntries(hotelIds.map(id=>[id,finderRecommendation(id,trip)])),followups,status:'done'}:x)}));
}
function hotelBasePrice(id:string){const ids=catalog.rooms.filter(r=>r.hotelId===id).map(r=>r.id);return Math.min(...catalog.rates.filter(r=>ids.includes(r.roomId)&&r.kind==='standard').map(r=>r.nightlyMinor));}
export function stopFinderReply(s:Commerce,owner:string,chatId:string,id:string){return updateFinderChat(s,owner,chatId,c=>({...c,messages:c.messages.map(m=>m.id===id&&m.status==='working'?{...m,status:'stopped',text:'Ответ остановлен.'}:m)}));}
export function retryFinderReply(s:Commerce,owner:string,chatId:string,id:string){return updateFinderChat(s,owner,chatId,c=>({...c,messages:c.messages.map(m=>m.id===id&&(m.status==='stopped'||m.status==='error')?{...m,status:'working',text:'',at:Date.now()}:m)}));}
export function startFinderBooking(s:Commerce,owner:string,chatId:string,hotelId:string,trip:FinderTrip,id:string,rateId?:string):Commerce{
 const chat=finderLibrary(s,owner).chats.find(c=>c.id===chatId);if(!chat?.messages.some(m=>m.hotelIds?.includes(hotelId)))throw Error('Отель не найден в этом диалоге');
 if(!trip.datesSet||!trip.guestsSet)throw Error('Выберите даты и гостей');
 const error=searchError(trip.search);if(error)throw Error(error);
 let next=startDraft(finderSearchCommerce(s,trip),hotelId,id,owner);
 if(rateId){next=selectRoomRate(next,owner,rateId);next={...next,draft:{...next.draft!,step:'guest'}};}
 return {...updateFinderChat(s,owner,chatId,c=>({...c,trip:structuredClone(trip)})),viewedHotels:next.viewedHotels,draft:{...next.draft!,returnTo:'ai-assistant',preferenceMatches:finderMatches(hotelId,trip).matched.map(m=>m.text)}};
}
export function finderHint(text:string,trip:FinderTrip){
 if(text.trim().length<3||/^(привет|спасибо|расскажи|сравни)/iu.test(text))return null;
 const next=interpretFinderTrip(trip,text);
 if(next.search.city==='Любой город')return {label:'Укажите город или направление',kind:'city' as const};
 if(!next.datesSet)return {label:'Добавьте даты поездки',kind:'dates' as const};
 if(!next.guestsSet||next.search.childrenAges.some(a=>a<0))return {label:'Уточните, кто едет',kind:'guests' as const};
 if(next.budgetMinor===null)return {label:'Можно указать бюджет за ночь',kind:'budget' as const};
 return null;
}

export function failFinderReply(s:Commerce,owner:string,chatId:string,id:string){return updateFinderChat(s,owner,chatId,c=>({...c,messages:c.messages.map(m=>m.id===id&&m.status==='working'?{...m,status:'error',text:'Не удалось подготовить ответ. Попробуйте ещё раз.'}:m)}));}
