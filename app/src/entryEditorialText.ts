import {getPrototypeText} from './prototypeText.ts';
import {getPrototypeVariant} from './prototypeVariant.ts';

/** Workbook addendum: November edited entry flows on both surfaces. Other editions retain their copy. */
export function isEntryEdited(){return getPrototypeVariant()==='november'&&getPrototypeText()==='edited';}
export function entryEditorialText<T>(group:string,original:T,edited:T):T {
 void group;
 return isEntryEdited()?edited:original;
}
