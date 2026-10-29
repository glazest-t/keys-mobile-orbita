import {calculateBookingQuote} from '../../../prototype/domain/booking.mjs';
import {readWallets,walletIds} from '../../../prototype/domain/payment.mjs';
import {available,catalog,nights,searchError,type Booking,type Commerce,type Search} from './model.ts';
import {trimGuests} from './bookingParty.ts';

export type AmendmentInput={search:Search;services:string[]};
export type BookingChange={id:string;at:string;fromRevision:number;previousSearch:Search;paidMinor:number;refundMinor:number;returnedHotelPoints:number;returnedKeysPoints:number};
function findBooking(state:Commerce,owner:string,id:string,now:string){
 const b=state.bookings.find(v=>v.id===id&&v.owner===owner);
 if(!b)throw Error('Бронь не найдена');
 if(b.stay)throw Error('Для изменения проживания обратитесь в отель');
 if(b.operation.status!=='confirmed')throw Error('Отменённую бронь нельзя изменить');
 if(!Number.isFinite(Date.parse(now))||Date.parse(now)>=Date.parse(b.draft.search.checkIn+'T15:00:00+03:00'))throw Error('Для изменения после начала заезда свяжитесь с отелем');
 return b;
}
export function previewAmendment(state:Commerce,owner:string,id:string,input:AmendmentInput,now=new Date().toISOString()){
 const b=findBooking(state,owner,id,now),search={...input.search,city:b.draft.search.city};
 if(b.serviceRequests?.some(r=>(r.operation?.status==='confirmed'||r.settlement==='at_hotel'&&['confirmed','completed'].includes(r.status)))&&(search.checkIn!==b.draft.search.checkIn||search.checkOut!==b.draft.search.checkOut||search.adults!==b.draft.search.adults||JSON.stringify(search.childrenAges)!==JSON.stringify(b.draft.search.childrenAges)))throw Error('Перед изменением дат или гостей отмените добавленные услуги в разделе «Все услуги отеля». Условия возврата указаны в каждом заказе');
 const error=searchError(search,now.slice(0,10));if(error)throw Error(error);
 if(!available({...state,bookings:state.bookings.filter(v=>v!==b)},b.draft.roomId,search))throw Error('Этот номер недоступен на выбранные даты или для такого числа гостей');
 const rate=catalog.rates.find(r=>r.id===b.draft.rateId)!;
 if(!rate)throw Error('Тариф недоступен');
 const services=[...new Set(input.services)];
 if(services.includes('sea-early')&&b.serviceRequests?.some(r=>r.kind==='early'&&(r.operation?.status==='confirmed'||r.settlement==='at_hotel'&&r.status==='confirmed')))throw Error('Ранний заезд уже оплачен отдельным заказом');
 if(services.some(id=>!b.draft.services.includes(id)&&id!=='sea-early')||b.draft.services.some(id=>id!=='sea-early'&&!services.includes(id)))throw Error('Эти услуги нельзя изменить здесь');
 const items=services.filter(id=>id!=='sea-breakfast'||rate.mealPlan!=='breakfast').map(id=>{
  const s=catalog.services.find(s=>s.id===id&&s.hotelId===b.draft.hotelId);if(!s)throw Error('Услуга недоступна');
  return {...s,quantity:id==='sea-breakfast'?nights(search)*(search.adults+search.childrenAges.length):1};
 });
 // Keep the booked nightly rate and discount. Only previously spent points are reused.
 const quote=calculateBookingQuote({hotelId:b.draft.hotelId,nights:nights(search),rate:{...rate,nightlyMinor:b.quote.baseLodgingMinor/b.quote.nights},hotelierStatus:'approved',hotelDiscountBasisPoints:b.quote.baseLodgingMinor?Math.round(b.quote.hotelDiscountMinor/b.quote.baseLodgingMinor*10000):0,services:items,wallets:{hotelId:b.draft.hotelId,hotelPoints:b.quote.applied.hotelPoints,keysPoints:b.quote.applied.keysPoints},usePoints:b.draft.usePoints});
 const hotelReturn=b.quote.applied.hotelPoints-quote.applied.hotelPoints,keysReturn=b.quote.applied.keysPoints-quote.applied.keysPoints;
 const wallets=readWallets(state.payment,owner,b.draft.hotelId);
 quote.remaining={hotelPoints:wallets.hotelPoints+hotelReturn,keysPoints:wallets.keysPoints+keysReturn};
 const nextPaid=b.operation.method==='online'?quote.cashDueMinor:0;
 return {bookingId:id,revision:b.revision||0,input:{search,services},quote,extraPaid:Math.max(0,nextPaid-b.operation.paidCashMinor),refund:Math.max(0,b.operation.paidCashMinor-nextPaid),dueAtHotel:b.operation.method==='at_hotel'?quote.cashDueMinor:0,hotelReturn,keysReturn};
}
export type AmendmentPreview=ReturnType<typeof previewAmendment>;
export function commitAmendment(state:Commerce,owner:string,expected:AmendmentPreview,requestId:string,outcome:'success'|'failure'='success',now=new Date().toISOString()):Commerce{
 if(!requestId)throw Error('Не удалось подтвердить изменение');
 const previous=state.bookings.find(b=>b.id===expected.bookingId&&b.owner===owner);
 if(previous?.changes?.some(c=>c.id===requestId))return state;
 const b=findBooking(state,owner,expected.bookingId,now);
 if((b.revision||0)!==expected.revision)throw Error('Бронь уже изменилась. Откройте её заново');
 const fresh=previewAmendment(state,owner,b.id,expected.input,now);
 if(JSON.stringify(fresh)!==JSON.stringify(expected))throw Error('Условия изменились. Проверьте расчёт ещё раз');
 if(fresh.extraPaid>0&&outcome==='failure')throw Error('Доплата не прошла. Исходная бронь сохранена');
 const ids=walletIds(owner,b.draft.hotelId),balances={...state.payment.balances,[ids.hotel]:fresh.quote.remaining.hotelPoints,[ids.keys]:fresh.quote.remaining.keysPoints};
 const operation={...b.operation,orderTotalMinor:fresh.quote.orderTotalMinor,pointsMinor:fresh.quote.applied.pointsMinor,debits:{[ids.hotel]:fresh.quote.applied.hotelPoints,[ids.keys]:fresh.quote.applied.keysPoints},paidCashMinor:b.operation.method==='online'?fresh.quote.cashDueMinor:0,dueAtHotelMinor:fresh.dueAtHotel};
 const draft={...b.draft,search:structuredClone(fresh.input.search),services:[...fresh.input.services],...trimGuests(b.draft,fresh.input.search)};
 const changed:Booking={...b,draft,quote:fresh.quote,operation,revision:(b.revision||0)+1,changes:[...(b.changes||[]),{id:requestId,at:now,fromRevision:b.revision||0,previousSearch:structuredClone(b.draft.search),paidMinor:fresh.extraPaid,refundMinor:fresh.refund,returnedHotelPoints:fresh.hotelReturn,returnedKeysPoints:fresh.keysReturn}]};
 return {...state,bookings:state.bookings.map(v=>v===b?changed:v),payment:{balances,operations:{...state.payment.operations,[operation.id]:operation}},draft:state.draft?.id===b.id&&state.draft.step==='confirmation'?{...draft,step:'confirmation'}:state.draft};
}
