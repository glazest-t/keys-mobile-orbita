/** Approved Soft icon set. SVG alpha preserves the optional secondary tone in masks. */
import {getPrototypeIcons,type PrototypeIcons} from './prototypeIcons';
export const ICON_REVISION='soft-20261108-25';
export function iconAsset(name:string,variant:PrototypeIcons=getPrototypeIcons()){
 const directory=variant==='old'?'icons-original':'icons';
 return `/brand/assets/${directory}/${name}.svg?v=${variant==='old'?'original-20261107':ICON_REVISION}`;
}
