import {createContext,useContext,useState} from 'react';
import {FlowStack,MobileScroll,type FlowScreen} from '../mobile';
import {Button,IconButton} from '../ui';
import {Calendar,GuestFields} from './SearchControls';
import {dateLabel,nights,type Search} from './model';
import {validDateRange} from './search';
import './results-search.css';

type Props={value:Search;onApply:(search:Search)=>void|string;onClose:()=>void;showTripFeatures?:boolean};
const SearchState=createContext<{draft:Search;setDraft:(value:Search)=>void;apply:()=>void;close:()=>void;showTripFeatures:boolean;error:string}|null>(null);
function Header(){
 const c=useContext(SearchState)!;
 return <header className="results-query-header"><IconButton name="close" label="Закрыть изменение поиска" onClick={c.close}/><h1>Когда и кто</h1><span className="header-spacer"/></header>;
}
function Content(){
 const c=useContext(SearchState)!;
 return <MobileScroll className="page-scroll"><Header/><main className="when-content results-query-content"><Calendar value={c.draft} onChange={c.setDraft}/><GuestFields value={c.draft} onChange={c.setDraft} showTripFeatures={c.showTripFeatures}/>{c.error&&<p className="field-error" role="alert">{c.error}</p>}</main></MobileScroll>;
}
function Footer(){
 const c=useContext(SearchState)!,error=validDateRange(c.draft),count=nights(c.draft);
 const nightLabel=count%10===1&&count%100!==11?'ночь':count%10>=2&&count%10<=4&&(count%100<12||count%100>14)?'ночи':'ночей';
 return <footer className="results-query-footer">{error&&c.draft.checkOut&&<p className="field-error" role="alert">{error}</p>}<Button disabled={!!error} onClick={c.apply} aria-label={c.draft.checkOut?`Применить поиск: ${dateLabel(c.draft)}, ${count} ${nightLabel}`:'Выберите дату выезда'}>{c.draft.checkOut?`${dateLabel(c.draft)} · ${count} ${nightLabel}`:'Выберите дату выезда'}</Button></footer>;
}
const screen:FlowScreen={id:'results-query',headerHeight:0,footerHeight:76,footer:()=> <Footer/>,render:()=> <Content/>};
export function ResultsSearch({value,onApply,onClose,showTripFeatures=true}:Props){
 const [draft,setDraft]=useState(()=>structuredClone(value)),[error,setError]=useState('');
 return <div className="results-query-flow"><SearchState.Provider value={{draft,setDraft:value=>{setError('');setDraft(value);},error,showTripFeatures,close:onClose,apply:()=>{if(!validDateRange(draft))setError(onApply(draft)||'');}}}><FlowStack initial={screen}/></SearchState.Provider></div>;
}
