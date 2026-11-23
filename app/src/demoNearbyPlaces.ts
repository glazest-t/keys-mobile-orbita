import {useSyncExternalStore} from 'react';

/** Presentation scenario only: map/data providers are unchanged. */
export type NearbyPlacesMode='photos'|'icons';
export const NEARBY_PLACES_KEY='keys-orbita-demo-nearby-places';
const eventName='keys-demo-nearby-places-change';
const valid=(value:string|null):value is NearbyPlacesMode=>value==='photos'||value==='icons';
export function resolveNearbyPlacesMode(href:string,saved:string|null):NearbyPlacesMode{
 const value=new URL(href).searchParams.get('nearbyPlaces');
 return valid(value)?value:valid(saved)?saved:'icons';
}
function getNearbyPlacesMode():NearbyPlacesMode{
 if(typeof location==='undefined')return 'icons';
 let saved:string|null=null;
 try{saved=localStorage.getItem(NEARBY_PLACES_KEY);}catch{/* URL remains usable. */}
 return resolveNearbyPlacesMode(location.href,saved);
}
export function setNearbyPlacesMode(value:NearbyPlacesMode){
 const url=new URL(location.href);url.searchParams.set('nearbyPlaces',value);
 history.replaceState(history.state,'',url);
 try{localStorage.setItem(NEARBY_PLACES_KEY,value);}catch{/* URL retains selection. */}
 window.dispatchEvent(new Event(eventName));
}
function subscribe(listener:()=>void){
 window.addEventListener(eventName,listener);window.addEventListener('popstate',listener);window.addEventListener('storage',listener);
 return()=>{window.removeEventListener(eventName,listener);window.removeEventListener('popstate',listener);window.removeEventListener('storage',listener);};
}
export function useNearbyPlacesMode(){return useSyncExternalStore(subscribe,getNearbyPlacesMode,()=> 'icons' as const);}
