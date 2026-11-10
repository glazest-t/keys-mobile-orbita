import {useSyncExternalStore} from 'react';
const eventName='keys-demo-history-loading';
let revision=0;
const snapshot=()=>`${typeof location!=='undefined'&&new URLSearchParams(location.search).get('historyLoading')==='error'?'error':'loaded'}:${revision}`;
function subscribe(listener:()=>void){window.addEventListener(eventName,listener);window.addEventListener('popstate',listener);return()=>{window.removeEventListener(eventName,listener);window.removeEventListener('popstate',listener);};}
export function useDemoHistoryLoading(){const value=useSyncExternalStore(subscribe,snapshot,()=> 'loaded:0');return {failed:value.startsWith('error:'),key:value};}
export function setDemoHistoryLoading(failed:boolean){
 const url=new URL(location.href);if(failed)url.searchParams.set('historyLoading','error');else url.searchParams.delete('historyLoading');
 history.replaceState(history.state,'',url);revision++;window.dispatchEvent(new Event(eventName));
}
