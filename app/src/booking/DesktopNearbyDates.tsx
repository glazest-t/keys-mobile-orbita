import {useLayoutEffect,useMemo,useRef,useState} from 'react';
import {Carousel} from '../mobile';
import {Icon} from '../ui';
import {dateLabel,formatMoney,guestLabel,nights,type Commerce,type Search} from './model';
import {nearbyDateOffers} from './nearbyDates';

export function DesktopNearbyDates({commerce,owner,onApply}:{commerce:Commerce;owner:string|null;onApply:(search:Search)=>void|string}){
 const [error,setError]=useState('');
 const sectionRef=useRef<HTMLElement>(null);
 const offers=useMemo(()=>nearbyDateOffers(commerce,owner),[commerce,owner]);
 const selectedDate=offers.find(offer=>offer.selected)?.search.checkIn;
 useLayoutEffect(()=>{
  const viewport=sectionRef.current?.querySelector<HTMLElement>('.desktop-nearby-dates-carousel');
  const selected=viewport?.querySelector<HTMLElement>('[aria-pressed="true"]');
  if(!viewport||!selected)return;
  const reveal=()=>{
   const track=selected.parentElement!;
   const inset=parseFloat(getComputedStyle(track).paddingLeft);
   const stride=selected.getBoundingClientRect().width+parseFloat(getComputedStyle(track).columnGap);
   viewport.scrollLeft+=selected.getBoundingClientRect().left-viewport.getBoundingClientRect().left-inset-stride;
  };
  reveal();
  const observer=new ResizeObserver(reveal);
  observer.observe(viewport);
  return ()=>observer.disconnect();
 },[selectedDate]);
 if(!offers.length)return null;
 return <section ref={sectionRef} className="desktop-nearby-dates" aria-label="Цены на соседние даты">
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
