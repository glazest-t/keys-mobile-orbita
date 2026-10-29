import {useId,useRef} from 'react';
import {Icon} from './ui';
import {KeyboardInput,useKeyboard} from './mobile';
import './sms-code.css';

type CodeFieldProps={value:string;onChange:(value:string)=>void;error?:string;success?:boolean};
export function SmsCodeField(props:CodeFieldProps){return <DigitCodeField {...props} length={6} label="Код из СМС"/>;}
export function PinCodeField({label,...props}:CodeFieldProps&{label:string;appKeypad?:boolean}){return <DigitCodeField {...props} length={4} label={label} masked/>;}
function DigitCodeField({value,onChange,error,success=false,length,label,masked=false,appKeypad=false}:CodeFieldProps&{length:4|6;label:string;masked?:boolean;appKeypad?:boolean}){
 const id=useId(),inputs=useRef<(HTMLInputElement|null)[]>([]),keyboard=useKeyboard();
 const Input=appKeypad?'input':KeyboardInput;
 const cells=value.padEnd(length,' ').slice(0,length).split('');
 const focus=(index:number)=>{const field=inputs.current[Math.max(0,Math.min(length-1,index))];field?.focus({preventScroll:true});field?.select();};
 const write=(index:number,raw:string)=>{
  const digits=raw.replace(/\D/g,'').slice(0,length);
  if(raw&&!digits)return;
  const next=[...cells],start=digits.length===length?0:index;
  if(digits)digits.split('').slice(0,length-start).forEach((digit,offset)=>{next[start+offset]=digit;});
  else next[index]=' ';
  onChange(next.join('').trimEnd());
  if(digits)focus(Math.min(length-1,start+digits.length));
 };
 return <div className={"sms-code-field"+(masked?" pin-code-field":"")+(success?" is-success":"")} role="group" aria-labelledby={id+'-label'}>
  <span className="sms-code-label" id={id+'-label'}>{label}</span>
  <div className="sms-code-cells">{cells.map((digit,index)=><Input key={index} readOnly={appKeypad} ref={field=>{inputs.current[index]=field;}} disabled={success} type={masked?'password':'text'} inputMode={appKeypad?'none':'numeric'} autoComplete={!masked&&index===0?'one-time-code':'off'} enterKeyHint={index===length-1?'done':'next'} aria-label={`Цифра ${index+1} из ${length}`} aria-invalid={!success&&!!error} aria-describedby={error?id+'-error':undefined} value={digit.trim()} onFocus={e=>e.currentTarget.select()} onClick={e=>e.currentTarget.select()} onChange={e=>write(index,e.currentTarget.value)} onPaste={e=>{e.preventDefault();write(index,e.clipboardData.getData('text'));}} onBlur={e=>{if(!inputs.current.includes(e.relatedTarget as HTMLInputElement))keyboard.hide();}} onKeyDown={e=>{
   if(appKeypad&&/^\d$/.test(e.key)&&!e.metaKey&&!e.ctrlKey){e.preventDefault();write(index,e.key);}
   else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();const target=e.key==='Backspace'&&!digit.trim()?Math.max(0,index-1):index;const next=[...cells];next[target]=' ';onChange(next.join('').trimEnd());focus(target);}
   else if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();focus(index+(e.key==='ArrowLeft'?-1:1));}
   else if(e.key==='Enter'&&index<length-1){e.preventDefault();focus(index+1);}
  }}/>)}</div>
  {success&&<p className="sms-code-success" role="status"><span className="button-success-icon"><Icon name="check" size={18} inheritColor/></span>Код верный</p>}
  {!success&&error&&<p id={id+'-error'} className="field-error" role="alert">{error}</p>}
 </div>;
}
