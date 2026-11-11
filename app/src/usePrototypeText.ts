import {useSyncExternalStore} from 'react';
import {getPrototypeText,subscribePrototypeText,selectPrototypeText} from './prototypeText';
export function usePrototypeText(){return useSyncExternalStore(subscribePrototypeText,getPrototypeText,()=> 'standard' as const);}
export function usePrototypeCopy(original:string,edited=original){return selectPrototypeText(usePrototypeText(),original,edited);}
