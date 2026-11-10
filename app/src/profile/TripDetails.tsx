import {CancellationTerms} from '../booking/CancellationTerms';
import {BookingPaymentSummary} from '../booking/BookingPaymentSummary';
import {bookingNumber} from '../booking/bookingNumber';
import {TripDetailsActions} from './TripDetailsActions';
import type {Dispatch,SetStateAction,ReactNode} from 'react';
import {isDesktop} from '../desktop/surface';
import {BookingReward} from '../booking/BookingReward';
import {mealLabel} from '../booking/searchFacets';
import {wishSummary} from '../booking/bookingParty';
import {Button,Icon,Row} from '../ui';
import {BookingHotelContacts} from '../booking/BookingHotelContacts';
import {catalog,formatMoney,guestLabel,hotelPhoto,type Booking,type Commerce} from '../booking/model';
import {rateTitle} from '../booking/roomOffers';
import {tripFacts} from '../booking/trip';
import {HistoryStatus} from './HistoryTimeline';
import {isPastTrip} from './history';
import './trip-details.css';
import './mobile-trip-details.css';

type Props={booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;onBooking?:()=>void;onRepeat?:()=>void;onDownload?:()=>void;onReview?:()=>void;onRemove?:()=>void;bottomActions?:ReactNode;actions?:ReactNode;stickyActions?:ReactNode;resources?:ReactNode;failNext?:boolean;onPaymentAttempt?:()=>void};
const date=(value:string)=>new Date(value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
export function TripDetails({booking:b,commerce,setCommerce,onBooking,onRepeat,onDownload,onReview,onRemove,bottomActions,actions,stickyActions,resources,failNext,onPaymentAttempt}:Props){
 const hotel=catalog.hotels.find(h=>h.id===b.draft.hotelId),room=catalog.rooms.find(r=>r.id===b.draft.roomId),rate=catalog.rates.find(r=>r.id===b.draft.rateId),facts=tripFacts(b);
 const cancelled=b.operation.status==='cancelled',completed=b.stay?.status==='checked_out',past=isPastTrip(b);
 const overview=<section className="trip-detail-overview" aria-label="О поездке">
    <div className="trip-detail-hotel"><img src={hotelPhoto(b.draft.hotelId)} alt={hotel?.name||'Отель'}/><div><HistoryStatus booking={b}/><h1>{hotel?.name}</h1><span className="trip-detail-number">№ {bookingNumber(b)}</span></div></div>
    <div className="trip-detail-dates"><div><span>Заезд</span><strong>{date(b.draft.search.checkIn)}</strong><small>с {facts.checkInTime}</small></div><div><span>Выезд</span><strong>{date(b.draft.search.checkOut)}</strong><small>до {facts.checkOutTime}</small></div></div>
    <div className="trip-detail-room"><span className="icon-tile"><Icon name="room" size={22} inheritColor/></span><div><h2>{room?.title||'Номер'}</h2><p>{rate&&rateTitle(rate)}</p>{b.stay&&<p>Номер {b.stay.roomNumber} · {b.stay.floor} этаж</p>}</div></div>
    <div className="trip-detail-guests"><span className="icon-tile"><Icon name="guests" size={22} inheritColor/></span><div><h2>{guestLabel(b.draft.search)}</h2><p>{[b.draft.contact,...(b.draft.additionalGuest?[b.draft.additionalGuest]:[]),...(b.draft.otherGuests||[])].map(g=>[g.name,g.surname].filter(Boolean).join(' ')).filter(Boolean).join(', ')}</p></div></div>
   </section>;
 const contacts=<section className="trip-detail-panel trip-detail-contacts"><h2>Контакты отеля</h2><BookingHotelContacts hotelId={b.draft.hotelId}/></section>;
 const terms=!isDesktop&&<section className="trip-detail-panel trip-detail-terms"><h2>Условия проживания</h2><div className="trip-detail-money"><div><span>Питание</span><strong>{rate&&mealLabel(rate.mealPlan)}</strong></div><div><span>Wi-Fi</span><strong>Включён</strong></div></div><CancellationTerms booking={b}/></section>;
 const wishes=!isDesktop&&wishSummary(b.draft)&&<section className="trip-detail-panel trip-detail-wishes"><h2>Пожелания к проживанию</h2><p>{wishSummary(b.draft)}</p><p>Отель учтёт пожелания при наличии возможности.</p></section>;
 const changes=!isDesktop&&!!b.changes?.length&&<section className="trip-detail-panel trip-detail-changes"><h2>Изменения брони</h2>{b.changes.map(c=><div key={c.id}><p>{new Date(c.at).toLocaleDateString('ru-RU')}</p><p>{c.paidMinor?`Доплачено ${formatMoney(c.paidMinor)}`:c.refundMinor?`Возврат ${formatMoney(c.refundMinor)}`:'Изменения сохранены'}{c.returnedHotelPoints+c.returnedKeysPoints>0?` · возвращено ${c.returnedHotelPoints+c.returnedKeysPoints} баллов`:''}</p></div>)}</section>;
 const review=completed&&!cancelled&&(onReview||b.review)&&<section className="trip-detail-panel trip-detail-review"><div><h2>Ваш отзыв</h2>{b.review?<><p className="trip-detail-rating"><Icon name="review" size={18}/>{b.review.rating} из 5</p>{b.review.text&&<p>{b.review.text}</p>}</>:<p>Поделитесь впечатлениями о проживании.</p>}</div>{onReview&&<Button variant="secondary" onClick={onReview}>{b.review?'Изменить отзыв':'Оценить проживание'}</Button>}</section>;
 const payment=<BookingPaymentSummary booking={b} commerce={commerce} setCommerce={setCommerce} failNext={failNext} onPaymentAttempt={onPaymentAttempt}>
    {!isDesktop&&!cancelled&&!completed&&<BookingReward quote={b.quote}/>}
    {actions!==undefined?actions:(past?onRepeat:onBooking)?<Button onClick={past?onRepeat:onBooking}><Icon name={past?'calendar':'document'} size={20} inheritColor/>{past?'Снова в этот отель':'Управлять бронированием'}</Button>:null}
   </BookingPaymentSummary>;
 const documents=<section className="trip-detail-panel trip-detail-resources" aria-label="Документы поездки">{resources??(onDownload&&<Row icon="document" title="Документы поездки" onClick={onDownload}/>)}</section>;
 const remove=onRemove&&<button className="trip-detail-remove" onClick={onRemove}><Icon name="trash" size={18} inheritColor/>Удалить бронь</button>;
 // Mobile DOM order matches the visual reading and keyboard navigation order.
 if(!isDesktop)return <div className="desktop-trip-detail mobile-trip-detail">{overview}{contacts}{terms}{payment}{wishes}{changes}{review}{documents}{bottomActions&&<div className="trip-detail-bottom-actions">{bottomActions}</div>}{remove}{stickyActions&&<TripDetailsActions>{stickyActions}</TripDetailsActions>}</div>;
 return <div className="desktop-trip-detail"><div className="trip-detail-main">{overview}{contacts}{review}</div><aside className="trip-detail-side" aria-label="Оплата и действия">{payment}{documents}{remove}</aside></div>;
}
