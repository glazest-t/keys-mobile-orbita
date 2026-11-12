import {useSyncExternalStore} from 'react';
import {getAppTheme,subscribeAppTheme} from './appTheme';
export function useAppTheme(){return useSyncExternalStore(subscribeAppTheme,getAppTheme,()=> 'light' as const);}
