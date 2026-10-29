import {historyFixture} from '../profile/historyDemo.ts';
import {type Commerce,initialCommerce,ensureAccount,startDraft,quoteDraft,commitBooking} from './model.ts';
import {demoCheckIn} from './stay.ts';
import {demoCheckoutDay,confirmCheckout,checkoutDay} from './stayBill.ts';
import {selectedTrip} from './trip.ts';

export const tripScenarios=[
 {id:'history',label:'История путешествий',hint:'Предстоящая, завершённая и отменённая брони'},
 {id:'empty',label:'Брони ещё нет',hint:'Поиск и подбор первой поездки'},
 {id:'upcoming',label:'До заезда',hint:'Бронь подтверждена, ключ ещё недоступен'},
 {id:'staying',label:'Во время проживания',hint:'Ключ, услуги и связь с отелем'},
 {id:'departure',label:'День выезда',hint:'Напоминание перед выездом'},
 {id:'completed',label:'После выезда',hint:'Завершённая поездка и отзыв'},
] as const;
export type TripScenario=typeof tripScenarios[number]['id'];
export type DemoTripSession={owner:string;original:Commerce};
/** A separate, replaceable fixture; original bookings and balances are restored verbatim. */
export function activateTripScenario(s:Commerce,owner:string,scenario:TripScenario,id:string,now=Date.now()):Commerce{
 if(!owner||!id||!tripScenarios.some(v=>v.id===scenario))throw Error('Выберите сценарий поездки');
 const original=s.demoTripSession?.original||s;
 let next=ensureAccount(initialCommerce(),owner);
 next={...next,search:{...next.search,city:'Сочи',checkIn:'2026-11-13',checkOut:'2026-11-15',adults:1,childrenAges:[]}};
 if(scenario==='history'){
  const bookings=[historyFixture(owner,'orbit-sea','KEYS-101','future'),historyFixture(owner,'orbit-forest','KEYS-102','past'),historyFixture(owner,'pine-sochi','KEYS-103','cancelled')];
  return {...next,bookings,selectedBooking:bookings[0].id,historyDemo:true,payment:{...next.payment,operations:Object.fromEntries(bookings.map(b=>[b.operation.id,b.operation]))},demoTripSession:{owner,original}};
 }
 if(scenario!=='empty'){
  next=startDraft(next,'orbit-sea',id);
  next={...next,draft:{...next.draft!,contact:{name:'Анна',surname:'Примерова',phone:owner,email:'anna@example.test'}}};
  // Fixed catalogue dates and payment timestamp make the fixture reproducible.
  next=commitBooking(next,owner,quoteDraft(next,owner),'success','2026-10-27T12:00:00Z');
  if(scenario!=='upcoming')next=demoCheckIn(next,owner,id,id+'-checkin',now);
  if(scenario==='departure'||scenario==='completed')next=demoCheckoutDay(next,owner,id,now);
  if(scenario==='completed')next=confirmCheckout(next,owner,id,id+'-checkout',now);
  next={...next,draft:null};
 }
 return {...next,demoTripSession:{owner,original}};
}
export function restoreTripData(s:Commerce):Commerce{return s.demoTripSession?.original||s;}
export function activeTripScenario(s:Commerce,owner:string,now=Date.now()):TripScenario|null{
 if(s.demoTripSession?.owner!==owner)return null;
 if(s.historyDemo)return 'history';
 const b=selectedTrip(s,owner);
 if(!b)return 'empty';
 if(b.stay?.status==='checked_out')return 'completed';
 if(b.stay)return checkoutDay(b,now)?'departure':'staying';
 return 'upcoming';
}
