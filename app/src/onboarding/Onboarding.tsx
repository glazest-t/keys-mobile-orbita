import {useEffect,useState,useRef,type CSSProperties} from 'react';
import {useReducedMotion} from 'motion/react';
import {MobileScroll,useKeyboardInsets} from '../mobile';
import {Button,Mark} from '../ui';
import {SourceFinish} from './SourceSplash';
import {motionVars} from './motion';
import {RoomControlArt} from './RoomControlArt';
import {BenefitsArt,BenefitsIntro} from './BenefitsIntro';
import {PersonalizationArt} from './PersonalizationArt';
import './source-motion.css';
import './onboarding.css';

const slides=[
 {id:'room-control',art:'',title:'Управляйте номером',lead:'Управляйте ',accent:'номером',text:'Все возможности — в вашем телефоне.'},
 {id:'dual-benefits',art:'',title:'Двойная выгода',lead:'Двойная ',accent:'выгода',text:''},
 {id:'personal-selection',art:'',title:'Подборка, которая понимает вас',lead:'Подборка, ',accent:'которая понимает вас',text:'Учимся на ваших поездках и выборе, учитываем избранное — и находим отели под ваши пожелания.'},
];

export function Onboarding({onStart,onLogin,registered=false}:{onStart:()=>void;onLogin:()=>void;registered?:boolean}){
 const reduced=useReducedMotion();
 const actions=useRef({onStart,onLogin});actions.current={onStart,onLogin};
 const {bottomInset}=useKeyboardInsets();
 const [ready,setReady]=useState(false),[step,setStep]=useState(0),[destination,setDestination]=useState<'find'|'login'|null>(null);
 useEffect(()=>{const timer=setTimeout(()=>setReady(true),0);return()=>clearTimeout(timer);},[reduced]);
 useEffect(()=>{if(!destination)return;const timer=setTimeout(()=>destination==='find'?actions.current.onStart():actions.current.onLogin(),reduced?0:1400);return()=>clearTimeout(timer);},[destination,reduced]);
 const active=ready&&!destination;
 return <div className="onboarding-flow" data-reduced-motion={reduced?'true':'false'}>
  <div className="onboarding-pages" inert={!active} aria-hidden={!active}>
   <MobileScroll className="keys-scroll">
    <header className="app-header"><Mark/>{step<2&&<button className="text-action" onClick={()=>setStep(2)}>Пропустить</button>}</header>
    <div className="onboarding-stack" aria-label="Знакомство с Ключами" onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();setStep(s=>Math.min(2,s+1));}if(e.key==='ArrowLeft'){e.preventDefault();setStep(s=>Math.max(0,s-1));}}}>
     {slides.map((slide,i)=><section key={slide.id} className={`onboarding-panel ${i===0?'onboarding-room-panel':i===1?'onboarding-benefits-panel':'onboarding-personal-panel'}`} data-active={!destination&&i===step} aria-hidden={i!==step} inert={i!==step} style={{...motionVars(slide.id,active&&i===step),'--page-offset':`${i<step||destination?-36:36}px`} as CSSProperties}>
      <div className="onboarding-art-stage">
       {i===0?<RoomControlArt/>:i===1?<BenefitsArt active={active&&i===step}/>:<PersonalizationArt active={active&&i===step}/>}
      </div>
      <h1>{slide.lead}<span className="onboarding-accent">{slide.accent}</span></h1>
      {i===1?<BenefitsIntro/>:<p>{slide.text}</p>}
     </section>)}
    </div>
   </MobileScroll>
   <footer className={`app-footer onboarding-footer ${step===0?'onboarding-room-footer':''}`} style={{bottom:bottomInset}}>
    <div className="onboarding-progress" aria-label="Шаги знакомства" onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=Math.max(0,Math.min(2,step+(e.key==='ArrowRight'?1:-1)));setStep(next);(e.currentTarget.children[next] as HTMLButtonElement).focus({preventScroll:true});}}}>
     {slides.map((s,i)=><button key={s.id} aria-label={`Шаг ${i+1}: ${s.title}`} aria-current={i===step?'step':undefined} onClick={()=>setStep(i)}><span><span style={{width:i<=step?'100%':'0%'}}/></span></button>)}
    </div>
    <span className="onboarding-sr" role="status">Шаг {step+1} из 3</span>
    <Button onClick={()=>step<2?setStep(step+1):setDestination('find')}>{step<2?'Дальше':registered?'Продолжить':'Начать'}</Button>
    {step>0&&<div className="onboarding-secondary">{step===2&&!registered?<Button variant="ghost" onClick={()=>setDestination('login')}>У меня уже есть бронь</Button>:<Button variant="ghost" onClick={()=>setStep(step-1)}>Назад</Button>}</div>}
   </footer>
  </div>
  {destination&&<div className="onboarding-finish" role="status"><div aria-hidden="true">{reduced?<Mark/>:<SourceFinish/>}</div><h1>Добро пожаловать</h1>{!registered&&<p>Войдём в ваш профиль</p>}</div>}
 </div>;
}
