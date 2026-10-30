import * as Dialog from '@radix-ui/react-dialog';
import {Children,useEffect,useRef,useState,type ComponentProps,type CSSProperties,type ReactNode,type UIEventHandler,type PointerEvent as ReactPointerEvent} from 'react';
import {animate,AnimatePresence, motion, useIsPresent, useMotionValue,useTransform,useReducedMotion} from 'motion/react';
import './interactions.css';
import {useScreenPortal} from './mobile';

/** Circular choices: one pair of soft water rings per committed tap (not a drag). */
export function WaterRippleButton({children,onClick,className='',...props}:ComponentProps<'button'>){
 const [pulse,setPulse]=useState(0);
 return <button {...props} className={`k-water-button ${className}`} onClick={event=>{setPulse(n=>n+1);onClick?.(event);}}>
  {children}{pulse>0&&<span key={pulse} className="k-water-ripples" aria-hidden="true"><i/><i/></span>}
 </button>;
}

export const interactionMotion = {
 authBrandMs: 200,
 authCheckMs: 900,
 authSuccessMs: 420,
 successHoldMs: 1500,
 paymentWaitMs: 800,
 chatReplyMs: 1200,
 wifiConnectingMs: 1200,
 keyOpeningMs: 1100,
 keySuccessHoldMs: 3000,
 points: 1.4,
 bubbleAppear: .52,
 bubbleStagger: .045,
 bubbleOrbit: 1.1,
 orbit: [.65,0,.35,1] as const,
 tab: .2,
 toast: .3,
 push: .46,
 pop: .38,
 iosPush: [.32,.72,0,1] as const,
 arrive: [.2, .8, .2, 1] as const,
} as const;

/** One gentle orbit-inspired arrival; image load cannot consume the animation offscreen. */
export function OrbitIllustrationReveal({src,alt,className='',active=true}:{src:string;alt:string;className?:string;active?:boolean}){
 const reduced=useReducedMotion(),[ready,setReady]=useState(false);
 return <div className={className}><motion.img src={src} alt={alt} draggable={false} onLoad={()=>setReady(true)}
  initial={false} animate={!ready||!active?{opacity:0,x:-8,y:24,rotate:-4,scale:.94}:reduced?{opacity:1,x:0,y:0,rotate:0,scale:1}:{opacity:[0,1,1,1],x:[-8,3,-1,0],y:[24,-6,2,0],rotate:[-4,1.5,-.5,0],scale:[.94,1.015,.995,1]}}
  transition={{duration:reduced||!active?0:interactionMotion.bubbleOrbit,ease:interactionMotion.orbit,times:[0,.55,.8,1]}}/>
 </div>;
}

/** Compact choices rise like bubbles, then orbit together before navigation. */
export function BubbleOrbit({children,departing,onDeparted}:{children:ReactNode;departing:boolean;onDeparted:()=>void}){
 const reduced=useReducedMotion(),finished=useRef(false),callback=useRef(onDeparted);
 callback.current=onDeparted;
 const finish=()=>{if(finished.current)return;finished.current=true;callback.current();};
 return <motion.div className="swipe-preferences-cloud" role="group" aria-label="Варианты отдыха" inert={departing}
  initial={false} animate={departing?'depart':'ready'}
  variants={{ready:{rotate:0,scale:1,opacity:1},depart:reduced?{opacity:0}:{rotate:[0,0,85,160],scale:[1,.72,.5,.28],opacity:[1,1,1,0]}}}
  transition={{duration:reduced?interactionMotion.tab:interactionMotion.bubbleOrbit,ease:interactionMotion.orbit,times:[0,.2,.7,1]}}
  onAnimationComplete={phase=>{if(phase==='depart')finish();}}>
  {Children.toArray(children).map((child,index)=><motion.div key={index} className="orbit-bubble-item"
   initial={reduced?{opacity:0}:{opacity:0,scale:.65,y:28}}
   animate={departing?(reduced?{opacity:0}:{opacity:1,scale:1,y:0,rotate:[0,0,-85,-160]}):{opacity:1,scale:1,y:0,rotate:0}}
   transition={departing?{duration:reduced?interactionMotion.tab:interactionMotion.bubbleOrbit,ease:interactionMotion.orbit,times:[0,.2,.7,1]}:{duration:reduced?interactionMotion.tab:interactionMotion.bubbleAppear,delay:reduced?0:index*interactionMotion.bubbleStagger,ease:interactionMotion.arrive}}>
    {child}
  </motion.div>)}
 </motion.div>;
}

// Browser focus may scroll the clipped phone portal to reveal an offscreen control.
// Only pages/sheets should scroll; keep device chrome and the hidden keyboard aligned.
export function useAppViewportGuard(){
 const {screenRef}=useScreenPortal();
 useEffect(()=>{
  const screen=screenRef.current;if(!screen)return;
  const reset=()=>{if(screen.scrollTop||screen.scrollLeft)screen.scrollTo({top:0,left:0,behavior:'instant'});};
  reset();screen.addEventListener('scroll',reset);
  return()=>screen.removeEventListener('scroll',reset);
 },[screenRef]);
}

// UI Kit 09: one orbital pass and a counter, with no financial side effects.
export function PointsBalance({value,children,className=''}:{value:number;children:ReactNode;className?:string}){
 const reduced=useReducedMotion(),count=useMotionValue(reduced?value:0);
 const formatted=useTransform(count,n=>Math.round(n).toLocaleString('ru-RU'));
 useEffect(()=>{
  if(reduced){count.set(value);return;}
  const animation=animate(count,value,{duration:interactionMotion.points,ease:interactionMotion.orbit});
  return ()=>animation.stop();
 },[value,reduced,count]);
 return <div className={`points-balance ${className}`} role="img" aria-label={`${value.toLocaleString('ru-RU')} баллов на счёте «Ключей»`} style={{'--points-duration':`${interactionMotion.points}s`,'--points-ease':`cubic-bezier(${interactionMotion.orbit.join(',')})`} as CSSProperties}>
  {children}<span className="points-balance-value" aria-hidden="true"><motion.strong>{reduced?value.toLocaleString('ru-RU'):formatted}</motion.strong><small>баллов</small></span>
 </div>;
}

export function ExpandingMap({open,origin,children,onClose}:{open:boolean;origin:string;children:ReactNode;onClose?:()=>void}){
 const reduced=useReducedMotion();

 return <AnimatePresence>{open&&<motion.div className="map-transition-layer"
  initial={reduced?{opacity:0}:{clipPath:origin}} animate={{opacity:1,clipPath:'inset(0px 0px 0px 0px round 0px)'}}
  exit={reduced?{opacity:0,transition:{duration:interactionMotion.tab}}:{clipPath:origin,transition:{duration:interactionMotion.pop,ease:interactionMotion.iosPush}}}
  transition={{duration:reduced?interactionMotion.tab:interactionMotion.push,ease:interactionMotion.iosPush}}>{children}</motion.div>}</AnimatePresence>;
}



/** nc4/nc5: a single idea leaves the deck; common Orbit timing, no motion when reduced. */
export function IdeaCardChange({id,direction,children,onReady}:{id:string;direction:number;children:ReactNode;onReady:()=>void}){
 const reduced=useReducedMotion();
 return <AnimatePresence initial={false} mode="wait" custom={direction}>
  <motion.article key={id} className="preference-idea-card" custom={direction}
   initial={{opacity:0,x:reduced?0:24,y:reduced?0:8}} animate="ready" onAnimationComplete={definition=>{if(definition==='ready')onReady();}}
   variants={{ready:{opacity:1,x:0,y:0,rotate:0},exit:(side:number)=>({opacity:0,x:reduced?0:side*100,rotate:reduced?0:side*8})}} exit="exit"
   transition={{duration:reduced?interactionMotion.tab:interactionMotion.pop,ease:interactionMotion.orbit}}>{children}</motion.article>
 </AnimatePresence>;
}

export type SwipeDecision='like'|'skip'|null;
export function SwipeCardTransition({decision,width,onComplete,onSwipeUp,onScrollCapture,children}:{decision:SwipeDecision;width:number;onComplete:()=>void;onSwipeUp:()=>void;onScrollCapture?:UIEventHandler<HTMLElement>;children:ReactNode}){
 const reduced=useReducedMotion();
 const gesture=useRef<{id:number;x:number;y:number;time:number;axis:'x'|'y'|null}|null>(null),suppressClick=useRef(false);
 const start=(event:ReactPointerEvent<HTMLElement>)=>{
  if(decision||!event.isPrimary||event.button!==0)return;
  suppressClick.current=false;
  const control=(event.target as HTMLElement).closest('button,a,input');
  if(control&&!control.classList.contains('swipe-media-tap'))return;
  gesture.current={id:event.pointerId,x:event.clientX,y:event.clientY,time:event.timeStamp,axis:null};
 };
 const move=(event:ReactPointerEvent<HTMLElement>)=>{
  const g=gesture.current;if(!g||g.id!==event.pointerId)return;
  const x=event.clientX-g.x,y=event.clientY-g.y;
  if(!g.axis&&Math.max(Math.abs(x),Math.abs(y))>=10){
   g.axis=Math.abs(y)>Math.abs(x)?'y':'x';
   if(g.axis==='y')event.currentTarget.setPointerCapture(event.pointerId);
  }
  // Horizontal gestures remain owned by Carousel, including its click suppression.
  if(g.axis==='y'){suppressClick.current=true;event.preventDefault();}
 };
 const finish=(event:ReactPointerEvent<HTMLElement>)=>{
  const g=gesture.current;if(!g||g.id!==event.pointerId)return;
  gesture.current=null;
  if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  if(g.axis!=='y')return;
  event.preventDefault();
  const distance=g.y-event.clientY,speed=distance/Math.max(1,event.timeStamp-g.time);
  if(event.type!=='pointercancel'&&(distance>=56||(distance>=24&&speed>.45)))onSwipeUp();
 };
 const exit=(side:number)=>reduced?{opacity:0}:{x:side*width*1.2,y:28,rotate:side*18,opacity:0};
 return <motion.article className="swipe-source-card" initial={false} animate={decision||'ready'}
  variants={{ready:{x:0,y:0,rotate:0,opacity:1},like:exit(1),skip:exit(-1)}}
  transition={{duration:reduced?interactionMotion.tab:interactionMotion.pop,ease:interactionMotion.orbit}}
  onAnimationComplete={state=>{if(decision&&state===decision)onComplete();}}
  inert={!!decision} onScrollCapture={onScrollCapture}
  onPointerDownCapture={start} onPointerMoveCapture={move} onPointerUpCapture={finish} onPointerCancelCapture={finish}
  onClickCapture={event=>{if(suppressClick.current){suppressClick.current=false;event.preventDefault();event.stopPropagation();}}}
  style={{transformOrigin:'50% 85%',touchAction:'none',userSelect:'none'}}>{children}</motion.article>;
}
export function SwipeStackPreview({revealing,children}:{revealing:boolean;children:ReactNode}){
 const reduced=useReducedMotion();
 return <motion.div className="swipe-back-card" aria-hidden="true" initial={false}
  animate={{y:reduced?0:revealing?0:14,scale:reduced?1:revealing?1:.94,opacity:revealing?1:.5}}
  transition={{duration:reduced?interactionMotion.tab:interactionMotion.pop,ease:interactionMotion.orbit}}>{children}</motion.div>;
}

function TabPage({children}:{children:ReactNode}) {
 const present=useIsPresent();
 return <motion.div className="tab-page" data-current={present} inert={!present} aria-hidden={!present}
  initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
  transition={{duration:interactionMotion.tab,ease:[.25,.1,.25,1]}}>{children}</motion.div>;
}

export function TabContent({route,children}:{route:string;children:ReactNode}) {
 return <div className="tab-content"><AnimatePresence initial={false}>
  <TabPage key={route}>{children}</TabPage>
 </AnimatePresence></div>;
}

export function Toast({message,bottom}:{message:string;bottom:number}) {
 const reduced=useReducedMotion();
 return <AnimatePresence>{message&&<motion.div key={message} className="toast" role="status" style={{bottom}}
  initial={{opacity:0,y:reduced?0:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reduced?0:16}}
  transition={{duration:reduced?.2:interactionMotion.toast,ease:interactionMotion.arrive}}>{message}</motion.div>}</AnimatePresence>;
}
