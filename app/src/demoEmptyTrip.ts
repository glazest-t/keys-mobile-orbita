import {useSyncExternalStore} from 'react';
export type EmptyTripScenario='none'|'missing';
const eventName='keys-demo-empty-trip';
const snapshot=():EmptyTripScenario=>typeof location!=='undefined'&&new URLSearchParams(location.search).get('emptyTrip')==='missing'?'missing':'none';
function subscribe(listener:()=>void){window.addEventListener(eventName,listener);window.addEventListener('popstate',listener);return()=>{window.removeEventListener(eventName,listener);window.removeEventListener('popstate',listener);};}
export function useDemoEmptyTrip(){return useSyncExternalStore(subscribe,snapshot,()=> 'none' as const);}
export function setDemoEmptyTrip(value:EmptyTripScenario){const url=new URL(location.href);if(value==='missing')url.searchParams.set('emptyTrip',value);else url.searchParams.delete('emptyTrip');history.replaceState(history.state,'',url);window.dispatchEvent(new Event(eventName));}
