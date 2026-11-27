import scenes from './catalogue/scenes.json' with {type:'json'};

/** Prototype scenario only; does not sign users out or erase their preferences. */
export const GUEST_PROFILE_KEY='keys-orbita-demo-guest-profile';
const eventName='keys-demo-guest-profile';
const styleStudyScenes=new Set(scenes.filter(scene=>scene.styleStudy).map(scene=>scene.id));
export function resolveGuestProfile(href:string,saved:string|null){
 const params=new URL(href).searchParams,value=params.get('guestProfile');
 if(value==='yes'||value==='no')return value==='yes';
 return styleStudyScenes.has(params.get('catalogue')||'')||saved==='yes';
}
export function getGuestProfile(){
 if(typeof location==='undefined')return false;
 let saved:string|null=null;
 try{saved=localStorage.getItem(GUEST_PROFILE_KEY);}catch{/* URL remains usable. */}
 return resolveGuestProfile(location.href,saved);
}
export function setGuestProfile(enabled:boolean){
 const value=enabled?'yes':'no',url=new URL(location.href);
 url.searchParams.set('guestProfile',value);history.replaceState(history.state,'',url);
 try{localStorage.setItem(GUEST_PROFILE_KEY,value);}catch{/* URL retains selection. */}
 window.dispatchEvent(new Event(eventName));
}
export function subscribeGuestProfile(listener:()=>void){
 window.addEventListener(eventName,listener);window.addEventListener('popstate',listener);window.addEventListener('storage',listener);
 return()=>{window.removeEventListener(eventName,listener);window.removeEventListener('popstate',listener);window.removeEventListener('storage',listener);};
}
