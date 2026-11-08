import {useSyncExternalStore} from 'react';
import {getPrototypeIcons,subscribePrototypeIcons} from './prototypeIcons';
export function usePrototypeIcons(){return useSyncExternalStore(subscribePrototypeIcons,getPrototypeIcons,()=> 'new' as const);}
