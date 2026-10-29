import {type Commerce,type Draft} from './model.ts';
export type PriceWatch={mode:'any'|'target';targetMinor:number|null;push:boolean;active:boolean;priceMinor:number};
export function watchKey(owner:string|null,d:Draft){return JSON.stringify([owner||'guest',d.hotelId,d.roomId,d.rateId,d.search.checkIn,d.search.checkOut,d.search.adults,[...d.search.childrenAges].sort((a,b)=>a-b)]);}
export function savePriceWatch(s:Commerce,owner:string|null,d:Draft,watch:PriceWatch):Commerce{
 if(watch.mode==='target'&&(!Number.isSafeInteger(watch.targetMinor)||watch.targetMinor!<=0||(watch.targetMinor!>=watch.priceMinor&&s.priceWatches?.[watchKey(owner,d)]?.targetMinor!==watch.targetMinor)))throw Error('Укажите цену больше нуля и ниже текущей');
 return {...s,priceWatches:{...s.priceWatches,[watchKey(owner,d)]:{...watch,priceMinor:s.priceWatches?.[watchKey(owner,d)]?.priceMinor??watch.priceMinor,targetMinor:watch.mode==='any'?null:watch.targetMinor}}};
}

import {available,catalog,quoteDraft,searchError,type Search} from './model.ts';
export type WatchEntry={key:string;watch:PriceWatch;draft:Draft;currentMinor:number|null;unavailable:string};
/** Recover parameters from the original keys too: previously saved watches have no snapshot. */
export function watchDraft(key:string,owner:string|null):Draft|null{
 try{
  const [who,hotelId,roomId,rateId,checkIn,checkOut,adults,childrenAges]=JSON.parse(key);
  if(who!==(owner||'guest')||!catalog.hotels.some(h=>h.id===hotelId)||!catalog.rooms.some(r=>r.id===roomId&&r.hotelId===hotelId)||!catalog.rates.some(r=>r.id===rateId&&r.roomId===roomId))return null;
  if(typeof checkIn!=='string'||typeof checkOut!=='string'||!Number.isInteger(adults)||!Array.isArray(childrenAges)||childrenAges.some(a=>!Number.isInteger(a)))return null;
  const search:Search={city:catalog.hotels.find(h=>h.id===hotelId)!.city,checkIn,checkOut,adults,childrenAges:[...childrenAges]};
  return {id:'watch-preview',hotelId,roomId,rateId,search,services:[],usePoints:false,method:'online',paymentOption:'sbp',contact:{name:'',surname:'',email:'',phone:''},step:'hotel',returnTo:'price-watches'};
 }catch{return null;}
}
export function priceWatchEntries(s:Commerce,owner:string|null):WatchEntry[]{
 return Object.entries(s.priceWatches||{}).flatMap(([key,watch])=>{
  const draft=watchDraft(key,owner);if(!draft)return [];
  let unavailable=searchError(draft.search)?'Даты поездки прошли или недоступны':!available(s,draft.roomId,draft.search)?'Нет номеров на выбранные даты':'';
  if(catalog.rates.find(r=>r.id===draft.rateId)?.kind==='friendly_rate'&&s.accounts[owner||'guest']?.hotelierStatus!=='approved')unavailable='Нужен подтверждённый статус отельера';
  let currentMinor:number|null=null;
  if(!unavailable)try{currentMinor=quoteDraft({...s,draft},owner).lodgingMinor;}catch{unavailable='Тариф недоступен';}
  return [{key,watch,draft,currentMinor,unavailable}];
 });
}
function ownedWatch(s:Commerce,owner:string|null,key:string){
 if(!s.priceWatches?.[key]||!watchDraft(key,owner))throw Error('Наблюдение не найдено');
 return s.priceWatches[key];
}
export function setWatchActive(s:Commerce,owner:string|null,key:string,active:boolean):Commerce{
 const watch=ownedWatch(s,owner,key);
 if(active){const entry=priceWatchEntries(s,owner).find(e=>e.key===key)!;if(entry.unavailable)throw Error(entry.unavailable);}
 return {...s,priceWatches:{...s.priceWatches,[key]:{...watch,active}}};
}
export function removePriceWatch(s:Commerce,owner:string|null,key:string):Commerce{
 ownedWatch(s,owner,key);const watches={...s.priceWatches};delete watches[key];return {...s,priceWatches:watches};
}
export function startWatchBooking(s:Commerce,owner:string,key:string,id:string):Commerce{
 ownedWatch(s,owner,key);const entry=priceWatchEntries(s,owner).find(e=>e.key===key)!;
 if(entry.unavailable)throw Error(entry.unavailable);
 return {...s,draft:{...entry.draft,id},viewedHotels:[entry.draft.hotelId,...(s.viewedHotels||[]).filter(v=>v!==entry.draft.hotelId)].slice(0,8)};
}

export function replacePriceWatch(s:Commerce,owner:string|null,original:Draft,next:Draft,watch:PriceWatch):Commerce{
 const oldKey=watchKey(owner,original),newKey=watchKey(owner,next);
 if(oldKey!==newKey&&s.priceWatches?.[oldKey]&&s.priceWatches?.[newKey])throw Error('Этот номер и тариф уже отслеживаются');
 const updated=savePriceWatch(s,owner,next,watch);
 if(oldKey!==newKey){const entry=priceWatchEntries(updated,owner).find(e=>e.key===newKey);if(!entry||entry.unavailable)throw Error(entry?.unavailable||'Предложение недоступно');}
 if(oldKey!==newKey&&s.priceWatches?.[oldKey]){const watches={...updated.priceWatches};delete watches[oldKey];return {...updated,priceWatches:watches};}
 return updated;
}
