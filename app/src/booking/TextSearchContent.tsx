import {useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet,KeyboardInput,useKeyboard} from '../mobile';
import {Icon} from '../ui';
import {PreferenceContent} from './PreferenceJourney';
import {PreferenceWish} from './PreferenceDiscovery';
import {preferenceError,type PreferenceDraft} from './preferences';
import {formatMoney,type Commerce} from './model';
import {DatePicker,GuestPicker} from './SearchControls';
import {guestCountLabel,popularCities} from './search';
import {compactDates} from './FindPage';
import './preferences.css';

export function TextSearchContent({draft:d,onChange,commerce,owner,setCommerce,onOpen}:{draft:PreferenceDraft;onChange:(d:PreferenceDraft)=>void;commerce:Commerce;owner:string;setCommerce:Dispatch<SetStateAction<Commerce>>;onOpen:(id:string)=>void}){
 const keyboard=useKeyboard(),[sheet,setSheet]=useState<'city'|'dates'|'guests'|null>(null);
 const patch=(p:Partial<PreferenceDraft>)=>onChange({...d,...p});
 if(d.stage==='results')return <PreferenceContent draft={d} onChange={onChange} commerce={commerce} owner={owner} setCommerce={setCommerce} onOpen={onOpen}/>;
 return <div className="text-search-content">
  <div className="preference-intro"><h1>Какой отдых хочется?</h1><p>Расскажите, что важно в отеле.</p></div>
  <div className="find-search-fields text-search-fields" role="group" aria-label="Параметры поездки">
   <button onClick={()=>setSheet('city')}><Icon name="pin" size={20}/><span><small>Куда</small><strong>{d.mode==='any'?'Куда угодно':d.city||'Выбрать город'}</strong></span><Icon name="chevron-down" size={16}/></button>
   <div><button onClick={()=>setSheet('dates')}><Icon name="calendar" size={20}/><span><small>Даты</small><strong>{compactDates(d.search)}</strong></span></button><button onClick={()=>setSheet('guests')}><Icon name="guests" size={20}/><span><small>Гости</small><strong>{guestCountLabel(d.search)}</strong></span></button></div>
  </div>
  {d.budgetMinor!==null&&<div className="preference-chips"><button aria-label="Убрать ограничение бюджета" onClick={()=>patch({budgetMinor:null})}>До {formatMoney(d.budgetMinor)} за ночь<Icon name="close" size={14}/></button></div>}
  <PreferenceWish key="text-search-form" draft={d} onChange={onChange} onApply={next=>onChange({...next,stage:'results'})} onClose={()=>{}} submitLabel="Подобрать отели" validationError={preferenceError(d)}/>
  <BottomSheet open={!!sheet} onOpenChange={v=>{if(!v)setSheet(null);}} title={sheet==='city'?'Куда поедем?':sheet==='dates'?'Даты поездки':'Кто едет'} snap={sheet==='dates'?.88:keyboard.visible?.65:.8}>
   {sheet==='dates'?<DatePicker value={d.search} onSave={search=>{patch({search});setSheet(null);}}/>:sheet==='guests'?<GuestPicker value={d.search} onSave={search=>{patch({search});setSheet(null);}}/>:<div className="sheet-body preference-city"><KeyboardInput aria-label="Город для текстового поиска" placeholder="Введите город" value={d.cityQuery} onChange={e=>patch({cityQuery:e.target.value})}/><div className="preference-city-options">{['Куда угодно',...popularCities.filter(c=>c.toLocaleLowerCase('ru').includes(d.cityQuery.toLocaleLowerCase('ru')))].map(city=><button key={city} onClick={()=>{keyboard.hide();patch({resultFilters:undefined,mode:city==='Куда угодно'?'any':'city',city:city==='Куда угодно'?'':city,cityQuery:city==='Куда угодно'?'':city});setSheet(null);}}>{city}</button>)}</div></div>}
  </BottomSheet>
 </div>;
}
