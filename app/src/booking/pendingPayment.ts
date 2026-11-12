import {quoteDraft,commitBooking,type Commerce,type Booking} from './model.ts';
import type {BookingQuote} from '../../../prototype/domain/booking.mjs';

export const awaitingPayment=(b:Booking)=>b.operation.status==='awaiting_payment';
export const pendingAmount=(b:Booking)=>b.quote.paymentSchedule?.nowMinor??b.quote.cashDueMinor;
/** Validate with the existing booking calculation, but do not post any payment or debit. */
export function beginBookingPayment(s:Commerce,owner:string,quote:BookingQuote,now=new Date().toISOString()):Commerce{
 const existing=s.bookings.find(b=>b.id===s.draft?.id&&b.owner===owner);
 if(existing)return {...s,selectedBooking:existing.id};
 if(s.draft?.method!=='online'||(quote.paymentSchedule?.nowMinor??quote.cashDueMinor)<=0)throw Error('Для этой брони онлайн-оплата не требуется');
 const preview=commitBooking(s,owner,quote,'success',now),b=preview.bookings.at(-1)!;
 const pending:Booking={...b,operation:{...b.operation,status:'awaiting_payment',paidCashMinor:0,pointsMinor:0,debits:{},dueAtHotelMinor:0}};
 return {...preview,payment:s.payment,bookings:[...s.bookings,pending]};
}
export function completeBookingPayment(s:Commerce,owner:string,id:string,outcome:'success'|'failure',now=new Date().toISOString()):Commerce{
 const b=s.bookings.find(b=>b.id===id&&b.owner===owner);
 if(!b)throw Error('Бронь не найдена');
 if(b.operation.status==='confirmed')return s;
 if(!awaitingPayment(b))throw Error('Эту бронь нельзя оплатить');
 const prepared={...s,bookings:s.bookings.filter(item=>item!==b),draft:structuredClone(b.draft)};
 const fresh=quoteDraft(prepared,owner);
 const {remaining:previousBalance,...expected}=b.quote,{remaining:currentBalance,...actual}=fresh;
 if(JSON.stringify(expected)!==JSON.stringify(actual))throw Error('Цена или списание баллов изменились. Проверьте условия бронирования');
 const result=commitBooking(prepared,owner,fresh,outcome,now);
 const confirmed=result.bookings.find(item=>item.id===id&&item.owner===owner)!;
 return {...result,draft:s.draft?.id===id?result.draft:s.draft,bookings:s.bookings.map(item=>item===b?{...confirmed,createdAt:b.createdAt}:item)};
}
