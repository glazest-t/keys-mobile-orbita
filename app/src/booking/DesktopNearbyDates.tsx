import {useLayoutEffect,useMemo,useRef,useState} from 'react';
import {Carousel} from '../mobile';
import {Icon,StatusBadge} from '../ui';
import {dateLabel,formatMoney,guestLabel,nights,type Commerce,type Search} from './model';
import {nearbyDateOffers,withDemoNearbyDate} from './nearbyDates';

export function DesktopNearbyDates({commerce,owner,onApply}:{commerce:Commerce;owner:string|null;onApply:(search:Search,pricedCommerce:Commerce)=>void|string}){
 const [error,setError]=useState('');
 const [edges,setEdges]=useState({start:true,end:false});
 const sectionRef=useRef<HTMLElement>(null);
 const pricedCommerce=useMemo(()=>withDemoNearbyDate(commerce,owner),[commerce,owner]);
 const offers=useMemo(()=>nearbyDateOffers(pricedCommerce,owner),[pricedCommerce,owner]);
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
  const update=()=>setEdges({start:viewport.scrollLeft<=2,end:viewport.scrollLeft+viewport.clientWidth>=viewport.scrollWidth-2});
  const resize=()=>{reveal();update();};
  resize();viewport.addEventListener('scroll',update,{passive:true});
  const observer=new ResizeObserver(resize);
  observer.observe(viewport);
  return ()=>{observer.disconnect();viewport.removeEventListener('scroll',update);};
 },[selectedDate]);
 const move=(direction:number)=>{const viewport=sectionRef.current?.querySelector<HTMLElement>('.desktop-nearby-dates-carousel');if(viewport)viewport.scrollBy({left:direction*(viewport.clientWidth+10),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 if(!offers.length)return null;
 return <section ref={sectionRef} className="desktop-nearby-dates" aria-label="Цены на соседние даты">
  <header><h2>Цены на соседние даты</h2><p>За {nights(commerce.draft!.search)} ноч. · {guestLabel(commerce.draft!.search)}</p></header>
  <div className="desktop-nearby-dates-slider">
  <Carousel ariaLabel="Соседние даты проживания" className="desktop-nearby-dates-carousel" contentClassName="desktop-nearby-dates-track">
   {offers.map(offer=><button type="button" key={offer.search.checkIn} className="desktop-nearby-date" disabled={offer.priceMinor===null} aria-pressed={offer.selected} onClick={()=>{if(!offer.selected)setError(onApply(offer.search,pricedCommerce)||'');}}>
    <span className="desktop-nearby-date-label">{dateLabel(offer.search)}</span>
    <strong>{offer.priceMinor===null?'Нет номеров':`от ${formatMoney(offer.priceMinor)}`}</strong>
    {offer.selected?<StatusBadge className="desktop-nearby-date-badge" tone="info" icon={null}>Ваши даты</StatusBadge>:offer.cheaper?<StatusBadge className="desktop-nearby-date-badge" tone="success" icon={null}>Дешевле</StatusBadge>:null}
   </button>)}
  </Carousel>
   <div className="desktop-nearby-date-controls">
    <div className="desktop-nearby-date-edge previous"><button type="button" className="k-icon-button" aria-label="Предыдущие даты" disabled={edges.start} onClick={()=>move(-1)}><Icon name="back" size={20} inheritColor/></button></div>
    <div className="desktop-nearby-date-edge next"><button type="button" className="k-icon-button" aria-label="Следующие даты" disabled={edges.end} onClick={()=>move(1)}><Icon name="back" size={20} inheritColor/></button></div>
   </div>
  </div>
  {error&&<p className="field-error" role="alert">{error}</p>}
 </section>;
}
