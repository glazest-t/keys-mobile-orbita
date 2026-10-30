import {normalizeContactPhone} from './travelers/contactPhone.ts';
export type Traveler = {id:string; name:string; surname:string; patronymic:string; birthDate:string; citizenship:string; phone:string; email:string; primary?:boolean};
export type User = {travelStyleIntro?:'pending'|'seen';demoDeviceAccess?:boolean;photo?:string;helpBrowse?:{query:string;category:string};supportRequests?:import('./profile/support').SupportRequest[];supportDraft?:import('./profile/support').SupportDraft;settings?:import('./profile/settings').ProfileSettings;phone:string; name:string; travelers:Traveler[]};
export type CodeRequest = {phone:string; issuedAt:number; expiresAt:number; resendAt:number};
export type State = {hotelierTourTarget?:'hotelier'|'trips';securityRecoveryPhone?:string;demoRegistrationPhone?:string;hotelierInviter?:{name:string;hotel:string};hotelierOnboarding?:boolean;hotelierReturnTo?:string;version:1; onboarded:boolean; users:Record<string,User>; activePhone:string|null; request:CodeRequest|null; verifiedPhone:string|null; returnTo:string; selectedTravelerId?:string};
export const STORAGE_KEY='keys-orbita-demo-v1';
export function initialState():State{return {version:1,onboarded:false,users:{},activePhone:null,request:null,verifiedPhone:null,returnTo:'trips'};}
export function normalizePhone(raw:string){let digits=raw.replace(/\D/g,'');if(digits.length===11&&['7','8'].includes(digits[0]))digits=digits.slice(1);return /^\d{10}$/.test(digits)?'+7'+digits:null;}
export function displayPhone(value:string){const n=value.replace(/\D/g,'').slice(-10);return n.length===10?`+7 ${n.slice(0,3)} ${n.slice(3,6)}-${n.slice(6,8)}-${n.slice(8)}`:value;}
export function validName(value:string){const v=value.trim();return v.length>=2&&v.length<=40&&/^[\p{L}]+(?:[ '\-’][\p{L}]+)*$/u.test(v);}
export function requestCode(state:State,raw:string,now=Date.now()):State{
 const phone=normalizePhone(raw);if(!phone)throw Error('Введите 10 цифр номера после +7');
 if(state.request?.phone===phone&&state.request.resendAt>now)throw Error('Подождите перед повторной отправкой');
 return {...state,request:{phone,issuedAt:now,expiresAt:now+300000,resendAt:now+30000},verifiedPhone:null};
}
export function verifyCode(state:State,code:string,now=Date.now()):State{
 if(!state.request)throw Error('Запросите новый код');
 if(now>=state.request.expiresAt)throw Error('Срок кода истёк. Запросите новый');
 if(code!=='123456')throw Error('Код не подходит. Проверьте шесть цифр');
 const phone=state.request.phone;
 if(state.securityRecoveryPhone===phone&&state.users[phone]){const user=state.users[phone];state={...state,securityRecoveryPhone:undefined,users:{...state.users,[phone]:{...user,settings:user.settings?{...user.settings,pinEnabled:false,pinCredential:undefined,biometric:false,pinFailures:0,pinBlockedUntil:0}:undefined}}};}
 return {...state,securityRecoveryPhone:undefined,request:null,verifiedPhone:state.users[phone]&&!state.hotelierOnboarding?null:phone,activePhone:state.users[phone]&&!state.hotelierOnboarding?phone:null,onboarded:true};
}
export function completeName(state:State,name:string):State{
 name=name.trim().replace(/\s+/g,' ');if(!state.verifiedPhone)throw Error('Сначала подтвердите телефон');if(!validName(name))throw Error('Введите имя: от 2 до 40 букв');
 const phone=state.verifiedPhone;const clean=name.trim();
 state={...state,hotelierTourTarget:state.hotelierOnboarding?(state.returnTo==='hotelier'?'hotelier':'trips'):undefined};
 const existing=state.users[phone];if(existing)return {...state,demoRegistrationPhone:undefined,verifiedPhone:null,activePhone:phone,users:{...state.users,[phone]:{...existing,name:clean,travelers:existing.travelers.map(t=>t.primary?{...t,name:clean}:t)}}};
 return {...state,demoRegistrationPhone:undefined,verifiedPhone:null,activePhone:phone,users:{...state.users,[phone]:{phone,name:clean,travelStyleIntro:'pending',travelers:[{...blankTraveler('primary'),name:clean,phone,primary:true}]}}};
}
export function registrationContinuation(state:State){return state.hotelierTourTarget==='hotelier'?'hotelier':state.hotelierTourTarget==='trips'?'welcome':state.returnTo;}
export function finishHotelierEntry(state:State):State{return {...state,hotelierOnboarding:false,hotelierTourTarget:state.hotelierTourTarget?'trips':undefined};}
export function completeRegistrationTour(state:State):State{return {...state,onboarded:true,hotelierTourTarget:undefined};}
export function blankTraveler(id:string):Traveler{return {id,name:'',surname:'',patronymic:'',birthDate:'',citizenship:'',phone:'',email:''};}
export function validateTraveler(t:Traveler,today=new Date().toISOString().slice(0,10)){
 const errors:Record<string,string>={};
 if(!validName(t.name))errors.name='Имя: от 2 до 40 букв';
 if(!validName(t.surname))errors.surname='Укажите фамилию: от 2 до 40 букв';
 if(t.patronymic&&!validName(t.patronymic))errors.patronymic='Проверьте отчество';
 if(t.birthDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(t.birthDate)||!Number.isFinite(Date.parse(t.birthDate))||new Date(t.birthDate).toISOString().slice(0,10)!==t.birthDate||t.birthDate<'1900-01-01'||t.birthDate>today))errors.birthDate='Дата должна быть между 1900 годом и сегодня';
 if(!t.phone.trim())errors.phone='Укажите номер телефона';else if(!normalizeContactPhone(t.phone))errors.phone='Проверьте номер телефона';
 if(t.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.email))errors.email='Проверьте адрес почты';
 return errors;
}
export function saveTraveler(state:State,traveler:Traveler):State{
 const user=state.activePhone&&state.users[state.activePhone];if(!user)throw Error('Войдите в профиль');
 if(Object.keys(validateTraveler(traveler)).length)throw Error('Проверьте данные путешественника');
 const old=user.travelers.find(t=>t.id===traveler.id);const saved={...traveler,name:traveler.name.trim(),surname:traveler.surname.trim(),phone:normalizeContactPhone(traveler.phone)!,primary:!!old?.primary};
 const travelers=old?user.travelers.map(t=>t.id===saved.id?saved:t):[...user.travelers,saved];
 return {...state,users:{...state.users,[user.phone]:{...user,name:saved.primary?saved.name:user.name,travelers}}};
}
export function deleteTraveler(state:State,id:string):State{
 const user=state.activePhone&&state.users[state.activePhone];if(!user)throw Error('Войдите в профиль');
 if(user.travelers.find(t=>t.id===id)?.primary)throw Error('Основного путешественника удалить нельзя');
 return {...state,users:{...state.users,[user.phone]:{...user,travelers:user.travelers.filter(t=>t.id!==id)}}};
}
export function decodeState(raw:string|null):State{
 if(!raw)return initialState();const value=JSON.parse(raw);
 if(value.version!==1||typeof value.onboarded!=='boolean'||!value.users||typeof value.users!=='object'||Array.isArray(value.users))throw Error('Неизвестный формат сохранения');
 for(const [phone,u] of Object.entries(value.users) as [string,User][]){
  if(normalizePhone(phone)!==phone||u.phone!==phone||!validName(u.name)||!Array.isArray(u.travelers)||!u.travelers.every(t=>typeof t.id==='string'&&['name','surname','patronymic','birthDate','citizenship','phone','email'].every(k=>typeof (t as unknown as Record<string,unknown>)[k]==='string')))throw Error('Повреждены данные профиля');
 }
 if(value.activePhone!==null&&!value.users[value.activePhone])throw Error('Профиль не найден');
 if(value.request&&(!normalizePhone(value.request.phone)||!['issuedAt','expiresAt','resendAt'].every(k=>Number.isFinite(value.request[k]))))throw Error('Повреждён запрос кода');
 return {...initialState(),...value};
}
