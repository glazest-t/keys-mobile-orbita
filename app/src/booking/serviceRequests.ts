import {mealIncludesBreakfast} from './searchFacets.ts';
import {cancelPaidService} from './serviceSettlement.ts';
import {addStayTimeService} from './stayTimeServices.ts';
import {stayNow} from './stay.ts';
import {timeServiceKind,serviceWasCompleted} from './serviceLifecycle.ts';
import {catalog,type Booking,type Commerce} from './model.ts';

// Working demo settings; a real hotel integration supplies these capabilities.
export const serviceSettings:Record<string,{breakfastOrder:boolean;roomBreakfast:boolean;breakfastMinor:number;roomBreakfastMinor:number;earlyRequest:boolean}>={
 'orbit-sea':{breakfastOrder:true,roomBreakfast:true,breakfastMinor:150000,roomBreakfastMinor:180000,earlyRequest:true},
 'pine-sochi':{breakfastOrder:true,roomBreakfast:true,breakfastMinor:150000,roomBreakfastMinor:180000,earlyRequest:false},
 'lighthouse-sochi':{breakfastOrder:true,roomBreakfast:true,breakfastMinor:150000,roomBreakfastMinor:180000,earlyRequest:false},
 'orbit-city':{breakfastOrder:true,roomBreakfast:true,breakfastMinor:150000,roomBreakfastMinor:180000,earlyRequest:false},
 'orbit-forest':{breakfastOrder:true,roomBreakfast:true,breakfastMinor:150000,roomBreakfastMinor:180000,earlyRequest:false},
};
export const settingsFor=(b:Booking)=>serviceSettings[b.draft.hotelId]||serviceSettings['pine-sochi'];
export type BreakfastMode='buffet'|'room';
export type ServiceRequest={items?:import('./serviceChoices.ts').ServiceLine[];photo?:string;settlement?:'at_hotel';paymentSource?:'deposit';id:string;groupId?:string;kind:'early'|'breakfast'|'catalog';serviceId?:string;title?:string;icon?:string;status:'pending'|'confirmed'|'paid'|'completed'|'declined'|'cancelled';operation?:import('../../../prototype/domain/payment.mjs').Operation;paymentOption?:import('./paymentOptions').OnlinePaymentOption;cancellation?:{freeUntil:string;label:string};confirmedAt?:string;date:string;time:string;persons:number;mode?:BreakfastMode;comment:string;amountMinor:number;createdAt:string};
export const breakfastIncluded=(b:Booking)=>mealIncludesBreakfast(catalog.rates.find(r=>r.id===b.draft.rateId)?.mealPlan||'none')||b.draft.services.includes('sea-breakfast');
export function requestStatus(b:Booking,r:ServiceRequest,now=Date.now()){
 if(b.operation.status==='cancelled'||r.status==='cancelled')return 'cancelled';
 const status=r.status==='completed'&&timeServiceKind(r)&&b.stay?.status!=='checked_out'&&!(r.kind==='early'&&b.stay)&&!serviceWasCompleted(r,stayNow(b,now))?(r.operation?.status==='confirmed'?'paid':'confirmed'):r.status;
 if(status==='declined'||status==='completed')return status;
 if(r.kind==='catalog'?(r.date<b.draft.search.checkIn||r.date>b.draft.search.checkOut||r.serviceId==='late'&&r.date!==b.draft.search.checkOut):r.kind==='early'?r.date!==b.draft.search.checkIn:r.date<=b.draft.search.checkIn||r.date>b.draft.search.checkOut||r.persons>b.draft.search.adults+b.draft.search.childrenAges.length)return 'review';
 return status;
}
export function activeRequests(b:Booking){return (b.serviceRequests||[]).filter(r=>['pending','confirmed','paid'].includes(requestStatus(b,r)));}
export function pendingRequests(b:Booking){return (b.serviceRequests||[]).filter(r=>requestStatus(b,r)==='pending');}
function ownBooking(s:Commerce,owner:string,id:string){const b=s.bookings.find(b=>b.owner===owner&&b.id===id);if(!b)throw Error('Бронь не найдена');if(b.operation.status!=='confirmed')throw Error('Бронь отменена');if(b.stay?.status==='checked_out')throw Error('Проживание завершено');return b;}
function update(s:Commerce,b:Booking,requests:ServiceRequest[]):Commerce{return {...s,bookings:s.bookings.map(v=>v===b?{...b,serviceRequests:requests,revision:(b.revision||0)+1}:v)};}
export function requestEarly(s:Commerce,owner:string,bookingId:string,time:string,id:string,now=new Date().toISOString()){
 return addStayTimeService(s,owner,bookingId,'arrival',time,id,Date.parse(now));
}

export type BreakfastInput={additional?:boolean;mode:BreakfastMode;date:string;time:string;persons:number;comment:string};
export function breakfastQuote(b:Booking,input:BreakfastInput,now=new Date().toISOString()){
 if(b.stay&&Number.isFinite(Date.parse(now)))now=new Date(stayNow(b,Date.parse(now))).toISOString();
 const config=settingsFor(b);
 if(b.stay?.status==='checked_out'||b.operation.status!=='confirmed'||!config.breakfastOrder||!['buffet','room'].includes(input.mode)||(input.mode==='room'&&!config.roomBreakfast))throw Error('Заказ завтрака в приложении недоступен');
 if(!input.additional&&input.mode==='buffet'&&breakfastIncluded(b))throw Error('Завтрак уже включён в бронь');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input.date)||!Number.isFinite(Date.parse(input.date))||new Date(input.date).toISOString().slice(0,10)!==input.date||input.date<=b.draft.search.checkIn||input.date>b.draft.search.checkOut)throw Error('Выберите утро в пределах проживания');
 if(!['07:00','08:00','09:00','10:00'].includes(input.time)||!Number.isFinite(Date.parse(now))||Date.parse(input.date+'T'+input.time+':00+03:00')<=Date.parse(now))throw Error('Выберите доступное время завтрака');
 if(!Number.isInteger(input.persons)||input.persons<1||input.persons>b.draft.search.adults+b.draft.search.childrenAges.length)throw Error('Проверьте количество персон');
 if(input.comment.length>500)throw Error('Комментарий — до 500 символов');
 if(!input.additional&&(b.serviceRequests||[]).some(r=>r.kind==='breakfast'&&r.date===input.date&&r.mode===input.mode&&['pending','confirmed','paid','completed'].includes(requestStatus(b,r))))throw Error('На эту дату завтрак уже заказан');
 return (input.mode==='room'?config.roomBreakfastMinor:config.breakfastMinor)*input.persons;
}
export function requestBreakfast(s:Commerce,owner:string,bookingId:string,input:BreakfastInput,id:string,now=new Date().toISOString()){
 const b=ownBooking(s,owner,bookingId);if(b.serviceRequests?.some(r=>r.id===id))return s;if(!id)throw Error('Не удалось сохранить заказ');
 const amountMinor=breakfastQuote(b,input,now);
 return update(s,b,[...(b.serviceRequests||[]),{...input,comment:input.comment.trim(),id,kind:'breakfast',status:'pending',amountMinor,createdAt:now}]);
}
export function cancelServiceRequest(s:Commerce,owner:string,bookingId:string,id:string){const b=ownBooking(s,owner,bookingId);const r=b.serviceRequests?.find(r=>r.id===id);if(!r)throw Error('Заявка не найдена');if(r.status==='cancelled')return s;if(r.settlement==='at_hotel')return cancelPaidService(s,owner,bookingId,id);if(r.operation||r.status==='completed')throw Error('Откройте заказ, чтобы проверить условия отмены');return update(s,b,b.serviceRequests!.map(v=>v.id===id?{...v,status:'cancelled'}:v));}

export function breakfastMornings(b:Booking){
 const dates:string[]=[];
 for(let d=Date.parse(b.draft.search.checkIn)+86400000;d<=Date.parse(b.draft.search.checkOut);d+=86400000)dates.push(new Date(d).toISOString().slice(0,10));
 return dates;
}
export function availableBreakfastDates(b:Booking,input:BreakfastInput,now=new Date().toISOString()){
 return breakfastMornings(b).filter(date=>Date.parse(date+'T'+input.time+':00+03:00')>stayNow(b,Date.parse(now))&&(input.additional||!(b.serviceRequests||[]).some(r=>r.kind==='breakfast'&&r.date===date&&r.mode===input.mode&&['pending','confirmed','paid','completed'].includes(requestStatus(b,r)))));
}
export function breakfastStayQuote(b:Booking,input:BreakfastInput,now=new Date().toISOString()){
 const dates=availableBreakfastDates(b,input,now);
 if(!dates.length)throw Error('Нет доступных дат для заказа');
 const amountMinor=dates.reduce((total,date)=>total+breakfastQuote(b,{...input,date},now),0);
 return {dates,amountMinor};
}
// One atomic submission; daily entries retain their own hotel response and refund deadline.
export function requestBreakfastStay(s:Commerce,owner:string,bookingId:string,input:BreakfastInput,id:string,now=new Date().toISOString()){
 const b=ownBooking(s,owner,bookingId);
 if(!id)throw Error('Не удалось сохранить заказ');
 if(b.serviceRequests?.some(r=>r.groupId===id||r.id===id))return s;
 const {dates}=breakfastStayQuote(b,input,now);
 const requests:ServiceRequest[]=dates.map(date=>({...input,date,comment:input.comment.trim(),id:id+':'+date,groupId:id,kind:'breakfast',status:'pending',amountMinor:breakfastQuote(b,{...input,date},now),createdAt:now}));
 return update(s,b,[...(b.serviceRequests||[]),...requests]);
}
