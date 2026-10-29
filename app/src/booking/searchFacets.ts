import data from '../../../spec/search-facets.json' with {type:'json'};
import {groupValues,counterValue,normalizeQuery} from './filterSchema.ts';
import type {Commerce} from './model.ts';
type HotelFacets={type:string;district:string;network:string;bonuses:string[];amenities:string[];booking:string[];parking:string[];payment:string[]};
type RoomFacets={beds:string[];bedrooms:number;bedCount:number;bathrooms:number;amenities:string[];kitchen:boolean};
export const hotelFacets=(id:string)=>(data.hotels as Record<string,HotelFacets>)[id];
export const roomFacets=(id:string)=>(data.rooms as Record<string,RoomFacets>)[id];
export const addedVisuals=data.visuals;
export const mealLabels:Record<string,string>={none:'Без питания',breakfast:'Завтрак включён',half_board:'Завтрак и ужин включены',full_board:'Полный пансион',all_inclusive:'Всё включено'};
export const mealLabel=(meal:string)=>mealLabels[meal]||'Без питания';
export const mealIncludesBreakfast=(meal:string)=>meal!=='none'&&!!mealLabels[meal];
export function matchesRoom(state:Commerce,roomId:string){const f=roomFacets(roomId);if(!f)return false;const filters=state.searchFilters||[],beds=groupValues(filters,'Выбор кровати');return (!beds.length||beds.some(v=>f.beds.includes(v)))&&groupValues(filters,'Удобства в номере').every(v=>f.amenities.includes(v))&&f.bedrooms>=counterValue(filters,'Спальни')&&f.bedCount>=counterValue(filters,'Кровати')&&f.bathrooms>=counterValue(filters,'Ванные комнаты');}
export function matchesRate(state:Commerce,rate:{mealPlan:string;roomId:string;kind:string}){const selected=groupValues(state.searchFilters||[],'Питание');return rate.kind==='standard'&&(!selected.length||selected.includes(mealLabel(rate.mealPlan))||selected.includes('Собственная кухня')&&roomFacets(rate.roomId)?.kitchen);}
export function matchesDestination(query:string,hotel:{id:string;city:string;name:string}){const q=normalizeQuery(query);return q==='любой город'||normalizeQuery([hotel.name,hotel.city,hotelFacets(hotel.id)?.district].join(' ')).includes(q);}
