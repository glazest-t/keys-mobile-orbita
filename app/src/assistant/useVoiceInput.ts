import {useEffect,useRef,useState} from 'react';
import {browserRecognition,createSpeechInput,type SpeechState} from './speechInput';
export function useVoiceInput(scope:string){
 const [state,setState]=useState<SpeechState>('idle'),[error,setError]=useState('');
 const session=useRef<ReturnType<typeof createSpeechInput>|null>(null);
 function cancel(){session.current?.cancel();session.current=null;}
 useEffect(()=>{setError('');return cancel;},[scope]);
 useEffect(()=>{const hide=()=>{if(document.visibilityState==='hidden')cancel();};const leave=()=>cancel();document.addEventListener('visibilitychange',hide);window.addEventListener('pagehide',leave);return()=>{document.removeEventListener('visibilitychange',hide);window.removeEventListener('pagehide',leave);};},[]);
 function start(base:string,onText:(value:string)=>void){cancel();const input=createSpeechInput({Recognition:browserRecognition(),onText,onState:setState,onError:setError});session.current=input;input.start(base);}
 return {state,error,busy:state!=='idle',start,stop:()=>session.current?.stop(),cancel,clearError:()=>setError('')};
}
