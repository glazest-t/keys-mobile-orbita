import {catalog,formatMoney,nights,type Booking} from './model';

export function ConfirmationServices({booking}:{booking:Booking}){
 const d=booking.draft,rate=catalog.rates.find(r=>r.id===d.rateId);
 const services=catalog.services.filter(s=>s.hotelId===d.hotelId&&d.services.includes(s.id)&&(s.id!=='sea-breakfast'||rate?.mealPlan!=='breakfast'));
 if(!services.length)return null;
 return <section className="hotel-section"><h2>Добавленные услуги</h2><div className="k-card booking-panel confirmation-services">{services.map(service=>{
  const breakfast=service.id==='sea-breakfast',days=nights(d.search),guests=d.search.adults+d.search.childrenAges.length;
  const quantity=breakfast?days*guests:1;
  const detail=service.stayTime?`${service.stayTime.kind==='arrival'?'С':'До'} ${service.stayTime.time}`:breakfast?`${days} дн. · ${guests} гост.`:'';
  return <div key={service.id}><span><strong>{service.title}</strong>{detail&&<small>{detail}</small>}</span><span className="confirmation-service-price">{formatMoney(service.unitPriceMinor*quantity)}</span></div>;
 })}</div></section>;
}
