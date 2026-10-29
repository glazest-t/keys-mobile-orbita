import {type Dispatch,type SetStateAction} from 'react';
import {Icon,IconButton} from '../ui';
import {type Commerce,dateLabel,guestLabel} from './model';
import {compactDates} from './FindPage';
import {guestCountLabel} from './search';
import {SearchFilterRail} from './SearchFilterRail';
import './results-header.css';
export function ResultsHeader({commerce,setCommerce,owner,onBack,onEdit}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string|null;onBack:()=>void;onEdit:()=>void}){
 const search=commerce.search;
 return <header className="results-fixed-header"><div className="results-search-row"><IconButton name="back" label="Назад к поиску" onClick={onBack}/><button className="results-search-edit" title="Изменить поиск" aria-label={`Изменить поиск: ${search.city}, ${dateLabel(search)}, ${guestLabel(search)}`} onClick={onEdit}><span><strong>{search.city}</strong><small>{compactDates(search)} · {guestCountLabel(search)}</small></span><span className="results-edit-hint" aria-hidden="true"><Icon name="edit" size={18} inheritColor/></span></button></div><SearchFilterRail commerce={commerce} setCommerce={setCommerce} owner={owner}/></header>;
}
