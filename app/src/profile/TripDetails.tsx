import {bookingNumber} from '../booking/bookingNumber';
import {TripDetailsActions} from './TripDetailsActions';
import type {Dispatch,SetStateAction,ReactNode} from 'react';
import {isDesktop} from '../desktop/surface';
import {BookingReward} from '../booking/BookingReward';
import {mealLabel} from '../booking/searchFacets';
import {wishSummary} from '../booking/bookingParty';
import {Button,Icon,Row} from '../ui';
import {BookingHotelContacts} from '../booking/BookingHotelContacts';
import {BookingPaymentStatus,BookingPaymentBadge} from '../booking/BookingPaymentStatus';
import {catalog,cancellationDeadline,formatMoney,guestLabel,hotelPhoto,type Booking,type Commerce} from '../booking/model';
import {rateTitle} from '../booking/roomOffers';
import {tripFacts} from '../booking/trip';
import {serviceTitle} from '../booking/serviceSettlement';
import {ServiceStatus} from '../booking/ServiceStatus';
import {HistoryStatus} from './HistoryTimeline';
import {isPastTrip} from './history';
import './trip-details.css';
import './mobile-trip-details.css';

type Props={booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;onBooking?:()=>void;onRepeat?:()=>void;onDownload?:()=>void;onReview?:()=>void;onRemove?:()=>void;bottomActions?:ReactNode;actions?:ReactNode;stickyActions?:ReactNode;resources?:ReactNode;failNext?:boolean;onPaymentAttempt?:()=>void};
const date=(value:string)=>new Date(value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
export function TripDetails({booking:b,commerce,setCommerce,onBooking,onRepeat,onDownload,onReview,onRemove,bottomActions,actions,stickyActions,resources,failNext,onPaymentAttempt}:Props){
 const hotel=catalog.hotels.find(h=>h.id===b.draft.hotelId),room=catalog.rooms.find(r=>r.id===b.draft.roomId),rate=catalog.rates.find(r=>r.id===b.draft.rateId),facts=tripFacts(b);
 const cancelled=b.operation.status==='cancelled',completed=b.stay?.status==='checked_out',past=isPastTrip(b);
 const included=b.draft.services.map(id=>catalog.services.find(s=>s.id===id)).filter(Boolean);
 const overview=<section className="trip-detail-overview" aria-label="О поездке">
    <div className="trip-detail-hotel"><img src={hotelPhoto(b.draft.hotelId)} alt={hotel?.name||'Отель'}/><div><HistoryStatus booking={b}/><h1>{hotel?.name}</h1><span className="trip-detail-number">№ {bookingNumber(b)}</span></div></div>
    <div className="trip-detail-dates"><div><span>Заезд</span><strong>{date(b.draft.search.checkIn)}</strong><small>с {facts.checkInTime}</small></div><div><span>Выезд</span><strong>{date(b.draft.search.checkOut)}</strong><small>до {facts.checkOutTime}</small></div></div>
    <div className="trip-detail-room"><span className="icon-tile"><Icon name="room" size={22} inheritColor/></span><div><h2>{room?.title||'Номер'}</h2><p>{rate&&rateTitle(rate)}</p>{b.stay&&<p>Номер {b.stay.roomNumber} · {b.stay.floor} этаж</p>}</div></div>
    <div className="trip-detail-guests"><span className="icon-tile"><Icon name="guests" size={22} inheritColor/></span><div><h2>{guestLabel(b.draft.search)}</h2><p>{[b.draft.contact,...(b.draft.additionalGuest?[b.draft.additionalGuest]:[]),...(b.draft.otherGuests||[])].map(g=>[g.name,g.surname].filter(Boolean).join(' ')).filter(Boolean).join(', ')}</p></div></div>
   </section>;
 const contacts=<section className="trip-detail-panel trip-detail-contacts"><h2>Контакты отеля</h2><BookingHotelContacts hotelId={b.draft.hotelId}/></section>;
 const services=(included.length>0||!!b.serviceRequests?.length)&&<section className="trip-detail-panel trip-detail-services"><h2>Услуги в поездке</h2><div className="trip-detail-service-list">{included.map(s=><div key={s!.id}><span>{s!.title}</span><small>В составе брони</small></div>)}{b.serviceRequests?.map(r=><div key={r.id}><span>{serviceTitle(r)}</span><span className="trip-detail-service-state"><ServiceStatus booking={b} request={r}/><small>{r.amountMinor?formatMoney(r.amountMinor):'Бесплатно'}</small></span></div>)}</div></section>;
 const terms=!isDesktop&&<section className="trip-detail-panel trip-detail-terms"><h2>Условия проживания</h2><div className="trip-detail-money"><div><span>Питание</span><strong>{rate&&mealLabel(rate.mealPlan)}</strong></div><div><span>Wi-Fi</span><strong>Включён</strong></div><div><span>Бесплатная отмена</span><strong>До {date(cancellationDeadline(b.draft.search).slice(0,10))}</strong></div></div></section>;
 const wishes=!isDesktop&&wishSummary(b.draft)&&<section className="trip-detail-panel trip-detail-wishes"><h2>Пожелания к проживанию</h2><p>{wishSummary(b.draft)}</p><p>Отель учтёт пожелания при наличии возможности.</p></section>;
 const changes=!isDesktop&&!!b.changes?.length&&<section className="trip-detail-panel trip-detail-changes"><h2>Изменения брони</h2>{b.changes.map(c=><div key={c.id}><p>{new Date(c.at).toLocaleDateString('ru-RU')}</p><p>{c.paidMinor?`Доплачено ${formatMoney(c.paidMinor)}`:c.refundMinor?`Возврат ${formatMoney(c.refundMinor)}`:'Изменения сохранены'}{c.returnedHotelPoints+c.returnedKeysPoints>0?` · возвращено ${c.returnedHotelPoints+c.returnedKeysPoints} баллов`:''}</p></div>)}</section>;
 const review=completed&&!cancelled&&(onReview||b.review)&&<section className="trip-detail-panel trip-detail-review"><div><h2>Ваш отзыв</h2>{b.review?<><p className="trip-detail-rating"><Icon name="review" size={18}/>{b.review.rating} из 5</p>{b.review.text&&<p>{b.review.text}</p>}</>:<p>Поделитесь впечатлениями о проживании.</p>}</div>{onReview&&<Button variant="secondary" onClick={onReview}>{b.review?'Изменить отзыв':'Оценить проживание'}</Button>}</section>;
 const payment=<section className="trip-detail-payment"><div className="trip-detail-payment-heading"><h2>{isDesktop?"Стоимость поездки":"Оплата бронирования"}</h2>{!isDesktop&&<BookingPaymentBadge booking={b}/>}</div><div className="trip-detail-total"><span>По бронированию</span><strong>{formatMoney(b.quote.orderTotalMinor)}</strong></div>
    {cancelled?<div className="trip-detail-money"><h3>Возврат</h3><div><span>Деньги</span><strong>{formatMoney(b.operation.refundCashMinor||0)}</strong></div>{!!b.operation.returnedPointsMinor&&<div><span>Баллы</span><strong>{((b.operation.returnedPointsMinor||0)/100).toLocaleString('ru-RU')}</strong></div>}{!!b.operation.penaltyMinor&&<div><span>Удержание</span><strong>{formatMoney(b.operation.penaltyMinor)}</strong></div>}{!!b.operation.penaltyDueMinor&&<div><span>К доплате</span><strong>{formatMoney(b.operation.penaltyDueMinor)}</strong></div>}</div>:<><BookingPaymentStatus hideStatus={!isDesktop} booking={b} commerce={commerce} setCommerce={setCommerce} failNext={failNext} onPaymentAttempt={onPaymentAttempt} showAmount/><div className="trip-detail-money"><div><span>Оплачено деньгами</span><strong>{formatMoney(b.operation.paidCashMinor)}</strong></div>{b.quote.hotelDiscountMinor>0&&<div><span>Скидка −{Math.round(b.quote.hotelDiscountMinor/b.quote.baseLodgingMinor*100)}%</span><strong>−{formatMoney(b.quote.hotelDiscountMinor)}</strong></div>}{b.quote.applied.keysPoints>0&&<div><span>Баллы «Ключей»</span><strong>{b.quote.applied.keysPoints.toLocaleString('ru-RU')}</strong></div>}{b.quote.applied.hotelPoints>0&&<div><span>Баллы отеля</span><strong>{b.quote.applied.hotelPoints.toLocaleString('ru-RU')}</strong></div>}</div></>}
    {!isDesktop&&!cancelled&&!completed&&<BookingReward quote={b.quote}/>}
    {actions!==undefined?actions:(past?onRepeat:onBooking)?<Button onClick={past?onRepeat:onBooking}><Icon name={past?'calendar':'document'} size={20} inheritColor/>{past?'Снова в этот отель':'Управлять бронированием'}</Button>:null}
   </section>;
 const documents=<section className="trip-detail-panel trip-detail-resources" aria-label="Документы поездки">{resources??(onDownload&&<Row icon="document" title="Документы поездки" onClick={onDownload}/>)}</section>;
 const remove=onRemove&&<button className="trip-detail-remove" onClick={onRemove}><Icon name="trash" size={18} inheritColor/>Удалить бронь</button>;
 // Mobile DOM order matches the visual reading and keyboard navigation order.
 if(!isDesktop)return <div className="desktop-trip-detail mobile-trip-detail">{overview}{contacts}{terms}{services}{wishes}{changes}{review}{documents}{payment}{bottomActions&&<div className="trip-detail-bottom-actions">{bottomActions}</div>}{remove}{stickyActions&&<TripDetailsActions>{stickyActions}</TripDetailsActions>}</div>;
 return <div className="desktop-trip-detail"><div className="trip-detail-main">{overview}{contacts}{services}{review}</div><aside className="trip-detail-side" aria-label="Оплата и действия">{payment}{documents}{remove}</aside></div>;
}
