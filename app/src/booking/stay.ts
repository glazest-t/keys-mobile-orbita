import {guaranteedTimeService} from './stayTimeServices.ts';
import {selectedBookingTime} from './bookingTimes.ts';
import type {Booking,Commerce} from './model.ts';

export type Stay={eventId:string;status:'in_house'|'checked_out';checkoutRequestedAt?:string;checkedOutAt?:string;checkoutEventId?:string;payments?:{source?:'online'|'deposit';id:string;at:string;cash:number;hotelPoints:number;keysPoints:number;option:import('./paymentOptions.ts').OnlinePaymentOption}[];roomNumber:string;floor:number;checkedInAt:string;accessFrom:string;accessUntil:string;demoTimeOffsetMs:number;openings:{id:string;at:string}[]};
export const stayNow=(b:Booking,now=Date.now())=>now+(b.stay?.demoTimeOffsetMs||0);
export function stayCheckoutTime(b:Booking){
 const paid=b.serviceRequests?.filter(r=>r.kind==='catalog'&&r.serviceId==='late'&&r.date===b.draft.search.checkOut&&guaranteedTimeService(r)).map(r=>r.time)||[];
 return [selectedBookingTime(b.draft,'departure').time,...paid].sort().at(-1)!;
}
export function stayAccessUntil(b:Booking){
 const base=b.stay?.accessUntil||b.draft.search.checkOut+('T'+selectedBookingTime(b.draft,'departure').time+':00+03:00');
 const late=b.serviceRequests?.some(r=>r.kind==='catalog'&&r.serviceId==='late'&&r.date===b.draft.search.checkOut&&guaranteedTimeService(r));
 if(!late||!Number.isFinite(Date.parse(base)))return base;
 const extended=b.draft.search.checkOut+'T'+stayCheckoutTime(b)+':00+03:00';
 return Date.parse(extended)>Date.parse(base)?extended:base;
}
export function keyAccess(b:Booking,now=Date.now()){
 const stay=b.stay;
 if(b.operation.status!=='confirmed'||!stay||stay.status!=='in_house')return {visible:false,available:false,reason:'Ключ появится после заселения'};
 if(![stayNow(b,now),Date.parse(stay.accessFrom),Date.parse(stayAccessUntil(b))].every(Number.isFinite))return {visible:true,available:false,reason:'Не удалось проверить срок доступа'};
 if(stayNow(b,now)<Date.parse(stay.accessFrom))return {visible:true,available:false,reason:'Доступ к номеру ещё не начался'};
 if(stayNow(b,now)>=Date.parse(stayAccessUntil(b)))return {visible:true,available:false,reason:'Срок действия ключа истёк'};
 return {visible:true,available:true,reason:''};
}
function ownBooking(s:Commerce,owner:string,id:string){const b=s.bookings.find(b=>b.id===id&&b.owner===owner);if(!b)throw Error('Поездка не найдена');if(b.operation.status!=='confirmed')throw Error('Бронь отменена');if(b.stay?.status==='checked_out')throw Error('Проживание завершено');return b;}
function update(s:Commerce,b:Booking,stay:Stay|undefined):Commerce{return {...s,bookings:s.bookings.map(item=>item===b?{...b,stay,revision:(b.revision||0)+1}:item)};}
/** Hotel event simulator. The clock follows the booking date; this is never guest registration. */
export function demoCheckIn(s:Commerce,owner:string,id:string,eventId:string,now=Date.now()){
 const b=ownBooking(s,owner,id);if(b.stay)return s;
 if(!eventId||!Number.isFinite(now))throw Error('Не удалось подтвердить заселение');
 const early=b.serviceRequests?.find(r=>r.kind==='early'&&r.date===b.draft.search.checkIn&&guaranteedTimeService(r));
 const checkInTime=early?.time||selectedBookingTime(b.draft,'arrival').time;
 const accessFrom=b.draft.search.checkIn+'T'+checkInTime+':00+03:00',accessUntil=b.draft.search.checkOut+('T'+selectedBookingTime(b.draft,'departure').time+':00+03:00');
 if(!Number.isFinite(Date.parse(accessFrom))||Date.parse(accessUntil)<=Date.parse(accessFrom))throw Error('Проверьте даты проживания');
 return update(s,b,{eventId,status:'in_house',roomNumber:'412',floor:4,checkedInAt:accessFrom,accessFrom,accessUntil,demoTimeOffsetMs:Date.parse(accessFrom)-now,openings:[]});
}
export function demoResetStay(s:Commerce,owner:string,id:string){const b=ownBooking(s,owner,id);return b.stay?update(s,b,undefined):s;}
export function demoExpireKey(s:Commerce,owner:string,id:string,now=Date.now()){
 const b=ownBooking(s,owner,id);if(!b.stay)throw Error('Гость ещё не заселён');return update(s,b,{...b.stay,demoTimeOffsetMs:Date.parse(stayAccessUntil(b))+1-now});
}
export function openRoom(s:Commerce,owner:string,id:string,eventId:string,outcome:'success'|'failure',now=Date.now()){
 const b=ownBooking(s,owner,id),access=keyAccess(b,now);
 if(!access.available)throw Error(access.reason);
 if(!eventId)throw Error('Повторите открытие двери');
 if(b.stay!.openings.some(e=>e.id===eventId))return s;
 if(outcome==='failure')throw Error('Не удалось связаться с замком');
 return update(s,b,{...b.stay!,openings:[...b.stay!.openings,{id:eventId,at:new Date(stayNow(b,now)).toISOString()}]});
}
