import {Field} from '../ui';
import {changeContactPhone,deleteContactPhone,formatContactPhone} from './contactPhoneMask';
export function ContactPhoneField({value,error,onChange}:{value:string;error?:string;onChange:(value:string)=>void}){
 const formatted=formatContactPhone(value);
 const apply=(input:HTMLInputElement,next:{value:string;caret:number})=>{onChange(next.value);input.value=formatContactPhone(next.value);queueMicrotask(()=>{if(input.isConnected&&document.activeElement===input)input.setSelectionRange(next.caret,next.caret);});};
 return <Field label="Телефон" required type="tel" inputMode="tel" autoComplete="tel" placeholder="+7 (900) 000-00-00" value={formatted} error={error}
  onChange={e=>apply(e.currentTarget,changeContactPhone(formatted,e.currentTarget.value,e.currentTarget.selectionStart??e.currentTarget.value.length,(e.nativeEvent as InputEvent).inputType))}
  onKeyDown={e=>{if((e.key==='Backspace'||e.key==='Delete')&&!e.metaKey&&!e.ctrlKey&&!e.altKey){e.preventDefault();apply(e.currentTarget,deleteContactPhone(formatted,e.currentTarget.selectionStart??0,e.currentTarget.selectionEnd??0,e.key==='Backspace'));}}}/>;
}
