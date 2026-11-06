import {isDesktop} from '../desktop/surface';
import {useState} from 'react';
import {Field,Icon} from '../ui';
import {ContactPhoneField} from './ContactPhoneField';
import {BirthDatePicker} from './BirthDatePicker';
import {BottomSheet,useKeyboard} from '../mobile';
import type {Traveler} from '../state';
import {displayBirthDate} from './birthDate';
import './travelers.css';
import {countries} from './countries';
export function TravelerFields({draft,errors,onChange}:{draft:Traveler;errors:Record<string,string>;onChange:(key:keyof Traveler,value:string)=>void}){
 const [dateOpen,setDateOpen]=useState(false);
 const [open,setOpen]=useState(false),[query,setQuery]=useState('');const keyboard=useKeyboard();
 const formatted=displayBirthDate(draft.birthDate);
 const choices=[...new Set([...countries,...(draft.citizenship?[draft.citizenship]:[])])].filter(country=>country.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru')));
 const choose=(value:string)=>{keyboard.hide();onChange('citizenship',value);setOpen(false);};
 return <>
  <Field label="Имя" autoComplete="given-name" value={draft.name} error={errors.name} onChange={e=>onChange('name',e.currentTarget.value)}/>
  <Field label="Фамилия" autoComplete="family-name" value={draft.surname} error={errors.surname} onChange={e=>onChange('surname',e.currentTarget.value)}/>
  <Field label="Отчество" value={draft.patronymic} error={errors.patronymic} onChange={e=>onChange('patronymic',e.currentTarget.value)}/>
  <div className="k-field"><span className="traveler-field-label" id="birth-label">Дата рождения</span><button type="button" className="traveler-select" aria-labelledby="birth-label birth-value" aria-haspopup="dialog" aria-expanded={dateOpen} onPointerDown={e=>{if(!isDesktop)e.preventDefault();}} onClick={()=>{keyboard.hide();setDateOpen(true);}}><span id="birth-value" className={formatted?'':'muted'}>{formatted||'ДД.ММ.ГГГГ'}</span><Icon name="calendar" size={20}/></button>{errors.birthDate&&<p className="field-error" role="alert">{errors.birthDate}</p>}</div>
  <div className="k-field traveler-citizenship"><span className="traveler-field-label" id="citizenship-label">Гражданство</span><button type="button" className="traveler-select" aria-labelledby="citizenship-label citizenship-value" aria-haspopup="dialog" aria-expanded={open} onPointerDown={e=>{if(!isDesktop)e.preventDefault();}} onClick={()=>{keyboard.hide();setQuery('');setOpen(true);}}><span id="citizenship-value" className={draft.citizenship?'':'muted'}>{draft.citizenship||'Выберите гражданство'}</span><Icon name="chevron-down" size={18}/></button></div>
  <ContactPhoneField value={draft.phone} error={errors.phone} onChange={value=>onChange('phone',value)}/>
  <Field label="Почта" type="email" autoComplete="email" value={draft.email} error={errors.email} onChange={e=>onChange('email',e.currentTarget.value)}/>
  {dateOpen&&<BirthDatePicker value={draft.birthDate} onClose={()=>setDateOpen(false)} onSave={value=>{onChange('birthDate',value);setDateOpen(false);}}/>}
  <BottomSheet title="Гражданство" open={open} onOpenChange={setOpen} snap={.85}><div className="sheet-body citizenship-sheet"><Field label="Поиск страны" placeholder="Название страны" value={query} onChange={e=>setQuery(e.currentTarget.value)}/><div className="citizenship-options"><button type="button" aria-pressed={!draft.citizenship} onPointerDown={e=>{if(!isDesktop)e.preventDefault();}} onClick={()=>choose('')}><span>Не указывать</span>{!draft.citizenship&&<Icon name="check" size={18} inheritColor/>}</button>{choices.map(country=><button type="button" key={country} aria-pressed={draft.citizenship===country} onPointerDown={e=>{if(!isDesktop)e.preventDefault();}} onClick={()=>choose(country)}><span>{country}</span>{draft.citizenship===country&&<Icon name="check" size={18} inheritColor/>}</button>)}</div>{!choices.length&&<p>Страна не найдена</p>}</div></BottomSheet>
 </>;
}
