import {useLayoutEffect,useRef} from 'react';
import {useDrag} from '@use-gesture/react';
import {animate,motion,useMotionValue,useReducedMotion} from 'motion/react';
import {BottomSheet} from '../mobile';
import {IconButton} from '../ui';
import {isDesktop} from '../desktop/surface';
import './fullscreen-photo-gallery.css';

export function FullscreenPhotoGallery({title,photos,selected,onSelect,subject}:{
 title:string;
 photos:{src:string;label:string}[];
 selected:number|null;
 onSelect:(index:number|null)=>void;
 subject:'отеля'|'номера'|'удобства';
}){
 const photo=selected===null?undefined:photos[selected];
 const stage=useRef<HTMLDivElement>(null);
 const offset=useMotionValue(0);
 const animation=useRef<ReturnType<typeof animate>|null>(null);
 const reducedMotion=useReducedMotion();
 const canPage=photos.length>1;
 const adjacentIndex=(index:number,direction:number)=>(index+direction+photos.length)%photos.length;

 useLayoutEffect(()=>{
  offset.jump(0);
  return ()=>{
   animation.current?.stop();
   animation.current=null;
  };
 },[selected,offset]);

 const change=(direction:number)=>{
  if(selected===null||!canPage||animation.current)return;
  const next=adjacentIndex(selected,direction);
  const width=stage.current?.clientWidth;
  if(!width||reducedMotion){
   onSelect(next);
   return;
  }
  animation.current=animate(offset,-direction*width,{
   duration:.25,
   ease:'easeOut',
   onComplete:()=>onSelect(next),
  });
 };
 const bindSwipe=useDrag(({active,canceled,event,movement:[x],swipe:[direction]})=>{
  const width=stage.current?.clientWidth;
  const visibleWidth=stage.current?.getBoundingClientRect().width;
  if(!width||!visibleWidth||animation.current)return;
  if(active){
   const fraction=Math.max(-1,Math.min(1,x/visibleWidth));
   offset.set(fraction*width);
   return;
  }
  if(!canceled&&event.type!=='pointercancel'&&(direction||Math.abs(x)>=48)){
   change(x<0?1:-1);
   return;
  }
  if(reducedMotion||offset.get()===0){
   offset.jump(0);
   return;
  }
  animation.current=animate(offset,0,{
   duration:.2,
   ease:'easeOut',
   onComplete:()=>{animation.current=null;},
  });
 },{axis:'x',filterTaps:true,enabled:canPage});

 return <BottomSheet open={!!photo} onOpenChange={open=>{if(!open)onSelect(null);}} title={title} snap={1}>
  <div className="fullscreen-photo-gallery" onKeyDown={event=>{
   if(event.key!=='ArrowLeft'&&event.key!=='ArrowRight')return;
   event.preventDefault();
   change(event.key==='ArrowLeft'?-1:1);
  }}>
   <header className="fullscreen-photo-header">
    <IconButton name="back" inheritColor label="Закрыть галерею" onClick={()=>onSelect(null)}/>
    {selected!==null&&<span aria-live="polite" aria-atomic="true">{selected+1} из {photos.length}</span>}
   </header>
   {photo&&selected!==null&&<div className="fullscreen-photo-stage" ref={stage} {...bindSwipe()}>
    <motion.div className="fullscreen-photo-track" style={{x:offset}}>
     {canPage&&<img className="fullscreen-photo-previous" src={photos[adjacentIndex(selected,-1)].src} alt="" draggable={false}/>}
     <img src={photo.src} alt={photo.label} draggable={false}/>
     {canPage&&<img className="fullscreen-photo-next" src={photos[adjacentIndex(selected,1)].src} alt="" draggable={false}/>}
    </motion.div>
    {isDesktop&&canPage&&<>
     <IconButton name="chevron-right" mirrored label={`Предыдущее фото ${subject}`} onClick={()=>change(-1)}/>
     <IconButton name="chevron-right" label={`Следующее фото ${subject}`} onClick={()=>change(1)}/>
    </>}
   </div>}
  </div>
 </BottomSheet>;
}
