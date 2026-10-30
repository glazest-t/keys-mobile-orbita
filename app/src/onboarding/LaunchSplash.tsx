import {useEffect,useRef,useState} from 'react';
import {useReducedMotion} from 'motion/react';
import {Button,Mark,StatusBadge} from '../ui';
import {interactionMotion} from '../interactions';
import {SourceSplash} from './SourceSplash';
import './source-motion.css';
import './onboarding.css';

type BiometricOutcome='success'|'failure'|'unavailable';
/** One artwork stays mounted from launch through the biometric result. */
export function LaunchSplash({onDone,biometricOutcome,onPin,preview=false}:{preview?:boolean;onDone:()=>void;biometricOutcome?:BiometricOutcome;onPin?:()=>void}){
 const reduced=useReducedMotion(),done=useRef(onDone);done.current=onDone;
 const [visible,setVisible]=useState(true);
 const [phase,setPhase]=useState<'launch'|'checking'|BiometricOutcome>('launch');
 useEffect(()=>{
  if(reduced&&preview)return;
  if(biometricOutcome){
   if(phase==='launch'||phase==='checking'){
    const timer=setTimeout(()=>setPhase(biometricOutcome),phase==='launch'?(reduced?0:2400):interactionMotion.authCheckMs);
    return()=>clearTimeout(timer);
   }
   if(phase==='success'){const timer=setTimeout(()=>done.current(),interactionMotion.authSuccessMs);return()=>clearTimeout(timer);}
   return;
  }
  const fade=setTimeout(()=>setVisible(false),reduced?0:2400);
  const finish=setTimeout(()=>done.current(),reduced?0:3100);
  return()=>{clearTimeout(fade);clearTimeout(finish);};
 },[reduced,biometricOutcome,phase,preview]);
 const failed=phase==='failure'||phase==='unavailable';
 return <div className={'onboarding-flow'+(preview?' launch-preview':'')+(biometricOutcome?' biometric-launch':'')} role="status" aria-label="Запуск Ключей"><div className="onboarding-splash" data-visible={visible}>
  <div className="launch-artwork" aria-hidden="true">{reduced?<Mark/>:<SourceSplash/>}</div>
  <div className="launch-feedback" aria-live="polite">
   {phase==='success'?<StatusBadge tone="success" icon="check">Вход выполнен</StatusBadge>:failed?<p>{phase==='failure'?'Не удалось распознать':'Биометрия недоступна'}</p>:phase==='checking'?<p>Проверяем биометрию</p>:<p className="onboarding-tagline">Ключи от всех отелей</p>}
  </div>
  {biometricOutcome&&phase!=='success'&&<div className="launch-actions">{failed&&<p>Войдите с помощью PIN-кода.</p>}<Button variant={failed?'primary':'ghost'} onClick={onPin}>Ввести PIN-код</Button>{phase==='failure'&&<Button variant="secondary" onClick={()=>setPhase('checking')}>Попробовать снова</Button>}</div>}
 </div></div>;
}
