import {useEffect,useState} from 'react';
import {interactionMotion} from '../interactions';
const phrases=[
 'Подбираем отели под ваши пожелания…',
 'Ищем место, где захочется задержаться…',
 'Перебираем варианты для вашего «вот оно!»…',
 'Чемодан пока не собираем — выбираем…',
 'Ещё чуть-чуть — собираем варианты для вас…',
];
export function FinderThinking({startedAt}:{startedAt:number}){
 const current=()=>Math.min(phrases.length-1,Math.max(0,Math.floor((Date.now()-startedAt)/interactionMotion.assistantPhraseMs)));
 const [phase,setPhase]=useState(current);
 useEffect(()=>{let timer:ReturnType<typeof setTimeout>;function tick(){const next=current();setPhase(next);if(next<phrases.length-1)timer=setTimeout(tick,Math.max(0,startedAt+(next+1)*interactionMotion.assistantPhraseMs-Date.now()));}tick();return()=>clearTimeout(timer);},[startedAt]);
 return <div className="finder-working" role="status" aria-live="polite" aria-atomic="true"><span className="chat-typing-dots" aria-hidden="true"><i/><i/><i/></span><span>{phrases[phase]}</span></div>;
}
