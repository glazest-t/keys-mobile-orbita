import {confirmPin,updateSettings} from './profile/settings.ts';
import {blankTraveler,type State} from './state.ts';
import {ensureAccount,type Commerce} from './booking/model.ts';
import {submitVerification,resolveVerification,verificationClaim} from './hotelier/verification.ts';
export type DemoEntry='new'|'hotelier'|'returning'|'returning-guest';
export function prepareDemoEntry(state:State,kind:DemoEntry,commerce:Commerce){
 const returning=kind==='returning'||kind==='returning-guest';
 const candidates=[...new Set([state.activePhone,...Object.keys(state.users)])].filter((phone):phone is string=>!!phone&&!!state.users[phone]);
 const matched=returning?candidates.find(phone=>kind==='returning'
  ?commerce.accounts[phone]?.hotelierStatus==='approved'
  :(!commerce.accounts[phone]||commerce.accounts[phone].hotelierStatus==='none')&&!commerce.hotelierParticipants?.[phone]&&!commerce.hotelierVerifications?.[phone]):undefined;
 let fresh=1;
 while(state.users['+7999'+String(fresh).padStart(7,'0')]||commerce.accounts['+7999'+String(fresh).padStart(7,'0')])fresh++;
 const phone=matched||'+7999'+String(fresh).padStart(7,'0');
 const users=returning&&!state.users[phone]?{...state.users,[phone]:{phone,name:'Анна',travelers:[{...blankTraveler('primary'),name:'Анна',surname:'Соколова',email:'anna@example.test',phone,primary:true}]}}:state.users;
 let nextCommerce=commerce;
 if(returning){
  nextCommerce=ensureAccount(commerce,phone);
  // Only a newly created demonstration profile receives a simulated approved role.
  // Existing users never have their status changed by selecting an entry scenario.
  if(kind==='returning'&&!matched){
   const pending=submitVerification(nextCommerce,phone,'anna@hotel.example',crypto.randomUUID());
   nextCommerce=resolveVerification(pending,phone,verificationClaim(pending.hotelierVerifications![phone]),'approved');
  }
 }
 const next:State={...state,users,activePhone:null,request:null,verifiedPhone:null,onboarded:returning,securityRecoveryPhone:undefined,hotelierOnboarding:false,hotelierTourTarget:undefined,hotelierInviter:undefined,hotelierReturnTo:'trips',returnTo:'trips',demoRegistrationPhone:returning?undefined:phone};
 return {state:next,commerce:nextCommerce,phone:phone.slice(2),route:kind==='new'?'welcome':kind==='hotelier'?'hotelier-invite':'phone'};
}

export type DeviceEntry='pin'|'biometric';
export const DEMO_PIN='1234';
/** Dedicated fixture: never replace a user's configured PIN or biometric settings. */
export async function prepareDeviceEntry(state:State,kind:DeviceEntry,commerce:Commerce){
 let phone=Object.keys(state.users).find(id=>state.users[id].demoDeviceAccess);
 if(!phone){let n=1;while(state.users['+7998'+String(n).padStart(7,'0')]||commerce.accounts['+7998'+String(n).padStart(7,'0')])n++;phone='+7998'+String(n).padStart(7,'0');}
 const user=state.users[phone]||{demoDeviceAccess:true,phone,name:'Анна',travelers:[{...blankTraveler('primary'),name:'Анна',surname:'Соколова',email:'anna@example.test',phone,primary:true}]};
 const next:State={...state,users:{...state.users,[phone]:user},activePhone:phone,request:null,verifiedPhone:null,securityRecoveryPhone:undefined,onboarded:true,hotelierOnboarding:false,hotelierTourTarget:undefined,hotelierInviter:undefined,hotelierReturnTo:'trips',returnTo:'trips',demoRegistrationPhone:undefined};
 const configured=await confirmPin(next,phone,DEMO_PIN,DEMO_PIN);
 return {state:updateSettings(configured,phone,{biometric:kind==='biometric'}),commerce:ensureAccount(commerce,phone),route:'trips'};
}
