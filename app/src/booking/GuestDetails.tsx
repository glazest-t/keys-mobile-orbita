import type {User} from '../state';
import {SavedTravelerList} from './BookingGuestContact';
import {availableBookingTravelers} from './bookingGuestSelection';
import {useId,useState} from 'react';
import {KeyboardTextarea,useKeyboard} from '../mobile';
import {Button,Field,Icon} from '../ui';
import {additionalGuestError,type Draft} from './model';
import {bookingGuests,guestCapacity,stayWishOptions,updateGuest,wishSummary,WISH_LIMIT} from './bookingParty';
import './guestDetails.css';

export function GuestActions({draft,onEdit}:{draft:Draft;onEdit:(index:number)=>void}){
 const guests=bookingGuests(draft);
 return <>{guests.map((guest,index)=><button key={index} className="booking-add-guest" onClick={()=>onEdit(index)}><Icon name="edit" size={18} inheritColor/>{[guest.name,guest.surname].filter(Boolean).join(' ')||`Гость ${index+2}`}{(!guest.name.trim()||!guest.surname.trim())&&<small>Данные не заполнены</small>}</button>)}{guests.length<guestCapacity(draft.search)&&<button className="booking-add-guest" onClick={()=>onEdit(guests.length)}><Icon name="plus" size={18} inheritColor/>{guests.length?'Добавить ещё гостя':'Добавить второго гостя'}</button>}</>;
}
export function StayWishesButton({draft,onClick}:{draft:Draft;onClick:()=>void}){
 return <button className="booking-wishes-row" onClick={onClick}><span><strong>Пожелания к проживанию</strong><small>{wishSummary(draft)||'Необязательно'}</small></span><Icon name="chevron-right" size={18} inheritColor/></button>;
}
export function BookingGuestDetails({draft}:{draft:Draft}){
 const guests=bookingGuests(draft).filter(g=>g.name.trim()&&g.surname.trim()),wishes=wishSummary(draft);
 return <>{guests.length>0&&<section className="hotel-section"><h2>{draft.bookingFor==='other'?'Другие гости':'С вами едут'}</h2><div className="k-card booking-panel">{guests.map((g,i)=><p key={i}>{g.name} {g.surname}</p>)}</div></section>}{wishes&&<section className="hotel-section"><h2>Пожелания к проживанию</h2><div className="k-card booking-panel booking-saved-wishes"><p>{wishes}</p><small>Отель учтёт пожелания при наличии возможности.</small></div></section>}</>;
}
type EditorProps={user?:User|null;draft:Draft;mode:'secondGuest'|'wishes';index:number;onChange:(patch:Partial<Draft>)=>void;onClose:()=>void};
export function GuestEditor({draft,user,mode,index,onChange,onClose}:EditorProps){
 const [choosing,setChoosing]=useState(false);
 const [error,setError]=useState(''),keyboard=useKeyboard(),id=useId();
 const close=()=>{keyboard.hide();onClose();};
 const guest=bookingGuests(draft)[index]||{name:'',surname:''};
 const wishes=draft.stayWishes||{options:[],note:''};
 const update=(value:typeof guest)=>{setError('');onChange(updateGuest(draft,index,value));};
 if(mode==='wishes')return <div className="guest-editor"><p className="room-detail-caption">Отель учтёт пожелания при наличии возможности.</p><div className="stay-wish-options">{stayWishOptions.map(option=><button key={option} aria-pressed={wishes.options.includes(option)} onClick={()=>onChange({stayWishes:{...wishes,options:wishes.options.includes(option)?wishes.options.filter(v=>v!==option):[...wishes.options,option]}})}><span>{option}</span><span className="wish-check">{wishes.options.includes(option)&&<Icon name="check" size={16} inheritColor/>}</span></button>)}</div><div className="k-field"><KeyboardTextarea aria-label="Другие пожелания" id={id} className="stay-wish-note" value={wishes.note} maxLength={WISH_LIMIT} placeholder="Что ещё важно для вашего отдыха?" onChange={e=>onChange({stayWishes:{...wishes,note:e.target.value}})} onBlur={()=>keyboard.hide()} aria-describedby={id+'-count'}/><small id={id+'-count'}>{wishes.note.length} / {WISH_LIMIT}</small></div><Button onClick={close}>Готово</Button></div>;
 const saved=user?availableBookingTravelers(draft,user,index):[];
 if(choosing)return <div className="guest-editor"><SavedTravelerList travelers={saved} onSelect={person=>{update({name:person.name,surname:person.surname});setChoosing(false);}}/><Button variant="ghost" onClick={()=>setChoosing(false)}>Назад к данным</Button></div>;
 return <div className="guest-editor">{saved.length>0&&<Button variant="secondary" onClick={()=>{keyboard.hide();setChoosing(true);}}><Icon name="guests" size={18} inheritColor/>Выбрать путешественника</Button>}{mode==='secondGuest'&&<p className="room-detail-caption">Данные гостя для заселения</p>}{mode==='secondGuest'&&<>{(['name','surname'] as const).map((key,i)=><Field key={key} label={i?'Фамилия':'Имя'} value={guest[key]} onChange={e=>update({...guest,[key]:e.target.value})}/>)}{error&&<p className="field-error" role="alert">{error}</p>}<Button onClick={()=>{const message=additionalGuestError({...draft,additionalGuest:guest,otherGuests:[]});if(!guest.name.trim()||!guest.surname.trim()){setError('Укажите имя и фамилию гостя');return;}if(message){setError(message);return;}close();}}>Готово</Button>{bookingGuests(draft)[index]&&<Button variant="ghost" onClick={()=>{onChange(updateGuest(draft,index,null));close();}}>Удалить гостя</Button>}</>}</div>;
}
