/** Exact atlas artwork; v2 wins wherever supplied. Original mode stays available. */
import {getPrototypeIcons,type PrototypeIcons} from './prototypeIcons';
import atlas from './iconAtlas.json';
const assets:Record<string,{file:string;color:boolean}>=atlas;
export const ICON_REVISION='soft-contour-v2-20261120';
export function isColorIcon(name:string,variant:PrototypeIcons){return variant==='new'&&assets[name]?.color===true;}
export function iconAsset(name:string,variant:PrototypeIcons=getPrototypeIcons()){
 if(variant==='new'&&assets[name])return `/brand/assets/icons-contour/${assets[name].file}?v=${ICON_REVISION}`;
 const directory=variant==='old'?'icons-original':'icons';
 return `/brand/assets/${directory}/${name}.svg?v=${variant==='old'?'original-20261107':ICON_REVISION}`;
}
