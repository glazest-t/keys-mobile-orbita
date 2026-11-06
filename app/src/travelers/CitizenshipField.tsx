import {useId,useState} from 'react';
import {BottomSheet,useKeyboard} from '../mobile';
import {Field,Icon} from '../ui';
import {countries} from './countries';
import './travelers.css';
export function CitizenshipField({value,onChange}:{value:string;onChange:(value:string)=>void}){
 const id=useId(),keyboard=useKeyboard(),[open,setOpen]=useState(false),[query,setQuery]=useState('');
 const choices=[...new Set([...countries,...(value?[value]:[])])].filter(c=>c.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru')));
 const choose=(next:string)=>{keyboard.hide();onChange(next);setOpen(false);};
 return <><div className="k-field traveler-citizenship"><span className="traveler-field-label" id={id}>Гражданство</span><button type="button" className="traveler-select" aria-labelledby={id+' '+id+'-value'} aria-haspopup="dialog" aria-expanded={open} onClick={()=>{keyboard.hide();setQuery('');setOpen(true);}}><span id={id+'-value'} className={value?'':'muted'}>{value||'Выберите гражданство'}</span><Icon name="chevron-down" size={18}/></button></div>
 <BottomSheet title="Гражданство" open={open} onOpenChange={setOpen} snap={.85}><div className="sheet-body citizenship-sheet"><Field label="Поиск страны" placeholder="Название страны" value={query} onChange={e=>setQuery(e.target.value)}/><div className="citizenship-options">{['Не указывать',...choices].map(c=><button type="button" key={c} aria-pressed={c==='Не указывать'?!value:value===c} onClick={()=>choose(c==='Не указывать'?'':c)}><span>{c}</span>{(value===c||!value&&c==='Не указывать')&&<Icon name="check" size={18} inheritColor/>}</button>)}</div>{!choices.length&&<p>Страна не найдена</p>}</div></BottomSheet></>;
}
