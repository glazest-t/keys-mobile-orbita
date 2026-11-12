export type AppTheme='light'|'dark'|'system';
export const APP_THEME_KEY='keys-orbita-theme';
const changeEvent='keys-theme-change';
const valid=(value:string|null):value is AppTheme=>value==='light'||value==='dark'||value==='system';
export function resolveAppTheme(href:string,saved:string|null):AppTheme{
 const explicit=new URL(href).searchParams.get('theme');
 return valid(explicit)?explicit:valid(saved)?saved:'light';
}
export function effectiveAppTheme(theme:AppTheme,systemDark:boolean):'light'|'dark'{return theme==='system'?(systemDark?'dark':'light'):theme;}
export function getAppTheme():AppTheme{
 if(typeof location==='undefined')return 'light';
 let saved:string|null=null;try{saved=localStorage.getItem(APP_THEME_KEY);}catch{/* URL keeps the selection available. */}
 return resolveAppTheme(location.href,saved);
}
function applyAppTheme(){
 if(typeof document==='undefined')return;
 const mode=effectiveAppTheme(getAppTheme(),window.matchMedia('(prefers-color-scheme: dark)').matches);
 document.documentElement.dataset.appTheme=mode;
 document.documentElement.style.colorScheme=mode;
}
export function setAppTheme(theme:AppTheme){
 const url=new URL(location.href);url.searchParams.set('theme',theme);history.replaceState(history.state,'',url);
 try{localStorage.setItem(APP_THEME_KEY,theme);}catch{/* The current URL still retains the selection. */}
 applyAppTheme();window.dispatchEvent(new Event(changeEvent));
}
export function subscribeAppTheme(notify:()=>void){
 window.addEventListener(changeEvent,notify);window.addEventListener('popstate',notify);window.addEventListener('storage',notify);
 return ()=>{window.removeEventListener(changeEvent,notify);window.removeEventListener('popstate',notify);window.removeEventListener('storage',notify);};
}
if(typeof window!=='undefined'){
 applyAppTheme();
 window.addEventListener('popstate',applyAppTheme);
 window.addEventListener('storage',applyAppTheme);
 window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyAppTheme);
}
