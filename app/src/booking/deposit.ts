import type {Booking,Commerce} from './model.ts';
import type {OnlinePaymentOption} from './paymentOptions.ts';
import {canManageBooking} from './bookingShare.ts';
import {stayNow} from './stay.ts';
export type Deposit={topups:{id:string;amountMinor:number;at:string;option:OnlinePaymentOption}[];returned?:{amountMinor:number;at:string}};
export function depositBalance(b:Booking){
 const funded=(b.deposit?.topups||[]).reduce((sum,t)=>sum+t.amountMinor,0);
 const spent=(b.serviceRequests||[]).filter(r=>r.paymentSource==='deposit').reduce((sum,r)=>sum+(r.operation?.paidCashMinor||0)-(r.operation?.refundCashMinor||0),0);
 return funded-spent-(b.deposit?.returned?.amountMinor||0);
}
export function topUpDeposit(s:Commerce,actor:string,bookingId:string,amountMinor:number,id:string,option:OnlinePaymentOption,outcome:'success'|'failure',now=Date.now()):Commerce{
 const b=s.bookings.find(v=>v.id===bookingId);
 if(!b||!canManageBooking(s,actor,b))throw Error('Нет доступа к поездке');
 const previous=b.deposit?.topups.find(t=>t.id===id);
 if(previous){if(previous.amountMinor!==amountMinor||previous.option!==option)throw Error('Параметры пополнения изменились');return s;}
 if(b.operation.status!=='confirmed'||b.stay?.status!=='in_house'||b.stay.checkoutRequestedAt||b.deposit?.returned)throw Error('Пополнение доступно во время проживания');
 if(!id||!Number.isSafeInteger(amountMinor)||amountMinor<100||amountMinor>100000000||!Number.isFinite(now))throw Error('Введите сумму от 1 до 1 000 000 ₽');
 if(!['sbp','card','sberpay','tpay','yandexpay'].includes(option))throw Error('Выберите способ оплаты');
 if(!Number.isSafeInteger(depositBalance(b)+amountMinor))throw Error('Превышен доступный баланс');
 if(outcome==='failure')throw Error('Оплата не прошла. Депозит не пополнен');
 const deposit:Deposit={topups:[...(b.deposit?.topups||[]),{id,amountMinor,option,at:new Date(stayNow(b,now)).toISOString()}]};
 return {...s,bookings:s.bookings.map(v=>v.id===b.id?{...v,deposit,revision:(v.revision||0)+1}:v)};
}
/** s5: unused advance is returned after the hotel confirms checkout. Local simulation. */
export function returnDeposit(b:Booking,now=Date.now()):Booking{
 if(b.deposit?.returned||!b.deposit)return b;
 return {...b,deposit:{...b.deposit,returned:{amountMinor:depositBalance(b),at:new Date(stayNow(b,now)).toISOString()}}};
}
