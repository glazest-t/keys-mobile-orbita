import {catalog,dateLabel,formatMoney,guestLabel,type Booking,type Commerce} from '../booking/model.ts';
import {canManageBooking,visibleBooking} from '../booking/bookingShare.ts';
import {reviewInputError} from '../booking/stayReview.ts';
export const isPastTrip=(b:Booking)=>b.operation.status==='cancelled'||b.stay?.status==='checked_out';
export function pastTrips(s:Commerce,owner:string,query='',filter='Все'){
 const text=query.trim().toLocaleLowerCase('ru-RU');
 return s.bookings.filter(b=>visibleBooking(s,owner,b)&&isPastTrip(b)&&(filter==='Все'||(filter==='Отменённые'?b.operation.status==='cancelled':b.operation.status!=='cancelled'))).filter(b=>{const h=catalog.hotels.find(h=>h.id===b.draft.hotelId);return `${h?.name} ${h?.city}`.toLocaleLowerCase('ru-RU').includes(text);}).sort((a,b)=>b.draft.search.checkIn.localeCompare(a.draft.search.checkIn)||b.createdAt.localeCompare(a.createdAt));
}
export function historyBooking(s:Commerce,owner:string,id:string){return s.bookings.find(b=>b.id===id&&visibleBooking(s,owner,b));}
export function saveHistoryReview(s:Commerce,owner:string,id:string,rating:number,text:string,now=new Date().toISOString()):Commerce{
 const b=historyBooking(s,owner,id);if(!b||b.operation.status==='cancelled'||b.stay?.status!=='checked_out')throw Error('Оценить можно завершённую поездку');
 const input={rating,text,liked:b.review?.liked||[],improve:b.review?.improve||[],photos:b.review?.photos||[]};const error=reviewInputError(input);if(error)throw Error(error);
 return {...s,bookings:s.bookings.map(item=>item.id===id?{...item,review:{...input,text:text.trim(),id:b.review?.id||'history-'+id,author:b.review?.author||owner,createdAt:b.review?.createdAt||now}}:item)};
}
export function historySummary(b:Booking){const h=catalog.hotels.find(h=>h.id===b.draft.hotelId),room=catalog.rooms.find(r=>r.id===b.draft.roomId);return [`Ключи · информация о поездке`,h?.name||'Отель',h?.city||'',`Бронь ${b.number||b.id}`,dateLabel(b.draft.search),guestLabel(b.draft.search),room?.title||'',`Стоимость: ${formatMoney(b.quote.orderTotalMinor)}`,`Статус: ${tripStatus(b)}`,...(b.operation.status==='cancelled'?[`Возврат: ${formatMoney(b.operation.refundCashMinor||0)}`,`Возвращено баллов: ${(b.operation.returnedPointsMinor||0)/100}`]:[]),'','Информационная сводка. Не является чеком.'].join('\n');}

export function tripStatus(b:Booking){return b.operation.status==='cancelled'?'Отменена':b.stay?.status==='checked_out'?'Завершена':b.stay?.status==='in_house'?'Проживание':'Предстоящая';}
export function historyTrips(s:Commerce,owner:string,query='',filter='Все'){
 const q=query.trim().toLocaleLowerCase('ru-RU');
 return s.bookings.filter(b=>visibleBooking(s,owner,b)).filter(b=>filter==='Все'||(filter==='Предстоящие'?!isPastTrip(b):filter==='Отменённые'?b.operation.status==='cancelled':b.stay?.status==='checked_out'&&b.operation.status!=='cancelled')).filter(b=>{const h=catalog.hotels.find(h=>h.id===b.draft.hotelId);return `${h?.name} ${h?.city} ${b.id}`.toLocaleLowerCase('ru-RU').includes(q);}).sort((a,b)=>Number(isPastTrip(a))-Number(isPastTrip(b))||(isPastTrip(a)?b.draft.search.checkIn.localeCompare(a.draft.search.checkIn):a.draft.search.checkIn.localeCompare(b.draft.search.checkIn)));
}
/** Visibility only: the hotel booking, payment and other travellers' access stay intact. */
export function removeTrip(s:Commerce,owner:string,id:string):Commerce{
 const b=s.bookings.find(b=>b.id===id&&canManageBooking(s,owner,b));if(!b)throw Error('Бронь не найдена');
 if(s.hiddenTrips?.[owner]?.includes(id))return s;
 return {...s,hiddenTrips:{...s.hiddenTrips,[owner]:[...(s.hiddenTrips?.[owner]||[]),id]},selectedBooking:s.selectedBooking===id?null:s.selectedBooking};
}
export function restoreTripByNumber(s:Commerce,owner:string,number:string):Commerce{
 const code=number.trim().toUpperCase();if(!code)throw Error('Введите номер бронирования');
 const b=s.bookings.find(b=>(b.number||b.id).toUpperCase()===code&&canManageBooking(s,owner,b));
 if(!b)throw Error('Бронь не найдена. Проверьте номер бронирования');
 if(!s.hiddenTrips?.[owner]?.includes(b.id))throw Error('Эта бронь уже есть в приложении');
 return {...s,hiddenTrips:{...s.hiddenTrips,[owner]:s.hiddenTrips[owner].filter(id=>id!==b.id)},selectedBooking:b.id};
}
