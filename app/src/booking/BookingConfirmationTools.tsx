import {useState,type Dispatch,type SetStateAction} from 'react';
import {Button,Icon,IconButton} from '../ui';
import type {Booking,Commerce} from './model';
import {BookingShareSheet} from './ShareBookingPanel';
import {downloadBookingCalendar} from './bookingCalendar';

/** Shared booking actions: headers use share; fresh confirmation also offers calendar. */
export function BookingConfirmationTools({booking,commerce,setCommerce,actor=booking.owner,mode='all'}:{actor?:string;mode?:'all'|'share'|'calendar';booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>}){
 const [share,setShare]=useState(false),[message,setMessage]=useState('');
 return <><div className={"booking-confirmation-tools"+(mode==='calendar'?' booking-confirmation-calendar-only':'')}>{mode!=='calendar'&&<IconButton name="share" inheritColor label="Поделиться бронью" onClick={()=>setShare(true)}/>}{mode!=='share'&&<Button variant="secondary" onClick={()=>{try{downloadBookingCalendar(booking);setMessage('Файл календаря скачан — откройте его, чтобы добавить поездку.');}catch{setMessage('Не удалось скачать файл. Попробуйте ещё раз.');}}}><Icon name="calendar" size={20} inheritColor/>В календарь</Button>}</div>{message&&<p className="booking-calendar-feedback" role="status">{message}</p>}<BookingShareSheet booking={booking} commerce={commerce} setCommerce={setCommerce} actor={actor} open={share} onClose={()=>setShare(false)}/></>;
}
