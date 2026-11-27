import {getPrototypeVariant} from '../prototypeVariant.ts';
import {swipePreferenceScore,travelStyleMatch} from './swipePreferences.ts';
import {promotionBasisPoints} from './promotions.ts';
import {type Commerce,catalog,searchHotels,quoteDraft,startDraft,cancellationDeadline} from './model.ts';
import {hotelVisual} from './presentation.ts';
import {hotelFacets} from './searchFacets.ts';
import {filterGroups,normalizeFilters,groupValues,priceRange,priceMode,priceError,sortKey,compareNumber,updateSearchOptions} from './filterSchema.ts';
export function appliedOfferFilters(commerce:Commerce){
 const filters=normalizeFilters(commerce.searchFilters);
 return getPrototypeVariant()==='november'?filters.filter(v=>!v.startsWith('Сеть отеля: ')):filters;
}
export function matchesHotelFilter(commerce:Commerce,id:string,group:string,value:string):boolean|undefined{
 const h=hotelFacets(id),visual=hotelVisual(id);
 if(group==='Тип размещения')return h?.type===value;
 if(group==='Звездность отеля')return visual.stars===(value==='Без звёзд'?0:Number(value[0]));
 if(group==='Сеть отеля')return h?.network===value;
 if(group==='Бонусы и скидки')return value==='Горячие скидки'?promotionBasisPoints(id)>=1000:(h?.bonuses.includes(value)??false);
 if(group==='Возможности бронирования')return (h?.booking.includes(value)??false);
 if(group==='Парковка')return (h?.parking.includes(value)??false);
 if(group==='Общие удобства')return (h?.amenities.includes(value)??false);
 if(group==='Оплата')return value==='Бесплатная отмена'?Date.now()<=Date.parse(cancellationDeadline(commerce.search)):(h?.payment.includes(value)??false);
 if(!group)return value==='У моря'?visual.distance.includes('моря'):value==='В центре'?visual.distance.includes('центре'):visual.styles.includes(value)||visual.amenities.includes(value);
 // Room and meal groups are matched together on an available room/rate in searchHotels.
 return undefined;
}
export function discoveryOffers(commerce:Commerce,owner:string|null,{rankByStyle=false}:{rankByStyle?:boolean}={}){
 if(getPrototypeVariant()==='november')commerce={...commerce,searchDistrict:undefined,searchFilters:commerce.searchFilters?.filter(f=>!f.startsWith('Сеть отеля: '))};
 const filters=appliedOfferFilters(commerce),range=priceRange(commerce),sort=sortKey(commerce.searchSort);
 if(priceError(range))return [];
 const themes=commerce.swipePreferences?.[owner||'guest']?.themes;
 const hotels=searchHotels(commerce,{includeStyleExamples:rankByStyle&&!!themes?.length}).filter(h=>{
  const visual=hotelVisual(h.id),district=commerce.searchDistrict;
  if(visual.rating<(commerce.minRating||0)||district&&district.city===commerce.search.city&&hotelFacets(h.id)?.district!==district.name)return false;
  if(!filterGroups.every(group=>{const values=groupValues(filters,group.name);return !values.length||(group.mode==='or'?values.some(v=>matchesHotelFilter(commerce,h.id,group.name,v)!==false):values.every(v=>matchesHotelFilter(commerce,h.id,group.name,v)!==false));}))return false;
  return filters.filter(f=>!f.includes(': ')).every(f=>matchesHotelFilter(commerce,h.id,'',f));
 }).map(h=>({h,q:quoteDraft(startDraft(commerce,h.id,'preview',owner),owner)})).filter(({h,q})=>{
  const price=priceMode(commerce)==='night'?Math.round(q.lodgingMinor/q.nights/100)*100:q.lodgingMinor;
  return price>=(range.min??0)&&(range.max===null||price<=range.max)&&(commerce.collection!=='discount'||promotionBasisPoints(h.id)>=1000&&q.hotelDiscountMinor>0)&&(commerce.collection!=='friendly'||catalog.rates.find(r=>r.id===q.rateId)?.kind==='friendly_rate');
 });
 if(rankByStyle&&sort==='recommended'&&themes?.length&&filterCount(commerce)===0&&!commerce.collection){
  const styleMatches=new Map(hotels.map(({h})=>[h.id,travelStyleMatch(h.id,themes).percent]));
  return hotels.sort((a,b)=>compareNumber(styleMatches.get(a.h.id),styleMatches.get(b.h.id),true));
 }
 hotels.sort((a,b)=>{
  const av=hotelVisual(a.h.id),bv=hotelVisual(b.h.id);
  if(sort==='price'||sort==='price-desc')return compareNumber(a.q.lodgingMinor,b.q.lodgingMinor,sort==='price-desc');
  if(sort==='stars-asc'||sort==='stars-desc')return compareNumber(av.stars<0?NaN:av.stars,bv.stars<0?NaN:bv.stars,sort==='stars-desc');
  if(sort==='reviews-desc')return compareNumber(av.rating,bv.rating,true)||compareNumber(av.reviews,bv.reviews,true);
  return sort==='recommended'&&owner?swipePreferenceScore(commerce,owner,b.h.id)-swipePreferenceScore(commerce,owner,a.h.id):0;
 });
 return hotels;
}
export function districtsFor(commerce:Commerce,owner:string|null=null){
 const hasStyle=!!commerce.swipePreferences?.[owner||'guest']?.themes.length;
 return [...new Set(catalog.hotels.filter(h=>h.city===commerce.search.city&&(!h.styleExample||hasStyle)).map(h=>hotelFacets(h.id)?.district).filter((v):v is string=>!!v))].sort((a,b)=>a.localeCompare(b,'ru'));}
// Retained for old consumers; the filter editor validates reversed input instead of silently swapping it.
export function normalizePriceRange(min:number|null,max:number|null){const clean=(v:number|null)=>v===null||!Number.isFinite(v)?null:Math.max(0,Math.round(v));let a=clean(min),b=clean(max);if(a!==null&&b!==null&&a>b)[a,b]=[b,a];return {min:a,max:b};}
export function clearFilters(s:Commerce):Commerce{return updateSearchOptions(s,{searchFilters:[],priceRangeMinor:undefined,priceMode:'stay',searchDistrict:undefined,minRating:0,maxNightly:null,collection:undefined});}
export function filterCount(s:Commerce){if(getPrototypeVariant()==='november')s={...s,searchDistrict:undefined,searchFilters:s.searchFilters?.filter(f=>!f.startsWith('Сеть отеля: '))};const r=priceRange(s);return normalizeFilters(s.searchFilters).length+(s.minRating?1:0)+(r.min!==null||r.max!==null?1:0)+(s.searchDistrict?.city===s.search.city?1:0);}
