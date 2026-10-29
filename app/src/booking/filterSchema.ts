import type {Commerce,Search} from './model.ts';
export const EXCLUSIVE_BONUS_LABEL='Только в Ключах';
// Keep the stored value stable when the visible label changes.
export const EXCLUSIVE_BONUS='Эксклюзивно только в Ключах';
export const filterGroups = [
 {name:'Тип размещения',mode:'or',values:['Гостиница','Квартира','Апарт-отель','Гостевой дом','Хостел','Загородный дом','База отдыха','Санаторий']},
 {name:'Бонусы и скидки',mode:'or',values:['Горячие скидки',EXCLUSIVE_BONUS,'Программа лояльности отеля','Программа лояльности «Ключи»']},
 {name:'Звездность отеля',mode:'or',values:['Без звёзд','1 звезда','2 звезды','3 звезды','4 звезды','5 звёзд']},
 {name:'Сеть отеля',mode:'or',values:['ibis','Cosmos Hotel Group','Hyatt','Novotel','Mercure','AZIMUT Hotels','Грейс','Alean Collection','Marriott','Rixos','Mövenpick','Pullman','Swissôtel','Mantera'].sort((a,b)=>a.localeCompare(b,'ru',{sensitivity:'base'}))},
 {name:'Питание',mode:'or',values:['Завтрак включён','Собственная кухня','Завтрак и ужин включены','Полный пансион','Всё включено','Без питания']},
 {name:'Выбор кровати',mode:'or',values:['Две односпальные','Одна двуспальная']},
 {name:'Возможности бронирования',mode:'and',values:['Можно с питомцем','Можно с детьми','Доступная среда','Можно курить']},
 {name:'Парковка',mode:'and',values:['Есть парковка','Бесплатная парковка']},
 {name:'Общие удобства',mode:'and',values:['Бассейн','Wi-Fi','Круглосуточная стойка регистрации','Камера хранения','Лифт','Ресторан','Спа','Фитнес-центр']},
 {name:'Удобства в номере',mode:'and',values:['Ванная комната в номере','Балкон','Телевизор','Кофемашина','Кондиционер','Холодильник','Стиральная машина','Сейф']},
 {name:'Оплата',mode:'and',values:['Бесплатная отмена','Оплата картой','Оплата на месте']},
] as const;
export const countFilters=['Спальни','Кровати','Ванные комнаты'] as const;
export const token=(group:string,value:string)=>`${group}: ${value}`;
const aliases:Record<string,string[]>={
 '4–5 звёзд':['Звездность отеля: 4 звезды','Звездность отеля: 5 звёзд'], 'От 4 звёзд':['Звездность отеля: 4 звезды','Звездность отеля: 5 звёзд'],
 'С завтраком':['Питание: Завтрак включён'],'С бассейном':['Общие удобства: Бассейн'],'Со спа':['Общие удобства: Спа'],
 'С питомцем':['Возможности бронирования: Можно с питомцем'],'С детьми':['Возможности бронирования: Можно с детьми'],
 'Спецпредложения':['Бонусы и скидки: Горячие скидки'],
};
export function normalizeFilters(values:string[]=[]):string[]{return [...new Set(values.flatMap(value=>aliases[value]||[filterGroups.flatMap(g=>g.values.includes(value as never)?[token(g.name,value)]:[])[0]||value]))];}
export function groupValues(filters:string[],name:string){return normalizeFilters(filters).filter(v=>v.startsWith(name+': ')).map(v=>v.slice(name.length+2));}
export function counterValue(filters:string[],name:string){return Math.min(10,Math.max(0,Number(groupValues(filters,name)[0])||0));}
export const normalizeQuery=(s:string)=>s.trim().toLocaleLowerCase('ru-RU').replaceAll('ё','е');
export const sortOptions=[['recommended','По вашим предпочтениям'],['stars-desc','Звездность отеля (от 5 до 0)'],['stars-asc','Звездность отеля (от 0 до 5)'],['reviews-desc','Лучшие по отзывам вначале'],['price','Цена (сначала низкая)'],['price-desc','Цена (сначала высокая)']] as const;
export function sortKey(value?:string){const old:Record<string,string>={'Рекомендуемые':'recommended','Сначала дешевле':'price','Сначала дороже':'price-desc','По звёздности':'stars-desc','По оценке гостей':'reviews-desc','rating-desc':'stars-desc','rating-asc':'stars-asc'};return sortOptions.some(([key])=>key===value)?value!:old[value||'']||'recommended';}
export function compareNumber(a:unknown,b:unknown,descending=false){const read=(v:unknown)=>typeof v==='number'?v:typeof v==='string'&&v.trim()?Number(v.replace(',','.')):NaN;const x=read(a),y=read(b);return !Number.isFinite(x)?!Number.isFinite(y)?0:1:!Number.isFinite(y)?-1:(x-y)*(descending?-1:1)||0;}
export type PriceMode='stay'|'night';
export type PriceRange={min:number|null;max:number|null};
export function priceMode(s:Commerce):PriceMode{return s.priceMode||(s.priceRangeMinor||s.maxNightly?'night':'stay');}
export function priceRange(s:Commerce):PriceRange{return s.priceRangeMinor||{min:null,max:s.maxNightly?s.maxNightly*100:null};}
export function priceError(r:PriceRange){return r.min!==null&&r.max!==null&&r.min>r.max?'Цена «До» должна быть не меньше цены «От».':'';}
export function convertPriceRange(r:PriceRange,to:PriceMode,nights:number):PriceRange{const convert=(v:number|null)=>v===null?null:to==='night'?Math.round(v/100/Math.max(1,nights))*100:v*Math.max(1,nights);return {min:convert(r.min),max:convert(r.max)};}
export function priceCeiling(r:PriceRange,mode:PriceMode){return Math.ceil(Math.max(mode==='night'?3000000:10000000,r.min||0,r.max||0)/1000000)*1000000;}
export type SearchOptions=Pick<Commerce,'searchFilters'|'searchSort'|'priceRangeMinor'|'priceMode'|'searchDistrict'|'maxNightly'|'minRating'|'collection'>;
export type RecentSearch=Search&{filtersSnapshot?:SearchOptions};
export function searchOptions(s:Commerce):SearchOptions{return structuredClone({searchFilters:s.searchFilters||[],searchSort:sortKey(s.searchSort),priceRangeMinor:priceRange(s),priceMode:priceMode(s),searchDistrict:s.searchDistrict,maxNightly:null,minRating:s.minRating||0,collection:s.collection});}
export function updateSearchOptions(s:Commerce,patch:SearchOptions):Commerce{const next={...s,...patch};return {...next,recentSearches:s.recentSearches?.map(entry=>{const {filtersSnapshot:_,...query}=entry;return JSON.stringify(query)===JSON.stringify(s.search)?{...entry,filtersSnapshot:searchOptions(next)}:entry;})};}
export const quickFilters=[{label:'Завтрак',values:[token('Питание','Завтрак включён')]},{label:'Бассейн',values:[token('Общие удобства','Бассейн')]},{label:'Спа',values:[token('Общие удобства','Спа')]},{label:'4–5 звёзд',values:[token('Звездность отеля','4 звезды'),token('Звездность отеля','5 звёзд')]},{label:'Бесплатная отмена',values:[token('Оплата','Бесплатная отмена')]}];
export function toggleQuick(s:Commerce,values:string[]):Commerce{let current=normalizeFilters(s.searchFilters);const selected=values.every(v=>current.includes(v));if(values.length===2)current=current.filter(v=>!v.startsWith('Звездность отеля: '));return updateSearchOptions(s,{searchFilters:selected?current.filter(v=>!values.includes(v)):[...current.filter(v=>!values.includes(v)),...values]});}
