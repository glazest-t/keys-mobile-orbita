import {useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet,Carousel} from '../mobile';
import {Icon} from '../ui';
import type {Commerce} from './model';
import {FiltersSheet,filterCount} from './Filters';
import {districtsFor} from './offers';
import {EXCLUSIVE_BONUS_LABEL,EXCLUSIVE_BONUS,normalizeFilters,quickFilters,toggleQuick,sortKey,sortOptions,updateSearchOptions,priceRange,priceMode} from './filterSchema';
export function SearchFilterRail({commerce,setCommerce,owner,map=false,getResultCount}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string|null;map?:boolean;getResultCount?:(s:Commerce)=>number}){
 const [sheet,setSheet]=useState<'filters'|'sort'|'district'|null>(null),filters=normalizeFilters(commerce.searchFilters),sort=sortKey(commerce.searchSort),count=filterCount(commerce),districts=districtsFor(commerce),district=commerce.searchDistrict?.city===commerce.search.city?commerce.searchDistrict.name:undefined;
 const selectedQuick=quickFilters.filter(q=>q.values.every(v=>filters.includes(v))),extra=filters.filter(v=>!selectedQuick.some(q=>q.values.includes(v)));
 const range=priceRange(commerce),hasRange=range.min!==null||range.max!==null;const money=(v:number)=>Math.round(v/100).toLocaleString('ru');
 const rangeLabel=[range.min!==null?`от ${money(range.min)}`:'',range.max!==null?`до ${money(range.max)}`:''].filter(Boolean).join(' ')+` ₽ ${priceMode(commerce)==='night'?'за ночь':'за проживание'}`;
 const sortLabel=sortOptions.find(([key])=>key===sort)![1];
 return <><Carousel ariaLabel={map?'Фильтры карты':'Фильтры отелей'} className={map?'map-filter-rail':'results-controls-rail'} contentClassName="discovery-chip-track">
 <button className="filter-chip" aria-haspopup="dialog" aria-expanded={sheet==='filters'} onClick={()=>setSheet('filters')}><Icon name="filter" size={16}/>Фильтры{count>0&&<b>{count}</b>}</button>
 <button className={'filter-chip sort-icon-chip '+(sort!=='recommended'?'selected':'')} aria-label={`Сортировка: ${sortLabel}`} aria-haspopup="dialog" aria-expanded={sheet==='sort'} onClick={()=>setSheet('sort')}><Icon name="sort" size={18} inheritColor/></button>
 {districts.length>0&&<button className={'filter-chip '+(district?'selected':'')} aria-label={`Район: ${district||'Все районы'}`} onClick={()=>setSheet('district')}>{district||'Район'}<Icon name="chevron-down" size={14}/></button>}
 {quickFilters.map(q=><button className={'filter-chip '+(selectedQuick.includes(q)?'selected':'')} key={q.label} aria-pressed={selectedQuick.includes(q)} onClick={()=>setCommerce(s=>toggleQuick(s,q.values))}>{q.label}</button>)}
 {hasRange&&<button className="filter-chip selected" aria-label={"Убрать фильтр цены: "+rangeLabel} onClick={()=>setCommerce(s=>updateSearchOptions(s,{priceRangeMinor:undefined,maxNightly:null}))}>{rangeLabel}<Icon name="close" size={12}/></button>}
 {!!commerce.minRating&&<button className="filter-chip selected" onClick={()=>setCommerce(s=>updateSearchOptions(s,{minRating:0}))}>Рейтинг от {commerce.minRating}<Icon name="close" size={12}/></button>}
 {extra.map(value=><button className="filter-chip selected" key={value} aria-label={'Убрать фильтр: '+value.replace(EXCLUSIVE_BONUS,EXCLUSIVE_BONUS_LABEL)} onClick={()=>setCommerce(s=>updateSearchOptions(s,{searchFilters:normalizeFilters(s.searchFilters).filter(f=>f!==value)}))}>{value.endsWith(': '+EXCLUSIVE_BONUS)&&<span aria-hidden="true">🔥</span>}{value.startsWith('Спальни:')||value.startsWith('Кровати:')||value.startsWith('Ванные комнаты:')?value:value.split(': ').at(-1)?.replace(EXCLUSIVE_BONUS,EXCLUSIVE_BONUS_LABEL)}<Icon name="close" size={12}/></button>)}
 </Carousel>
 <FiltersSheet open={sheet==='filters'} onClose={()=>setSheet(null)} commerce={commerce} setCommerce={setCommerce} owner={owner} getResultCount={getResultCount}/>
 <BottomSheet open={sheet==='sort'} onOpenChange={open=>{if(!open)setSheet(null);}} title="Сортировка" snap={.68}><div className="results-sort-panel" role="group" aria-label="Порядок отелей">{sortOptions.map(([key,label])=><button className="results-sort-option" key={key} aria-pressed={key===sort} onClick={()=>{setCommerce(s=>updateSearchOptions(s,{searchSort:key}));setSheet(null);}}><span>{label}</span><span className="results-sort-check" aria-hidden="true">{key===sort&&<Icon name="check" size={14} inheritColor/>}</span></button>)}</div></BottomSheet>
 <BottomSheet open={sheet==='district'} onOpenChange={open=>{if(!open)setSheet(null);}} title="Район" snap={.68}><div className="results-sort-panel" role="group" aria-label="Район проживания">{['Все районы',...districts].map((name,i)=>{const selected=i===0?!district:district===name;return <button className="results-sort-option" key={name} aria-pressed={selected} onClick={()=>{setCommerce(s=>updateSearchOptions(s,{searchDistrict:i?{city:s.search.city,name}:undefined}));setSheet(null);}}><span>{name}</span><span className="results-sort-check" aria-hidden="true">{selected&&<Icon name="check" size={14} inheritColor/>}</span></button>;})}</div></BottomSheet>
 </>;
}
