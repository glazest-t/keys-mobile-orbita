import {editorialText} from '../../../prototype/domain/editorialText.mjs';
import {CancellationTerms} from '../booking/CancellationTerms';
import {BookingPaymentSummary} from '../booking/BookingPaymentSummary';
import {bookingNumber} from '../booking/bookingNumber';
import {TripDetailsActions} from './TripDetailsActions';
import {PendingCancellationButton,PendingPaymentFooter} from '../booking/PendingBooking';
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

type Props={initialPaymentOpen?:boolean;booking:Booking;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;onBooking?:()=>void;onRepeat?:()=>void;onDownload?:()=>void;onReview?:()=>void;onRemove?:()=>void;bottomActions?:ReactNode;actions?:ReactNode;stickyActions?:ReactNode;resources?:ReactNode;failNext?:boolean;onPaymentAttempt?:()=>void};
const date=(value:string)=>new Date(value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});
export function TripDetails({booking:b,commerce,setCommerce,onBooking,onRepeat,onDownload,onReview,onRemove,bottomActions,actions,stickyActions,resources,failNext,onPaymentAttempt,initialPaymentOpen}:Props){
 const hotel=catalog.hotels.find(h=>h.id===b.draft.hotelId),room=catalog.rooms.find(r=>r.id===b.draft.roomId),rate=catalog.rates.find(r=>r.id===b.draft.rateId),facts=tripFacts(b);
 const cancelled=b.operation.status==='cancelled',completed=b.stay?.status==='checked_out',past=isPastTrip(b);
 const overview=<section className="trip-detail-overview" aria-label="О поездке">
    <div className="trip-detail-hotel"><img src={hotelPhoto(b.draft.hotelId)} alt={hotel?.name||'Отель'}/><div><HistoryStatus booking={b}/><h1>{hotel?.name}</h1><span className="trip-detail-number">№ {bookingNumber(b)}</span></div></div>
    <div className="trip-detail-dates"><div><span>Заезд</span><strong>{date(b.draft.search.checkIn)}</strong><small>{editorialText("РШ-042", `с ${facts.checkInTime}`, `С ${facts.checkInTime}`)}</small></div><div><span>Выезд</span><strong>{date(b.draft.search.checkOut)}</strong><small>{editorialText("РШ-044", `до ${facts.checkOutTime}`, `До ${facts.checkOutTime}`)}</small></div></div>
    <div className="trip-detail-room"><span className="icon-tile"><Icon name="room" size={22} inheritColor/></span><div><h2>{room?.title||'Номер'}</h2><p>{rate&&rateTitle(rate)}</p>{b.stay&&<p>Номер {b.stay.roomNumber} · {b.stay.floor} этаж</p>}</div></div>
    <div className="trip-detail-guests"><span className="icon-tile"><Icon name="guests" size={22} inheritColor/></span><div><h2>{guestLabel(b.draft.search)}</h2><p>{[b.draft.contact,...(b.draft.additionalGuest?[b.draft.additionalGuest]:[]),...(b.draft.otherGuests||[])].map(g=>[g.name,g.surname].filter(Boolean).join(' ')).filter(Boolean).join(', ')}</p></div></div>
   </section>;
 const contacts=<section className="trip-detail-panel trip-detail-contacts"><h2>{editorialText("РШ-047", "Контакты отеля", "Контакты")}</h2><BookingHotelContacts hotelId={b.draft.hotelId}/></section>;
 const terms=!isDesktop&&<section className="trip-detail-panel trip-detail-terms"><h2>Условия проживания</h2><div className="trip-detail-money"><div><span>Питание</span><strong>{rate&&mealLabel(rate.mealPlan)}</strong></div><div><span>Wi-Fi</span><strong>Включён</strong></div></div><CancellationTerms booking={b}/></section>;
 const wishes=!isDesktop&&wishSummary(b.draft)&&<section className="trip-detail-panel trip-detail-wishes"><h2>Пожелания к проживанию</h2><p>{wishSummary(b.draft)}</p><p>{editorialText("РШ-053", "Отель учтёт пожелания при наличии возможности.", "Пожелания будут учтены по возможности")}</p></section>;
 const changes=!isDesktop&&!!b.changes?.length&&<section className="trip-detail-panel trip-detail-changes"><h2>Изменения брони</h2>{b.changes.map(c=><div key={c.id}><p>{new Date(c.at).toLocaleDateString('ru-RU')}</p><p>{c.paidMinor?`Доплачено ${formatMoney(c.paidMinor)}`:c.refundMinor?`Возврат ${formatMoney(c.refundMinor)}`:'Изменения сохранены'}{c.returnedHotelPoints+c.returnedKeysPoints>0?editorialText(c.paidMinor?"РШ-055":c.refundMinor?"РШ-057":"РШ-059", ` · возвращено ${c.returnedHotelPoints+c.returnedKeysPoints} баллов`, ` · Возвращено ${c.returnedHotelPoints+c.returnedKeysPoints} баллов`):''}</p></div>)}</section>;
 const review=completed&&!cancelled&&(onReview||b.review)&&<section className="trip-detail-panel trip-detail-review"><div><h2>{editorialText("РШ-061", "Ваш отзыв", "Как всё прошло?")}</h2>{b.review?<><p className="trip-detail-rating"><Icon name="review" size={18}/>{b.review.rating} из 5</p>{b.review.text&&<p>{b.review.text}</p>}</>:<p>{editorialText("РШ-063", "Поделитесь впечатлениями о проживании.", "Поделитесь впечатлениями о проживании")}</p>}</div>{onReview&&<Button variant="secondary" onClick={onReview}>{b.review?'Изменить отзыв':'Оценить проживание'}</Button>}</section>;
 const payment=<BookingPaymentSummary booking={b} commerce={commerce} setCommerce={setCommerce} failNext={failNext} onPaymentAttempt={onPaymentAttempt} initialPaymentOpen={initialPaymentOpen}>
    {!isDesktop&&b.operation.status==='confirmed'&&!completed&&<BookingReward quote={b.quote}/>}
    {actions!==undefined?actions:(past?onRepeat:onBooking)?<Button onClick={past?onRepeat:onBooking}><Icon name={past?'calendar':'document'} size={20} inheritColor/>{past?editorialText("РШ-066", "Снова в этот отель", "Забронировать снова"):'Управлять бронированием'}</Button>:null}
   </BookingPaymentSummary>;
 const documents=b.operation.status!=='awaiting_payment'&&<section className="trip-detail-panel trip-detail-resources" aria-label="Документы поездки">{resources??(onDownload&&<Row icon="document" title="Документы поездки" onClick={onDownload}/>)}</section>;
 const remove=onRemove&&<button className="trip-detail-remove" onClick={onRemove}><Icon name="trash" size={18} inheritColor/>{editorialText("РШ-069", "Удалить бронь", "Удалить из приложения")}</button>;
 const pageBottomActions=bottomActions||(!isDesktop&&b.operation.status==='awaiting_payment'&&<PendingCancellationButton booking={b} commerce={commerce} setCommerce={setCommerce}/>);
 const pendingFooter=!isDesktop&&b.operation.status==='awaiting_payment'&&<PendingPaymentFooter booking={b} commerce={commerce} setCommerce={setCommerce} failNext={failNext} onPaymentAttempt={onPaymentAttempt} initialOpen={initialPaymentOpen}/>;
 // Mobile DOM order matches the visual reading and keyboard navigation order.
 if(!isDesktop)return <div className="desktop-trip-detail mobile-trip-detail">{overview}{contacts}{terms}{payment}{wishes}{changes}{review}{documents}{pageBottomActions&&<div className="trip-detail-bottom-actions">{pageBottomActions}</div>}{remove}{pendingFooter}{stickyActions&&<TripDetailsActions>{stickyActions}</TripDetailsActions>}</div>;
 return <div className="desktop-trip-detail"><div className="trip-detail-main">{overview}{contacts}{review}</div><aside className="trip-detail-side" aria-label="Оплата и действия">{payment}{documents}{pageBottomActions&&<div className="record-actions">{pageBottomActions}</div>}{remove}</aside>{pendingFooter}</div>;
}
