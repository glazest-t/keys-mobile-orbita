import type {Commerce} from './model.ts';
import {walletIds} from '../../../prototype/domain/payment.mjs';
import {respondToService,serviceQuote,payService,payServiceFromDeposit} from './serviceSettlement.ts';
import {depositBalance} from './deposit.ts';
function group(s:Commerce,owner:string,bookingId:string,groupId:string){
 const b=s.bookings.find(v=>v.id===bookingId&&v.owner===owner),rows=b?.serviceRequests?.filter(r=>r.id===groupId||r.groupId===groupId)||[];
 if(!b||!rows.length)throw Error('Заказ не найден');return {b,rows};
}
/** Fixed-price services are accepted immediately; stay-time services are already added for hotel settlement. */
export function confirmPricedServices(s:Commerce,owner:string,bookingId:string,ids:string[],now=new Date().toISOString()){
 let next=s;
 for(const id of ids){const {rows}=group(next,owner,bookingId,id);for(const r of rows.filter(r=>r.settlement!=='at_hotel'))next=respondToService(next,owner,bookingId,r.id,'confirm',now);}
 return next;
}
export function quoteServiceGroup(s:Commerce,owner:string,bookingId:string,groupId:string,usePoints:boolean,now=new Date().toISOString()){
 const {b,rows}=group(s,owner,bookingId,groupId);let preview=s;const wallets=walletIds(owner,b.draft.hotelId);
 const items=rows.filter(r=>r.status==='confirmed'&&!r.operation).map(r=>{const quote=serviceQuote(preview,owner,bookingId,r.id,usePoints,now);preview={...preview,payment:{...preview.payment,balances:{...preview.payment.balances,[wallets.hotel]:quote.remaining.hotelPoints,[wallets.keys]:quote.remaining.keysPoints}}};return {id:r.id,quote};});
 if(!items.length)throw Error('Нет заказов к оплате');
 return {bookingId,groupId,usePoints,items,total:items.reduce((n,i)=>n+i.quote.orderTotalMinor,0),cash:items.reduce((n,i)=>n+i.quote.cashDueMinor,0),points:items.reduce((n,i)=>n+i.quote.applied.pointsMinor,0)};
}
export function payServiceGroup(s:Commerce,owner:string,bookingId:string,groupId:string,expected:ReturnType<typeof quoteServiceGroup>,option:import('./paymentOptions.ts').OnlinePaymentOption,source:'online'|'deposit',outcome:'success'|'failure',now=new Date().toISOString()){
 const {b,rows}=group(s,owner,bookingId,groupId);
 if(expected.items.length&&expected.items.every(i=>rows.some(r=>r.id===i.id&&r.operation?.status==='confirmed')))return s;
 const fresh=quoteServiceGroup(s,owner,bookingId,groupId,expected.usePoints,now);
 if(JSON.stringify(fresh)!==JSON.stringify(expected))throw Error('Заказы или баланс изменились. Проверьте сумму');
 if(source==='deposit'&&depositBalance(b)<fresh.cash)throw Error('На депозите недостаточно средств');
 if(outcome==='failure')throw Error('Оплата не прошла. Попробуйте ещё раз');
 let next=s;for(const i of fresh.items)next=source==='deposit'?payServiceFromDeposit(next,owner,bookingId,i.id,i.quote,now):payService(next,owner,bookingId,i.id,i.quote,option,'success',now);
 return next;
}
