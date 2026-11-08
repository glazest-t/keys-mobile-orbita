import {useId,useRef,useState} from 'react';
import {KeyboardInput,useKeyboard} from '../mobile';
import {Button,Icon,IconButton} from '../ui';
import {Calendar,GuestFields} from './SearchControls';
import {catalog,dateLabel,searchError,type Commerce,type Search} from './model';
import {destinationSuggestions,guestCountLabel,popularCities,tripFeaturesLabel,validDateRange} from './search';
import './search-journey.css';

type Step='city'|'dates'|'guests';
const steps:Step[]=['city','dates','guests'];
const labels={city:'Куда',dates:'Даты',guests:'Гости'};

/** One draft for all panels: reopening an earlier step preserves later choices. */
export function SearchJourney({commerce,initialStep,onApply,onClose}:{commerce:Commerce;initialStep:Step;onApply:(value:Search,hotelId?:string)=>void|string;onClose:()=>void}){
 const returningSearch=!!commerce.recentSearches?.length;
 const [draft,setDraft]=useState<Search>(()=>returningSearch?structuredClone(commerce.search):{city:'',checkIn:'',checkOut:'',adults:1,childrenAges:[]});
 const [guestsChosen,setGuestsChosen]=useState(returningSearch||initialStep==='guests');
 const [step,setStep]=useState<Step>(initialStep),[hotelId,setHotelId]=useState<string>();
 const [query,setQuery]=useState(''),[error,setError]=useState('');
 const keyboard=useKeyboard(),id=useId(),scroll=useRef<HTMLDivElement>(null);
 const selectedHotel=catalog.hotels.find(h=>h.id===hotelId);
 const suggestions=destinationSuggestions(query,{...commerce,search:draft});
 const datesError=validDateRange({...draft,adults:1,childrenAges:[]}),guestsError=draft.childrenAges.some(age=>age<0);
 const summaries={city:selectedHotel?.name||draft.city||'Выберите направление',dates:draft.checkOut?dateLabel(draft):'Указать даты',guests:guestsChosen?guestCountLabel(draft):'Добавить гостей'};
 function open(next:Step){if(next==='guests')setGuestsChosen(true);keyboard.hide();setError('');setStep(next);requestAnimationFrame(()=>scroll.current?.scrollTo({top:0,behavior:'instant'}));}
 function select(city:string,hotel?:string){setDraft(s=>({...s,city}));setHotelId(hotel);setQuery('');open('dates');}
 function change(value:Search){setError('');setDraft(value);}
 function next(){
  if(step==='city'){if(query.trim()){const match=suggestions.find(s=>s.title.toLocaleLowerCase('ru')===query.trim().toLocaleLowerCase('ru'))||suggestions[0];if(match)select(match.city,match.hotelId);}else if(draft.city)open('dates');return;}
  if(step==='dates'){if(!datesError)open('guests');return;}
  const validation=searchError(draft);
  if(validation){setError(validation);if(!draft.city)open('city');else if(datesError)open('dates');return;}
  keyboard.hide();setError(onApply(draft,hotelId)||'');
 }
 const disabled=step==='city'?(query.trim()?suggestions.length===0:!draft.city):step==='dates'?!!datesError:guestsError;
 return <div className="search-journey">
  <header className="search-journey-heading"><IconButton name="close" label="Закрыть поиск" onClick={onClose}/></header>
  <div className="search-journey-scroll" ref={scroll}>
   {steps.map(key=><section className={'search-step'+(step===key?' is-open':'')} key={key}>
    <button type="button" className="search-step-heading" aria-expanded={step===key} aria-controls={`${id}-${key}`} onClick={()=>open(key)}>
     <span>{labels[key]}</span>{step!==key&&<strong>{summaries[key]}</strong>}<Icon name="chevron-down" size={16} inheritColor/>
    </button>
    <div id={`${id}-${key}`} hidden={step!==key} className="search-step-content">
     {key==='city'&&<>
      <div className="search-journey-input"><Icon name="nav-search" size={20} inheritColor/><KeyboardInput aria-label="город или название отеля" placeholder={selectedHotel?.name||draft.city||'город или название отеля'} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();next();}}} enterKeyHint="search"/>{query&&<IconButton name="close" label="Очистить направление" onClick={()=>setQuery('')}/>}</div>
      <p className="search-journey-label">{query.trim()?'Города и отели':'Популярные направления'}</p>
      <div className="search-journey-destinations">{query.trim()?suggestions.map(s=><button type="button" key={s.id} onClick={()=>select(s.city,s.hotelId)}><span className="icon-tile"><Icon name={s.hotelId?'room':'pin'} size={20} inheritColor/></span><span><strong>{s.title}</strong><small>{s.subtitle}</small></span></button>):popularCities.map(city=><button type="button" key={city} onClick={()=>select(city)}><span className="icon-tile"><Icon name="pin" size={20} inheritColor/></span><span><strong>{city}</strong></span></button>)}</div>
      {query.trim()&&!suggestions.length&&<p className="search-journey-label">Ничего не нашли. Попробуйте другое название.</p>}
     </>}
     {key==='dates'&&<Calendar value={draft} onChange={change}/>}
     {key==='guests'&&<GuestFields value={draft} onChange={change} showTripFeatures/>}
    </div>
   </section>)}
  </div>
  <footer className="search-journey-footer">
   {(error||(step==='guests'&&guestsError))&&<p role="alert" className="field-error">{error||'Укажите возраст каждого ребёнка'}</p>}
   {step==='guests'&&tripFeaturesLabel(draft)&&<small>{tripFeaturesLabel(draft)}</small>}
   <Button disabled={disabled} onClick={next}>{step==='guests'?<><Icon name="nav-search" size={18} inheritColor/>Найти отели</>:step==='dates'&&!draft.checkOut?(draft.checkIn?'Выберите дату выезда':'Выберите дату заезда'):'Далее'}</Button>
  </footer>
 </div>;
}
