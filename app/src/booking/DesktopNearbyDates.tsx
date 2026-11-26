import {useCallback,useMemo,useState} from 'react';
import {Carousel} from '../mobile';
import {StatusBadge} from '../ui';
import {DesktopCarouselNavigation} from './DesktopCarouselNavigation';
import {dateLabel,formatMoney,guestLabel,nights,type Commerce,type Search} from './model';
import {nearbyDateOffers,withDemoNearbyDate} from './nearbyDates';

export function DesktopNearbyDates({commerce,owner,onApply}:{commerce:Commerce;owner:string|null;onApply:(search:Search,pricedCommerce:Commerce)=>void|string}){
 const [error,setError]=useState('');
 const pricedCommerce=useMemo(()=>withDemoNearbyDate(commerce,owner),[commerce,owner]);
 const offers=useMemo(()=>nearbyDateOffers(pricedCommerce,owner),[pricedCommerce,owner]);
 const selectedDate=offers.find(offer=>offer.selected)?.search.checkIn;
 const revealSelected=useCallback((viewport:HTMLElement)=>{
  const selected=viewport.querySelector<HTMLElement>('[aria-pressed="true"]');
  const track=selected?.parentElement;
  if(!selected||!track)return;
  const previous=selected.previousElementSibling;
  const firstVisible=previous?.previousElementSibling?previous:selected;
  const inset=parseFloat(getComputedStyle(track).paddingLeft);
  viewport.scrollLeft+=firstVisible.getBoundingClientRect().left-viewport.getBoundingClientRect().left-inset;
 },[selectedDate]);
 if(!offers.length)return null;
 return <section className="desktop-nearby-dates" aria-label="Цены на соседние даты">
  <header><h2>Цены на соседние даты</h2><p>За {nights(commerce.draft!.search)} ноч. · {guestLabel(commerce.draft!.search)}</p></header>
  <DesktopCarouselNavigation className="desktop-nearby-dates-slider" previousLabel="Предыдущие даты" nextLabel="Следующие даты" itemCount={offers.length} onResize={revealSelected} scrollStep={nearbyDatesPageWidth}>
  <Carousel ariaLabel="Соседние даты проживания" className="desktop-nearby-dates-carousel" contentClassName="desktop-nearby-dates-track">
   {offers.map(offer=><button type="button" key={offer.search.checkIn} className="desktop-nearby-date" disabled={offer.priceMinor===null} aria-pressed={offer.selected} onClick={()=>{if(!offer.selected)setError(onApply(offer.search,pricedCommerce)||'');}}>
    <span className="desktop-nearby-date-label">{dateLabel(offer.search)}</span>
    <strong>{offer.priceMinor===null?'Нет номеров':`от ${formatMoney(offer.priceMinor)}`}</strong>
    {offer.selected?<StatusBadge className="desktop-nearby-date-badge" tone="info" icon={null}>Ваши даты</StatusBadge>:offer.cheaper?<StatusBadge className="desktop-nearby-date-badge" tone="success" icon={null}>Дешевле</StatusBadge>:null}
   </button>)}
  </Carousel>
  </DesktopCarouselNavigation>
  {error&&<p className="field-error" role="alert">{error}</p>}
 </section>;
}

function nearbyDatesPageWidth(viewport:HTMLElement){
 const track=viewport.querySelector<HTMLElement>('.desktop-nearby-dates-track');
 const card=track?.firstElementChild;
 if(!track||!card)return viewport.clientWidth;
 const styles=getComputedStyle(track);
 const gap=parseFloat(styles.columnGap);
 const stride=card.getBoundingClientRect().width+gap;
 const visibleWidth=track.clientWidth-parseFloat(styles.paddingLeft)-parseFloat(styles.paddingRight);
 return Math.max(1,Math.floor((visibleWidth+gap+1)/stride))*stride;
}
