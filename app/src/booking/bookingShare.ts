import {type Booking,type Commerce} from './model.ts';
export type BookingShare={token:string;bookingId:string;mode:'read'|'manage'};
export function canManageBooking(s:Commerce,actor:string,b:Booking){return b.owner===actor||!!s.bookingManagers?.[b.id]?.includes(actor);}
export function sharedBooking(s:Commerce,token:string){
 const share=s.bookingShares?.find(v=>v.token===token);
 const booking=share&&s.bookings.find(b=>b.id===share.bookingId);
 return share&&booking?{share,booking}:null;
}
export function createBookingShare(s:Commerce,actor:string,id:string,mode:BookingShare['mode'],token:string):Commerce{
 const b=s.bookings.find(b=>b.id===id);
 if(!b||!canManageBooking(s,actor,b))throw Error('Нет доступа к брони');
 if(b.operation.status!=='confirmed'||b.stay?.status==='checked_out')throw Error('Поездка уже завершена');
 if(!['read','manage'].includes(mode)||!token||s.bookingShares?.some(v=>v.token===token))throw Error('Не удалось создать ссылку');
 if(s.bookingShares?.some(v=>v.bookingId===id&&v.mode===mode))return s;
 return {...s,bookingShares:[...(s.bookingShares||[]),{token,bookingId:id,mode}]};
}
export function acceptBookingShare(s:Commerce,actor:string,token:string):Commerce{
 const entry=sharedBooking(s,token);
 if(!entry||!s.accounts[actor])throw Error('Ссылка недоступна');
 const {booking:b,share}=entry;
 if(share.mode!=='manage')throw Error('Эта ссылка даёт только просмотр');
 if(b.operation.status!=='confirmed'||b.stay?.status==='checked_out')throw Error('Поездка уже завершена');
 return {...s,selectedBooking:b.id,bookingManagers:canManageBooking(s,actor,b)?s.bookingManagers:{...s.bookingManagers,[b.id]:[...(s.bookingManagers?.[b.id]||[]),actor]}};
}
export function bookingShareUrl(base:string,token:string){const url=new URL(base);url.search='';url.searchParams.set('trip',token);url.hash='shared-booking';return url.toString();}

export function visibleBooking(s:Commerce,actor:string,b:Booking){return canManageBooking(s,actor,b)&&!s.hiddenTrips?.[actor]?.includes(b.id);}
