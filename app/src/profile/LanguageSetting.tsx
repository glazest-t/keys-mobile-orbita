import {useState} from 'react';
import {BottomSheet} from '../mobile';
import {Icon,Row} from '../ui';

export function LanguageSetting({value='ru',onChange}:{value?:'ru'|'en';onChange:(value:'ru'|'en')=>void}){
 const [open,setOpen]=useState(false);
 return <><Row icon="language" title="Язык приложения" subtitle={value==='en'?'English':'Русский'} onClick={()=>setOpen(true)}/><BottomSheet open={open} onOpenChange={setOpen} title="Язык приложения" snap={.4}><div className="sheet-body" role="radiogroup" aria-label="Язык приложения">{([['ru','Русский'],['en','English']] as const).map(([id,label])=><button className="language-choice" type="button" role="radio" aria-checked={value===id} key={id} onClick={()=>{onChange(id);setOpen(false);}}><span>{label}</span>{value===id&&<Icon name="check" size={20} inheritColor/>}</button>)}</div></BottomSheet></>;
}
