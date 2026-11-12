import {editorialText} from '../../../prototype/domain/editorialText.mjs';
import {useState,type Dispatch,type SetStateAction} from 'react';
import {Button,IconButton} from '../ui';
import type {Booking,Commerce} from './model';
import {BookingShareSheet} from './ShareBookingPanel';
import {downloadBookingCalendar} from './bookingCalendar';

/** Shared booking actions: headers use share; fresh confirmation also offers calendar. */
export function BookingConfirmationTools({booking,commerce,setCommerce,actor=booking.owner,mode='all'}:{actor?:string;mode?:'all'|'share'|'calendar';booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>}){
 const [share,setShare]=useState(false),[message,setMessage]=useState('');
 return <><div className={"booking-confirmation-tools"+(mode==='calendar'?' booking-confirmation-calendar-only':'')}>{mode!=='calendar'&&<IconButton name="share" inheritColor label={editorialText("РШ-087", "Поделиться бронью", "Поделиться поездкой")} onClick={()=>setShare(true)}/>}{mode!=='share'&&<Button variant="secondary" className="booking-calendar-button" onClick={()=>{try{downloadBookingCalendar(booking);setMessage(editorialText("РШ-088", "Файл календаря скачан — откройте его, чтобы добавить поездку.", "Откройте файл календаря, чтобы добавить поездку"));}catch{setMessage(editorialText("РШ-089", "Не удалось скачать файл. Попробуйте ещё раз.", "Не удалось скачать файл. Попробуйте ещё раз"));}}}>{editorialText("РШ-090", "В календарь", "Добавить в календарь")}</Button>}</div>{message&&<p className="booking-calendar-feedback" role="status">{message}</p>}<BookingShareSheet booking={booking} commerce={commerce} setCommerce={setCommerce} actor={actor} open={share} onClose={()=>setShare(false)}/></>;
}
