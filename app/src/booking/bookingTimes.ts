import {editorialText} from '../../../prototype/domain/editorialText.mjs';
import data from '../../../spec/demo-data.json' with {type:'json'};
import settings from '../../../spec/booking-time-settings.json' with {type:'json'};
import type {Draft} from './model.ts';

export type StayTimeKind='arrival'|'departure';
export type StayTimeOption={id:string;time:string;title:string;amountMinor:number;serviceId?:string};
export function bookingTimeOptions(hotelId:string,kind:StayTimeKind):StayTimeOption[]{
 const hotel=data.hotels.find(h=>h.id===hotelId);
 if(!hotel)throw Error(editorialText("РШ-212", "Отель не найден", "Объект не найден"));
 return [{id:'standard',time:kind==='arrival'?hotel.checkInTime:hotel.checkOutTime,title:kind==='arrival'?'Стандартный заезд':'Стандартный выезд',amountMinor:0},
  ...data.services.filter(s=>s.hotelId===hotelId&&s.stayTime?.kind===kind).map(s=>({id:s.id,time:s.stayTime!.time,title:s.title,amountMinor:s.unitPriceMinor}))];
}
export function isBookingTimeService(id:string){return !!data.services.find(s=>s.id===id)?.stayTime;}
type TimeSettings={freeFrom:string;freeUntil:string;paidServiceId?:string};
export type HourlyStayTimeOption=StayTimeOption&{serviceId?:string;available:boolean};
export function hourlyBookingTimeOptions(hotelId:string,kind:StayTimeKind):HourlyStayTimeOption[]{
 const hotel=data.hotels.find(h=>h.id===hotelId);
 if(!hotel)throw Error('Отель не найден');
 const config=(settings as Record<string,Partial<Record<StayTimeKind,TimeSettings>>>)[hotelId]?.[kind];
 const standard=kind==='arrival'?hotel.checkInTime:hotel.checkOutTime;
 const freeFrom=config?.freeFrom||(kind==='arrival'?standard:'00:00'),freeUntil=config?.freeUntil||(kind==='arrival'?'23:00':standard);
 const paid=data.services.find(s=>s.hotelId===hotelId&&s.id===config?.paidServiceId&&s.stayTime?.kind===kind);
 return Array.from({length:24},(_,hour)=>{
  const time=String(hour).padStart(2,'0')+':00',free=time>=freeFrom&&time<=freeUntil;
  return {id:`time:${time}`,time,title:time===standard?'Стандартное время':free?'Без доплаты':kind==='arrival'?'Ранний заезд':'Поздний выезд',amountMinor:free?0:paid?.unitPriceMinor||0,serviceId:free?undefined:paid?.id,available:free||!!paid};
 });
}
export function selectedBookingTime(d:Draft,kind:StayTimeKind){
 const options=bookingTimeOptions(d.hotelId,kind),paid=options.find(o=>d.services.includes(o.id));
 const stored=d.stayTimes?.[kind],hourly=hourlyBookingTimeOptions(d.hotelId,kind).find(o=>o.time===stored&&o.available);
 // A removed paid service resets its selected hour; legacy bookings keep their original time.
 if(hourly&&(hourly.serviceId?d.services.includes(hourly.serviceId):!paid))return hourly;
 return paid||options[0];
}
export function selectBookingTime(d:Draft,kind:StayTimeKind,id:string):Draft{
 const base=bookingTimeOptions(d.hotelId,kind);
 const option=id.startsWith('time:')?hourlyBookingTimeOptions(d.hotelId,kind).find(o=>o.id===id&&o.available):base.find(o=>o.id===id);
 if(!option)throw Error(editorialText("РШ-213", "Это время недоступно в выбранном отеле", "Это время недоступно в выбранном объекте"));
 const serviceId=option.id.startsWith('time:')?option.serviceId:(option.id==='standard'?undefined:option.id);
 const services=d.services.filter(s=>!data.services.some(item=>item.id===s&&item.stayTime?.kind===kind));
 return {...d,stayTimes:{...d.stayTimes,[kind]:option.time},services:serviceId?[...services,serviceId]:services};
}
export function validateBookingTimes(d:Draft){
 for(const kind of ['arrival','departure'] as const){
  const options=bookingTimeOptions(d.hotelId,kind);
  if(d.services.filter(id=>options.some(o=>o.id===id&&id!=='standard')).length>1)throw Error('Выберите один вариант времени заезда и выезда');
 }
}
