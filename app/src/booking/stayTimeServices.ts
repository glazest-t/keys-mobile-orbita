import {catalog,type Booking,type Commerce} from './model.ts';
import {settingsFor,type ServiceRequest} from './serviceRequests.ts';
import type {StayTimeKind} from './bookingTimes.ts';
import {canManageBooking} from './bookingShare.ts';
import {stayNow} from './stay.ts';
import {timeServiceKind} from './serviceLifecycle.ts';
export {timeServiceKind} from './serviceLifecycle.ts';

export const guaranteedTimeService=(r:ServiceRequest)=>!!timeServiceKind(r)&&(['paid','completed'].includes(r.status)||r.status==='confirmed'&&r.settlement==='at_hotel');
export const timeServiceDate=(b:Booking,kind:StayTimeKind)=>kind==='arrival'?b.draft.search.checkIn:b.draft.search.checkOut;
export const addedTimeService=(b:Booking,kind:StayTimeKind)=>b.serviceRequests?.find(r=>timeServiceKind(r)===kind&&r.date===timeServiceDate(b,kind)&&guaranteedTimeService(r));
export const includedTimeService=(b:Booking,kind:StayTimeKind)=>b.draft.services.some(id=>catalog.services.find(s=>s.id===id)?.stayTime?.kind===kind);
/** Existing demo prices; availability is supplied by hotel settings, not a guest request. */
export function stayTimeServiceOptions(b:Booking,kind:StayTimeKind,now=Date.now()){
 if(b.operation.status!=='confirmed'||b.stay?.status==='checked_out'||kind==='arrival'&&b.stay||b.timeServiceAvailability?.[kind]===false)return [];
 const early=catalog.services.find(s=>s.hotelId===b.draft.hotelId&&s.id==='sea-early');
 const options=kind==='arrival'?(early&&settingsFor(b).earlyRequest?['09:00','10:00','11:00','12:00'].map(time=>({time,amountMinor:early.unitPriceMinor})):[]):catalog.hotels.some(h=>h.id===b.draft.hotelId)?[{time:'15:00',amountMinor:300000},{time:'18:00',amountMinor:600000}]:[];
 return options.filter(o=>Date.parse(timeServiceDate(b,kind)+'T'+o.time+':00+03:00')>stayNow(b,now));
}
export function showTimeService(b:Booking,kind:StayTimeKind,now=Date.now()){
 return b.operation.status==='confirmed'&&b.stay?.status!=='checked_out'&&!(kind==='arrival'&&b.stay)&&b.timeServiceAvailability?.[kind]!==false&&(!!addedTimeService(b,kind)||includedTimeService(b,kind)||stayTimeServiceOptions(b,kind,now).length>0);
}
export function addStayTimeService(s:Commerce,actor:string,bookingId:string,kind:StayTimeKind,time:string,id:string,now=Date.now()):Commerce{
 const b=s.bookings.find(v=>v.id===bookingId);if(!b||!canManageBooking(s,actor,b))throw Error('Нет доступа к поездке');
 if(b.operation.status!=='confirmed'||b.stay?.status==='checked_out')throw Error('Поездка завершена или отменена');
 if(b.serviceRequests?.some(r=>r.id===id))return s;
 if(kind==='arrival'&&b.stay)throw Error('Гость уже заселён');
 const option=stayTimeServiceOptions(b,kind,now).find(o=>o.time===time);
 if(!id||!option||!Number.isFinite(now))throw Error('Это время недоступно. Выберите другой вариант');
 if(includedTimeService(b,kind)||addedTimeService(b,kind))throw Error('Услуга уже добавлена в бронь');
 const at=new Date(stayNow(b,now)).toISOString();
 const r:ServiceRequest={id,kind:kind==='arrival'?'early':'catalog',...(kind==='departure'?{serviceId:'late',title:'Поздний выезд',icon:'late-check-out'}:{}),status:'confirmed',settlement:'at_hotel',confirmedAt:at,date:timeServiceDate(b,kind),time,persons:1,comment:'',amountMinor:option.amountMinor,createdAt:at};
 // Explicit selection replaces an old unanswered request; paid services are never rewritten.
 const requests=(b.serviceRequests||[]).map(v=>timeServiceKind(v)===kind&&['pending','confirmed'].includes(v.status)&&!v.operation?{...v,status:'cancelled' as const}:v);
 return {...s,bookings:s.bookings.map(v=>v===b?{...b,revision:(b.revision||0)+1,serviceRequests:[...requests,r]}:v)};
}
