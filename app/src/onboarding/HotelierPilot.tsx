import {useEffect,useRef,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {MobileScroll,useKeyboardInsets,BottomSheet} from '../mobile';
import {Button,Icon,Mark} from '../ui';
import {interactionMotion} from '../interactions';
import {usePrototypeCopy} from '../usePrototypeText';
import {FriendlyRateBadge} from '../hotelier/FriendlyRateBadge';
import {RatingBadge} from '../booking/RatingBadge';
import './hotelier-pilot.css';

/** A separate editorial pilot. It never grants hotelier status or changes existing tours. */
export function HotelierPilot({onStart,initialStep=0}:{onStart:()=>void;initialStep?:number}){
 const [step,setStep]=useState(Math.max(0,Math.min(3,initialStep))),[chatOpen,setChatOpen]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null),reduced=useReducedMotion(),{bottomInset}=useKeyboardInsets();
 const title=[usePrototypeCopy('Первые Ключи — отельерам чата'),usePrototypeCopy('Friendly Rate: скидки для своих'),usePrototypeCopy('Как открыть тарифы'),usePrototypeCopy('Проверяйте в деле. Влияйте на продукт')];
 const description=[usePrototypeCopy('Вы помогали создавать этот продукт — время проверить его в деле'),usePrototypeCopy('Бронируйте объекты коллег на закрытых условиях — доступ по профилю TravelLine'),usePrototypeCopy('Активируйте участие и промокод со скидкой в кабинете TravelLine, затем подтвердите профиль здесь. Это нужно, чтобы выгоду получали только свои'),usePrototypeCopy('Это первая версия Ключей. Делитесь впечатлениями, предлагайте идеи в нашем чате — мы всегда на связи')];
 const changeStep=(next:number)=>{setStep(next);requestAnimationFrame(()=>heading.current?.focus({preventScroll:true}));};
 return <div className={`hotelier-pilot-flow${step===3?' is-final-step':''}`}>
  <MobileScroll className="keys-scroll hotelier-pilot-scroll">
   <header className="app-header hotelier-pilot-header"><Mark/><span>Для отельеров</span>{step>0&&<div className="hotelier-pilot-navigation"><button className="hotelier-pilot-skip" onClick={onStart}>Пропустить</button></div>}</header>
   <main className="hotelier-pilot-main">
    <motion.div key={step} className="hotelier-pilot-art" initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:interactionMotion.push}}>
     {step===0?<PilotInvitation/>:step===1?<PilotHotelCard/>:step===2?<PilotSteps/>:<PilotChat/>}
    </motion.div>
    <div className="hotelier-pilot-copy"><h1 ref={heading} tabIndex={-1}>{title[step]}</h1><p>{description[step]}</p></div>
   </main>
  </MobileScroll>
  <footer className="app-footer hotelier-pilot-footer" style={{bottom:bottomInset}}>
   <div className="onboarding-progress" aria-label="Шаги онбординга отельера">{title.map((label,i)=><button key={i} aria-label={`Шаг ${i+1}: ${label}`} aria-current={i===step?'step':undefined} onClick={()=>changeStep(i)}><span><span style={{width:i<=step?'100%':'0%'}}/></span></button>)}</div>
   <span className="onboarding-sr" role="status">Шаг {step+1} из 4</span>
   <Button onClick={()=>step<3?changeStep(step+1):onStart()}>{step===0?'Что внутри':step===3?'Попробовать Ключи':'Дальше'}</Button>
   {step===0&&<button className="hotelier-pilot-skip" onClick={onStart}>Пропустить</button>}
   {step>0&&<div className="hotelier-pilot-footer-links">{step===3&&<Button variant="secondary" onClick={()=>setChatOpen(true)}>Меня нет в чате</Button>}<button className="hotelier-pilot-skip" onClick={()=>changeStep(step-1)}>Назад</button></div>}
  </footer>
  <BottomSheet open={chatOpen} onOpenChange={setChatOpen} title="Чат отельеров в Telegram" snap={.35}><div className="sheet-body"><p>Здесь появится приглашение в чат отельеров. В прототипе ссылка пока не подключена.</p><Button onClick={()=>setChatOpen(false)}>Вернуться к онбордингу</Button></div></BottomSheet>
 </div>;
}


function PilotInvitation(){
 return <div className="hotelier-pilot-invitation" role="img" aria-label="Ключи. Сообщество отельеров. Приглашение для своих. Закрытый релиз.">
  <span className="hotelier-pilot-orbit" aria-hidden="true"/>
  <div className="hotelier-pilot-invite-card" aria-hidden="true"><div className="hotelier-pilot-invite-brand"><Mark/><span>Ключи</span></div><span className="hotelier-pilot-invite-community">Сообщество отельеров</span><strong>Приглашение<br/>для своих</strong><span className="hotelier-pilot-invite-seal"><Icon name="secure" size={16} inheritColor/>Закрытый релиз</span></div>
 </div>;
}
function PilotHotelCard(){
 return <article className="hotelier-pilot-rate" aria-label="Пример карточки отеля с Friendly Rate">
  <div className="hotelier-pilot-photo"><img src="/brand/illustrations/hotelier-pilot-seaside.png" alt="Отель у моря"/></div>
  <div className="hotelier-pilot-rate-copy"><strong>Орбита у моря</strong><p><Icon name="pin" size={14}/>Сочи · 300 м до моря</p><div className="hotelier-pilot-hotel-bottom"><div><RatingBadge value={4.9}/><span>Превосходно</span></div><div className="hotelier-pilot-hotel-price"><s>8 500 ₽</s><div className="hotelier-pilot-price-line"><FriendlyRateBadge/><strong>5 525 ₽</strong></div><small>за ночь</small></div></div></div>
 </article>;
}
function PilotSteps(){
 return <div className="hotelier-pilot-steps"><ol><li><span className="hotelier-pilot-step-number">1</span><span className="icon-tile"><Icon name="gift" size={28}/></span><strong>Промокод со скидкой<br/>в кабинете TravelLine</strong></li><li><span className="hotelier-pilot-step-number">2</span><span className="icon-tile"><Icon name="nav-profile" size={28}/></span><strong>Подтверждение профиля<br/>в приложении</strong></li></ol><div className="hotelier-pilot-unlocked"><Icon name="check" size={20} inheritColor/><div><span>В приложении откроется тариф</span><FriendlyRateBadge/></div></div></div>;
}
function PilotChat(){
 const reduced=useReducedMotion(),[replied,setReplied]=useState(!!reduced);
 useEffect(()=>{if(reduced){setReplied(true);return;}const timer=setTimeout(()=>setReplied(true),interactionMotion.chatReplyMs*2);return()=>clearTimeout(timer);},[reduced]);
 return <div className="hotelier-pilot-chat"><div className="hotelier-pilot-chat-heading"><span className="icon-tile"><Icon name="nav-chats" size={28}/></span><div><strong>Чат отельеров</strong><small>На связи с командой Ключей</small></div></div>
  <motion.div className="hotelier-pilot-bubble is-hotelier" initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:interactionMotion.bubbleAppear}}><small>Вы · отельер</small><p>В форме всё отлично, добавьте кнопку продления</p><Icon name="check" size={14} inheritColor/></motion.div>
  <div className="hotelier-pilot-reply-slot">{replied?<motion.div className="hotelier-pilot-bubble is-team" initial={reduced?false:{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{duration:interactionMotion.bubbleAppear}}><small>Команда Ключей</small><p>Принято, берём в следующий спринт!</p></motion.div>:<div className="hotelier-pilot-typing" aria-label="Команда Ключей набирает сообщение"><span>Команда Ключей</span><div aria-hidden="true">{[0,1,2].map(i=><motion.i key={i} animate={{opacity:[.3,1,.3],y:[0,-3,0]}} transition={{duration:interactionMotion.bubbleOrbit,delay:i*interactionMotion.bubbleStagger,repeat:Infinity}}/>)}</div></div>}</div>
 </div>;
}
