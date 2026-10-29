import {useEffect,useRef,useState} from 'react';
import {animate,useReducedMotion} from 'motion/react';
import {Carousel} from '../mobile';
import {interactionMotion} from '../interactions';

/** Tap areas live inside Carousel so a drag never becomes an extra tap. */
export function SwipeGallery({items,name,onChange}:{items:string[];name:string;onChange:(index:number)=>void}){
 const root=useRef<HTMLDivElement>(null),animation=useRef<{stop:()=>void}|null>(null),videos=useRef<(HTMLVideoElement|null)[]>([]);
 const [active,setActive]=useState(0),reduced=useReducedMotion();
 const stop=()=>{animation.current?.stop();animation.current=null;};
 useEffect(()=>()=>animation.current?.stop(),[]);
 useEffect(()=>{videos.current.forEach((video,i)=>{if(!video)return;if(i===active)void video.play().catch(()=>{});else video.pause();});},[active]);
 const page=(direction:number)=>{
  const scroller=root.current?.querySelector<HTMLElement>('.mobile-carousel');if(!scroller)return;
  stop();const next=Math.max(0,Math.min(items.length-1,Math.round(scroller.scrollLeft/scroller.clientWidth)+direction));
  const target=next*scroller.clientWidth;
  if(reduced){scroller.scrollLeft=target;return;}
  animation.current=animate(scroller.scrollLeft,target,{duration:interactionMotion.tab,ease:interactionMotion.orbit,onUpdate:value=>{scroller.scrollLeft=value;}});
 };
 return <div ref={root} className="swipe-gallery" onPointerDownCapture={stop} onScrollCapture={event=>{
  const el=event.target as HTMLElement;if(!el.classList.contains('mobile-carousel')||!el.clientWidth)return;
  const next=Math.max(0,Math.min(items.length-1,Math.round(el.scrollLeft/el.clientWidth)));setActive(next);onChange(next);
 }} onKeyDown={event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();page(event.key==='ArrowRight'?1:-1);}}}>
  <Carousel ariaLabel="Фотографии и видео отеля" contentClassName="swipe-photos" className="swipe-carousel">
   {items.map((src,i)=><div className="swipe-media" key={src} aria-hidden={i!==active}>
    {/\.(mp4|webm)(?:[?#]|$)/i.test(src)?<video ref={el=>{videos.current[i]=el;}} src={src} muted playsInline loop preload="metadata" aria-label={`${name} · видео ${i+1}`}/>:<img src={src} alt={`${name} · фото ${i+1}`} draggable={false}/>}
    <button type="button" className="swipe-media-tap previous" aria-label="Предыдущий кадр" aria-disabled={i===0} tabIndex={i===active?0:-1} onClick={()=>page(-1)}/>
    <button type="button" className="swipe-media-tap next" aria-label="Следующий кадр" aria-disabled={i===items.length-1} tabIndex={i===active?0:-1} onClick={()=>page(1)}/>
   </div>)}
  </Carousel>
 </div>;
}
