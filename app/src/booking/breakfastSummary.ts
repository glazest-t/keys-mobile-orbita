import {breakfastVenue} from './breakfastVenue.ts';
import {tripFacts} from './trip.ts';
import {activeRequests} from './serviceRequests.ts';
import type {Booking} from './model.ts';

export function breakfastSummary(b:Booking){
 const facts=tripFacts(b);
 const orders=activeRequests(b).filter(r=>r.kind==='breakfast').sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
 const unpaid=orders.find(r=>r.status==='confirmed'&&!r.operation);
 const order=unpaid||orders[0];
 const present=facts.breakfastIncluded||facts.breakfastAdded||!!order;
 const paid=!!order?.operation&&order.operation.status==='confirmed';
 const label=unpaid?'Ожидает оплаты':facts.breakfastIncluded?'Включён':facts.breakfastAdded?(b.operation.dueAtHotelMinor?'Добавлен':'Оплачен'):paid?'Оплачен':order?'Добавлен':'Не включён';
 const tone=unpaid?'warning' as const:'success' as const;
 const place=order?.mode==='room'?'Доставка в номер':b.draft.hotelId==='orbit-sea'?'Ресторан «Гренадин»':'Ресторан отеля';
 const venue=breakfastVenue(b.draft.hotelId);
 const time=order?.mode==='room'?order.time:venue.hours;
 return {present,label,tone,details:`${time} · ${place}${order?.mode==='room'?'':' · '+venue.floor}`};
}
