import {getPrototypeText} from './prototypeText.ts';
import {getPrototypeVariant} from './prototypeVariant.ts';
import {isDesktop} from './desktop/surface.ts';

/** Workbook addendum: November mobile entry flows only. Other editions retain their copy. */
export function isEntryEdited(){return !isDesktop&&getPrototypeVariant()==='november'&&getPrototypeText()==='edited';}
export function entryEditorialText<T>(group:string,original:T,edited:T):T {
 void group;
 return isEntryEdited()?edited:original;
}
