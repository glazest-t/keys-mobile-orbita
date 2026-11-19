import {useState,type Dispatch,type SetStateAction} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {FilterEditorDialog} from './FilterEditor';
import {SwipePreferences} from './SwipeWelcome';
import {applySwipePreferences} from './swipePreferences';
import type {Commerce} from './model';
import './guest-style.css';

/** Mount when opened so each edit starts with the latest saved preferences. */
export function GuestStyleEditor({commerce,setCommerce,owner,onClose}:{commerce:Commerce;setCommerce:Dispatch<SetStateAction<Commerce>>;owner:string|null;onClose:()=>void}){
 const actor=owner||'guest';
 const [selected,setSelected]=useState(()=>[...(commerce.swipePreferences?.[actor]?.themes||[])]);
 return <FilterEditorDialog open onClose={onClose} initialFocusSelector=".guest-style-editor .k-icon-button">
  <Dialog.Title className="guest-style-dialog-title">Ваш стиль путешествий</Dialog.Title>
  <div className="guest-style-editor"><SwipePreferences selected={selected} onChange={setSelected} saveMode backLabel="Назад к отелям" onClose={onClose} onContinue={()=>{setCommerce(s=>applySwipePreferences(s,actor,selected));onClose();}}/></div>
 </FilterEditorDialog>;
}
