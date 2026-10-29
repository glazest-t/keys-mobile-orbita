import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet} from '../mobile';
import {Button} from '../ui';
import {formatMoney,type Booking,type Commerce} from './model';
import {selectedBookingTime,type StayTimeKind} from './bookingTimes';
import {addStayTimeService,addedTimeService,includedTimeService,stayTimeServiceOptions,timeServiceDate} from './stayTimeServices';
import './booking-times.css';
import './trip-services.css';
export function EarlyArrival({open,onClose,booking:b,commerce,setCommerce,onOrder,onAdded,kind='arrival'}:{kind?:StayTimeKind;onOrder:(id:string)=>void;onAdded:()=>void;open:boolean;onClose:()=>void;booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>}){
 const options=stayTimeServiceOptions(b,kind),added=addedTimeService(b,kind),included=includedTimeService(b,kind),[time,setTime]=useState(''),[error,setError]=useState(''),id=useRef(crypto.randomUUID());
 useEffect(()=>{if(open){setTime(options[0]?.time||'');setError('');id.current=crypto.randomUUID();}},[open,b.id,kind]);
 useEffect(()=>{if(open&&added)onOrder(added.id);},[open,added?.id,onOrder]);
 const selected=options.find(o=>o.time===time),title=kind==='arrival'?'Ранний заезд':'Поздний выезд',prefix=kind==='arrival'?'С':'До';
 const submit=()=>{try{const requestId=id.current;setCommerce(addStayTimeService(commerce,b.owner,b.id,kind,time,requestId));setError('');onAdded();}catch(e){setError((e as Error).message);}};
 if(added)return null;
 return <BottomSheet open={open} onOpenChange={v=>{if(!v)onClose();}} title={title} snap={.7}><div className="sheet-body booking-time-editor">
 {included?<><p>{prefix} {selectedBookingTime(b.draft,kind).time} · включено в бронь</p><Button onClick={onClose}>Готово</Button></>:<>
 <p className="room-detail-caption">{new Date(timeServiceDate(b,kind)+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</p>
 <div className="booking-time-options" role="radiogroup" aria-label={kind==='arrival'?'Время раннего заезда':'Время позднего выезда'}>{options.map(o=><button key={o.time} role="radio" aria-checked={o.time===time} onClick={()=>{setTime(o.time);setError('');}}><strong>{prefix} {o.time}</strong><span className="booking-time-price">{formatMoney(o.amountMinor)}</span><span className="booking-time-radio">{o.time===time&&<i/>}</span></button>)}</div>
 {!options.length&&<p>Доступного времени больше нет.</p>}{error&&<p role="alert" className="field-error">{error}</p>}
 <div className="booking-time-total"><span>{kind==='arrival'?'Оплата при заселении':'Оплата при выезде'}</span><strong>{selected?formatMoney(selected.amountMinor):'—'}</strong></div><Button disabled={!selected} onClick={submit}>Добавить в бронь</Button>
 </>}
 </div></BottomSheet>;
}
