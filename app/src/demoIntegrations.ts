import {useSyncExternalStore} from 'react';

export type DemoIntegration='room'|'key'|'wifi';
const eventName='keys-demo-integrations';
const parameter='integrationOff';
const snapshot=()=>typeof location==='undefined'?'':new URLSearchParams(location.search).get(parameter)||'';
function subscribe(listener:()=>void){
 window.addEventListener(eventName,listener);window.addEventListener('popstate',listener);
 return()=>{window.removeEventListener(eventName,listener);window.removeEventListener('popstate',listener);};
}
export function useDemoIntegrations(){
 const value=useSyncExternalStore(subscribe,snapshot,()=> '');
 const disabled=new Set(value.split(','));
 return {room:!disabled.has('room'),key:!disabled.has('key'),wifi:!disabled.has('wifi')};
}
export function toggleDemoIntegration(integration:DemoIntegration){
 const disabled=new Set(snapshot().split(',').filter(Boolean));
 if(disabled.has(integration))disabled.delete(integration);else disabled.add(integration);
 const url=new URL(location.href);
 const value=(['room','key','wifi'] as const).filter(item=>disabled.has(item)).join(',');
 if(value)url.searchParams.set(parameter,value);else url.searchParams.delete(parameter);
 history.replaceState(history.state,'',url);window.dispatchEvent(new Event(eventName));
}
