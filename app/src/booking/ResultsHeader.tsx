import {isDesktop} from '../desktop/surface';
import {Button} from '../ui';
import {type Dispatch,type SetStateAction} from 'react';
import {Icon,IconButton} from '../ui';
import {type Commerce,dateLabel,guestLabel} from './model';
import {compactDates} from './FindPage';
import {guestCountLabel} from './search';
import {SearchFilterRail} from './SearchFilterRail';
import './results-header.css';
export function ResultsHeader({commerce,setCommerce,owner,onBack,onEdit,onField,onSearch}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string|null;onBack:()=>void;onEdit:()=>void;onField?:(field:string)=>void;onSearch?:()=>void}){
 const search=commerce.search;
 if(isDesktop)return <header className="desktop-results-search"><form aria-label="Поиск отелей" onSubmit={e=>{e.preventDefault();onSearch?.();}}><button type="button" onClick={()=>onField?.('city')}><Icon name="pin" size={20}/><span><small>Куда</small><strong>{search.city||'город или название отеля'}</strong></span></button><button type="button" onClick={()=>onField?.('dates')}><Icon name="calendar" size={20}/><span><small>Заезд — выезд</small><strong>{dateLabel(search)}</strong></span></button><button type="button" onClick={()=>onField?.('guests')}><Icon name="guests" size={20}/><span><small>Гости</small><strong>{guestCountLabel(search)}</strong></span></button><Button type="submit"><Icon name="nav-search" size={20} inheritColor/>Найти</Button></form></header>;
 return <header className="results-fixed-header"><div className="results-search-row"><IconButton name="back" label="Назад к поиску" onClick={onBack}/><button className="results-search-edit" title="Изменить поиск" aria-label={`Изменить поиск: ${search.city}, ${dateLabel(search)}, ${guestLabel(search)}`} onClick={onEdit}><span><strong>{search.city}</strong><small>{compactDates(search)} · {guestCountLabel(search)}</small></span><span className="results-edit-hint" aria-hidden="true"><Icon name="edit" size={18} inheritColor/></span></button></div><SearchFilterRail commerce={commerce} setCommerce={setCommerce} owner={owner}/></header>;
}
