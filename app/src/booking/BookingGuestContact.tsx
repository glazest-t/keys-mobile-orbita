import {Field,Icon} from '../ui';
import {ContactPhoneField} from '../travelers/ContactPhoneField';
import type {Traveler} from '../state';
import type {Draft,Contact} from './model';
export function SavedTravelerList({travelers,onSelect}:{travelers:Traveler[];onSelect:(traveler:Traveler)=>void}){
 return <div className="k-card booking-traveler-list">{travelers.map(t=><button type="button" className="k-row k-list-row" key={t.id} onPointerDown={e=>e.preventDefault()} onClick={()=>onSelect(t)}><span className="icon-tile"><Icon name="guests" size={22} inheritColor/></span><span><strong>{t.name} {t.surname}</strong>{t.primary&&<small>Это вы</small>}</span><Icon name="chevron-right" size={18} inheritColor/></button>)}</div>;
}
export function BookingGuestContact({draft,errors,onChange}:{draft:Draft;errors:Partial<Record<keyof Contact,string>>;onChange:(patch:Partial<Draft>)=>void}){
 return <>
 <div className="guest-form-card">{(['name','surname','phone','email'] as const).map((key,i)=><div className={i<2?'guest-half':'guest-full'} key={key}>{key==='phone'?<ContactPhoneField value={draft.contact.phone} error={errors.phone} onChange={phone=>onChange({contact:{...draft.contact,phone}})}/>:<Field label={key==='name'?'Имя':key==='surname'?'Фамилия':'Email для подтверждения'} type={key==='email'?'email':'text'} value={draft.contact[key]} autoComplete={key==='name'?'given-name':key==='surname'?'family-name':'email'} error={errors[key]} onChange={e=>onChange({contact:{...draft.contact,[key]:e.target.value},...(key==='name'||key==='surname'?{guestTravelerId:undefined}:{})})}/>}</div>)}</div>
 </>;
}
