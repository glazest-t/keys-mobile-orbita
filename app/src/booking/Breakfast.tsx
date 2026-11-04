import {ServiceSheet as BottomSheet} from './ServiceSheet';
import {ServiceHotelPaymentNote} from './ServiceHotelPaymentNote';
import {ServiceDetailIntro} from './ServiceDetailIntro';
import {isDesktop} from '../desktop/surface';
import {breakfastVenue,breakfastTime} from './breakfastVenue';
import {addServicesForHotelPayment} from './servicePayment';
import {createContext,useContext,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {useKeyboard} from '../mobile';
import {Button,Icon} from '../ui';
import {Counter} from './SearchControls';
import {formatMoney,type Booking,type Commerce} from './model';
import {availableBreakfastDates,breakfastIncluded,breakfastMornings,breakfastQuote,breakfastStayQuote,requestBreakfast,requestBreakfastStay,requestStatus,settingsFor,type BreakfastInput,type BreakfastMode} from './serviceRequests';
import './trip-services.css';
const dateLabel=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});
type Props={initialMode?:BreakfastMode;booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;onBack:()=>void;onDone:()=>void;onAdded:()=>void;onOrder:(id:string,payNow?:boolean)=>void};
type Ctx=Props&{mode:BreakfastMode;input:BreakfastInput;setInput:(v:BreakfastInput)=>void;error:string;setError:(v:string)=>void;viewOrder:(id:string)=>void};
const Context=createContext<Ctx|null>(null),useBreakfast=()=>useContext(Context)!;
function BreakfastBooked(){
 const c=useBreakfast(),b=c.booking,rows=(b.serviceRequests||[]).filter(r=>r.kind==='breakfast'&&(r.mode||'buffet')===c.mode&&!['cancelled','declined'].includes(requestStatus(b,r))).sort((a,b)=>a.date.localeCompare(b.date));
 if(!rows.length)return null;
 return <section className="breakfast-booked"><h3>Уже заказано</h3><p>На эти дни завтрак добавлен. Откройте заказ, чтобы посмотреть детали или отменить его.</p>{rows.map(r=><button className="breakfast-booked-row" key={r.id} onClick={()=>c.viewOrder(r.id)}><span><strong>{dateLabel(r.date)}</strong><small>{breakfastTime(r)} · {r.persons} перс.</small></span><span>Детали и отмена<Icon name="chevron-right" size={16} inheritColor/></span></button>)}</section>;
}
function BreakfastOrder({open,onClose,onSubmit}:{open:boolean;onClose:()=>void;onSubmit:(all:boolean)=>void}){
 const c=useBreakfast(),b=c.booking,input=c.input,config=settingsFor(b),[all,setAll]=useState(false);
 const change=(v:Partial<BreakfastInput>)=>{c.setInput({...input,...v});c.setError('');};
 let dates=all?availableBreakfastDates(b,input):[input.date],total=0,validation='';
 try{if(all){const q=breakfastStayQuote(b,input);dates=q.dates;total=q.amountMinor;}else total=breakfastQuote(b,input);}catch(e){validation=(e as Error).message;}
 const unit=input.mode==='room'?config.roomBreakfastMinor:config.breakfastMinor,available=availableBreakfastDates(b,input),skipped=breakfastMornings(b).length-available.length;
 const booked=(b.serviceRequests||[]).some(r=>r.kind==='breakfast'&&(r.mode||'buffet')===input.mode&&!['cancelled','declined'].includes(requestStatus(b,r)));
 if(!available.length)return <BottomSheet open={open} onOpenChange={v=>{if(!v)onClose();}} title={input.mode==='room'?'Завтрак в номер':'Завтрак «шведский стол»'} snap={.85}><div className="breakfast-order-sheet"><div className="breakfast-order-fields"><ServiceDetailIntro kind={input.mode}/><p className="service-detail-note">{input.mode==='buffet'&&breakfastIncluded(b)?'Завтрак включён в бронь на всё проживание.':booked?'Все доступные дни уже заказаны. Новый заказ можно оформить после отмены существующего.':'Доступных дат для заказа больше нет.'}</p><BreakfastBooked/></div><div className="service-action-footer"><Button dismissOnly variant="secondary" onClick={onClose}>Закрыть</Button></div></div></BottomSheet>;

 return <BottomSheet open={open} onOpenChange={v=>{if(!v)onClose();}} title={input.mode==='room'?'Завтрак в номер':'Завтрак «шведский стол»'} snap={.91}>
 <div className="breakfast-order-sheet"><div className="breakfast-order-fields">
 <ServiceDetailIntro kind={input.mode}/><BreakfastBooked/>
 <div className="desktop-breakfast-settings">

  <div className="desktop-breakfast-schedule">
   <div className="desktop-breakfast-date"><label className="desktop-breakfast-field">{all?'Даты завтраков':'Дата'}{all?<span className="desktop-breakfast-date-range">{dates.length?dateLabel(dates[0]):'—'}{dates.length>1?' — '+dateLabel(dates[dates.length-1]):''}</span>:<span className="desktop-breakfast-select"><select aria-label="Дата завтрака" value={input.date} onChange={e=>change({date:e.target.value})} disabled={!available.length}>{!available.length&&<option value="">Нет доступных дат</option>}{available.map(date=><option key={date} value={date}>{dateLabel(date)}</option>)}</select><Icon name="chevron-down" size={18} inheritColor/></span>}</label>
    <label className="desktop-breakfast-all"><input type="checkbox" checked={all} onChange={e=>{setAll(e.target.checked);c.setError('');}}/>{booked?'На все свободные дни':'На всё проживание'}</label>
    {all&&skipped>0&&<small className="breakfast-form-hint">Уже заказанные и прошедшие даты не включены.</small>}
   </div>
   {input.mode==='room'&&<label className="desktop-breakfast-field">Время доставки<span className="desktop-breakfast-select"><select aria-label="Время доставки" value={input.time} onChange={e=>change({time:e.target.value})}>{['07:00','08:00','09:00','10:00'].map(time=><option key={time}>{time}</option>)}</select><Icon name="chevron-down" size={18} inheritColor/></span>{all&&<small>В одно время каждый день</small>}</label>}
  </div>
  <Counter label="Гости" min={1} max={b.draft.search.adults+b.draft.search.childrenAges.length} value={input.persons} onChange={persons=>change({persons})}/>
  {input.mode==='buffet'&&<div className="breakfast-buffet-schedule"><Icon name="early-check-in" size={20} inheritColor/><span><strong>{breakfastVenue(b.draft.hotelId).hours}</strong><small>{breakfastVenue(b.draft.hotelId).restaurant} · {breakfastVenue(b.draft.hotelId).floor}</small></span></div>}
 </div>

 {isDesktop&&<ServiceHotelPaymentNote booking={b} amount={total}/>}</div><div className="service-action-footer">{!isDesktop&&<ServiceHotelPaymentNote booking={b} amount={total}/>}{(c.error||validation)&&<p role="alert" className="field-error">{c.error||validation}</p>}<div className="breakfast-cost-summary"><span>Стоимость</span><strong>{validation?'—':formatMoney(total)}</strong>{!validation&&<small>{formatMoney(unit)} × {input.persons} перс.{all?` × ${dates.length} ${dayWord(dates.length)}`:''}</small>}</div><Button disabled={!!validation||(!config.breakfastOrder||b.operation.status!=='confirmed'||b.stay?.status==='checked_out')} onClick={()=>onSubmit(all)}>Заказать</Button></div></div></BottomSheet>;
}
const dayWord=(n:number)=>n%10===1&&n%100!==11?'день':n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?'дня':'дней';
export function BreakfastFlow(props:Props){
 const mode=props.initialMode||'buffet', [input,setInput]=useState<BreakfastInput>(()=>{const initial:BreakfastInput={mode,additional:false,date:'',time:'08:00',persons:props.booking.draft.search.adults+props.booking.draft.search.childrenAges.length,comment:''};initial.date=availableBreakfastDates(props.booking,initial)[0]||breakfastMornings(props.booking)[0]||'';return initial;}),[error,setError]=useState(''),id=useRef(crypto.randomUUID()),locked=useRef(false),keyboard=useKeyboard();
 const submit=(all:boolean)=>{if(locked.current)return;try{locked.current=true;const next=(all?requestBreakfastStay:requestBreakfast)(props.commerce,props.booking.owner,props.booking.id,input,id.current);props.setCommerce(addServicesForHotelPayment(next,props.booking.owner,props.booking.id,[id.current]));keyboard.hide();props.onAdded();}catch(e){locked.current=false;setError((e as Error).message);}};
 return <Context.Provider value={{...props,mode,input,setInput,error,setError,viewOrder:props.onOrder}}><BreakfastOrder open onClose={props.onBack} onSubmit={submit}/></Context.Provider>;
}
