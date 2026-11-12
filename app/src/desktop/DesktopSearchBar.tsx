import {useEffect,useId,useRef,useState} from 'react';
import {Button,Icon,IconButton} from '../ui';
import {Calendar,GuestFields} from '../booking/SearchControls';
import {catalog,dateLabel,searchError,type Commerce,type Search} from '../booking/model';
import {destinationSuggestions,guestCountLabel,popularCities,validDateRange} from '../booking/search';

type Step='city'|'dates'|'guests';
const titles={city:'Куда поедем?',dates:'Когда планируете поездку?',guests:'Кто едет?'};
/** Desktop-only, non-modal search. A shared draft survives panel switches and dismissal. */
export function DesktopSearchBar({commerce,onSearch}:{commerce:Commerce;onSearch:(search:Search,hotelId?:string)=>void}){
 const [draft,setDraft]=useState<Search>(()=>structuredClone(commerce.search));
 const [step,setStep]=useState<Step|null>(null),[query,setQuery]=useState(''),[hotelId,setHotelId]=useState<string>(),[error,setError]=useState('');
 const [maxHeight,setMaxHeight]=useState(560),[guestRight,setGuestRight]=useState(0);
 const root=useRef<HTMLDivElement>(null),panel=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null);
 const triggers=useRef<Partial<Record<Step,HTMLButtonElement|null>>>({}),id=useId();
 const selectedHotel=catalog.hotels.find(h=>h.id===hotelId);
 const suggestions=destinationSuggestions(query,{...commerce,search:draft});
 useEffect(()=>{setDraft(structuredClone(commerce.search));setHotelId(undefined);setQuery('');setError('');},[commerce.search]);
 function close(restore=false){const previous=step;setStep(null);if(restore&&previous)triggers.current[previous]?.focus();}
 function open(next:Step){setError('');setStep(next);}
 useEffect(()=>{
  if(!step)return;
  const update=()=>{if(!root.current)return;const bounds=root.current.getBoundingClientRect();setMaxHeight(Math.max(180,window.innerHeight-bounds.bottom-28));const anchor=triggers.current.guests?.getBoundingClientRect();if(anchor)setGuestRight(Math.min(Math.max(0,bounds.width-440),Math.max(0,bounds.right-anchor.right)));};
  const outside=(e:PointerEvent)=>{if(root.current&&!root.current.contains(e.target as Node))setStep(null);};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();setStep(null);triggers.current[step]?.focus();}};
  update();const observer=new ResizeObserver(update);if(root.current)observer.observe(root.current);document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  window.addEventListener('resize',update);window.addEventListener('scroll',update,true);
  if(step==='city')input.current?.focus();else panel.current?.focus({preventScroll:true});
  return()=>{observer.disconnect();document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);window.removeEventListener('resize',update);window.removeEventListener('scroll',update,true);};
 },[step]);
 function select(city:string,hotel?:string){setDraft(s=>({...s,city}));setHotelId(hotel);setQuery('');open('dates');}
 function submit(){
  let value=draft,selected=hotelId;
  if(query.trim()){
   const match=suggestions.find(s=>s.title.toLocaleLowerCase('ru')===query.trim().toLocaleLowerCase('ru'))||suggestions[0];
   if(!match){setStep('city');setError('Выберите город или отель из списка');return;}
   value={...draft,city:match.city};selected=match.hotelId;setDraft(value);setHotelId(selected);setQuery('');
  }
  const validation=searchError(value);
  if(validation){setStep(!value.city.trim()?'city':validDateRange({...value,adults:1,childrenAges:[]})?'dates':'guests');setError(validation);return;}
  close();onSearch(value,selected);
 }
 const fields=[{key:'city' as const,label:'Куда',value:query||selectedHotel?.name||draft.city||'город или название отеля',icon:'nav-search'},
  {key:'dates' as const,label:'Даты',value:draft.checkIn&&draft.checkOut?dateLabel(draft):draft.checkIn?'Выберите дату выезда':'Указать даты',icon:'calendar'},
  {key:'guests' as const,label:'Гости',value:guestCountLabel(draft),icon:'guests'}];
 return <div className={'desktop-search-bar'+(step?' is-editing':'')} ref={root} onBlur={e=>{if(e.relatedTarget&&!e.currentTarget.contains(e.relatedTarget as Node))setStep(null);}}>
  <div className="desktop-search-fields">{fields.map(f=><div key={f.key} className={'desktop-search-field'+(step===f.key?' is-active':'')}><button ref={el=>{triggers.current[f.key]=el;}} type="button" className={'desktop-search-trigger'+(step===f.key?' is-active':'')} aria-haspopup="dialog" aria-expanded={step===f.key} aria-controls={step===f.key?id:undefined} onClick={()=>step===f.key?close():open(f.key)}><Icon name={f.icon} size={20} inheritColor/><span><small>{f.label}</small><strong>{f.value}</strong></span></button>{step===f.key&&<button type="button" className="desktop-search-field-close" aria-label={`Закрыть окно «${f.label}»`} onClick={()=>close(true)}><Icon name="close" size={16} inheritColor/></button>}</div>)}</div>
  <Button onClick={submit}><Icon name="nav-search" size={20} inheritColor/>Найти</Button>
  {step&&<div className={'desktop-search-popover desktop-search-popover-'+step} id={id} ref={panel} role="dialog" aria-label={titles[step]} tabIndex={-1} style={{maxHeight,...(step==='guests'?{right:guestRight}: {})}}>
   {step==='city'&&<><div className="desktop-destination-input"><Icon name="nav-search" size={20}/><input ref={input} aria-label="город или название отеля" placeholder="город или название отеля" value={query} onChange={e=>{setQuery(e.target.value);setError('');}} onKeyDown={e=>{if(e.key==='Enter'&&!e.nativeEvent.isComposing){e.preventDefault();const match=suggestions[0];if(match)select(match.city,match.hotelId);else setError('Ничего не найдено. Попробуйте другое название.');}}}/>{query&&<IconButton name="close" label="Очистить направление" onClick={()=>{setQuery('');input.current?.focus();}}/>}</div>
    <p className="desktop-destination-label">{query.trim()?'Города и отели':'Популярные направления'}</p>
    <div className="desktop-destination-list">{query.trim()?suggestions.map(s=><button type="button" key={s.id} onClick={()=>select(s.city,s.hotelId)}><span className="icon-tile"><Icon name={s.hotelId?'room':'pin'} size={22}/></span><span><strong>{s.title}</strong><small>{s.subtitle}</small></span></button>):popularCities.map(city=><button type="button" key={city} onClick={()=>select(city)}><span className="icon-tile"><Icon name="pin" size={22}/></span><strong>{city}</strong></button>)}</div>
    {query.trim()&&!suggestions.length&&<p>Ничего не нашли. Попробуйте другое название.</p>}</>}
   {step==='dates'&&<Calendar value={draft} visibleMonths={2} onChange={value=>{setDraft(value);setError('');if(value.checkOut){const dateError=validDateRange({...value,adults:1,childrenAges:[]});if(dateError)setError(dateError);else open('guests');}}}/>}
   {step==='guests'&&<GuestFields value={draft} onChange={value=>{setDraft(value);setError('');}} showTripFeatures/>}
   {(error||(step==='guests'&&draft.childrenAges.some(age=>age<0)))&&<p className="field-error" role="alert">{error||'Укажите возраст каждого ребёнка'}</p>}
  </div>}
 </div>;
}
