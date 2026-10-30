import {useEffect,useState,type Dispatch,type SetStateAction} from 'react';
import {BottomSheet} from '../mobile';
import {SwipePreferences} from './SwipeWelcome';
import {applySwipePreferences} from './swipePreferences';
import {type Commerce} from './model';
import {type User} from '../state';

/** A per-account welcome step, consumed on presentation even when dismissed. */
export function FindStyleIntro({user,commerce,setCommerce,ready,onSeen}:{user:User;commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;ready:boolean;onSeen:()=>void}){
 const [open,setOpen]=useState(false);
 const [selected,setSelected]=useState(()=>commerce.swipePreferences?.[user.phone]?.themes||[]);
 useEffect(()=>{if(ready&&user.travelStyleIntro==='pending'){setOpen(true);onSeen();}},[ready,user.travelStyleIntro]);
 return <BottomSheet title="Ваш стиль путешествий" open={open} onOpenChange={setOpen} snap={.94}>
  <SwipePreferences embedded selected={selected} onChange={setSelected} saveMode onClose={()=>setOpen(false)} onContinue={()=>{setCommerce(s=>applySwipePreferences(s,user.phone,selected));setOpen(false);}}/>
 </BottomSheet>;
}
