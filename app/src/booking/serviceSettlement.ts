import {depositBalance} from './deposit.ts';
import {stayNow} from './stay.ts';
import {calculatePayment,confirmPayment,readWallets,type Quote} from '../../../prototype/domain/payment.mjs';
import {catalog,type Booking,type Commerce} from './model.ts';
import {requestStatus,type ServiceRequest} from './serviceRequests.ts';
import {serviceStartsAt,serviceWasCompleted,serviceCancellationAvailability,timeServiceKind} from './serviceLifecycle.ts';

export const serviceTitle=(r:ServiceRequest)=>r.kind==='catalog'?(r.title||'Услуга отеля'):r.kind==='early'?'Ранний заезд':r.mode==='room'?'Завтрак в номер':'Завтрак';
export const serviceIcon=(r:ServiceRequest)=>r.kind==='catalog'?(r.icon||'room-service'):r.kind==='early'?'early-check-in':'breakfast';
export function serviceStatusPresentation(b:Booking,r:ServiceRequest):{label:string;tone:'neutral'|'success'|'warning'|'info'|'error';icon:string}{
 const status=requestStatus(b,r);
 if(status==='cancelled')return {label:'Отменено',tone:'neutral',icon:'close'};
 if(status==='declined')return {label:'Отклонено',tone:'error',icon:'close'};
 if(status==='review')return {label:'Нужна проверка',tone:'warning',icon:'info'};
 if(timeServiceKind(r)&&['confirmed','paid','completed'].includes(status))return {label:'Добавлено',tone:'success',icon:'check'};
 if(status==='paid'||r.operation?.status==='confirmed')return {label:'Оплачено',tone:'success',icon:'check'};
 if(status==='pending')return {label:'Ждёт ответа',tone:'warning',icon:'pending'};
 if(r.settlement==='at_hotel'&&r.amountMinor>0)return {label:'Оплата в отеле',tone:'info',icon:'info'};
 const timeService=r.kind==='early'||r.kind==='catalog'&&r.serviceId==='late';
 if(status==='completed')return {label:timeService?'Добавлено':'Выполнено',tone:'success',icon:'check'};
 return r.amountMinor>0?{label:'К оплате',tone:'warning',icon:'pending'}:{label:timeService?'Добавлено':'Заказано',tone:'success',icon:'check'};
}
export const serviceStatusLabel=(b:Booking,r:ServiceRequest)=>serviceStatusPresentation(b,r).label;
const starts=serviceStartsAt;
function order(s:Commerce,owner:string,bookingId:string,id:string){const b=s.bookings.find(b=>b.id===bookingId&&b.owner===owner),r=b?.serviceRequests?.find(r=>r.id===id);if(!b||!r)throw Error('Заказ не найден');if(b.operation.status!=='confirmed')throw Error('Бронь отменена');if(b.stay?.status==='checked_out')throw Error('Проживание завершено');return {b,r};}
function update(s:Commerce,b:Booking,r:ServiceRequest):Commerce{return {...s,bookings:s.bookings.map(v=>v===b?{...b,revision:(b.revision||0)+1,serviceRequests:b.serviceRequests!.map(v=>v.id===r.id?r:v)}:v)};}
export function servicePolicy(r:ServiceRequest):NonNullable<ServiceRequest['cancellation']>{
 // Policy is snapshotted when the hotel confirms the request.
 const deadline=r.kind==='catalog'?starts(r):r.kind==='early'?starts(r)-86400000:Date.parse(r.date+'T20:00:00+03:00')-86400000;
 const freeUntil=new Date(deadline).toISOString();
 return {freeUntil,label:'Бесплатная отмена до '+new Date(deadline).toLocaleString('ru-RU',{timeZone:'Europe/Moscow',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})+' мск. Позже — без возврата.'};
}
export function respondToService(s:Commerce,owner:string,bookingId:string,id:string,response:'confirm'|'decline'|'complete',now=new Date().toISOString()){
 const {b,r}=order(s,owner,bookingId,id),status=requestStatus(b,r,Date.parse(now));
 if(b.stay&&Number.isFinite(Date.parse(now)))now=new Date(stayNow(b,Date.parse(now))).toISOString();
 if(response==='complete'){if(timeServiceKind(r)&&starts(r)>Date.parse(now)&&!(r.kind==='early'&&b.stay))throw Error('Время услуги ещё не наступило');if(status==='completed')return s;if(status!=='paid'&&!(status==='confirmed'&&(r.amountMinor===0||r.settlement==='at_hotel')))throw Error('Сначала оплатите услугу');return update(s,b,{...r,status:'completed'});}
 if(status===(response==='confirm'?'confirmed':'declined'))return s;
 if(status!=='pending'||!Number.isFinite(Date.parse(now))||(response==='confirm'&&starts(r)<=Date.parse(now)))throw Error('Заявка уже изменилась или её время прошло');
 return update(s,b,response==='decline'?{...r,status:'declined'}:{...r,status:'confirmed',confirmedAt:now,cancellation:servicePolicy(r)});
}
export function serviceQuote(s:Commerce,owner:string,bookingId:string,id:string,usePoints:boolean,now=new Date().toISOString()){
 const {b,r}=order(s,owner,bookingId,id);if(r.settlement==='at_hotel')throw Error('Эта услуга оплачивается в отеле');if(b.stay&&Number.isFinite(Date.parse(now)))now=new Date(stayNow(b,Date.parse(now))).toISOString();if(requestStatus(b,r)!=='confirmed'||starts(r)<=Date.parse(now)||!Number.isFinite(Date.parse(now)))throw Error('Заказ пока недоступен для оплаты');
 const friendly=catalog.rates.find(v=>v.id===b.draft.rateId)?.id.includes('friendly')||false;
 return calculatePayment({hotelId:b.draft.hotelId,lodgingMinor:0,services:[{id:r.id,quantity:1,unitPriceMinor:r.amountMinor}],wallets:readWallets(s.payment,owner,b.draft.hotelId),usePoints,hotelBenefitsAllowed:!friendly});
}
export function payService(s:Commerce,owner:string,bookingId:string,id:string,expected:Quote,option:NonNullable<ServiceRequest['paymentOption']>,outcome:'success'|'failure'='success',now=new Date().toISOString()){
 const {b,r}=order(s,owner,bookingId,id);if(r.operation?.status==='confirmed')return s;
 const fresh=serviceQuote(s,owner,bookingId,id,expected.usePoints,now);
 if(JSON.stringify(fresh)!==JSON.stringify(expected))throw Error('Баланс или условия изменились. Проверьте сумму');
 const paid=confirmPayment(s.payment,{userId:owner,bookingId:`service:${b.id}:${r.id}`,quote:fresh,method:'online',outcome});
 if(!paid.operation)throw Error('Оплата не прошла. Баллы не списаны. Попробуйте ещё раз');
 return update({...s,payment:paid.state},b,{...r,status:'paid',operation:paid.operation,paymentOption:option});
}
export function payServiceFromDeposit(s:Commerce,owner:string,bookingId:string,id:string,expected:Quote,now=new Date().toISOString()){
 const {b,r}=order(s,owner,bookingId,id);
 if(r.operation?.status==='confirmed')return s;
 if(b.stay?.status!=='in_house'||b.deposit?.returned)throw Error('Депозит недоступен');
 const fresh=serviceQuote(s,owner,bookingId,id,expected.usePoints,now);
 if(JSON.stringify(fresh)!==JSON.stringify(expected))throw Error('Условия изменились. Проверьте сумму');
 if(depositBalance(b)<fresh.cashDueMinor)throw Error('На депозите недостаточно средств');
 const paid=payService(s,owner,bookingId,id,fresh,'sbp','success',now);
 return {...paid,bookings:paid.bookings.map(v=>v.id===b.id?{...v,serviceRequests:v.serviceRequests!.map(item=>item.id===id?{...item,paymentSource:'deposit' as const,paymentOption:undefined}:item)}:v)};
}
export function serviceCancellation(r:ServiceRequest,now=new Date().toISOString()){
 if(!Number.isFinite(Date.parse(now)))throw Error('Не удалось определить срок отмены');
 const op=r.operation,free=!!r.cancellation&&Date.parse(now)<=Date.parse(r.cancellation.freeUntil)&&!serviceWasCompleted(r,Date.parse(now));
 const pointReturns=op?.status==='confirmed'&&free?op.debits:{};
 return {depositReturn:op?.status==='confirmed'&&free&&r.paymentSource==='deposit'?op.paidCashMinor:0,cashReturn:op?.status==='confirmed'&&free&&r.paymentSource!=='deposit'?op.paidCashMinor:0,pointReturns,pointsReturn:Object.values(pointReturns).reduce((a,b)=>a+b,0),penalty:op?.status==='confirmed'&&!free?op.orderTotalMinor:0};
}
export function cancelPaidService(s:Commerce,owner:string,bookingId:string,id:string,now=new Date().toISOString()){
 const {b,r}=order(s,owner,bookingId,id);if(r.status==='cancelled')return s;
 const availability=serviceCancellationAvailability(b,r,Date.parse(now));if(!availability.allowed)throw Error(availability.reason);
 if(b.stay)now=new Date(stayNow(b,Date.parse(now))).toISOString();
 const refund=serviceCancellation(r,now),balances={...s.payment.balances};for(const [id,n] of Object.entries(refund.pointReturns))balances[id]=(balances[id]||0)+n;
 const operation=r.operation?{...r.operation,status:'cancelled' as const,refundCashMinor:refund.cashReturn+refund.depositReturn,returnedPointsMinor:refund.pointsReturn*100,penaltyMinor:refund.penalty}:undefined;
 return update({...s,payment:{balances,operations:{...s.payment.operations,...(operation?{[operation.id]:operation}:{})}}},b,{...r,status:'cancelled',operation});
}

/** Reception payment event: records cash received at the hotel, never runs the guest payment flow. */
export function settleTimeServiceAtHotel(s:Commerce,owner:string,bookingId:string,id:string){
 const {b,r}=order(s,owner,bookingId,id);if(r.operation?.status==='confirmed')return s;
 if(r.settlement!=='at_hotel'||!['confirmed','completed'].includes(requestStatus(b,r)))throw Error('Нет услуги к оплате в отеле');
 const quote=calculatePayment({hotelId:b.draft.hotelId,lodgingMinor:0,services:[{id:r.id,quantity:1,unitPriceMinor:r.amountMinor}],wallets:readWallets(s.payment,owner,b.draft.hotelId),usePoints:false});
 const paid=confirmPayment(s.payment,{userId:owner,bookingId:`service:${b.id}:${r.id}`,quote,method:'at_hotel'});
 const operation={...paid.operation!,paidCashMinor:r.amountMinor,dueAtHotelMinor:0};
 return update({...s,payment:{...paid.state,operations:{...paid.state.operations,[operation.id]:operation}}},b,{...r,status:r.status==='completed'?'completed':'paid',operation,cancellation:r.cancellation||servicePolicy(r)});
}
