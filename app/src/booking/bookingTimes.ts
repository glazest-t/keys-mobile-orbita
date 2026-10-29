import data from '../../../spec/demo-data.json' with {type:'json'};
import type {Draft} from './model.ts';

export type StayTimeKind='arrival'|'departure';
export type StayTimeOption={id:string;time:string;title:string;amountMinor:number};
export function bookingTimeOptions(hotelId:string,kind:StayTimeKind):StayTimeOption[]{
 const hotel=data.hotels.find(h=>h.id===hotelId);
 if(!hotel)throw Error('Отель не найден');
 return [{id:'standard',time:kind==='arrival'?hotel.checkInTime:hotel.checkOutTime,title:kind==='arrival'?'Стандартный заезд':'Стандартный выезд',amountMinor:0},
  ...data.services.filter(s=>s.hotelId===hotelId&&s.stayTime?.kind===kind).map(s=>({id:s.id,time:s.stayTime!.time,title:s.title,amountMinor:s.unitPriceMinor}))];
}
export function isBookingTimeService(id:string){return !!data.services.find(s=>s.id===id)?.stayTime;}
export function selectedBookingTime(d:Draft,kind:StayTimeKind){
 const options=bookingTimeOptions(d.hotelId,kind);
 return options.find(o=>d.services.includes(o.id))||options[0];
}
export function selectBookingTime(d:Draft,kind:StayTimeKind,id:string):Draft{
 const options=bookingTimeOptions(d.hotelId,kind);
 if(!options.some(o=>o.id===id))throw Error('Это время недоступно в выбранном отеле');
 const services=d.services.filter(s=>!options.some(o=>o.id===s));
 return {...d,services:id==='standard'?services:[...services,id]};
}
export function validateBookingTimes(d:Draft){
 for(const kind of ['arrival','departure'] as const){
  const options=bookingTimeOptions(d.hotelId,kind);
  if(d.services.filter(id=>options.some(o=>o.id===id&&id!=='standard')).length>1)throw Error('Выберите один вариант времени заезда и выезда');
 }
}
