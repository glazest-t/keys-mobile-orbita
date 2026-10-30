import type {Draft} from './model.ts';
import type {BookingQuote} from '../../../prototype/domain/booking.mjs';
export type CardPaymentPlan='full'|'night'|'percent30';
export function bookingPayment(q:BookingQuote,d:Pick<Draft,'method'|'paymentOption'|'cardPaymentPlan'>){
 const plan=d.method==='online'&&d.paymentOption==='card'?(d.cardPaymentPlan||'full'):'full';
 const target=plan==='night'?Math.round(q.lodgingMinor/q.nights):plan==='percent30'?Math.round(q.orderTotalMinor*.3):q.orderTotalMinor;
 const nowMinor=d.method==='at_hotel'?0:Math.min(q.cashDueMinor,Math.max(0,target-q.applied.pointsMinor));
 return {nowMinor,laterMinor:q.cashDueMinor-nowMinor,plan};
}
