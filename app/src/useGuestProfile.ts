import {useSyncExternalStore} from 'react';
import {getGuestProfile,subscribeGuestProfile} from './demoGuestProfile';
export function useGuestProfile(){return useSyncExternalStore(subscribeGuestProfile,getGuestProfile,()=>false);}
