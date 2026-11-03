import type {ReactNode} from 'react';
import {isDesktop} from '../desktop/surface';

/** Independent desktop columns; mobile retains its original flat document order. */
export function TripLayoutGroup({className,children}:{className:string;children:ReactNode}){
 return isDesktop?<div className={className}>{children}</div>:<>{children}</>;
}
