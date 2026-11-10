import {useLayoutEffect,useRef} from 'react';
import {usePrototypeVariant} from './usePrototypeVariant';
import './prototype-edition-notice.css';

export const FULL_EDITION_NOTICE='Внимание, вы открыли полную версию, которая будет реализована только в марте.';

export function PrototypeEditionNotice(){
 const full=usePrototypeVariant()==='full',ref=useRef<HTMLDivElement>(null);
 useLayoutEffect(()=>{
  const element=ref.current;
  if(!full||!element)return;
  const measure=()=>document.documentElement.style.setProperty('--prototype-notice-height',`${element.offsetHeight}px`);
  measure();const observer=new ResizeObserver(measure);observer.observe(element);
  return()=>{observer.disconnect();document.documentElement.style.removeProperty('--prototype-notice-height');};
 },[full]);
 return full?<div ref={ref} className="prototype-edition-notice" role="note" aria-label="Полная версия прототипа">{FULL_EDITION_NOTICE}</div>:null;
}
