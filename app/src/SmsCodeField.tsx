import {useId,useLayoutEffect,useRef,useState,type CSSProperties,type RefObject} from 'react';
import {createPortal} from 'react-dom';
import {Icon} from './ui';
import {KeyboardInput,useKeyboard} from './mobile';
import './sms-code.css';

type CodeFieldProps={value:string;onChange:(value:string)=>void;error?:string;success?:boolean};
const smsCodeLength=6;
export function SmsCodeField({value,onChange,error,success=false,expired=false,inputRef:providedInput,label='Код из СМС'}:CodeFieldProps&{expired?:boolean;inputRef?:RefObject<HTMLInputElement|null>;label?:string}){
 const id=useId(),keyboard=useKeyboard();
 const ownInput=useRef<HTMLInputElement>(null),inputRef=providedInput??ownInput;
 const [selection,setSelection]=useState<[number,number]>([0,0]);
 const [dock,setDock]=useState<Element|null>(null);
 const pendingCaret=useRef<number|null>(null);
 const selectionFrom=(field:HTMLInputElement)=>setSelection([field.selectionStart??0,field.selectionEnd??0]);
 const moveCaret=(field:HTMLInputElement,start:number,end=start)=>{
  field.setSelectionRange(start,end);
  selectionFrom(field);
 };
 const edit=(digits:string,caret:number)=>{
  if(digits===value){if(inputRef.current)moveCaret(inputRef.current,caret);return;}
  pendingCaret.current=caret;
  onChange(digits);
 };
 useLayoutEffect(()=>{
  if(pendingCaret.current===null||!inputRef.current)return;
  moveCaret(inputRef.current,pendingCaret.current);
  pendingCaret.current=null;
 },[value,inputRef]);
 useLayoutEffect(()=>{
  const field=inputRef.current;
  if(error&&!expired&&field===document.activeElement&&field)moveCaret(field,0,field.value.length);
 },[error,expired,inputRef]);
 useLayoutEffect(()=>{
  if(!keyboard.visible)return;
  const field=inputRef.current;
  setDock(field&&keyboard.focusedElement===field
   ? field.closest('[data-phone-screen]')?.querySelector('.keyboard-dock')??null
   : null);
 },[keyboard.visible,keyboard.focusedElement,inputRef]);
 const replaceSelection=(raw:string)=>{
  const field=inputRef.current,digits=raw.replace(/\D/g,'').slice(0,smsCodeLength);
  if(!field||!digits||success||expired)return;
  const whole=digits.length===smsCodeLength;
  if(whole&&digits===value&&error){moveCaret(field,0,smsCodeLength);return;}
  const start=whole?0:field.selectionStart??value.length;
  const end=whole?value.length:field.selectionEnd??value.length;
  const inserted=digits.slice(0,smsCodeLength-value.length+end-start);
  edit(value.slice(0,start)+inserted+value.slice(end),start+inserted.length);
 };
 const deleteDigit=()=>{
  const field=inputRef.current;
  if(!field||success||expired)return;
  const end=field.selectionEnd??value.length;
  const start=field.selectionStart??end;
  const from=start===end?Math.max(0,start-1):start;
  edit(value.slice(0,from)+value.slice(end),from);
 };
 const activeIndex=Math.min(selection[0],value.length,smsCodeLength-1);
 return <div className={'sms-code-field sms-code-entry'+(success?' is-success':error?' is-invalid':'')}>
  {success?<span className="sms-code-label">{label}</span>:<label className="sms-code-label" htmlFor={id}>{label}</label>}
  <div className="sms-code-entry-control">
   {!success&&<KeyboardInput
     ref={inputRef}
     id={id}
     className="sms-code-entry-input"
     type="text"
     inputMode="numeric"
     autoComplete="one-time-code"
     enterKeyHint="done"
     maxLength={smsCodeLength}
     value={value}
     readOnly={expired}
     aria-invalid={!!error&&!expired}
     aria-describedby={error?id+'-error':undefined}
     onFocus={e=>selectionFrom(e.currentTarget)}
     onBlur={()=>keyboard.hide()}
     onSelect={e=>selectionFrom(e.currentTarget)}
     onChange={e=>{
      const field=e.currentTarget;
      const raw=field.value;
      edit(raw.replace(/\D/g,'').slice(0,smsCodeLength),raw.slice(0,field.selectionStart??raw.length).replace(/\D/g,'').length);
     }}
     onPaste={e=>{e.preventDefault();replaceSelection(e.clipboardData.getData('text'));}}
     onClick={e=>{
      if(e.detail!==1||expired)return;
      const field=e.currentTarget,bounds=field.getBoundingClientRect();
      const index=Math.max(0,Math.min(value.length,Math.floor((e.clientX-bounds.left)/bounds.width*smsCodeLength)));
      moveCaret(field,index,Math.min(value.length,index+1));
     }}
   />}
   <div className="sms-code-cells" aria-hidden="true">
    {Array.from({length:smsCodeLength},(_,index)=><span
     className="sms-code-cell" key={index} style={{'--sms-code-position':index} as CSSProperties}
     data-active={index===activeIndex||undefined} data-selected={index>=selection[0]&&index<selection[1]||undefined}
    >{value[index]&&<span className="sms-code-digit" key={value[index]}>{value[index]}</span>}</span>)}
   </div>
  </div>
  {!success&&error&&<p id={id+'-error'} className="sms-code-error" role="alert">{error}</p>}
  <div className="sms-code-result" role="status">
   {success&&<p className="sms-code-success"><span className="button-success-icon" aria-hidden="true"><Icon name="check" size={18} inheritColor/></span>Код верный</p>}
  </div>
  {dock&&createPortal(<div className="sms-code-keypad" role="group" aria-label="Цифровая клавиатура" onPointerDown={e=>e.preventDefault()}>
   {['1','2','3','4','5','6','7','8','9'].map(digit=><button key={digit} type="button" tabIndex={-1} onClick={()=>replaceSelection(digit)}>{digit}</button>)}
   <button className="sms-code-keypad-zero" type="button" tabIndex={-1} onClick={()=>replaceSelection('0')}>0</button>
   <button className="sms-code-keypad-delete" type="button" tabIndex={-1} aria-label="Удалить цифру" onClick={deleteDigit}>Стереть</button>
  </div>,dock)}
 </div>;
}
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
