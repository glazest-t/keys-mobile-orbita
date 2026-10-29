import {selectedPreferenceIds,type IdeaAnswer} from './preferenceIdeas.ts';
import {type Commerce,type Search,searchError,searchHotels,startDraft,quoteDraft} from './model.ts';
import {discoveryOffers} from './offers.ts';
import {sortKey,type SearchOptions} from './filterSchema.ts';
import {hotelVisual} from './presentation.ts';
export type PreferenceDraft={source?:'text';discoveryMode?:'ideas'|'themes';ideaAnswers?:Record<string,IdeaAnswer>;ideaHistory?:{id:string;answers:Record<string,IdeaAnswer>;dismissed:string[]}[];dismissedInterests?:string[];wishText?:string;wishAppliedText?:string;wishInterests?:string[];stage:'direction'|'themes'|'topic'|'results';resultFilters?:SearchOptions;mode:'any'|'city';city:string;cityQuery:string;party:string;interests:string[];budgetMinor:number|null;topic:string;sort:'match'|'price'|'rating';search:Search};
export const parties=[{id:'solo',title:'Один',art:'adults'},{id:'couple',title:'Вдвоём',art:'couple'},{id:'kids',title:'С детьми',art:'kids'},{id:'work',title:'По работе',art:'work'},{id:'friends',title:'С друзьями',art:'restaurant'}];
export const interests=[
 {id:'pool',title:'Бассейн',art:'pool'}, {id:'spa',title:'Спа',art:'spa'}, {id:'sea',title:'Море рядом',art:'sea'},
 {id:'breakfast',title:'Завтраки',art:'breakfast'},{id:'restaurant',title:'Ресторан',art:'restaurant'},
 {id:'quiet',title:'Тишина',art:'sleep'},{id:'greenery',title:'Сад и зелень',art:'greenery'},
 {id:'walks',title:'Прогулки рядом',art:'hiking'},{id:'design',title:'Красивые интерьеры',art:'couple'},
];
export const themes=[
 {id:'water',title:'Вода и спа',cover:'pool',items:['pool','spa','sea']},
 {id:'food',title:'Еда',cover:'gastro',items:['breakfast','restaurant']},
 {id:'rest',title:'Отдых и сон',cover:'sleep',items:['quiet']},
 {id:'nature',title:'Природа',cover:'waterfall',items:['greenery','sea']},
 {id:'active',title:'Активный отдых',cover:'sup',items:['walks']},
 {id:'self',title:'Для себя',cover:'yoga',items:['spa','quiet','design']},
];
export function newPreferenceDraft(search:Search):PreferenceDraft{return {discoveryMode:'ideas',stage:'direction',mode:'any',city:'',cityQuery:'',party:'',interests:[],budgetMinor:null,topic:'water',sort:'match',search:{...search,withPet:false,businessTrip:false,byCar:false,childrenAges:[...search.childrenAges]}};}
export function preferenceDraft(s:Commerce,owner:string){return s.preferenceDrafts?.[owner]||newPreferenceDraft(s.search);}
export function savePreferences(s:Commerce,owner:string,d:PreferenceDraft):Commerce{return {...s,preferenceDrafts:{...s.preferenceDrafts,[owner]:d}};}
export function preferenceSearch(d:PreferenceDraft):Search{return {...d.search,city:d.mode==='any'?'Любой город':d.city};}
export function preferenceError(d:PreferenceDraft){if(d.mode==='city'&&!d.city)return 'Выберите город из подсказок';if(d.source!=='text'&&!parties.some(p=>p.id===d.party))return 'Выберите, с кем едете';return searchError(preferenceSearch(d));}
const isGreen=(id:string)=>['pine-sochi','orbit-forest'].includes(id);
export function matchedPreferences(id:string,d:PreferenceDraft){
 const v=hotelVisual(id),rules:Record<string,[boolean,string]>={
  pool:[v.amenities.includes('Бассейн'),'Бассейн в отеле'],spa:[v.amenities.includes('Спа'),'Спа в отеле'],sea:[v.styles.includes('У моря'),'Море рядом · '+v.distance],
  breakfast:[v.amenities.includes('Завтрак'),'В отеле есть завтраки'],restaurant:[v.amenities.includes('Ресторан'),'Ресторан в отеле'],quiet:[v.styles.includes('Тихое место'),'Тихое расположение'],
  greenery:[isGreen(id),'Рядом зелень и прогулочные зоны'],walks:[isGreen(id)||v.styles.includes('У моря'),'Места для прогулок рядом'],design:[v.styles.includes('Дизайн'),'Дизайнерские интерьеры'],
  kids:[v.styles.includes('С детьми'),'Подходит для отдыха с детьми'],work:[v.amenities.includes('Рабочее место'),'В номере есть рабочее место'],
 };
 const requested=[...new Set([...selectedPreferenceIds(d),...(['kids','work'].includes(d.party)?[d.party]:[])])].filter(id=>rules[id]);
 return {total:requested.length,matched:requested.filter(key=>rules[key][0]).map(key=>({id:key,text:rules[key][1]})),missing:requested.filter(key=>!rules[key][0]).map(key=>interests.find(i=>i.id===key)?.title||parties.find(p=>p.id===key)?.title||key)};
}
export function preferenceSearchCommerce(s:Commerce,d:PreferenceDraft):Commerce{
 return {...s,search:preferenceSearch(d),searchFilters:[],searchSort:'recommended',searchDistrict:undefined,maxNightly:null,priceRangeMinor:d.source==='text'&&d.budgetMinor!==null?{min:null,max:d.budgetMinor}:undefined,priceMode:d.budgetMinor!==null?'night':'stay',minRating:0,collection:undefined,...(d.source==='text'?d.resultFilters:undefined)};
}
export function preferenceOffers(s:Commerce,owner:string,d:PreferenceDraft){
 if(preferenceError(d))return [];
 const clean=preferenceSearchCommerce(s,d);
 const base=d.source==='text'?discoveryOffers(clean,owner):searchHotels(clean).map(h=>({h,q:quoteDraft(startDraft(clean,h.id,'preference-preview',owner),owner)}));
 const result=base.map(o=>({...o,...matchedPreferences(o.h.id,d)})).filter(x=>(x.total===0||x.matched.length>0)&&(d.budgetMinor===null||x.q.lodgingMinor<=d.budgetMinor*x.q.nights));
 if(d.source==='text'&&sortKey(clean.searchSort)!=='recommended')return result;
 return result.sort((a,b)=>d.source!=='text'&&d.sort==='price'?a.q.lodgingMinor-b.q.lodgingMinor:d.source!=='text'&&d.sort==='rating'?hotelVisual(b.h.id).rating-hotelVisual(a.h.id).rating:b.matched.length-a.matched.length||hotelVisual(b.h.id).rating-hotelVisual(a.h.id).rating||a.h.id.localeCompare(b.h.id));
}
export function startPreferenceBooking(s:Commerce,owner:string,hotelId:string,id:string,source?:'text'):Commerce{
 const d=source==='text'?freeTextDraft(s,owner):preferenceDraft(s,owner);const error=preferenceError(d);if(error)throw Error(error);
 if(!preferenceOffers(s,owner,d).some(x=>x.h.id===hotelId))throw Error('Отель больше недоступен для выбранных условий');
 const next=startDraft(preferenceSearchCommerce(s,d),hotelId,id,owner);
 return {...s,viewedHotels:next.viewedHotels,draft:{...next.draft!,returnTo:source==='text'?'wish-search':'preferences',preferenceMatches:matchedPreferences(hotelId,d).matched.map(m=>m.text)}};
}

// Old intermediate screens are retired; restore their saved drafts directly into results.
export function normalizeTextDraft(d:PreferenceDraft):PreferenceDraft{
 const {district,districtReturn,summaryFromDistrict,...rest}=d as PreferenceDraft&{district?:unknown;districtReturn?:unknown;summaryFromDistrict?:unknown};
 return {...rest,source:'text',stage:['districts','summary'].includes(d.stage)?'results':d.stage};
}
export function freeTextDraft(s:Commerce,owner:string):PreferenceDraft{return normalizeTextDraft(s.freeTextDrafts?.[owner]||{...newPreferenceDraft(s.search),source:'text',mode:s.search.city&&s.search.city!=='Любой город'?'city':'any',city:s.search.city,cityQuery:s.search.city});}
export function saveFreeText(s:Commerce,owner:string,d:PreferenceDraft):Commerce{return {...s,freeTextDrafts:{...s.freeTextDrafts,[owner]:normalizeTextDraft(d)}};}
