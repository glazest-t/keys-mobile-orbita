import {mealLabel,roomFacets} from './searchFacets.ts';
import {trimGuests} from './bookingParty.ts';
import {available,catalog,cancellationDeadline,quoteDraft,type Commerce,type Search} from './model.ts';

export type RoomFilters={bed:'any'|'double'|'twin';breakfast:boolean;freeCancellation:boolean;payment:'any'|'at_hotel'|'online'};
export const emptyRoomFilters:RoomFilters={bed:'any',breakfast:false,freeCancellation:false,payment:'any'};
export const roomBeds=(id:string):('double'|'twin'|'single')[]=>roomFacets(id)?.beds.map(b=>b==='Одна двуспальная'?'double':b==='Одна односпальная'?'single':'twin')||['double','twin'];
// Все тарифы текущего демонстрационного каталога допускают оба способа оплаты.
export const roomPaymentMethods = ['at_hotel','online'] as const;
export function rateTitle(rate:typeof catalog.rates[number]){return rate.kind==='friendly_rate'?(rate.mealPlan==='breakfast'?'Friendly Rate с завтраком':rate.mealPlan==='none'?'Friendly Rate без питания':'Friendly Rate · '+mealLabel(rate.mealPlan)):rate.mealPlan==='breakfast'?'Гибкий с завтраком':rate.mealPlan==='none'?'Гибкий без питания':mealLabel(rate.mealPlan);}
export function roomQuote(state:Commerce,owner:string|null,rateId:string){
 const rate=catalog.rates.find(r=>r.id===rateId);
 if(!state.draft||!rate||rate.hotelId!==state.draft.hotelId)throw Error('Тариф недоступен');
 return quoteDraft({...state,draft:{...state.draft,roomId:rate.roomId,rateId,services:[],usePoints:false}},owner);
}
export function roomOffers(state:Commerce,owner:string|null,filters=emptyRoomFilters,now=Date.now()){
 const d=state.draft;if(!d)return [];
 if(filters.payment!=='any'&&!roomPaymentMethods.includes(filters.payment))return [];
 const approved=!!owner&&state.accounts[owner]?.hotelierStatus==='approved';
 return catalog.rooms.filter(r=>r.hotelId===d.hotelId&&available(state,r.id,d.search)&&(filters.bed==='any'||roomBeds(r.id).includes(filters.bed)))
 .map(room=>({room,rates:catalog.rates.filter(rate=>rate.roomId===room.id&&(rate.kind!=='friendly_rate'||approved)&&(!filters.breakfast||rate.mealPlan==='breakfast')&&(!filters.freeCancellation||now<=Date.parse(cancellationDeadline(d.search))))
 .sort((a,b)=>Number(b.kind==='friendly_rate')-Number(a.kind==='friendly_rate')).map(rate=>({rate,quote:roomQuote(state,owner,rate.id)}))})).filter(r=>r.rates.length);
}
export function selectRoomRate(state:Commerce,owner:string|null,rateId:string):Commerce{
 const rate=catalog.rates.find(r=>r.id===rateId),d=state.draft;
 if(!d||!rate||rate.hotelId!==d.hotelId||!available(state,rate.roomId,d.search))throw Error('Предложение недоступно. Проверьте даты и гостей');
 if(rate.kind==='friendly_rate'&&(!owner||state.accounts[owner]?.hotelierStatus!=='approved'))throw Error('Friendly Rate доступен подтверждённым отельерам');
 return {...state,draft:{...d,roomId:rate.roomId,rateId,services:rate.mealPlan==='breakfast'?d.services.filter(id=>id!=='sea-breakfast'):d.services}};
}
export function updateRoomSearch(state:Commerce,owner:string|null,search:Search):Commerce{
 if(!state.draft)throw Error('Выберите отель');
 const next={...state,draft:{...state.draft,search,...trimGuests(state.draft,search)}};
 const offers=roomOffers(next,owner);
 if(!offers.length)throw Error('Нет доступных номеров на эти даты или состав гостей');
 const current=offers.flatMap(o=>o.rates).find(o=>o.rate.id===state.draft!.rateId);
 return selectRoomRate(next,owner,current?.rate.id||offers[0].rates[0].rate.id);
}
