import {useEffect,useRef,useState} from 'react';
import {Button,Icon} from '../ui';
import {formatMoney,quoteDraft,type Commerce,type Draft} from './model';
import {hourlyBookingTimeOptions,selectedBookingTime,selectBookingTime,type StayTimeKind} from './bookingTimes';
import './booking-times.css';

export function BookingTimes({draft,onEdit}:{draft:Draft;onEdit:(kind:StayTimeKind)=>void}){
 return <section className="hotel-section"><h2>Заезд и выезд</h2><div className="booking-times">{(['arrival','departure'] as const).map(kind=>{
  const option=selectedBookingTime(draft,kind);
  return <button key={kind} onClick={()=>onEdit(kind)} aria-label={`Изменить время ${kind==='arrival'?'заезда':'выезда'}: ${option.time}`}>
   <span className="booking-time-label"><Icon name={kind==='arrival'?'check-in':'check-out'} size={18} inheritColor/>{kind==='arrival'?'Заезд':'Выезд'}</span>
   <span className="booking-time-value"><strong>{kind==='arrival'?'С':'До'} {option.time}</strong><Icon name="edit" size={16} inheritColor/></span>
   <small>{option.amountMinor?`+ ${formatMoney(option.amountMinor)}`:'Без доплаты'}</small>
  </button>;
 })}</div></section>;
}
export function BookingTimeEditor({commerce,owner,kind,onApply}:{commerce:Commerce;owner:string|null;kind:StayTimeKind;onApply:(id:string)=>void}){
 const draft=commerce.draft!,options=hourlyBookingTimeOptions(draft.hotelId,kind);
 const [selected,setSelected]=useState(`time:${selectedBookingTime(draft,kind).time}`);
 const listRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{const list=listRef.current,row=list?.querySelector<HTMLElement>('[aria-checked="true"]');if(!list||!row)return;const target=Math.max(0,row.offsetTop-list.offsetTop-(list.clientHeight-row.offsetHeight)/2);const first=[...list.querySelectorAll<HTMLElement>('[role="radio"]')].filter(item=>item.offsetTop-list.offsetTop<=target).at(-1);list.scrollTop=first?first.offsetTop-list.offsetTop:0;},[]);
 const next=selectBookingTime(draft,kind,selected);
 let total:number|undefined,error='';try{total=quoteDraft({...commerce,draft:next},owner).cashDueMinor;}catch(e){error=(e as Error).message;}
 return <div className="booking-time-editor" onFocusCapture={event=>{
  // Keep browser auto-focus inside the sheet from scrolling the device shell.
  const screen=event.currentTarget.closest<HTMLElement>('[data-phone-screen]');
  if(screen)screen.scrollTop=0;
 }}><div ref={listRef} className="booking-time-options" role="radiogroup" aria-label={kind==='arrival'?'Время заезда':'Время выезда'}>{options.map(o=><button key={o.id} role="radio" aria-checked={o.id===selected} disabled={!o.available} onClick={()=>setSelected(o.id)}>
  <span><strong>{kind==='arrival'?'С':'До'} {o.time}</strong>{o.title==='Стандартное время'&&<small>{o.title}</small>}</span><span className="booking-time-price">{!o.available?'Недоступно':o.amountMinor?`+ ${formatMoney(o.amountMinor)}`:'Без доплаты'}</span><span className="booking-time-radio">{o.id===selected&&<i/>}</span>
 </button>)}</div>{error&&<p role="alert" className="field-error">{error}</p>}<div className="service-time-order-footer"><div className="booking-time-total"><span>Итого за бронирование</span><strong>{total!==undefined?formatMoney(total):'—'}</strong></div><Button disabled={total===undefined} onClick={()=>onApply(selected)}>Применить</Button></div></div>;
}
