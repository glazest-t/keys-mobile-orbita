import {mealIncludesBreakfast} from './searchFacets.ts';
import {guaranteedTimeService} from './stayTimeServices.ts';
import {selectedBookingTime} from './bookingTimes.ts';
import {stayCheckoutTime} from './stay.ts';
import {requestStatus} from './serviceRequests.ts';
import {canManageBooking,visibleBooking} from './bookingShare.ts';
import {catalog,type Booking,type Commerce} from './model.ts';

export type ChatAction='hotel'|'breakfast'|'services'|'route'|'guide';
export type TripMessage={id:string;text:string;at:string;role?:'guest'|'assistant';replyState?:'pending'|'answered';replyTo?:string;action?:ChatAction};
export function ownTrips(state:Commerce,owner:string){
 return state.bookings.filter(b=>visibleBooking(state,owner,b)).sort((a,b)=>a.draft.search.checkIn.localeCompare(b.draft.search.checkIn)||a.createdAt.localeCompare(b.createdAt));
}
export function selectedTrip(state:Commerce,owner:string){
 const active=ownTrips(state,owner).filter(b=>b.operation.status==='confirmed'&&b.stay?.status!=='checked_out');
 const completed=ownTrips(state,owner).filter(b=>b.stay?.status==='checked_out');return active.find(b=>b.id===state.selectedBooking)||completed.find(b=>b.id===state.selectedBooking)||active[0]||completed.at(-1);
}
export function tripFacts(b:Booking){
 const rate=catalog.rates.find(r=>r.id===b.draft.rateId);
 const early=b.serviceRequests?.find(r=>r.kind==='early'&&guaranteedTimeService(r)&&!['cancelled','review'].includes(requestStatus(b,r))&&r.date===b.draft.search.checkIn);
 return {checkInTime:early?.time||selectedBookingTime(b.draft,'arrival').time,checkOutTime:stayCheckoutTime(b),breakfastIncluded:mealIncludesBreakfast(rate?.mealPlan||'none'),breakfastAdded:b.draft.services.includes('sea-breakfast'),due:b.operation.dueAtHotelMinor};
}
export function sendTripMessage(state:Commerce,owner:string,bookingId:string,text:string,id:string,at=new Date().toISOString()):Commerce{
 const b=state.bookings.find(b=>b.id===bookingId&&canManageBooking(state,owner,b));
 if(!b)throw Error('Поездка не найдена');
 const messages=state.tripMessages?.[bookingId]||[];
 if(!id)throw Error('Не удалось сохранить сообщение');
 if(messages.some(m=>m.id===id))return state;
 const trimmed=text.trim();if(!trimmed||trimmed.length>1000)throw Error('Введите сообщение до 1000 символов');
 return {...state,tripMessages:{...state.tripMessages,[bookingId]:[...messages,{id,text:trimmed,at,role:'guest',replyState:'pending'}]}};
}
