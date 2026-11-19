import {useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet,Carousel} from '../mobile';
import {Icon} from '../ui';
import './results-header.css';
import {catalog,type Commerce} from './model';
import {roomVisual} from './roomVisuals';
import {activeRoomFilters,roomFilterGroups,updateRoomFilters,type RoomFilterKey} from './roomFilters';

const anyLabels:Record<RoomFilterKey,string>={meals:'Любое питание',beds:'Любые кровати',views:'Любой вид из окна',payments:'Любой способ оплаты',cancellations:'Любые правила отмены'};

export function RoomFilterBar({commerce,setCommerce,disabled=false}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string|null;disabled?:boolean}){
 const filters=activeRoomFilters(commerce),[groupKey,setGroupKey]=useState<RoomFilterKey|null>(null);
 const group=roomFilterGroups.find(item=>item.key===groupKey);
 const views=[...new Set([...catalog.rooms.filter(room=>room.hotelId===commerce.draft?.hotelId).map(room=>roomVisual(room.id).view).filter(Boolean),...filters.views])];
 const options=group?.key==='views'?views.map(value=>({value,label:value})):group?.options??[];
 const select=(value:string|null)=>{
  if(!groupKey)return;
  setCommerce(state=>updateRoomFilters(state,{...activeRoomFilters(state),[groupKey]:value===null?[]:[value]}));
  setGroupKey(null);
 };
 return <><Carousel ariaLabel="Фильтры номеров и тарифов" className="results-controls-rail room-filter-rail" contentClassName="discovery-chip-track">
  {roomFilterGroups.map(item=><button key={item.key} disabled={disabled} className={'filter-chip '+(filters[item.key].length?'selected':'')} aria-haspopup="dialog" aria-expanded={groupKey===item.key} onClick={()=>setGroupKey(item.key)}>{item.label}{filters[item.key].length>0&&<b>{filters[item.key].length}</b>}<Icon name="chevron-down" size={14} inheritColor/></button>)}
 </Carousel><BottomSheet open={groupKey!==null} onOpenChange={open=>{if(!open)setGroupKey(null);}} title={group?.label??'Фильтр'} snap={.68}>
  {groupKey&&<div className="results-sort-panel" role="group" aria-label={group?.label}>
   {[{value:null,label:anyLabels[groupKey]},...options].map(option=>{const selected=option.value===null?filters[groupKey].length===0:filters[groupKey].includes(option.value);return <button type="button" className="results-sort-option" key={option.value??'any'} aria-pressed={selected} onClick={()=>select(option.value)}><span>{option.label==='Одна двуспальная'?'Двуспальная':option.label}</span><span className="results-sort-check" aria-hidden="true">{selected&&<Icon name="check" size={14} inheritColor/>}</span></button>;})}
  </div>}
 </BottomSheet></>;
}
