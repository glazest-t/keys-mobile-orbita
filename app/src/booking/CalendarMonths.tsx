import {memo,useLayoutEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {MobileScroll} from '../mobile';
import {IconButton} from '../ui';
import './calendar-months.css';

const monthLabel=new Intl.DateTimeFormat('ru-RU',{month:'long',year:'numeric'});
const MonthSection=memo(function MonthSection({month,visible,renderMonth}:{month:Date;visible:boolean;renderMonth:(month:Date)=>ReactNode}){
 const label=monthLabel.format(month).replace(' г.','');
 // Keep placeholder geometry equal to calendar-months.css: 24px weekdays + 44px per week.
 const rows=Math.ceil(((month.getDay()+6)%7+new Date(month.getFullYear(),month.getMonth()+1,0).getDate())/7);
 return <section className="calendar-month-section" aria-label={label}>
  <h3>{label}</h3>
  {visible?renderMonth(month):<div className="calendar-grid-placeholder" aria-hidden="true" style={{height:24+rows*44}}/>}
 </section>;
});

/** Reuses the phone's swipe physics and drag-click suppression. */
export function CalendarMonths({initialMonth,renderMonth}:{initialMonth:Date;renderMonth:(month:Date)=>ReactNode}){
 const [start]=useState(()=>{const now=new Date();return new Date(now.getFullYear(),now.getMonth(),1);});
 const [initialIndex]=useState(()=>Math.max(0,(initialMonth.getFullYear()-start.getFullYear())*12+initialMonth.getMonth()-start.getMonth()));
 const [count,setCount]=useState(initialIndex+24),[active,setActive]=useState(initialIndex);
 const host=useRef<HTMLDivElement>(null),initialized=useRef(false),offsets=useRef<number[]>([]);
 const months=useMemo(()=>Array.from({length:count},(_,index)=>new Date(start.getFullYear(),start.getMonth()+index,1)),[start,count]);
 useLayoutEffect(()=>{
  const root=host.current,scroller=root?.querySelector<HTMLElement>('.mobile-scroll');
  if(!root||!scroller)return;
  const items=Array.from(scroller.querySelectorAll<HTMLElement>('.calendar-month-section'));
  let frame=0;
  const measure=()=>{
   const first=items[initialIndex],next=items[initialIndex+1];
   if(!first?.offsetHeight||!next?.offsetHeight)return;
   offsets.current=items.map(item=>item.offsetTop);
   const height=`${next.offsetTop-first.offsetTop+next.offsetHeight/2}px`;
   if(root.style.getPropertyValue('--calendar-window')!==height)root.style.setProperty('--calendar-window',height);
   if(!initialized.current){scroller.scrollTop=first.offsetTop;initialized.current=true;}
  };
  const onScroll=()=>{
   if(frame)return;
   frame=requestAnimationFrame(()=>{
    frame=0;
    const top=scroller.scrollTop;
    // Cached geometry: no forced layout for every month during pointer/scroll events.
    const index=offsets.current.reduce((current,offset,i)=>offset<=top+8?i:current,0);
    setActive(current=>current===index?current:index);
    if(scroller.scrollHeight-top-scroller.clientHeight<scroller.clientHeight)setCount(current=>Math.max(current,count+12));
   });
  };
  const resize=new ResizeObserver(measure);
  resize.observe(root);
  const first=items[initialIndex];if(first)resize.observe(first);
  measure();scroller.addEventListener('scroll',onScroll,{passive:true});
  return()=>{cancelAnimationFrame(frame);resize.disconnect();scroller.removeEventListener('scroll',onScroll);};
 },[initialIndex,count]);
 function move(direction:number){
  const scroller=host.current?.querySelector<HTMLElement>('.mobile-scroll');
  const top=offsets.current[Math.max(0,active+direction)];
  if(scroller&&top!==undefined)scroller.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 }
 return <div className="calendar-month-browser">
  <div className="calendar-heading"><IconButton name="back" label="Предыдущий месяц" disabled={active===0} onClick={()=>move(-1)}/><IconButton name="back" label="Следующий месяц" onClick={()=>move(1)}/></div>
  {/* Only isolate drag start from an outer MobileScroll. Move/up/cancel must reach the phone cursor. */}
  <div className="calendar-month-window" ref={host} role="region" aria-label="Месяцы календаря" onPointerDown={event=>{if(event.currentTarget.parentElement?.closest('.mobile-scroll'))event.stopPropagation();}}>
   <MobileScroll className="calendar-month-scroll">
    {months.map((month,index)=><MonthSection key={month.getTime()} month={month} visible={index>=active-1&&index<=active+3} renderMonth={renderMonth}/>)}
   </MobileScroll>
  </div>
 </div>;
}
