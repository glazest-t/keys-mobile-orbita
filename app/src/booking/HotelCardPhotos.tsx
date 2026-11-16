import {useEffect,useRef,useState} from 'react';
import {Carousel} from '../mobile';
import {IconButton} from '../ui';

/** Uses the shared carousel's gesture arbitration and drag-click suppression. */
export function HotelCardPhotos({name,photos,onOpen,showArrows=false,photoIndex=0,transientCounter=false,allowPhotoDrag=true}:{
 name:string;photos:string[];onOpen:(index:number)=>void;showArrows?:boolean;photoIndex?:number;transientCounter?:boolean;allowPhotoDrag?:boolean;
}){
 const root=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(0);
 const [scrolling,setScrolling]=useState(false);
 const scrollTimer=useRef<number|undefined>(undefined);
 useEffect(()=>()=>window.clearTimeout(scrollTimer.current),[]);
 const scroller=()=>root.current?.querySelector<HTMLElement>('.hotel-photo-carousel');
 const showCounter=()=>{
  if(!transientCounter||photos.length<2)return;
  setScrolling(true);
  window.clearTimeout(scrollTimer.current);
  scrollTimer.current=window.setTimeout(()=>setScrolling(false),450);
 };
 const navigate=(direction:number)=>{
  const track=scroller();
  const index=Math.max(0,Math.min(photos.length-1,active+direction));
  if(track)track.scrollTo({left:index*track.clientWidth,behavior:'instant'});
  else if(index!==active){
   setActive(index);
   showCounter();
  }
 };
 useEffect(()=>{
  const track=root.current?.querySelector<HTMLElement>('.hotel-photo-carousel');
  if(!allowPhotoDrag)setActive(photoIndex);
  if(track&&Math.round(track.scrollLeft/track.clientWidth)!==photoIndex)
   track.scrollTo({left:photoIndex*track.clientWidth,behavior:'instant'});
 },[allowPhotoDrag,photoIndex]);
 return <div ref={root} className="hotel-card-photos" data-counter-on-scroll={transientCounter||undefined} data-photo-scrolling={scrolling||undefined} onScrollCapture={event=>{
  const track=event.target as HTMLElement;
  if(!track.classList.contains('hotel-photo-carousel')||!track.clientWidth)return;
  setActive(Math.max(0,Math.min(photos.length-1,Math.round(track.scrollLeft/track.clientWidth))));
  showCounter();
 }}
 onKeyDown={event=>{
  if(!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();
  navigate(event.key==='ArrowRight'?1:-1);
 }}>
  {allowPhotoDrag?<Carousel ariaLabel={`Фотографии: ${name}`} className="hotel-photo-carousel" contentClassName="hotel-photo-track">
   {photos.map((src,index)=><button type="button" key={src} className="photo-open" tabIndex={index===active?0:-1} onClick={()=>onOpen(index)} aria-label={`Посмотреть ${name} · фото ${index+1} из ${photos.length}`}><img src={src} alt={`${name} · фото ${index+1}`} draggable={false}/></button>)}
  </Carousel>:<button type="button" className="photo-open" onClick={()=>onOpen(active)} aria-label={`Посмотреть ${name} · фото ${active+1} из ${photos.length}`}>
   <img src={photos[active]} alt={`${name} · фото ${active+1}`} draggable={false}/>
  </button>}
  {showArrows&&photos.length>1&&<div className="hotel-card-photo-arrows">
   <IconButton name="back" label={`Предыдущее фото: ${name}`} disabled={active===0} onClick={()=>navigate(-1)}/>
   <IconButton name="chevron-right" label={`Следующее фото: ${name}`} disabled={active===photos.length-1} onClick={()=>navigate(1)}/>
  </div>}
  {(!showArrows||photos.length>1)&&<span className="photo-counter" aria-live="polite" aria-atomic="true">{active+1} / {photos.length}</span>}
 </div>;
}
