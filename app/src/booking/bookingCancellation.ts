import type {Booking, Draft} from './model.ts';

export type CancellationPolicy={daysBefore:number;time:string;utcOffset:string;penalty:{kind:'first_night'|'full_stay'|'percent'|'fixed'|'none';value?:number}};
/** Hotel/rate settings; existing demo terms remain the default. Amounts are in kopecks. */
export const cancellationSettings:{default:CancellationPolicy;hotels:Record<string,CancellationPolicy>;rates:Record<string,CancellationPolicy>}={
 default:{daysBefore:3,time:'15:00:00',utcOffset:'+03:00',penalty:{kind:'first_night'}},hotels:{},rates:{}
};
export function cancellationPolicyFor(d:Draft){return structuredClone(cancellationSettings.rates[d.rateId]??cancellationSettings.hotels[d.hotelId]??cancellationSettings.default);}
export function bookingCancellationPolicy(b:Booking){return b.cancellationPolicy??cancellationSettings.default;}
export function policyDeadline(checkIn:string,p:CancellationPolicy){return new Date(Date.parse(`${checkIn}T${p.time}${p.utcOffset}`)-p.daysBefore*86400000).toISOString();}
export function policyPenalty(lodgingMinor:number,nights:number,p:CancellationPolicy){
 const value=p.penalty.value??0;
 return Math.min(lodgingMinor,Math.max(0,Math.round(p.penalty.kind==='none'?0:p.penalty.kind==='full_stay'?lodgingMinor:p.penalty.kind==='percent'?lodgingMinor*value/100:p.penalty.kind==='fixed'?value:lodgingMinor/nights)));
}
export function cancellationTerms(checkIn:string,p:CancellationPolicy){
 if(p.penalty.kind==='none')return ['Бесплатная отмена бронирования возможна до заезда.'];
 const sign=p.utcOffset.startsWith('-')?-1:1,[hours,minutes]=p.utcOffset.slice(1).split(':').map(Number);
 const local=new Date(Date.parse(policyDeadline(checkIn,p))+sign*(hours*60+minutes)*60000).toISOString();
 const [year,month,day]=local.slice(0,10).split('-'),time=local.slice(11,19),deadline=`${day}.${month}.${year} ${time} (UTC ${p.utcOffset})`;
 const fee=p.penalty.kind==='first_night'?'стоимость первых суток':p.penalty.kind==='full_stay'?'полная стоимость проживания':p.penalty.kind==='percent'?`${p.penalty.value}% стоимости проживания`:new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:2}).format((p.penalty.value??0)/100);
 return [`Бесплатная отмена бронирования возможна до ${deadline}.`,`При отмене бронирования после ${deadline} взимается ${fee}.`];
}
