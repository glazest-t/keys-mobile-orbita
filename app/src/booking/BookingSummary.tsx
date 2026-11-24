import {Icon} from '../ui';
import {catalog,dateLabel,guestLabel,hotelPhoto,nights,type Draft} from './model';
import {includedRoomServices,rateTitle} from './roomOffers';
import './booking-summary.css';

const mealServices:Record<string,readonly string[]> = {
 breakfast:['Завтрак'],
 half_board:['Завтрак','Ужин'],
 full_board:['Завтрак','Обед','Ужин'],
 all_inclusive:['Питание по программе «Всё включено»'],
};

const servicePlural = new Intl.PluralRules('ru');

export type BookingSummaryExample={rateTitle:string;includedServices:readonly string[]};

export function BookingSummary({draft,example}:{draft:Draft;example?:BookingSummaryExample}){
 const hotel=catalog.hotels.find(h=>h.id===draft.hotelId)!;
 const room=catalog.rooms.find(r=>r.id===draft.roomId)!;
 const rate=catalog.rates.find(r=>r.id===draft.rateId)!;
 const services=example?.includedServices??[
  ...(mealServices[rate.mealPlan]||[]),
  ...includedRoomServices(room.id).map(service=>service.title),
 ];
 const count=services.length;
 const form=servicePlural.select(count);
 const serviceCount=`${count} ${form==='one'?'услуга':form==='few'?'услуги':'услуг'}`;

 return (
  <div className="booking-summary">
   <img src={hotelPhoto(hotel.id)} alt=""/>
   <div className="booking-summary-copy">
    <strong>{hotel.name}</strong>
    <p>{dateLabel(draft.search)} · {nights(draft.search)} ноч. · {guestLabel(draft.search)}</p>
    <small>{room.title} · {example?.rateTitle??rateTitle(rate)}</small>
   </div>
   <details className="booking-summary-inclusions" key={rate.id}>
    <summary>
     <Icon name="gift" size={18} inheritColor/>
     <span>Включено в тариф</span>
     <span className="booking-summary-inclusions-count">{serviceCount}</span>
     <span className="booking-summary-inclusions-chevron"><Icon name="chevron-down" size={16} inheritColor/></span>
    </summary>
    <ul role="list">
     {services.map(title=><li key={title}>{title}</li>)}
    </ul>
   </details>
  </div>
 );
}
