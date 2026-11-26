import {useLayoutEffect,useRef,useState,type PropsWithChildren} from 'react';
import {Icon} from '../ui';

export function DesktopCarouselNavigation({
 children,previousLabel,nextLabel,itemCount,className='',hideUnavailable=false,onResize,scrollStep,
}:PropsWithChildren<{
 previousLabel:string;
 nextLabel:string;
 itemCount:number;
 className?:string;
 hideUnavailable?:boolean;
 onResize?:(viewport:HTMLElement)=>void;
 scrollStep?:(viewport:HTMLElement)=>number;
}>) {
 const host=useRef<HTMLDivElement>(null);
 const viewport=useRef<HTMLElement|null>(null);
 const previous=useRef<HTMLButtonElement>(null);
 const next=useRef<HTMLButtonElement>(null);
 const focusAfterUpdate=useRef<'previous'|'next'|null>(null);
 const [edges,setEdges]=useState({start:true,end:hideUnavailable});

 useLayoutEffect(()=>{
  const rail=host.current?.querySelector<HTMLElement>('.mobile-carousel');
  if(!rail)return;
  viewport.current=rail;

  const update=()=>{
   const start=rail.scrollLeft<=2;
   const end=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-2;
   if(hideUnavailable){
    if(start&&document.activeElement===previous.current)focusAfterUpdate.current='next';
    if(end&&document.activeElement===next.current)focusAfterUpdate.current='previous';
   }
   setEdges(current=>current.start===start&&current.end===end?current:{start,end});
  };
  const resize=()=>{onResize?.(rail);update();};
  resize();
  rail.addEventListener('scroll',update,{passive:true});
  const observer=new ResizeObserver(resize);
  observer.observe(rail);
  return ()=>{
   observer.disconnect();
   rail.removeEventListener('scroll',update);
   viewport.current=null;
  };
 },[hideUnavailable,itemCount,onResize]);

 useLayoutEffect(()=>{
  const target=focusAfterUpdate.current;
  if(!target)return;
  focusAfterUpdate.current=null;
  const button=target==='previous'?previous.current:next.current;
  (button??viewport.current?.querySelector('button'))?.focus({preventScroll:true});
 },[edges]);

 const move=(direction:number)=>{
  const rail=viewport.current;
  if(!rail)return;
  const step=scrollStep?.(rail)??rail.clientWidth;
  const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
  rail.scrollBy({left:direction*step,behavior:reducedMotion?'auto':'smooth'});
 };

 return <div ref={host} className={'desktop-carousel-navigation '+className}>
  {children}
  <div className="desktop-carousel-controls">
   {(!hideUnavailable||!edges.start)&&<div className="desktop-carousel-edge previous">
    <button ref={previous} type="button" className="k-icon-button" aria-label={previousLabel} disabled={edges.start} onClick={()=>move(-1)}><Icon name="back" size={20} inheritColor/></button>
   </div>}
   {(!hideUnavailable||!edges.end)&&<div className="desktop-carousel-edge next">
    <button ref={next} type="button" className="k-icon-button" aria-label={nextLabel} disabled={edges.end} onClick={()=>move(1)}><Icon name="back" size={20} inheritColor/></button>
   </div>}
  </div>
 </div>;
}
