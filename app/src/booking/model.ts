import {normalizeContactPhone} from '../travelers/contactPhone.ts';
import {hotelProgramDiscount,hotelLoyaltySnapshot,programWallets} from '../rewards/loyalty.ts';
import {promotionBasisPoints} from './promotions.ts';
import {matchesRoom,matchesRate,matchesDestination,hotelFacets} from './searchFacets.ts';
import {watchKey} from './priceWatch.ts';
import {validateBookingTimes} from './bookingTimes.ts';
import {serviceCancellation} from './serviceSettlement.ts';
import {bookingGuests,guestCapacity,WISH_LIMIT} from './bookingParty.ts';
import {hotelVisual} from './presentation.ts';
import data from '../../../spec/demo-data.json' with {type:'json'};
import {calculateBookingQuote,type BookingQuote} from '../../../prototype/domain/booking.mjs';
import {createPaymentState,readWallets,confirmPayment,type PaymentState,type Operation} from '../../../prototype/domain/payment.mjs';

export const catalog=data;
export const COMMERCE_KEY='keys-orbita-booking-v1';
export type Search={city:string;checkIn:string;checkOut:string;adults:number;childrenAges:number[];withPet?:boolean;businessTrip?:boolean;byCar?:boolean};
export type Contact={name:string;surname:string;phone:string;email:string};
export type Draft={returnTo?:`hotel-chat/${string}`|'profile-history'|`profile-trip/${string}`|`loyalty-program/${string}`|'swipe'|'notifications'|'price-watches'|'wish-search'|'preferences'|'favorite-list'|'favorite-map';favoriteListId?:string;preferenceMatches?:string[];id:string;hotelId:string;roomId:string;rateId:string;search:Search;services:string[];usePoints:boolean;method:'online'|'at_hotel';paymentOption?:import('./paymentOptions').OnlinePaymentOption;bookingFor?:'self'|'other';guestTravelerId?:string;contact:Contact;additionalGuest?:{name:string;surname:string};otherGuests?:{name:string;surname:string}[];stayWishes?:{options:string[];note:string};step:string};
export type Booking={hotelLoyalty?:import('../rewards/loyalty.ts').HotelLoyaltySnapshot;number?:string;timeServiceAvailability?:Partial<Record<'arrival'|'departure',boolean>>;review?:import('./stayReview.ts').StayReview;deposit?:import('./deposit.ts').Deposit;problems?:import('./stayProblems.ts').StayProblem[];stay?:import('./stay.ts').Stay;serviceRequests?:import('./serviceRequests.ts').ServiceRequest[];id:string;owner:string;draft:Draft;quote:BookingQuote;operation:Operation;createdAt:string;revision?:number;changes?:import('./amendment.ts').BookingChange[]};
export type Commerce={hotelLoyaltySeeds?:Record<string,Record<string,{year:string;amountMinor:number}>>;hotelLoyaltyAwards?:Record<string,import('../rewards/loyalty.ts').HotelLoyaltyAward[]>;demoPointsHistory?:Record<string,import('../rewards/points.ts').PointEntry[]>;wishSearchReturnTo?:'find'|'chats';hiddenTrips?:Record<string,string[]>;historyReturnTo?:string;historyDemo?:boolean;welcomePoints?:Record<string,{amount:number;at:string}>;hotelConversations?:Record<string,Record<string,import('./chatThreads.ts').HotelConversation>>;chatReads?:Record<string,Record<string,string>>;chatReturnTo?:string;helpReturnTo?:'profile'|'chats';chatBrowse?:Record<string,{list?:string;new?:string}>;historyBrowse?:Record<string,{query:string;filter:string}>;rewardsBrowse?:Record<string,{query:string;filter:string}>;hotelMemberships?:Record<string,Record<string,boolean>>;rewardsReturnTo?:string;hotelierInviters?:Record<string,import('../hotelier/verification.ts').HotelierInvitationData>;hotelierParticipants?:Record<string,boolean>;hotelierBannerDismissed?:Record<string,string>;hotelierEmailDrafts?:Record<string,string>;hotelierVerifications?:Record<string,import('../hotelier/verification.ts').Verification>;appNotices?:import('./notifications.ts').AppNotice[];swipePreferences?:Record<string,import('./swipePreferences.ts').SwipePreferences>;demoTripSession?:import('./demoTripScenarios.ts').DemoTripSession;swipeHistories?:Record<string,import('./swipeDiscovery.ts').SwipeHistory>;notificationsReturnTo?:string;notificationHotelId?:string;notificationChatBookingId?:string;priceEvents?:import('./priceEvents.ts').PriceEvent[];priceNotices?:import('./priceEvents.ts').PriceNotice[];demoOfferPrices?:Record<string,number>;freeTextDrafts?:Record<string,import('./preferences.ts').PreferenceDraft>;favoriteLibraries?:Record<string,import('./favorites.ts').FavoriteLibrary>;preferenceDrafts?:Record<string,import('./preferences.ts').PreferenceDraft>;version:1;chatDrafts?:Record<string,string>;bookingShares?:import('./bookingShare.ts').BookingShare[];bookingManagers?:Record<string,string[]>;tripMessages?:Record<string,import('./trip.ts').TripMessage[]>;priceWatches?:Record<string,import('./priceWatch').PriceWatch>;recentSearches?:import('./filterSchema.ts').RecentSearch[];priceMode?:'stay'|'night';searchDistrict?:{city:string;name:string};viewedHotels?:string[];collection?:string;maxNightly?:number|null;priceRangeMinor?:{min:number|null;max:number|null};minRating?:number;searchFilters?:string[];searchSort?:string;savedHotels?:Record<string,string[]>;search:Search;draft:Draft|null;bookings:Booking[];payment:PaymentState;accounts:Record<string,{hotelierStatus:import('../hotelier/verification.ts').HotelierStatus;loyalty:boolean}>;selectedBooking:string|null};
export const initialCommerce=():Commerce=>({version:1,search:{...data.search,childrenAges:[]},draft:null,bookings:[],payment:createPaymentState(),accounts:{},selectedBooking:null});
export function decodeCommerce(raw:string|null):Commerce{
 if(!raw)return initialCommerce();const value=JSON.parse(raw) as Commerce;
 if(value.version!==1||!value.search||!Array.isArray(value.bookings)||!value.payment?.balances||!value.payment.operations||!value.accounts)throw Error('Не удалось прочитать сохранённые брони');
 return value;
}
export function ensureAccount(state:Commerce,owner:string):Commerce{
 if(state.accounts[owner])return state;
 return {...state,accounts:{...state.accounts,[owner]:{hotelierStatus:'none',loyalty:true}},payment:{...state.payment,balances:{...state.payment.balances,[`keys:${owner}`]:4860,[`hotel:orbit-sea:${owner}`]:1240}}};
}
export const nights=(s:Search)=>Math.round((Date.parse(s.checkOut)-Date.parse(s.checkIn))/86400000);
export function searchError(s:Search,today=new Date().toLocaleDateString('en-CA')){
 const valid=(v:string)=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
 if(!s.city.trim())return 'Выберите город';
 if(!valid(s.checkIn)||!valid(s.checkOut)||s.checkIn<today||nights(s)<1)return 'Выберите будущий заезд и выезд позже заезда';
 if(nights(s)>30)return 'Можно выбрать до 30 ночей';
 if(!Number.isInteger(s.adults)||s.adults<1||s.adults>6||s.childrenAges.length>4||s.childrenAges.some(a=>!Number.isInteger(a)||a<0||a>17))return 'Проверьте состав и возраст гостей';
 return '';
}
export function available(state:Commerce,roomId:string,s:Search){
 if(searchError(s))return false;
 const room=data.rooms.find(r=>r.id===roomId),slot=data.availability.find(a=>a.roomId===roomId);
 if(!room||!slot||room.maxGuests<s.adults+s.childrenAges.length||s.checkIn<slot.from||s.checkOut>slot.to)return false;
 // Availability is a local demo allotment; each confirmed overlapping booking occupies a room.
 const used=state.bookings.filter(b=>b.operation.status==='confirmed'&&b.stay?.status!=='checked_out'&&b.draft.roomId===roomId&&b.draft.search.checkIn<s.checkOut&&b.draft.search.checkOut>s.checkIn).length;
 return slot.remaining>used;
}
export function searchHotels(state:Commerce){return data.hotels.filter(h=>matchesDestination(state.search.city,h)&&(!state.search.withPet||hotelFacets(h.id)?.booking.includes('Можно с питомцем'))&&(!state.search.childrenAges.length||hotelFacets(h.id)?.booking.includes('Можно с детьми'))&&data.rooms.some(r=>r.hotelId===h.id&&matchesRoom(state,r.id)&&available(state,r.id,state.search)&&data.rates.some(rate=>rate.roomId===r.id&&matchesRate(state,rate))));}
export function startDraft(state:Commerce,hotelId:string,id:string,owner:string|null=null):Commerce{
 const eligible=(r:typeof data.rates[number])=>matchesRate(state,r);
 const room=data.rooms.find(r=>r.hotelId===hotelId&&matchesRoom(state,r.id)&&available(state,r.id,state.search)&&data.rates.some(rate=>rate.roomId===r.id&&eligible(rate)));
 const regular=data.rates.find(r=>r.roomId===room?.id&&eligible(r));
 const rate=owner&&state.accounts[owner]?.hotelierStatus==='approved'?data.rates.find(r=>r.kind==='friendly_rate'&&r.baseRateId===regular?.id)||regular:regular;
 if(!room||!rate)throw Error('На эти даты нет доступных номеров');
 return {...state,viewedHotels:[hotelId,...(state.viewedHotels||[]).filter(v=>v!==hotelId)].slice(0,8),draft:{id,hotelId,roomId:room.id,rateId:rate.id,search:{...state.search,childrenAges:[...state.search.childrenAges]},services:[],usePoints:false,method:'online',paymentOption:'sbp',contact:{name:'',surname:'',phone:'',email:''},step:'hotel'}};
}
export function additionalGuestError(d:Draft){
 const guests=bookingGuests(d);
 if(guests.length>guestCapacity(d.search))return 'Проверьте состав гостей';
 for(const [index,guest] of guests.entries()){
  if(!guest.name.trim()&&!guest.surname.trim())continue;
  if(!guest.name.trim()||!guest.surname.trim())return index===0?'Укажите имя и фамилию второго гостя':`Укажите имя и фамилию гостя ${index+2}`;
  if(!/^[\p{L}][\p{L} '\-’]{1,39}$/u.test(guest.name.trim())||!/^[\p{L}][\p{L} '\-’]{1,39}$/u.test(guest.surname.trim()))return `Проверьте имя и фамилию гостя ${index+2}`;
 }
 return '';
}
export function contactErrors(c:Contact){
 const errors:Partial<Record<keyof Contact,string>>={};
 if(!/^[\p{L}][\p{L} '\-’]{1,39}$/u.test(c.name.trim()))errors.name='Введите имя';
 if(!/^[\p{L}][\p{L} '\-’]{1,39}$/u.test(c.surname.trim()))errors.surname='Введите фамилию';
 if(!normalizeContactPhone(c.phone))errors.phone='Проверьте номер телефона';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email))errors.email='Проверьте почту';
 return errors;
}
export function quoteDraft(state:Commerce,owner:string|null):BookingQuote{
 const d=state.draft;if(!d)throw Error('Выберите номер');
 const hotel=data.hotels.find(h=>h.id===d.hotelId),rate=data.rates.find(r=>r.id===d.rateId&&r.roomId===d.roomId);
 if(!hotel||!rate)throw Error('Тариф недоступен');
 validateBookingTimes(d);
 const account=owner?state.accounts[owner]:undefined;
 const services=d.services.filter(id=>id!=='sea-breakfast'||rate.mealPlan!=='breakfast').map(id=>{const s=data.services.find(v=>v.id===id&&v.hotelId===d.hotelId);if(!s)throw Error('Услуга недоступна');return {...s,quantity:id==='sea-breakfast'?nights(d.search)*(d.search.adults+d.search.childrenAges.length):1};});
 return calculateBookingQuote({baseLodgingOverrideMinor:state.demoOfferPrices?.[watchKey(owner,d)],hotelId:d.hotelId,nights:nights(d.search),rate,hotelierStatus:account?.hotelierStatus||'none',hotelDiscountBasisPoints:Math.max(promotionBasisPoints(hotel.id),hotelProgramDiscount(state,owner,hotel.id)),services,wallets:programWallets(state,owner,d.hotelId),usePoints:d.usePoints});
}
export function commitBooking(state:Commerce,owner:string,expected:BookingQuote,outcome:'success'|'failure',now=new Date().toISOString()):Commerce{
 const d=state.draft;if(!d||!state.accounts[owner])throw Error('Войдите в профиль');
 const duplicate=state.bookings.find(b=>b.owner===owner&&b.id===d.id);
 if(duplicate){if(duplicate.operation.status==='cancelled')throw Error('Бронь уже отменена');return {...state,selectedBooking:d.id};}
 if(Object.keys(contactErrors(d.contact)).length)throw Error('Проверьте данные гостя');
 if(additionalGuestError(d))throw Error(additionalGuestError(d));
 if((d.stayWishes?.note.length||0)>WISH_LIMIT)throw Error('Сократите пожелание до 500 символов');
 if(searchError(d.search,now.slice(0,10))||!available(state,d.roomId,d.search))throw Error('Условия изменились. Проверьте даты и наличие');
 const fresh=quoteDraft(state,owner);
 if(JSON.stringify(fresh)!==JSON.stringify(expected))throw Error('Цена или баланс изменились. Проверьте итог ещё раз');
 const paid=confirmPayment(state.payment,{userId:owner,bookingId:d.id,quote:fresh,method:d.method,outcome});
 if(!paid.operation)throw Error('Оплата не прошла. Баллы не списаны. Попробуйте ещё раз');
 return {...state,draft:{...d,step:'confirmation'},payment:paid.state,selectedBooking:d.id,bookings:[...state.bookings,{id:d.id,owner,draft:structuredClone(d),quote:fresh,operation:paid.operation,createdAt:now,hotelLoyalty:hotelLoyaltySnapshot(state,owner,d.hotelId,d.rateId)}]};
}
export function cancelBooking(state:Commerce,owner:string,id:string,now=new Date().toISOString()):Commerce{
 const booking=state.bookings.find(b=>b.id===id&&b.owner===owner);if(!booking)throw Error('Бронь не найдена');
 if(booking.operation.status==='cancelled')return state;
 const result=cancellationPreview(booking,now),balances={...state.payment.balances};
 for(const [id,amount] of Object.entries(result.pointReturns))balances[id]=(balances[id]||0)+amount;
 const serviceRequests=booking.serviceRequests?.map(r=>{if(!r.operation||r.operation.status==='cancelled')return {...r,status:'cancelled' as const};const refund=serviceCancellation(r,now);return {...r,status:'cancelled' as const,operation:{...r.operation,status:'cancelled' as const,refundCashMinor:refund.cashReturn,returnedPointsMinor:refund.pointsReturn*100,penaltyMinor:refund.penalty}};});
 const serviceOperations=Object.fromEntries((serviceRequests||[]).filter(r=>r.operation).map(r=>[r.operation!.id,r.operation!]));
 const operation:Operation={...booking.operation,status:'cancelled',refundCashMinor:result.cashReturn,returnedPointsMinor:result.pointsReturn*100,penaltyMinor:result.penalty,penaltyDueMinor:result.due,dueAtHotelMinor:0};
 return {...state,draft:state.draft?.id===id?null:state.draft,payment:{balances,operations:{...state.payment.operations,[operation.id]:operation,...serviceOperations}},bookings:state.bookings.map(b=>b.id===id&&b.owner===owner?{...b,operation,serviceRequests}:b)};
}
export function cancellationDeadline(s:Search){return new Date(Date.parse(s.checkIn+'T15:00:00+03:00')-3*86400000).toISOString();}
export function cancellationLabel(s:Search){return new Date(cancellationDeadline(s)).toLocaleString('ru-RU',{timeZone:'Europe/Moscow',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'})+' мск';}
export function cancellationPreview(b:Booking,now=new Date().toISOString()){
 if(b.stay)throw Error('Проживание уже началось. Обратитесь в отель');
 if(!Number.isFinite(Date.parse(now)))throw Error('Не удалось определить срок отмены');
 if(Date.parse(now)>=Date.parse(b.draft.search.checkIn+'T15:00:00+03:00'))throw Error('Срок заезда наступил. Для отмены свяжитесь с отелем');
 const penalty=Date.parse(now)<=Date.parse(cancellationDeadline(b.draft.search))?0:Math.round(b.quote.lodgingMinor/b.quote.nights);
 const cashKept=Math.min(penalty,b.operation.paidCashMinor);
 let pointsKept=Math.min(Math.floor((penalty-cashKept)/100),b.operation.pointsMinor/100);
 const due=penalty-cashKept-pointsKept*100,pointReturns:Record<string,number>={};
 // Demonstration settlement: paid money first, then whole points in original debit order.
 for(const [id,amount] of Object.entries(b.operation.debits)){const kept=Math.min(pointsKept,amount);pointsKept-=kept;pointReturns[id]=amount-kept;}
 let serviceCashReturn=0,servicePenalty=0;for(const r of b.serviceRequests||[]){const refund=serviceCancellation(r,now);serviceCashReturn+=refund.cashReturn;servicePenalty+=refund.penalty;for(const [id,n] of Object.entries(refund.pointReturns))pointReturns[id]=(pointReturns[id]||0)+n;}
 return {penalty:penalty+servicePenalty,serviceCashReturn,servicePenalty,cashReturn:b.operation.paidCashMinor-cashKept+serviceCashReturn,pointReturns,pointsReturn:Object.values(pointReturns).reduce((a,b)=>a+b,0),due};
}
export function formatMoney(minor:number){return new Intl.NumberFormat('ru-RU',{style:'currency',currency:'RUB',maximumFractionDigits:minor%100?2:0}).format(minor/100);}
export function dateLabel(s:Search){const f=(d:string)=>new Date(d+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'});return `${f(s.checkIn)} — ${f(s.checkOut)}`;}
export function guestLabel(s:Search){return `${s.adults} взр.${s.childrenAges.length?` · ${s.childrenAges.length} дет.`:''}`;}
export const hotelPhoto=(id:string)=>hotelVisual(id).photos[0];
