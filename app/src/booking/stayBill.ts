import {settleHotelLoyalty} from '../rewards/loyalty.ts';
import {depositBalance,returnDeposit} from './deposit.ts';
import {calculatePayment,readWallets,walletIds,type Quote} from '../../../prototype/domain/payment.mjs';
import {catalog,type Booking,type Commerce} from './model.ts';
import {requestStatus} from './serviceRequests.ts';
import {payService,payServiceFromDeposit,serviceQuote,serviceTitle} from './serviceSettlement.ts';
import {stayNow} from './stay.ts';
import type {OnlinePaymentOption} from './paymentOptions.ts';

export function stayBill(b:Booking){
 const requests=b.serviceRequests||[];
 const charges=requests.filter(r=>['confirmed','paid','completed'].includes(requestStatus(b,r)));
 const retained=requests.filter(r=>r.operation?.status==='cancelled');
 const due=b.operation.dueAtHotelMinor+charges.filter(r=>!r.operation&&r.amountMinor>0).reduce((n,r)=>n+r.amountMinor,0);
 const cash=b.operation.paidCashMinor+requests.reduce((n,r)=>n+(r.operation?.paidCashMinor||0)-(r.operation?.refundCashMinor||0),0);
 const points=b.operation.pointsMinor+requests.reduce((n,r)=>n+(r.operation?.pointsMinor||0)-(r.operation?.returnedPointsMinor||0),0);
 const total=b.quote.orderTotalMinor+charges.reduce((n,r)=>n+r.amountMinor,0)+retained.reduce((n,r)=>n+(r.operation?.penaltyMinor||0),0);
 const hotelDue=charges.filter(r=>r.settlement==='at_hotel'&&!r.operation).reduce((n,r)=>n+r.amountMinor,0);
 return {due,hotelDue,onlineDue:due-hotelDue,cash,points,total,charges,pending:requests.filter(r=>['pending','review'].includes(requestStatus(b,r)))};
}
function own(s:Commerce,owner:string,id:string){const b=s.bookings.find(b=>b.id===id&&b.owner===owner);if(!b)throw Error('Поездка не найдена');if(b.operation.status!=='confirmed'||!b.stay)throw Error('Счёт доступен после заселения');return b;}
function active(s:Commerce,owner:string,id:string){const b=own(s,owner,id);if(b.stay!.status!=='in_house')throw Error('Проживание завершено');return b;}
function replace(s:Commerce,b:Booking):Commerce{return {...s,bookings:s.bookings.map(v=>v.id===b.id&&v.owner===b.owner?b:v)};}
const friendly=(b:Booking)=>catalog.rates.find(r=>r.id===b.draft.rateId)?.kind==='friendly_rate';
function lodgingQuote(s:Commerce,b:Booking,usePoints:boolean){return calculatePayment({hotelId:b.draft.hotelId,lodgingMinor:b.operation.dueAtHotelMinor,wallets:readWallets(s.payment,b.owner,b.draft.hotelId),usePoints,hotelBenefitsAllowed:!friendly(b)});}
function spendPreview(s:Commerce,b:Booking,q:Quote):Commerce{const ids=walletIds(b.owner,b.draft.hotelId);return {...s,payment:{...s.payment,balances:{...s.payment.balances,[ids.keys]:q.remaining.keysPoints,[ids.hotel]:q.remaining.hotelPoints}}};}
export function quoteStayBill(s:Commerce,owner:string,id:string,usePoints:boolean,now=new Date().toISOString()){
 const b=active(s,owner,id);let preview=s;
 const items:{id:string;quote:Quote}[]=[];
 if(b.operation.dueAtHotelMinor){const quote=lodgingQuote(preview,b,usePoints);items.push({id:'lodging',quote});preview=spendPreview(preview,b,quote);}
 for(const r of stayBill(b).charges.filter(r=>!r.operation&&r.amountMinor>0&&r.settlement!=='at_hotel')){
  let quote:Quote;try{quote=serviceQuote(preview,owner,id,r.id,usePoints,now);}catch{throw Error(`${serviceTitle(r)} · ${r.date}: уточните заказ в отеле или отмените его`);}
  items.push({id:r.id,quote});preview=spendPreview(preview,b,quote);
 }
 return {bookingId:id,revision:b.revision||0,usePoints,items,cash:items.reduce((n,r)=>n+r.quote.cashDueMinor,0),hotelPoints:items.reduce((n,r)=>n+r.quote.applied.hotelPoints,0),keysPoints:items.reduce((n,r)=>n+r.quote.applied.keysPoints,0)};
}
export function payStayBill(s:Commerce,owner:string,id:string,expected:ReturnType<typeof quoteStayBill>,eventId:string,option:OnlinePaymentOption,outcome:'success'|'failure',now=new Date().toISOString(),source:'online'|'deposit'='online'){
 let b=own(s,owner,id);
 if(b.stay!.payments?.some(p=>p.id===eventId))return s;
 if(!eventId)throw Error('Повторите оплату');
 const fresh=quoteStayBill(s,owner,id,expected.usePoints,now);
 if(JSON.stringify(fresh)!==JSON.stringify(expected))throw Error('Счёт изменился. Проверьте сумму и повторите оплату');
 if(!fresh.items.length)throw Error('Счёт уже оплачен');
 if(source==='deposit'&&(fresh.items.some(i=>i.id==='lodging')||depositBalance(b)<fresh.cash))throw Error('Депозит доступен для услуг при достаточном остатке');
 if(outcome!=='success')throw Error('Оплата не прошла. Попробуйте ещё раз');
 // Build an immutable transaction. Any later error discards every earlier change.
 let next=s;
 for(const item of fresh.items){
  if(item.id==='lodging'){
   const q=item.quote,ids=walletIds(owner,b.draft.hotelId),old=b.operation;
   const operation={...old,paidCashMinor:old.paidCashMinor+q.cashDueMinor,dueAtHotelMinor:0,pointsMinor:old.pointsMinor+q.applied.pointsMinor,debits:{...old.debits,[ids.hotel]:(old.debits[ids.hotel]||0)+q.applied.hotelPoints,[ids.keys]:(old.debits[ids.keys]||0)+q.applied.keysPoints}};
   b={...b,operation,quote:{...b.quote,cashDueMinor:b.quote.cashDueMinor-q.applied.pointsMinor,applied:{hotelPoints:b.quote.applied.hotelPoints+q.applied.hotelPoints,keysPoints:b.quote.applied.keysPoints+q.applied.keysPoints,pointsMinor:b.quote.applied.pointsMinor+q.applied.pointsMinor},remaining:q.remaining}};
   next=replace(spendPreview(next,b,q),b);
   next={...next,payment:{...next.payment,operations:{...next.payment.operations,[operation.id]:operation}}};
  }else next=source==='deposit'?payServiceFromDeposit(next,owner,id,item.id,item.quote,now):payService(next,owner,id,item.id,item.quote,option,'success',now);
 }
 b=own(next,owner,id);
 return replace(next,{...b,revision:(b.revision||0)+1,stay:{...b.stay!,payments:[...(b.stay!.payments||[]),{id:eventId,at:new Date(stayNow(b,Date.parse(now))).toISOString(),cash:fresh.cash,hotelPoints:fresh.hotelPoints,keysPoints:fresh.keysPoints,option,source}]}});
}
export function checkoutDay(b:Booking,now=Date.now()){return !!b.stay&&new Date(stayNow(b,now)).toLocaleDateString('en-CA',{timeZone:'Europe/Moscow'})>=b.draft.search.checkOut;}
export function checkoutBlock(b:Booking,now=Date.now()){
 if(b.stay?.status!=='in_house')return 'Проживание завершено';
 if(!checkoutDay(b,now))return 'Выезд будет доступен в последний день проживания';
 const bill=stayBill(b);
 if(bill.due)return 'Сначала оплатите счёт';
 if(bill.pending.length)return 'Есть заявки без ответа. Отмените их или дождитесь решения отеля';
 if(bill.charges.some(r=>r.status==='paid'))return 'Отель ещё не отметил выполнение оплаченных услуг';
 return '';
}
export function requestCheckout(s:Commerce,owner:string,id:string,now=Date.now()){
 const b=active(s,owner,id),reason=checkoutBlock(b,now);if(reason)throw Error(reason);
 if(b.stay!.checkoutRequestedAt)return s;
 return replace(s,{...b,revision:(b.revision||0)+1,stay:{...b.stay!,checkoutRequestedAt:new Date(stayNow(b,now)).toISOString()}});
}
export function demoCheckoutDay(s:Commerce,owner:string,id:string,now=Date.now()){
 const b=active(s,owner,id);return replace(s,{...b,stay:{...b.stay!,demoTimeOffsetMs:Date.parse(b.draft.search.checkOut+'T09:00:00+03:00')-now}});
}
export function confirmCheckout(s:Commerce,owner:string,id:string,eventId:string,now=Date.now()){
 const b=own(s,owner,id);if(b.stay!.status==='checked_out')return s;
 const reason=checkoutBlock(b,now);if(reason)throw Error(reason);
 if(!eventId)throw Error('Нужно подтверждение выезда от отеля');
 return settleHotelLoyalty(replace(s,{...returnDeposit(b,now),revision:(b.revision||0)+1,stay:{...b.stay!,status:'checked_out',checkedOutAt:new Date(stayNow(b,now)).toISOString(),checkoutEventId:eventId}}),owner,id);
}
