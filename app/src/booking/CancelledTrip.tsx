import {Button,Icon,StatusBadge} from '../ui';
import {usePrototypeCopy} from '../usePrototypeText';
import {catalog,hotelPhoto,formatMoney,nights,type Booking} from './model';
import {guestCountLabel} from './search';
import {tripFacts} from './trip';
import {hotelLocation} from '../maps/locations';
import {hotelVisual} from './presentation';
import {TripLayoutGroup} from './TripLayoutGroup';
import {useNovember} from '../usePrototypeVariant';

export function CancelledTrip({booking:b,onDetails,onRepeat}:{booking:Booking;onDetails:()=>void;onRepeat:()=>void}){
 const november=useNovember();
 const hotel=catalog.hotels.find(h=>h.id===b.draft.hotelId)!,facts=tripFacts(b);
 const visual=hotelVisual(hotel.id),address=[visual.location.replaceAll(' · ', ', '),hotelLocation(hotel.id)?.address||visual.address].filter(Boolean).join(', ');
 const repeat=usePrototypeCopy('Снова в этот отель','Забронировать снова');
 const date=(value:string)=>new Date(value+'T12:00:00').toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.','');
 const count=nights(b.draft.search),nightLabel=`${count} ${count%10===1&&count%100!==11?'ночь':count%10>=2&&count%10<=4&&(count%100<12||count%100>14)?'ночи':'ночей'}`;
 return <div className="trip-home cancelled-trip"><div className="trip-greeting"><h1>Поездки</h1></div>
  <TripLayoutGroup className="desktop-trip-columns"><TripLayoutGroup className="desktop-trip-column desktop-trip-booking">
  <article className="upcoming-card">
   <div className="upcoming-photo"><img src={hotelPhoto(hotel.id)} alt={hotel.name}/><StatusBadge className="upcoming-status" tone="neutral" icon="close">Отменена</StatusBadge><div className="upcoming-hotel-heading"><div className="upcoming-hotel-copy"><h2>{hotel.name}</h2><p>{address}</p></div></div></div>
   <div className="upcoming-body">
    <div className="upcoming-dates"><span><small>Заезд</small><strong>{date(b.draft.search.checkIn)}</strong><b>с {facts.checkInTime}</b></span><span className={november?'trip-date-direction':undefined} aria-hidden="true">{november?<i className="trip-date-line"/>:'→'}</span><span><small>Выезд</small><strong>{date(b.draft.search.checkOut)}</strong><b>до {facts.checkOutTime}</b></span></div>
    <div className="upcoming-payment"><div className="upcoming-payment-overview"><span className="upcoming-payment-facts"><span><Icon name="moon" size={17} inheritColor/>{nightLabel}</span><span><Icon name="guests" size={17} inheritColor/>{guestCountLabel(b.draft.search)}</span></span><span className="upcoming-payment-price"><strong>{formatMoney(b.quote.orderTotalMinor)}</strong></span></div></div>
    <div className="booking-card-actions"><Button variant="secondary" className="booking-card-action" onClick={onDetails}><Icon name="document" size={20} inheritColor/><span>Детали</span></Button><Button variant="secondary" className="booking-card-action" onClick={onRepeat}>{repeat}</Button></div>
   </div>
  </article>
  </TripLayoutGroup></TripLayoutGroup>
 </div>;
}
