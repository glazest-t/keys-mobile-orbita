import {useState} from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {isDesktop} from '../desktop/surface';
import {FilterEditorDialog} from './FilterEditor';
import {SwipePreferences} from './SwipeWelcome';
import './guest-style.css';

/** Mount when opened so each edit starts with the latest saved preferences. */
export function GuestStyleEditor({themes,onSave,onClose,backLabel='Назад к отелям'}:{themes:string[];onSave:(themes:string[])=>void;onClose:()=>void;backLabel?:string}){
 const [selected,setSelected]=useState(themes);
 return <FilterEditorDialog open onClose={onClose} initialFocusSelector={isDesktop?'.swipe-preferences-intro h1':'.guest-style-editor .k-icon-button'}>
  <Dialog.Title className="guest-style-dialog-title">Ваш стиль путешествий</Dialog.Title>
  <div className="guest-style-editor"><SwipePreferences selected={selected} onChange={setSelected} saveMode fixedIntro={isDesktop} backLabel={backLabel} onClose={onClose} onContinue={()=>onSave(selected)}/></div>
 </FilterEditorDialog>;
}
