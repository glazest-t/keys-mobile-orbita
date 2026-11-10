import type {Booking, Draft} from './model.ts';
import {catalog} from './model.ts';
import type {BookingQuote} from '../../../prototype/domain/booking.mjs';
import {ratePrice} from './friendlyRate.ts';
import {selectedBookingTime} from './bookingTimes.ts';
import {stayBill} from './stayBill.ts';
import {serviceTitle} from './serviceSettlement.ts';
import {requestStatus} from './serviceRequests.ts';

/** Presentation only: totals always come from the existing booking/bill calculations. */
export function bookingCostLines(d:Draft,q:BookingQuote){
 const price=ratePrice(q),rate=catalog.rates.find(r=>r.id===d.rateId);
 const services=d.services.filter(id=>id!=='sea-breakfast'||rate?.mealPlan!=='breakfast').flatMap(id=>{
  const s=catalog.services.find(s=>s.id===id&&s.hotelId===d.hotelId);if(!s)return [];
  const quantity=id==='sea-breakfast'?q.nights*(d.search.adults+d.search.childrenAges.length):1;
  const detail=s.stayTime?`${s.stayTime.kind==='arrival'?'Заезд с':'Выезд до'} ${selectedBookingTime(d,s.stayTime.kind as 'arrival'|'departure').time}`:id==='sea-breakfast'?`${d.search.adults+d.search.childrenAges.length} гост. · ${q.nights} дн.`:undefined;
  return [{id,title:s.title,detail,amount:s.unitPriceMinor*quantity}];
 });
 // Historic quotes remain authoritative if the current catalogue price has changed.
 const reconciled=services.reduce((n,s)=>n+s.amount,0)===q.serviceTotalMinor;
 return {price,services:reconciled?services:q.serviceTotalMinor?[{id:'services',title:'Услуги в бронировании',detail:services.map(s=>s.title).join(', '),amount:q.serviceTotalMinor}]:[]};
}
export function bookingPaymentView(b:Booking){
 const bill=stayBill(b),cancelled=b.operation.status==='cancelled';
 const groups=new Map<string,{id:string;title:string;status:string;amount:number;due:number}>();
 for(const r of b.serviceRequests||[]){
  const status=requestStatus(b,r),paid=r.operation?.status==='confirmed';
  const label=status==='cancelled'?'Отменено':status==='declined'?'Отклонено':status==='pending'?'Ждёт подтверждения':status==='review'?'Нужна проверка':r.amountMinor===0?'Бесплатно':paid?'Оплачено':r.settlement==='at_hotel'?(b.stay?'При выезде':'При заселении'):'К оплате';
  const title=serviceTitle(r),key=title+'|'+label;
  const due=bill.charges.includes(r)&&!r.operation?r.amountMinor:0;
  const group=groups.get(key);
  if(group){group.amount+=r.amountMinor;group.due+=due;}
  else groups.set(key,{id:r.id,title,status:label,amount:r.amountMinor,due});
 }
 const retained=(b.serviceRequests||[]).reduce((n,r)=>n+(r.operation?.status==='cancelled'?(r.operation.penaltyMinor||0):0),0);
 const serviceRefunds=(b.serviceRequests||[]).reduce((a,r)=>({cash:a.cash+(r.operation?.refundCashMinor||0),points:a.points+(r.operation?.returnedPointsMinor||0)}),{cash:0,points:0});
 const due=cancelled?(b.operation.penaltyDueMinor||0):bill.due;
 return {cancelled,serviceRefunds,refundCash:(b.operation.refundCashMinor||0)+serviceRefunds.cash,returnedPoints:(b.operation.returnedPointsMinor||0)+serviceRefunds.points,penalty:(b.operation.penaltyMinor||0)+retained,groups:[...groups.values()],retained,total:bill.total,cash:bill.cash,points:bill.points,due,serviceDue:bill.due-b.operation.dueAtHotelMinor,serviceTotal:bill.total-b.quote.orderTotalMinor,servicePoints:bill.points-b.operation.pointsMinor,
  status:cancelled?'Бронь отменена':due===0?'Оплачено':bill.cash+bill.points>0?'Оплачено частично':'Не оплачено'};
}
