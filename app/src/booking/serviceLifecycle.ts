import type {ServiceRequest} from './serviceRequests.ts';
import type {Booking} from './model.ts';
import {stayNow} from './stay.ts';

export const timeServiceKind=(r:ServiceRequest)=>r.kind==='early'?'arrival' as const:r.kind==='catalog'&&r.serviceId==='late'?'departure' as const:null;
export const serviceStartsAt=(r:ServiceRequest)=>Date.parse(`${r.date}T${r.kind==='breakfast'&&r.mode==='buffet'?'11:00':r.time}:00+03:00`);
/** Older demo controls could mark a future stay-time service completed. */
export function serviceWasCompleted(r:ServiceRequest,now:number){
 return r.status==='completed'&&(!timeServiceKind(r)||!Number.isFinite(serviceStartsAt(r))||serviceStartsAt(r)<=now);
}
export function serviceCancellationAvailability(b:Booking,r:ServiceRequest,now=Date.now()){
 const current=stayNow(b,now),start=serviceStartsAt(r);
 if(b.operation.status!=='confirmed')return {allowed:false,reason:'Бронь отменена'};
 if(b.stay?.status==='checked_out')return {allowed:false,reason:'Проживание завершено'};
 if(r.status==='cancelled'||r.status==='declined')return {allowed:false,reason:r.status==='cancelled'?'Заказ отменён':'Заказ отклонён'};
 if(!Number.isFinite(current)||!Number.isFinite(start))return {allowed:false,reason:'Не удалось определить срок отмены'};
 if(r.kind==='early'&&b.stay||serviceWasCompleted(r,current)||start<=current&&(!!r.operation||r.settlement==='at_hotel'))return {allowed:false,reason:'Услуга уже началась. Обратитесь в отель'};
 return {allowed:true,reason:''};
}
