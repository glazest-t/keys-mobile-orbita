import type {State,User} from '../state.ts';

export type PinCredential={salt:string;digest:string};
export type ProfileSettings={pinCredential?:PinCredential;pinFailures?:number;pinBlockedUntil?:number;push:boolean;email:boolean;sms:boolean;booking:boolean;messages:boolean;services:boolean;benefits:boolean;offers:boolean;quiet:boolean;quietStart:string;quietEnd:string;biometric:boolean;pinEnabled:boolean;otherSession:boolean;personalization:boolean;analytics:boolean;deletionRequestedAt:string|null};
export const defaultSettings=():ProfileSettings=>({push:true,email:false,sms:false,booking:true,messages:true,services:true,benefits:true,offers:false,quiet:false,quietStart:'22:00',quietEnd:'08:00',biometric:false,pinEnabled:false,otherSession:true,personalization:true,analytics:false,deletionRequestedAt:null});
export function profileSettings(user:User):ProfileSettings{const settings={...defaultSettings(),...user.settings};if(!settings.pinCredential){settings.pinEnabled=false;settings.biometric=false;}return settings;}
export function updateSettings(s:State,owner:string,patch:Partial<ProfileSettings>):State{
 const user=s.users[owner];if(!user||s.activePhone!==owner)throw Error('Войдите в профиль');
 const next={...profileSettings(user),...patch};
 if(next.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.travelers.find(t=>t.primary)?.email||''))throw Error('Добавьте почту в данные профиля');
 for(const time of [next.quietStart,next.quietEnd])if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw Error('Укажите время в формате ЧЧ:ММ');
 if(next.quiet&&next.quietStart===next.quietEnd)throw Error('Начало и конец должны отличаться');
 return {...s,users:{...s.users,[owner]:{...user,settings:next}}};
}
// Local demo verifier only. Real mobile access requires OS credentials and secure storage.
async function pinDigest(pin:string,salt:string){
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(pin),'PBKDF2',false,['deriveBits']);
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);
 return Array.from(new Uint8Array(bits),b=>b.toString(16).padStart(2,'0')).join('');
}
export async function confirmPin(s:State,owner:string,first:string,second:string):Promise<State>{
 if(!s.users[owner]||s.activePhone!==owner)throw Error('Войдите в профиль');
 if(!/^\d{4}$/.test(first)||!/^\d{4}$/.test(second))throw Error('Введите четыре цифры');
 if(first!==second)throw Error('Коды не совпали. Попробуйте ещё раз');
 const salt=crypto.randomUUID(),digest=await pinDigest(first,salt);
 return updateSettings(s,owner,{pinEnabled:true,pinCredential:{salt,digest},pinFailures:0,pinBlockedUntil:0});
}
export const hasDevicePin=(user:User)=>!!(profileSettings(user).pinEnabled&&profileSettings(user).pinCredential);
export async function checkPin(s:State,owner:string,pin:string,now=Date.now()){
 if(s.activePhone!==owner||!s.users[owner])throw Error('Войдите в профиль');
 const settings=profileSettings(s.users[owner]);
 if(!hasDevicePin(s.users[owner]))throw Error('Сначала установите PIN-код');
 if((settings.pinBlockedUntil||0)>now)return {state:s,valid:false,message:'Слишком много попыток. Подождите 30 секунд или войдите по СМС'};
 const valid=/^\d{4}$/.test(pin)&&await pinDigest(pin,settings.pinCredential!.salt)===settings.pinCredential!.digest;
 const failures=valid?0:((settings.pinBlockedUntil||0)>0?0:settings.pinFailures||0)+1;
 return {state:updateSettings(s,owner,{pinFailures:failures>=5?0:failures,pinBlockedUntil:failures>=5?now+30000:0}),valid,
  message:valid?'':failures>=5?'Слишком много попыток. Подождите 30 секунд или войдите по СМС':'Неверный PIN-код. Попробуйте ещё раз'};
}
export function clearDeviceAccess(s:State,owner:string){return updateSettings(s,owner,{pinEnabled:false,pinCredential:undefined,biometric:false,pinFailures:0,pinBlockedUntil:0});}
export function requestDeletion(s:State,owner:string,acknowledged:boolean,now=new Date().toISOString()):State{
 if(!s.users[owner]||s.activePhone!==owner)throw Error('Войдите в профиль');
 if(!acknowledged)throw Error('Подтвердите, что ознакомились с условиями');
 return updateSettings(s,owner,{deletionRequestedAt:profileSettings(s.users[owner]).deletionRequestedAt||now});
}
