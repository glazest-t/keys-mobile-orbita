import {addStayTimeService,stayTimeServiceOptions,guaranteedTimeService} from './stayTimeServices.ts';
import {type Booking,type Commerce} from './model.ts';
import {canManageBooking} from './bookingShare.ts';
import {stayNow,stayCheckoutTime} from './stay.ts';
import type {ServiceRequest} from './serviceRequests.ts';

// Approved full demo assortment. These are editable demonstration hotel settings, not real hotel offers.
export const hotelServices=[
 {id:'breakfast',title:'Завтрак в номер',icon:'breakfast',category:'Еда',section:'Популярное',description:'Завтрак с доставкой в номер',amountMinor:180000},
 {id:'cleaning',title:'Уборка',icon:'cleaning',category:'Номер',section:'Популярное',description:'Выберите удобное время',amountMinor:0},
 {id:'early',title:'Ранний заезд',icon:'early-check-in',category:'Номер',section:'Популярное',description:'С 09:00 до 12:00',amountMinor:250000},
 {id:'late',title:'Поздний выезд',icon:'late-check-out',category:'Номер',section:'Популярное',description:'До 15:00 или 18:00',amountMinor:300000},
 {id:'spa',title:'Спа-программа',icon:'spa',category:'Отдых',section:'Популярное',description:'Термы и массаж, 2 часа',amountMinor:480000},
 {id:'food',title:'Еда в номер',icon:'restaurant',category:'Еда',section:'Еда',description:'Меню и доставка в номер',amountMinor:0},
 {id:'towels',title:'Полотенца и бельё',icon:'towels',category:'Номер',section:'Номер',description:'Свежий комплект в номер',amountMinor:0},
 {id:'pillow',title:'Подушка на выбор',icon:'pillow',category:'Номер',section:'Номер',description:'Пух, латекс, гречиха',amountMinor:0},
 {id:'cot',title:'Детская кроватка',icon:'baby-cot',category:'Номер',section:'Номер',description:'Поставим в вашем номере',amountMinor:0},
 {id:'transfer',title:'Трансфер в аэропорт',icon:'transfer',category:'Транспорт',section:'Транспорт',description:'Поездка от отеля',amountMinor:290000},
 {id:'other',title:'Другой запрос',icon:'concierge',category:'Номер',section:'Номер',description:'Расскажите, что вам нужно',amountMinor:0},
 {id:'parking',title:'Парковка',icon:'parking',category:'Транспорт',section:'Транспорт',description:'Место для автомобиля',amountMinor:0},
] as const;
export type CatalogServiceId=typeof hotelServices[number]['id'];
export const serviceCategories=['Популярное','Еда','Номер','Отдых','Транспорт'] as const;
export const catalogService=(id:string)=>hotelServices.find(v=>v.id===id);
export function filterHotelServices(category:string,query:string){const q=query.trim().toLocaleLowerCase('ru');return hotelServices.filter(s=>(category==='Популярное'||s.category===category)&&(!q||`${s.title} ${s.description}`.toLocaleLowerCase('ru').includes(q)));}
export function catalogServiceDays(b:Booking,id:string,now=Date.now()){
 if(id==='early')return catalogServiceTimes(b,id,b.draft.search.checkIn,now).length?[b.draft.search.checkIn]:[];
 const start=id==='late'?b.draft.search.checkOut:b.draft.search.checkIn,end=b.draft.search.checkOut,dates:string[]=[];
 for(let d=Date.parse(start);d<=Date.parse(end);d+=86400000){const date=new Date(d).toISOString().slice(0,10);if(catalogServiceTimes(b,id,date,now).length)dates.push(date);}
 return dates;
}
export function catalogServiceTimes(b:Booking,id:string,date:string,now=Date.now()){
 if(id==='early')return date===b.draft.search.checkIn?stayTimeServiceOptions(b,'arrival',now).map(o=>o.time):[];
 if(id==='late')return date===b.draft.search.checkOut?stayTimeServiceOptions(b,'departure',now).map(o=>o.time):[];
 const early=b.serviceRequests?.find(r=>r.kind==='early'&&r.date===b.draft.search.checkIn&&guaranteedTimeService(r));
 const from=Date.parse(b.stay?.accessFrom||b.draft.search.checkIn+'T'+(early?.time||(b.draft.services.includes('sea-early')?'10:00':'15:00'))+':00+03:00');
 const until=Date.parse(b.draft.search.checkOut+'T'+stayCheckoutTime(b)+':00+03:00');
 return (id==='late'?['15:00','18:00']:['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00']).filter(time=>{
  const at=Date.parse(`${date}T${time}:00+03:00`);
  return at>stayNow(b,now)&&(id==='late'||at>=from&&at+(id==='spa'?7200000:0)<=until);
 });
}
export function requestCatalogService(s:Commerce,actor:string,bookingId:string,serviceId:string,date:string,time:string,comment:string,id:string,now=Date.now()):Commerce{
 if(serviceId==='early'){const b=s.bookings.find(v=>v.id===bookingId);if(date!==b?.draft.search.checkIn)throw Error('Выберите дату заезда');return addStayTimeService(s,actor,bookingId,'arrival',time,id,now);}
 if(serviceId==='late') {const b=s.bookings.find(v=>v.id===bookingId);if(date!==b?.draft.search.checkOut)throw Error('Выберите дату выезда');return addStayTimeService(s,actor,bookingId,'departure',time,id,now);}
 const b=s.bookings.find(v=>v.id===bookingId),item=catalogService(serviceId);
 if(!b||!canManageBooking(s,actor,b))throw Error('Нет доступа к поездке');
 if(b.operation.status!=='confirmed'||b.stay?.status==='checked_out')throw Error('Поездка завершена');
 if(b.serviceRequests?.some(r=>r.id===id))return s;
 if(!id||!item||item.id==='breakfast'||!catalogServiceDays(b,serviceId,now).includes(date)||!catalogServiceTimes(b,serviceId,date,now).includes(time))throw Error('Выберите доступные дату и время');
 if(comment.length>500)throw Error('Комментарий — до 500 символов');
 if(item.id==='late'&&b.draft.services.includes('sea-late'))throw Error('Поздний выезд уже включён в бронь');
 if(item.id==='late'&&b.serviceRequests?.some(r=>r.serviceId===serviceId&&r.date===date&&['pending','confirmed','paid'].includes(r.status)))throw Error('На эту дату уже есть заявка');
 const amountMinor=item.id==='late'&&time==='18:00'?600000:item.amountMinor;
 const r:ServiceRequest={id,kind:'catalog',serviceId,title:item.title,icon:item.icon,status:'pending',date,time,persons:1,comment:comment.trim(),amountMinor,createdAt:new Date(stayNow(b,now)).toISOString()};
 return {...s,bookings:s.bookings.map(v=>v.id===b.id?{...v,revision:(v.revision||0)+1,serviceRequests:[...(v.serviceRequests||[]),r]}:v)};
}
