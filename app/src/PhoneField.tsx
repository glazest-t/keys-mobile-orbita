import {Field} from './ui';
import {changePhone,deletePhone,formatPhoneInput} from './phoneMask';

export function PhoneField({value,onValueChange,error,label='Номер телефона',required=false}:{value:string;onValueChange:(value:string)=>void;error?:string;label?:string;required?:boolean}){
 const formatted=formatPhoneInput(value);
 function apply(input:HTMLInputElement,next:{digits:string;caret:number}){
  onValueChange(next.digits);
  input.value=formatPhoneInput(next.digits);
  queueMicrotask(()=>{if(input.isConnected&&document.activeElement===input)input.setSelectionRange(next.caret,next.caret);});
 }
 return <Field label={label} required={required} prefix="+7" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(900) 000-00-00" value={formatted} error={error}
  onChange={e=>apply(e.currentTarget,changePhone(formatted,e.currentTarget.value,e.currentTarget.selectionStart??e.currentTarget.value.length,(e.nativeEvent as InputEvent).inputType))}
  onKeyDown={e=>{if((e.key==='Backspace'||e.key==='Delete')&&!e.altKey&&!e.metaKey&&!e.ctrlKey){e.preventDefault();const input=e.currentTarget;apply(input,deletePhone(formatted,input.selectionStart??0,input.selectionEnd??0,e.key==='Backspace'));}}}/>;
}
