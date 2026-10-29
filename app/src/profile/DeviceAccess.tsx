import {useEffect,useRef,useState,type ReactNode,type Dispatch,type SetStateAction} from 'react';
import {createPortal} from 'react-dom';
import {motion,useReducedMotion} from 'motion/react';
import {PinCodeField} from '../SmsCodeField';
import {Button,Icon,StatusBadge} from '../ui';
import {BottomSheet,MobileScroll,useKeyboard} from '../mobile';
import {interactionMotion} from '../interactions';
import {type State,type User} from '../state';
import {checkPin,clearDeviceAccess,confirmPin,hasDevicePin,profileSettings,updateSettings} from './settings';
import './device-access.css';
import {LaunchSplash} from '../onboarding/LaunchSplash';
export type BiometricResult='success'|'failure'|'unavailable';

export function BiometricDemoControls({value,onChange}:{value:BiometricResult;onChange:(v:BiometricResult)=>void}){
 return <fieldset className="biometric-demo-controls"><legend>Биометрия · симуляция</legend>{([['success','Успех'],['failure','Не распознано'],['unavailable','Недоступна']] as const).map(([v,label])=><button key={v} aria-pressed={value===v} onClick={()=>onChange(v)}>{label}</button>)}</fieldset>;
}
export function BiometricSheet({open,onClose,onSuccess,outcome,unlock=false}:{open:boolean;onClose:()=>void;onSuccess:()=>void;outcome:BiometricResult;unlock?:boolean}){
 const [phase,setPhase]=useState<'intro'|'checking'|'success'|'failure'|'unavailable'>('intro');
 useEffect(()=>{if(open)setPhase('intro');},[open]);
 useEffect(()=>{if(!open)return;if(phase==='checking'){const t=setTimeout(()=>setPhase(outcome),interactionMotion.keyOpeningMs);return()=>clearTimeout(t);}if(phase==='success'){const t=setTimeout(onSuccess,interactionMotion.successHoldMs);return()=>clearTimeout(t);}},[phase,open,outcome]);
 return <BottomSheet title="Вход по биометрии" open={open} onOpenChange={v=>{if(!v)onClose();}} snap={.65}><div className="sheet-body device-biometric">
  <span style={{animationDuration:`${interactionMotion.bubbleOrbit}s`}} className={'device-access-mark '+(phase==='checking'?'is-checking':'')+(phase==='success'?'is-success':'')}><Icon name={phase==='success'?'check':'face-id'} size={40} inheritColor/></span>
  <h2>{phase==='intro'?'Подтвердите, что это вы':phase==='checking'?'Проверяем биометрию':phase==='success'?'Готово':phase==='failure'?'Не удалось распознать':'Биометрия недоступна'}</h2>
  <p>{phase==='intro'?(unlock?'Подтвердите вход в «Ключи».':'В следующий раз сможете войти без ввода PIN-кода.'):phase==='checking'?'Посмотрите на экран':phase==='success'?(unlock?'Вход подтверждён':'Биометрия включена'):phase==='failure'?'Попробуйте ещё раз или используйте PIN-код.':'Используйте PIN-код для входа.'}</p>
  {phase==='success'?<StatusBadge tone="success" icon="check">Подтверждено</StatusBadge>:unlock&&(phase==='failure'||phase==='unavailable')?<><Button onClick={onClose}>Ввести PIN-код</Button>{phase==='failure'&&<Button variant="secondary" onClick={()=>setPhase('checking')}>Попробовать снова</Button>}</>:<>{phase!=='unavailable'&&<Button busy={phase==='checking'} busyLabel="Проверяем" onClick={()=>setPhase('checking')}>{phase==='failure'?'Попробовать снова':'Подтвердить'}</Button>}<Button variant="secondary" onClick={onClose}>{unlock?'Ввести PIN-код':'Не сейчас'}</Button></>}
 </div></BottomSheet>;
}

function PinCheck({state,setState,user,onSuccess,onRecovery,label='Введите PIN-код',quick=false,onBiometric}:{state:State;setState:Dispatch<SetStateAction<State>>;user:User;onSuccess:(next:State)=>void;onRecovery:()=>void;label?:string;quick?:boolean;onBiometric?:()=>void}){
 const [pin,setPin]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[success,setSuccess]=useState(false),[attempt,setAttempt]=useState(0);const keyboard=useKeyboard();
 useEffect(()=>{if(!/^\d{4}$/.test(pin))return;let cancelled=false,timer:ReturnType<typeof setTimeout>;setBusy(true);
  checkPin(state,user.phone,pin).then(result=>{if(cancelled)return;setState(result.state);setBusy(false);if(result.valid){keyboard.hide();setSuccess(true);timer=setTimeout(()=>onSuccess(result.state),quick?interactionMotion.authSuccessMs:interactionMotion.successHoldMs);}else{setError(result.message);setPin('');setAttempt(v=>v+1);}}).catch(e=>{if(!cancelled){setError(e.message);setBusy(false);setPin('');}});
  return()=>{cancelled=true;clearTimeout(timer);};
 },[pin]);
 const change=(value:string)=>{if(busy||success)return;setPin(value);setError('');};
 const digit=(value:string)=>{const cells=pin.padEnd(4,' ').split(''),index=cells.findIndex(v=>v===' ');if(index>=0){cells[index]=value;change(cells.join('').trimEnd());}};
 return <><fieldset className="device-pin-input" disabled={busy||success}><PinCodeField key={attempt} appKeypad={quick} label={label} value={pin} onChange={change} error={error} success={success}/></fieldset>{busy&&<p className="device-access-progress" role="status">Проверяем код…</p>}
 {quick&&<fieldset className="device-pin-keypad" disabled={busy||success} aria-label="Цифровая клавиатура PIN-кода" data-scroll-drag="ignore">
  {['1','2','3','4','5','6','7','8','9'].map(value=><button type="button" key={value} onClick={()=>digit(value)}>{value}</button>)}
  {onBiometric?<button type="button" className="pin-key-action" aria-label="Войти по биометрии" onClick={onBiometric}><Icon name="face-id" inheritColor size={26}/></button>:<span/>}
  <button type="button" onClick={()=>digit('0')}>0</button><button type="button" className="pin-key-action" aria-label="Удалить цифру" disabled={!pin} onClick={()=>change(pin.trimEnd().slice(0,-1).trimEnd())}><Icon name="back" inheritColor size={24}/></button>
 </fieldset>}
 <Button variant="ghost" disabled={busy||success} onClick={onRecovery}>Не помню PIN-код</Button></>;

}

type AccessProps={state:State;setState:Dispatch<SetStateAction<State>>;user:User;outcome:BiometricResult;onRecovery:()=>void};
export function DeviceAccessSetup({state,setState,user,outcome,onRecovery,mode,onDone}:{mode:'pin'|'biometric'|'disable';onDone:(message:string)=>void}&AccessProps){
 const existing=hasDevicePin(user),keyboard=useKeyboard();
 const [stage,setStage]=useState<'verify'|'create'|'repeat'|'biometric'>(mode==='biometric'&&existing?'biometric':existing?'verify':'create');
 const [pin,setPin]=useState(''),[repeat,setRepeat]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
 const [success,setSuccess]=useState(false);const [saved,setSaved]=useState<State|null>(null);const alive=useRef(true);useEffect(()=>{alive.current=true;return()=>{alive.current=false;};},[]);
 useEffect(()=>{if(!success)return;const t=setTimeout(()=>{if(mode==='biometric'){setSuccess(false);setStage('biometric');}else onDone('PIN-код настроен');},interactionMotion.successHoldMs);return()=>clearTimeout(t);},[success]);
 const save=async()=>{setBusy(true);try{const next=await confirmPin(state,user.phone,pin,repeat);if(!alive.current)return;setState(next);setSaved(next);setSuccess(true);keyboard.hide();}catch(e){if(alive.current){setError((e as Error).message);setRepeat('');}}finally{if(alive.current)setBusy(false);}};
 const current=saved||state;
 return <div className="device-access-setup">
  <div className="profile-settings-intro"><span className="device-access-mark"><Icon name={mode==='biometric'?'face-id':'secure'} size={32} inheritColor/></span><h1>{stage==='verify'?(mode==='disable'?'Отключить PIN-код?':'Текущий PIN-код'):stage==='create'?'Придумайте PIN-код':stage==='repeat'?'Повторите PIN-код':'Быстрый вход'}</h1><p>{stage==='verify'?(mode==='disable'?'Вход по биометрии тоже будет отключён.':'Подтвердите код, чтобы задать новый.'):stage==='biometric'?'Используйте биометрию или PIN-код.':mode==='biometric'?'PIN-код пригодится, если биометрия не сработает.':'Четыре цифры для входа в приложение'}</p></div>
  {stage==='verify'?<PinCheck state={state} setState={setState} user={user} onRecovery={onRecovery} onSuccess={next=>{if(mode==='disable'){setState(clearDeviceAccess(next,user.phone));onDone('PIN-код отключён');}else setStage('create');}}/>:stage==='biometric'?<BiometricSheet open outcome={outcome} onClose={()=>onDone('')} onSuccess={()=>{setState(updateSettings(current,user.phone,{biometric:true}));onDone('Биометрия включена');}}/>:<>
   <fieldset className="device-pin-input" disabled={busy||success}><PinCodeField key={stage} label={stage==='create'?'Новый PIN-код':'Повтор PIN-кода'} value={stage==='create'?pin:repeat} success={success} error={error} onChange={v=>{stage==='create'?setPin(v):setRepeat(v);setError('');}}/></fieldset>
   <Button busy={busy} success={success} disabled={!/^\d{4}$/.test(stage==='create'?pin:repeat)} onClick={()=>{if(stage==='create'){keyboard.hide();setError('');setStage('repeat');}else void save();}}>{success?'PIN-код настроен':stage==='create'?'Продолжить':'Сохранить PIN-код'}</Button>
   {stage==='repeat'&&!success&&<Button variant="ghost" disabled={busy} onClick={()=>{setStage('create');setPin('');setRepeat('');setError('');}}>Ввести другой код</Button>}
  </>}
 </div>;
}
export function DeviceUnlock({state,setState,user,outcome,onOutcome,onRecovery,onUnlocked,entryControls}:{entryControls?:ReactNode;onOutcome:(value:BiometricResult)=>void;onUnlocked:()=>void}&AccessProps){
 const biometricEnabled=profileSettings(user).biometric;
 const [phase,setPhase]=useState<'pin'|'biometric'>(biometricEnabled?'biometric':'pin');
 return <><div className="keys-app device-lock-screen" data-auth-phase={phase}><MobileScroll className="keys-scroll">
 {phase==='pin'?<motion.main key="pin" className="device-unlock device-unlock-quick" initial={{opacity:0}} animate={{opacity:1}} transition={{duration:interactionMotion.tab}}>
  <img className="device-access-logo" src="/brand/assets/logo/horizontal-cobalt.svg" alt="Ключи"/>
  <div className="profile-settings-intro"><p>{user.name}, с возвращением</p><h1>Введите PIN-код</h1></div>
  <PinCheck quick state={state} setState={setState} user={user} onSuccess={onUnlocked} onRecovery={onRecovery} onBiometric={biometricEnabled?()=>setPhase('biometric'):undefined}/>
 </motion.main>:null}
 </MobileScroll>{phase==='biometric'&&<LaunchSplash biometricOutcome={outcome} onPin={()=>setPhase('pin')} onDone={onUnlocked}/> }</div>{createPortal(<aside className="demo-tools"><strong>Вход в приложение</strong>{entryControls}<small>PIN проверяется локально. Биометрия имитируется, данные лица не запрашиваются.</small>{!entryControls&&<BiometricDemoControls value={outcome} onChange={onOutcome}/>}</aside>,document.body)}</>;
}
