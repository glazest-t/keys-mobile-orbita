import {useEffect,useRef,useState,type Dispatch,type SetStateAction} from 'react';
import {interactionMotion} from '../interactions';
import type {Commerce} from './model';
import {prepareDoorAttempt,finishDoorAttempt,type DoorAttempt} from './doorAttempt';
export function useDoorAction(commerce:Commerce,setCommerce:Dispatch<SetStateAction<Commerce>>,actor:string|undefined,route:string,onError:(text:string)=>void){
 const [pending,setPending]=useState<DoorAttempt|null>(null),[opened,setOpened]=useState<DoorAttempt|null>(null),[failure,setFailure]=useState<{bookingId:string;message:string}|null>(null),lock=useRef(false);
 const latest=useRef({commerce,actor,onError,setCommerce});latest.current={commerce,actor,onError,setCommerce};
 useEffect(()=>{
  if(!pending)return;
  if(route!=='trips'||actor!==pending.actor||commerce.selectedBooking!==pending.bookingId){lock.current=false;setPending(null);return;}
  const timer=setTimeout(()=>{const current=latest.current;try{current.setCommerce(finishDoorAttempt(current.commerce,pending,current.actor||''));setOpened(pending);}catch(e){setFailure({bookingId:pending.bookingId,message:pending.outcome==='failure'&&(e as Error).message==='Не удалось связаться с замком'?'Поднесите телефон к замку и попробуйте снова.':(e as Error).message});}finally{lock.current=false;setPending(null);}},interactionMotion.keyOpeningMs);
  return()=>clearTimeout(timer);
 },[pending,route,actor,commerce.selectedBooking]);
 useEffect(()=>{if(!opened)return;const timer=setTimeout(()=>setOpened(null),interactionMotion.keySuccessHoldMs);return()=>clearTimeout(timer);},[opened]);
 useEffect(()=>{lock.current=false;setPending(null);setOpened(null);setFailure(null);},[route,actor]);
 const open=(bookingId:string,outcome:DoorAttempt['outcome'])=>{
  if(lock.current||opened?.bookingId===bookingId)return false;
  try{const attempt=prepareDoorAttempt(commerce,actor||'',bookingId,crypto.randomUUID(),outcome);lock.current=true;setFailure(null);setPending(attempt);return true;}catch(e){onError((e as Error).message);return false;}
 };
 return {open,failure,dismissFailure:()=>setFailure(null),pendingId:pending?.bookingId,openedId:opened?.bookingId};
}
