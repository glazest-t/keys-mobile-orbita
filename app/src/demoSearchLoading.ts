import {useSyncExternalStore} from 'react';
const eventName='keys-demo-search-loading';
let revision=0;
const snapshot=()=>`${typeof location!=='undefined'&&new URLSearchParams(location.search).get('searchLoading')==='slow'?'slow':'normal'}:${revision}`;
function subscribe(listener:()=>void){window.addEventListener(eventName,listener);window.addEventListener('popstate',listener);return()=>{window.removeEventListener(eventName,listener);window.removeEventListener('popstate',listener);};}
export function useDemoSearchLoading(){const value=useSyncExternalStore(subscribe,snapshot,()=> 'normal:0');return {slow:value.startsWith('slow:'),key:value};}
export function setDemoSearchLoading(slow:boolean){
 const url=new URL(location.href);if(slow)url.searchParams.set('searchLoading','slow');else url.searchParams.delete('searchLoading');
 history.replaceState(history.state,'',url);revision++;window.dispatchEvent(new Event(eventName));
}
export function waitForDemoSearch(signal:AbortSignal){return new Promise<void>(resolve=>{
 if(signal.aborted){resolve();return;}
 const finish=()=>{clearTimeout(timer);signal.removeEventListener('abort',finish);resolve();};
 const timer=setTimeout(finish,5000);signal.addEventListener('abort',finish,{once:true});
});}
