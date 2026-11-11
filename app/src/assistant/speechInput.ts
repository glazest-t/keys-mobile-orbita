/** Browser speech adapter. No audio is stored by the prototype; only the transcript enters the draft. */
export type SpeechState='idle'|'starting'|'listening'|'stopping';
export type RecognitionResult={results:ArrayLike<{isFinal:boolean;0:{transcript:string}}>};
export type Recognition={lang:string;continuous:boolean;interimResults:boolean;maxAlternatives:number;onstart:(()=>void)|null;onresult:((event:RecognitionResult)=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void};
export type RecognitionConstructor=new()=>Recognition;
export function browserRecognition():RecognitionConstructor|undefined{
 if(typeof window==='undefined')return undefined;
 const browser=window as unknown as {SpeechRecognition?:RecognitionConstructor;webkitSpeechRecognition?:RecognitionConstructor};
 return browser.SpeechRecognition||browser.webkitSpeechRecognition;
}
export function speechError(code:string){
 const errors:Record<string,string>={
  'not-allowed':'Разрешите доступ к микрофону в настройках браузера и попробуйте ещё раз.',
  'service-not-allowed':'Распознавание речи недоступно в этом браузере. Введите запрос текстом.',
  'audio-capture':'Микрофон недоступен. Проверьте подключение и доступ к нему.',
  'no-speech':'Не удалось расслышать. Нажмите микрофон и попробуйте ещё раз.',
  network:'Не удалось подключиться к распознаванию речи. Проверьте интернет и повторите.',
  'language-not-supported':'Распознавание на русском языке недоступно в этом браузере.',
 };
 return errors[code]||'Не удалось распознать речь. Попробуйте ещё раз или введите запрос текстом.';
}
export function createSpeechInput({Recognition,onText,onState,onError}:{Recognition?:RecognitionConstructor;onText:(text:string)=>void;onState:(state:SpeechState)=>void;onError:(error:string)=>void}){
 let active:Recognition|null=null,stopTimer:ReturnType<typeof setTimeout>|undefined;
 function dispose(abort=true){const rec=active;active=null;clearTimeout(stopTimer);if(rec){rec.onstart=null;rec.onresult=null;rec.onerror=null;rec.onend=null;if(abort)try{rec.abort();}catch{/* already ended */}}onState('idle');}
 function stop(){if(!active)return;const rec=active;onState('stopping');try{rec.stop();if(active===rec)stopTimer=setTimeout(()=>dispose(),1800);}catch{dispose();}}
 function start(base:string){
  if(active)return;
  onError('');
  if(!Recognition){onError('В этом браузере голосовой ввод недоступен. Введите запрос текстом или откройте прототип в браузере с поддержкой распознавания речи.');return;}
  if(base.length>=2000){onError('Сообщение уже содержит 2000 символов. Сократите его перед диктовкой.');return;}
  let rec:Recognition;try{rec=new Recognition();}catch{onError(speechError('service-not-allowed'));return;}
  active=rec;let heard=false,reachedLimit=false;
  rec.lang='ru-RU';rec.continuous=false;rec.interimResults=true;rec.maxAlternatives=1;
  rec.onstart=()=>{if(active===rec)onState('listening');};
  rec.onresult=event=>{if(active!==rec)return;const words=Array.from(event.results,result=>result[0].transcript).join(' ').trim();if(!words)return;heard=true;const text=[base.trimEnd(),words].filter(Boolean).join(' ');onText(text.slice(0,2000));if(text.length>=2000&&!reachedLimit){reachedLimit=true;onError('Достигнут лимит 2000 символов. Проверьте текст перед отправкой.');stop();}};
  rec.onerror=event=>{if(active!==rec)return;if(event.error!=='aborted')onError(speechError(event.error));dispose();};
  rec.onend=()=>{if(active!==rec)return;if(!heard)onError(speechError('no-speech'));dispose(false);};
  onState('starting');try{rec.start();}catch{dispose();onError(speechError('audio-capture'));}
 }
 return {start,stop,cancel:()=>dispose()};
}
