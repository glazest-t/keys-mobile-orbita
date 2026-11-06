import {useSyncExternalStore} from 'react';
import {getPrototypeVariant,subscribePrototypeVariant} from './prototypeVariant';

/** Use this edition switch for November-specific product behavior. */
export function usePrototypeVariant() {
 return useSyncExternalStore(subscribePrototypeVariant, getPrototypeVariant, () => 'full' as const);
}

export function useNovember(){return usePrototypeVariant()==='november';}
