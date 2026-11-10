import {useId,useState} from 'react';
import {Icon} from '../ui';
import type {Booking} from './model';
import {bookingCancellationPolicy,cancellationSummary,cancellationTerms} from './bookingCancellation';
import './cancellation-terms.css';
export function CancellationTerms({booking}:{booking:Booking}){
 const [open,setOpen]=useState(false),id=useId(),policy=bookingCancellationPolicy(booking),checkIn=booking.draft.search.checkIn;
 return <div className="booking-cancellation-terms"><div className="booking-cancellation-heading"><span>{cancellationSummary(checkIn,policy)}</span><button type="button" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>Правила отмены<Icon name="chevron-down" size={16} inheritColor/></button></div><div id={id} className="booking-cancellation-details" hidden={!open}>{cancellationTerms(checkIn,policy).map(text=><p key={text}>{text}</p>)}</div></div>;
}
