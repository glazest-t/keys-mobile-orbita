import {bookingPayment} from './bookingPayment.ts';
import {calculateBookingQuote} from '../../../prototype/domain/booking.mjs';
import {readWallets,walletIds} from '../../../prototype/domain/payment.mjs';
import {available,catalog,nights,searchError,contactErrors,additionalGuestError,type Booking,type Commerce,type Search,type Contact} from './model.ts';
import {canBookRate} from './rateAccess.ts';
import {hotelProgramDiscount} from '../rewards/loyalty.ts';
import {promotionBasisPoints} from './promotions.ts';
import {bookingGuests,guestPatch,WISH_LIMIT,type GuestName} from './bookingParty.ts';
import {trimGuests} from './bookingParty.ts';

export type AmendmentInput={search:Search;services:string[];roomId?:string;rateId?:string;contact?:Contact;guests?:GuestName[];wishes?:string};
export function amendmentInput(b:Booking):AmendmentInput{return {search:structuredClone(b.draft.search),services:[...b.draft.services],roomId:b.draft.roomId,rateId:b.draft.rateId,contact:{...b.draft.contact},guests:bookingGuests(b.draft).map(g=>({...g})),wishes:b.draft.stayWishes?.note||''};}
export type BookingChange={id:string;at:string;fromRevision:number;previousSearch:Search;previousDraft?:Booking['draft'];paidMinor:number;refundMinor:number;returnedHotelPoints:number;returnedKeysPoints:number};
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
 const roomId=input.roomId||b.draft.roomId,rateId=input.rateId||b.draft.rateId;
 if(!catalog.rooms.some(r=>r.id===roomId&&r.hotelId===b.draft.hotelId))throw Error('Выберите номер этого отеля');
 if(!available({...state,bookings:state.bookings.filter(v=>v!==b)},roomId,search))throw Error('Этот номер недоступен на выбранные даты или для такого числа гостей');
 const rate=catalog.rates.find(r=>r.id===rateId&&r.roomId===roomId&&r.hotelId===b.draft.hotelId)!;
 if(!rate)throw Error('Тариф недоступен');
 const sameRate=rateId===b.draft.rateId;
 if(!sameRate&&!canBookRate(state,owner,rate))throw Error('Этот тариф недоступен для вашего профиля');
 const contact={...(input.contact||b.draft.contact)},guests=input.guests?input.guests.map(g=>({...g})):bookingGuests({...b.draft,...trimGuests(b.draft,search)}),wishes=input.wishes??b.draft.stayWishes?.note??'';
 if(input.contact&&JSON.stringify(contact)!==JSON.stringify(b.draft.contact)&&Object.keys(contactErrors(contact)).length)throw Error('Проверьте имя, фамилию, телефон и почту основного гостя');
 const guestError=additionalGuestError({...b.draft,search,...guestPatch(guests)});if(guestError)throw Error(guestError);
 if(wishes.length>WISH_LIMIT)throw Error(`Пожелание — не более ${WISH_LIMIT} символов`);
 const services=[...new Set(input.services)];
 if(services.includes('sea-early')&&b.serviceRequests?.some(r=>r.kind==='early'&&(r.operation?.status==='confirmed'||r.settlement==='at_hotel'&&r.status==='confirmed')))throw Error('Ранний заезд уже оплачен отдельным заказом');
 if(services.some(id=>!b.draft.services.includes(id)&&id!=='sea-early')||b.draft.services.some(id=>id!=='sea-early'&&!services.includes(id)))throw Error('Эти услуги нельзя изменить здесь');
 const items=services.filter(id=>id!=='sea-breakfast'||rate.mealPlan!=='breakfast').map(id=>{
  const s=catalog.services.find(s=>s.id===id&&s.hotelId===b.draft.hotelId);if(!s)throw Error('Услуга недоступна');
  return {...s,quantity:id==='sea-breakfast'?nights(search)*(search.adults+search.childrenAges.length):1};
 });
 // Keep the booked price snapshot unless a different tariff is explicitly selected. Reuse only previously spent points.
 const quote=calculateBookingQuote({baseLodgingOverrideMinor:sameRate?Math.round(b.quote.baseLodgingMinor*nights(search)/b.quote.nights):undefined,hotelId:b.draft.hotelId,nights:nights(search),rate:{...rate,nightlyMinor:sameRate?Math.round(b.quote.baseLodgingMinor/b.quote.nights):rate.nightlyMinor},hotelierStatus:'approved',hotelDiscountBasisPoints:sameRate?(b.quote.baseLodgingMinor?Math.round(b.quote.hotelDiscountMinor/b.quote.baseLodgingMinor*10000):0):Math.max(promotionBasisPoints(b.draft.hotelId),hotelProgramDiscount(state,owner,b.draft.hotelId)),services:items,wallets:{hotelId:b.draft.hotelId,hotelPoints:b.quote.applied.hotelPoints,keysPoints:b.quote.applied.keysPoints},usePoints:b.draft.usePoints});
 const hotelReturn=b.quote.applied.hotelPoints-quote.applied.hotelPoints,keysReturn=b.quote.applied.keysPoints-quote.applied.keysPoints;
 const wallets=readWallets(state.payment,owner,b.draft.hotelId);
 quote.remaining={hotelPoints:wallets.hotelPoints+hotelReturn,keysPoints:wallets.keysPoints+keysReturn};
 const schedule=bookingPayment(quote,b.balancePayments?.length?{...b.draft,cardPaymentPlan:'full'}:b.draft);quote.paymentSchedule=schedule;const nextPaid=schedule.nowMinor;
 return {bookingId:id,revision:b.revision||0,input:{search,services,roomId,rateId,contact,guests,wishes},quote,extraPaid:Math.max(0,nextPaid-b.operation.paidCashMinor),refund:Math.max(0,b.operation.paidCashMinor-nextPaid),dueAtHotel:schedule.laterMinor,hotelReturn,keysReturn};
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
 const operation={...b.operation,orderTotalMinor:fresh.quote.orderTotalMinor,pointsMinor:fresh.quote.applied.pointsMinor,debits:{[ids.hotel]:fresh.quote.applied.hotelPoints,[ids.keys]:fresh.quote.applied.keysPoints},paidCashMinor:fresh.quote.cashDueMinor-fresh.dueAtHotel,dueAtHotelMinor:fresh.dueAtHotel};
 const draft={...b.draft,stayTimes:!fresh.input.services.includes('sea-early')&&b.draft.services.includes('sea-early')?{...b.draft.stayTimes,arrival:undefined}:b.draft.stayTimes,search:structuredClone(fresh.input.search),services:[...fresh.input.services],roomId:fresh.input.roomId,rateId:fresh.input.rateId,contact:{...fresh.input.contact},...guestPatch(fresh.input.guests),stayWishes:{options:b.draft.stayWishes?.options||[],note:fresh.input.wishes}};
 const changed:Booking={...b,draft,quote:fresh.quote,operation,revision:(b.revision||0)+1,changes:[...(b.changes||[]),{id:requestId,at:now,fromRevision:b.revision||0,previousSearch:structuredClone(b.draft.search),previousDraft:structuredClone(b.draft),paidMinor:fresh.extraPaid,refundMinor:fresh.refund,returnedHotelPoints:fresh.hotelReturn,returnedKeysPoints:fresh.keysReturn}]};
 return {...state,bookings:state.bookings.map(v=>v===b?changed:v),payment:{balances,operations:{...state.payment.operations,[operation.id]:operation}},draft:state.draft?.id===b.id&&state.draft.step==='confirmation'?{...draft,step:'confirmation'}:state.draft};
}
