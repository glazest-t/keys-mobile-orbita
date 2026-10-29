import {searchOptions,normalizeQuery,type RecentSearch} from './filterSchema.ts';
import {hotelFacets} from './searchFacets.ts';
import {catalog,searchHotels,searchError,type Commerce,type Search} from './model.ts';
export const popularCities=['Сочи','Москва','Санкт-Петербург','Казань','Калининград','Алтай'];
export function rememberSearch(state:Commerce,value:RecentSearch):Commerce{
 const {filtersSnapshot,...search}=value;
 const key=(s:RecentSearch)=>{const {filtersSnapshot:_,...query}=s;return JSON.stringify(query);};
 const restored=filtersSnapshot?{...state,...structuredClone(filtersSnapshot)}:state;
 const next={...restored,search:structuredClone(search),searchDistrict:restored.searchDistrict?.city===search.city?restored.searchDistrict:undefined};
 return {...next,recentSearches:[{...structuredClone(search),filtersSnapshot:searchOptions(next)},...(state.recentSearches||[]).filter(s=>key(s)!==key(search))].slice(0,6)};
}
export function destinationSuggestions(query:string,state:Commerce){
 const q=normalizeQuery(query);
 const cities=popularCities.filter(city=>!!q&&city.toLocaleLowerCase('ru-RU').includes(q)).map(city=>({id:city,title:city,city,hotelId:undefined as string|undefined,subtitle:cityCount(city)}));
 const hotels=q?catalog.hotels.filter(h=>normalizeQuery(h.name+' '+h.city+' '+hotelFacets(h.id)?.district).includes(q)).map(h=>({id:h.id,title:h.name,city:h.city,hotelId:h.id,subtitle:`${hotelFacets(h.id)?.type||'Отель'} · ${h.city}${searchHotels({...state,search:{...state.search,city:h.city}}).some(v=>v.id===h.id)?'':' · нет мест на эти даты'}`})):[];
 return [...cities,...hotels];
}
export function collectionSearch(search:Search,kind:string):Search{
 if(kind==='weekend')return {...search,checkOut:new Date(Date.parse(search.checkIn)+2*86400000).toISOString().slice(0,10)};
 return kind==='anywhere'?{...search,city:'Любой город'}:search;
}
export function validDateRange(search:Search){return searchError({...search,city:search.city||'Город'});}

function cityCount(city:string){const count=catalog.hotels.filter(h=>h.city===city).length;return count?`Город · ${count} ${count===1?'отель':count<5?'отеля':'отелей'}`:'Город';}

export function guestCountLabel(s:Search){const n=s.adults+s.childrenAges.length;return `${n} ${n===1?"гость":n<5?"гостя":"гостей"}`;}

export function tripFeaturesLabel(s:Search){return [s.withPet&&'с питомцем',s.businessTrip&&'командировка',s.byCar&&'на машине'].filter(Boolean).join(', ');}
