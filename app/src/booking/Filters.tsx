import {useNovember} from '../usePrototypeVariant';
import {useEffect,useLayoutEffect,useRef,useState,type Dispatch,type SetStateAction,type CSSProperties} from 'react';
import {FilterEditorDialog,FilterEditorLayout,FilterSection} from './FilterEditor';
import {KeyboardInput,useKeyboard} from '../mobile';
import {Switch} from '../ui';
import {type Commerce,nights} from './model';
import {discoveryOffers,clearFilters,districtsFor} from './offers';
import {filterGroups,roomAreaGroup,minimumRoomArea,token,normalizeFilters,groupValues,priceMode,priceRange,priceCeiling,priceError,convertPriceRange,updateSearchOptions,searchOptions,type SearchOptions,type PriceMode} from './filterSchema';
export {filterCount,clearFilters} from './offers';
import './filters.css';
export function FiltersSheet({open,onClose,commerce,setCommerce,owner,getResultCount}:{open:boolean;onClose:()=>void;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string|null;getResultCount?:(s:Commerce)=>number}){
 return <FilterEditorDialog open={open} onClose={onClose}><FilterFields getResultCount={getResultCount} commerce={commerce} owner={owner} onClose={onClose} onApply={value=>{setCommerce(state=>updateSearchOptions(state,value));onClose();}}/></FilterEditorDialog>;
}
function FilterFields({commerce,owner,onApply,onClose,getResultCount,embedded=false}:{embedded?:boolean;commerce:Commerce;owner:string|null;onApply:(v:SearchOptions)=>void;onClose:()=>void;getResultCount?:(s:Commerce)=>number}){
 const november=useNovember();
 const [draft,setDraft]=useState(()=>({...commerce,searchFilters:normalizeFilters(commerce.searchFilters),priceMode:priceMode(commerce),priceRangeMinor:priceRange(commerce)}));
 const sourceKey=JSON.stringify([searchOptions(commerce),commerce.search]);
 useEffect(()=>{if(embedded)setDraft({...commerce,searchFilters:normalizeFilters(commerce.searchFilters),priceMode:priceMode(commerce),priceRangeMinor:priceRange(commerce)});},[embedded,sourceKey]);
 const keyboard=useKeyboard();
 const filters=draft.searchFilters,range=draft.priceRangeMinor,mode=draft.priceMode,nightCount=Math.max(1,nights(commerce.search)||1),error=priceError(range);
 const count=error?0:getResultCount?getResultCount(draft):discoveryOffers(draft,owner).length,ceiling=priceCeiling(range,mode),low=range.min??0,high=range.max??ceiling;
 const toggle=(key:string)=>setDraft(s=>({...s,searchFilters:s.searchFilters.includes(key)?s.searchFilters.filter(v=>v!==key):[...s.searchFilters,key]}));
 const reset=()=>setDraft({...clearFilters(commerce),searchFilters:[],priceMode:'stay',priceRangeMinor:{min:null,max:null}});
 const setMode=(next:PriceMode)=>setDraft(s=>({...s,priceMode:next,priceRangeMinor:convertPriceRange(s.priceRangeMinor,next,nightCount),maxNightly:null}));
 const update=(key:'min'|'max',value:string)=>{const digits=value.replace(/\D/g,'').slice(0,9);setDraft(s=>({...s,maxNightly:null,priceRangeMinor:{...s.priceRangeMinor,[key]:digits?Number(digits)*100:null}}));};
 const days=nightCount%10===1&&nightCount%100!==11?(embedded?'ночь':'день'):nightCount%10>=2&&nightCount%10<=4&&!(nightCount%100>=12&&nightCount%100<=14)?(embedded?'ночи':'дня'):(embedded?'ночей':'дней');
 return <FilterEditorLayout embedded={embedded} onClose={onClose} onReset={reset} onApply={()=>onApply(searchOptions(draft))} disabled={!!error} submitLabel={count?`Показать отели · ${count}`:'Показать результаты'}>
 <section className="filter-section filter-price-section"><div className="filter-price-heading"><h3>{mode==='night'?'Цена за ночь':`Цена за ${nightCount} ${days}`}</h3><Switch checked={mode==='night'} onChange={v=>setMode(v?'night':'stay')}>За ночь</Switch></div><div className="filter-section-body"><div className="filter-price-fields">{(['min','max'] as const).map(key=><label key={key}><span>{key==='min'?'От':'До'}</span><KeyboardInput onBlur={e=>{if(!(e.relatedTarget instanceof HTMLInputElement))keyboard.hide();}} inputMode="numeric" aria-label={key==='min'?'Цена от':'Цена до'} aria-invalid={!!error} aria-describedby={error?'filter-price-error':undefined} value={range[key]===null?'':String(range[key]!/100)} placeholder={key==='min'?'0':embedded?'—':'Без лимита'} onChange={e=>update(key,e.target.value)}/><span>₽</span></label>)}</div>
 <div className="price-slider" data-scroll-drag="ignore" style={{'--range-low':`${Math.min(low,high)/ceiling*100}%`,'--range-high':`${Math.max(low,high)/ceiling*100}%`} as CSSProperties}><div className="price-slider-track"/><input type="range" aria-label="Минимальная цена" min={0} max={ceiling} step={10000} value={low} onChange={e=>setDraft(s=>({...s,maxNightly:null,priceRangeMinor:{...range,min:Math.min(Number(e.target.value),high)||null}}))}/><input type="range" aria-label="Максимальная цена" min={0} max={ceiling} step={10000} value={high} onChange={e=>setDraft(s=>({...s,maxNightly:null,priceRangeMinor:{...range,max:Number(e.target.value)===ceiling?null:Math.max(Number(e.target.value),low)}}))}/></div>{error&&<p id="filter-price-error" className="field-error" role="alert">{error}</p>}</div></section>
 {filterGroups.filter(group=>!november||group.name!=='Сеть отеля').map(group=><FilterSection key={group.name} title={group.name==='Общие удобства'?'Удобства в отеле':group.name} count={groupValues(filters,group.name).length+(group.name==='Комнаты'&&minimumRoomArea(filters)>0?1:0)}><div className="filter-styles">{group.values.map(value=>{const key=token(group.name,value);return <button className={'filter-chip '+(filters.includes(key)?'selected':'')} key={key} aria-pressed={filters.includes(key)} onClick={()=>toggle(key)}>{value==='Одна двуспальная'?'Двуспальная':value}</button>;})}</div>{group.name==='Комнаты'&&<label className="filter-area-field"><span>Площадь номера от</span><span className="filter-area-input"><KeyboardInput inputMode="numeric" aria-label="Площадь номера от" value={minimumRoomArea(filters)||''} placeholder="Не важно" onBlur={e=>{if(!(e.relatedTarget instanceof HTMLInputElement))keyboard.hide();}} onChange={e=>{const area=Number(e.target.value.replace(/\D/g,'').slice(0,4));setDraft(s=>({...s,searchFilters:[...s.searchFilters.filter(v=>!v.startsWith(roomAreaGroup+': ')),...(area?[token(roomAreaGroup,String(area))]:[])]}));}}/><span>м²</span></span></label>}</FilterSection>)}
 {!november&&districtsFor(commerce).length>0&&<FilterSection title="Район" count={draft.searchDistrict?.city===commerce.search.city?1:0}><div className="filter-styles">{['Все районы',...districtsFor(commerce)].map((name,i)=><button className={'filter-chip '+((i===0?!draft.searchDistrict:draft.searchDistrict?.name===name)?'selected':'')} key={name} aria-pressed={i===0?!draft.searchDistrict:draft.searchDistrict?.name===name} onClick={()=>setDraft(s=>({...s,searchDistrict:i?{city:commerce.search.city,name}:undefined}))}>{name}</button>)}</div></FilterSection>}
 {count===0&&!error&&<p className="filter-empty" role="status">Нет вариантов. Попробуйте изменить фильтры</p>}
 </FilterEditorLayout>;
}

export function DesktopFilters({commerce,setCommerce,owner}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string|null}){
 const panel=useRef<HTMLElement>(null);
 useLayoutEffect(()=>{
  const element=panel.current;if(!element)return;
  let frame=0;
  const measure=()=>{
   const top=Math.max(20,element.getBoundingClientRect().top);
   const height=Math.max(0,(window.visualViewport?.height??window.innerHeight)-top-20);
   element.style.setProperty('--filter-available-height',`${height}px`);
  };
  const update=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
  const observer=new ResizeObserver(update);
  if(element.parentElement)observer.observe(element.parentElement);
  window.addEventListener('resize',update);window.addEventListener('scroll',update,{passive:true});
  window.visualViewport?.addEventListener('resize',update);
  measure();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',update);window.removeEventListener('scroll',update);window.visualViewport?.removeEventListener('resize',update);};
 },[]);
 return <aside ref={panel} className="desktop-results-filters" aria-label="Все фильтры"><FilterFields embedded commerce={commerce} owner={owner} onClose={()=>{}} onApply={value=>setCommerce(s=>updateSearchOptions(s,value))}/></aside>;
}
