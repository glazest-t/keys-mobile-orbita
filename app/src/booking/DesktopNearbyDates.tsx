import {useMemo,useState} from 'react';
import {Carousel} from '../mobile';
import {Icon} from '../ui';
import {dateLabel,formatMoney,guestLabel,nights,type Commerce,type Search} from './model';
import {nearbyDateOffers} from './nearbyDates';

export function DesktopNearbyDates({commerce,owner,onApply}:{commerce:Commerce;owner:string|null;onApply:(search:Search)=>void|string}){
 const [error,setError]=useState('');
 const offers=useMemo(()=>nearbyDateOffers(commerce,owner),[commerce,owner]);
 if(!offers.length)return null;
 return <section className="desktop-nearby-dates" aria-label="Цены на соседние даты">
  <header><h2>Цены на соседние даты:</h2><p>За {nights(commerce.draft!.search)} ноч. · {guestLabel(commerce.draft!.search)}</p></header>
  <Carousel ariaLabel="Соседние даты проживания" className="desktop-nearby-dates-carousel" contentClassName="desktop-nearby-dates-track">
   {offers.map(offer=><button type="button" key={offer.search.checkIn} className="desktop-nearby-date" disabled={offer.priceMinor===null} aria-pressed={offer.selected} onClick={()=>{if(!offer.selected)setError(onApply(offer.search)||'');}}>
    <span className="desktop-nearby-date-label">{dateLabel(offer.search)}</span>
    <strong>{offer.priceMinor===null?'Нет номеров':`от ${formatMoney(offer.priceMinor)}`}</strong>
    {offer.selected?<span className="desktop-nearby-date-status"><Icon name="check" size={14} inheritColor/>Выбрано</span>:offer.cheaper?<span className="desktop-nearby-date-cheaper">Дешевле</span>:null}
   </button>)}
  </Carousel>
  {error&&<p className="field-error" role="alert">{error}</p>}
 </section>;
}
