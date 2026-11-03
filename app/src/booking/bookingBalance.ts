import type {Booking,Commerce} from './model.ts';

export type BalancePayment={id:string;at:string;amountMinor:number};
export function isPartiallyPaid(b:Booking){
 return b.operation.status==='confirmed'&&b.operation.dueAtHotelMinor>0&&(b.operation.paidCashMinor+b.operation.pointsMinor)>0;
}
export function quoteBookingBalance(b:Booking){
 if(!isPartiallyPaid(b)||b.stay?.status==='checked_out')throw Error('У этой брони нет остатка для оплаты');
 return {bookingId:b.id,revision:b.revision||0,amountMinor:b.operation.dueAtHotelMinor};
}
export function payBookingBalance(s:Commerce,owner:string,expected:ReturnType<typeof quoteBookingBalance>,eventId:string,outcome:'success'|'failure',now=new Date().toISOString()):Commerce{
 const b=s.bookings.find(b=>b.id===expected.bookingId&&b.owner===owner);
 if(!b)throw Error('Бронь не найдена');
 if(!eventId)throw Error('Повторите оплату');
 if(b.balancePayments?.some(p=>p.id===eventId))return s;
 const fresh=quoteBookingBalance(b);
 if(fresh.revision!==expected.revision||fresh.amountMinor!==expected.amountMinor)throw Error('Сумма брони изменилась. Откройте оплату заново');
 if(outcome!=='success')throw Error('Оплата не прошла. Попробуйте ещё раз');
 const operation={...b.operation,paidCashMinor:b.operation.paidCashMinor+fresh.amountMinor,dueAtHotelMinor:0};
 const updated:Booking={...b,operation,revision:(b.revision||0)+1,balancePayments:[...(b.balancePayments||[]),{id:eventId,at:now,amountMinor:fresh.amountMinor}],quote:{...b.quote,paymentSchedule:{plan:'full',nowMinor:operation.paidCashMinor,laterMinor:0}}};
 return {...s,bookings:s.bookings.map(item=>item===b?updated:item),payment:{...s.payment,operations:{...s.payment.operations,[operation.id]:operation}}};
}
