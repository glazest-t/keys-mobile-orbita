import {filterGroups,groupValues} from './filterSchema.ts';
import type {Commerce} from './model.ts';

export type RoomFilterKey='meals'|'beds'|'views'|'payments'|'cancellations';
export type RoomSelectionFilters=Record<RoomFilterKey,string[]>;
export const emptyRoomSelectionFilters=():RoomSelectionFilters=>({meals:[],beds:[],views:[],payments:[],cancellations:[]});
export function roomFiltersFromSearch(filters:string[]=[]):RoomSelectionFilters{
 const payment=groupValues(filters,'Оплата');
 return {
  meals:groupValues(filters,'Питание'),beds:groupValues(filters,'Выбор кровати'),views:groupValues(filters,'Вид из окна'),
  payments:[...(payment.includes('Оплата картой')?['online']:[]),...(payment.includes('Оплата на месте')?['at_hotel']:[])],
  cancellations:payment.includes('Бесплатная отмена')?['free']:[],
 };
}
export const activeRoomFilters=(state:Commerce):RoomSelectionFilters=>state.draft?.roomFilters??roomFiltersFromSearch(state.searchFilters);
export function updateRoomFilters(state:Commerce,filters:RoomSelectionFilters):Commerce{
 return state.draft?{...state,draft:{...state.draft,roomFilters:structuredClone(filters)}}:state;
}
export const roomFilterGroups=[
 {key:'meals',label:'Питание',options:filterGroups.find(g=>g.name==='Питание')!.values.map(value=>({value,label:value}))},
 {key:'beds',label:'Кровати',options:['Одна двуспальная','Две односпальные','Одна односпальная','Диван-кровать','Двухъярусная','Детская кроватка'].map(value=>({value,label:value}))},
 {key:'views',label:'Вид из окна',options:[]},
 {key:'payments',label:'Способ оплаты',options:[{value:'online',label:'Онлайн'},{value:'at_hotel',label:'В отеле'}]},
 {key:'cancellations',label:'Правила отмены',options:[{value:'free',label:'Бесплатная отмена'},{value:'penalty',label:'Отмена со штрафом'}]},
] satisfies {key:RoomFilterKey;label:string;options:{value:string;label:string}[]}[];
