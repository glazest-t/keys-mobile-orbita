import {useState,Fragment} from 'react';
import {FlowStack,MobileScroll,KeyboardInput,useKeyboard,type FlowScreen} from '../mobile';
import {Button,Icon,IconButton,Row} from '../ui';
import {Calendar} from './SearchControls';
import {destinationSuggestions,popularCities,validDateRange} from './search';
import {dateLabel,type Commerce,type Search} from './model';
export function DestinationSearch({commerce,onSelect,onCancel,inSheet=false}:{commerce:Commerce;onSelect:(city:string,hotelId?:string)=>void;onCancel:()=>void;inSheet?:boolean}){
 const [query,setQuery]=useState('');const keyboard=useKeyboard();const suggestions=destinationSuggestions(query,commerce);
 const Scroll=inSheet?Fragment:MobileScroll;
 const select=(city:string,id?:string)=>{keyboard.hide();onSelect(city,id);};
 const submit=()=>{const choice=suggestions.find(s=>s.title.toLocaleLowerCase('ru-RU')===query.trim().toLocaleLowerCase('ru-RU'))||suggestions[0];if(choice)select(choice.city,choice.hotelId);else if(!query.trim()&&commerce.search.city)select(commerce.search.city);};
 return <div className={inSheet?"destination-sheet":"destination-screen"}><Scroll {...(inSheet?{}:{className:"destination-scroll"})}><header className="destination-header"><div><Icon name="nav-search" size={20}/><KeyboardInput aria-label="Город или отель" placeholder="Город или отель" value={query} enterKeyHint="done" onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();submit();}}} onChange={e=>setQuery(e.target.value)} onBlur={e=>{if(!(e.relatedTarget instanceof HTMLInputElement))keyboard.hide();}}/><button className="destination-close" type="button" aria-label="Закрыть выбор направления" onPointerDown={e=>e.preventDefault()} onClick={()=>{keyboard.hide();onCancel();}}><Icon name="close" size={20} inheritColor/></button></div></header><main className="destination-content" onPointerDownCapture={e=>{if((e.target as HTMLElement).closest('button'))e.preventDefault();}}>{!!suggestions.length&&<section className="k-card">{suggestions.map(s=><Row key={s.id} icon={s.hotelId?'nav-trips':'pin'} title={s.title} subtitle={s.subtitle} onClick={()=>select(s.city,s.hotelId)}/>)}</section>}{query&&!suggestions.length&&<div className="search-no-match"><h2>Ничего не нашли</h2><p>Попробуйте другое название города или отеля.</p></div>}<h2>Популярные</h2><div className="popular-cities">{popularCities.map(city=><button className="filter-chip" key={city} onClick={()=>select(city)}>{city}</button>)}</div></main></Scroll></div>;
}
export function SearchDateFlow({value,onSave,onClose,error}:{value:Search;onSave:(s:Search)=>void;onClose:()=>void;error?:string}){
 // The flow renders from a stable child so date edits cannot recreate its stack.
 return <DateContext value={value} onSave={onSave} onClose={onClose} error={error}/>;
}
import {createContext,useContext} from 'react';
const DateState=createContext<{draft:Search;setDraft:(s:Search)=>void;onSave:()=>void;onClose:()=>void;error?:string}|null>(null);
function DateContent(){const c=useContext(DateState)!;return <MobileScroll className="page-scroll"><DateHeader/><main className="when-content"><Calendar value={c.draft} onChange={c.setDraft}/></main></MobileScroll>;}
function DateFooter(){const c=useContext(DateState)!,validation=validDateRange(c.draft),error=c.error||validation;return <div className="booking-footer date-footer"><Button disabled={!!validation} onClick={c.onSave}>{c.draft.checkOut?'Готово · '+dateLabel(c.draft):'Выберите дату выезда'}</Button>{error&&c.draft.checkOut&&<p className="field-error" role="alert">{error}</p>}</div>;}
function DateHeader(){const c=useContext(DateState)!;return <div className="booking-header"><IconButton name="back" label="Закрыть выбор дат" onClick={c.onClose}/><span>Даты поездки</span><span className="header-spacer"/></div>;}
const dateScreen:FlowScreen={id:'dates',headerHeight:0,footerHeight:76,footer:()=> <DateFooter/>,render:()=> <DateContent/>};
function DateContext({value,onSave,onClose,error}:{value:Search;onSave:(s:Search)=>void;onClose:()=>void;error?:string}){const [draft,setDraft]=useState(()=>structuredClone(value));return <DateState.Provider value={{draft,setDraft,onSave:()=>onSave(draft),onClose,error}}><FlowStack initial={dateScreen}/></DateState.Provider>;}
