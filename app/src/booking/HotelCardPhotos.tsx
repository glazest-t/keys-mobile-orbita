import {useState} from 'react';
import {Carousel} from '../mobile';

/** Uses the shared carousel's gesture arbitration and drag-click suppression. */
export function HotelCardPhotos({name,photos,onOpen}:{name:string;photos:string[];onOpen:()=>void}){
 const [active,setActive]=useState(0);
 return <div className="hotel-card-photos" onScrollCapture={event=>{
  const scroller=event.target as HTMLElement;
  if(scroller.classList.contains('mobile-carousel')&&scroller.clientWidth)
   setActive(Math.max(0,Math.min(photos.length-1,Math.round(scroller.scrollLeft/scroller.clientWidth))));
 }} onKeyDown={event=>{
  if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
  const scroller=event.currentTarget.querySelector<HTMLElement>('.mobile-carousel');
  if(!scroller)return;
  event.preventDefault();
  scroller.scrollTo({left:Math.max(0,Math.min(photos.length-1,active+(event.key==='ArrowRight'?1:-1)))*scroller.clientWidth});
 }}>
  <Carousel ariaLabel={`Фотографии: ${name}`} className="hotel-photo-carousel" contentClassName="hotel-photo-track">
   {photos.map((src,index)=><button key={src} className="photo-open" tabIndex={index===active?0:-1} onClick={onOpen} aria-label={`Посмотреть ${name} · фото ${index+1} из ${photos.length}`}><img src={src} alt={`${name} · фото ${index+1}`} draggable={false}/></button>)}
  </Carousel>
  <span className="photo-counter" aria-live="polite" aria-atomic="true">{active+1} / {photos.length}</span>
 </div>;
}
