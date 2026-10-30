import {submitSupport} from '../profile/support';
import {confirmPin} from '../profile/settings';
import {addNotificationExamples} from '../booking/notifications';
import {requestBreakfast,availableBreakfastDates} from '../booking/serviceRequests';
import {confirmPricedServices} from '../booking/servicePayment';
import {payService,serviceQuote} from '../booking/serviceSettlement';
/** Isolated publication fixtures. Never read or write a visitor's saved prototype. */
import scenes from './scenes.json';
import {collectionSearch} from '../booking/search';
import {initialState,blankTraveler,requestCode,type State} from '../state';
import {initialCommerce,startDraft,quoteDraft,commitBooking,type Commerce} from '../booking/model';
import {activateTripScenario,type TripScenario} from '../booking/demoTripScenarios';
import {prepareDeviceEntry} from '../demoEntry';
import {ensureDemoHotelPoints} from '../rewards/loyalty';
import {ensureWelcomePoints,ensureDemoPointsHistory} from '../rewards/points';
import {registerHotelierInterest,submitVerification,resolveVerification,verificationClaim} from '../hotelier/verification';
import {saveSwipeLike,favoriteNavigation} from '../booking/favorites';
import {savePriceWatch} from '../booking/priceWatch';
import {saveSwipePreferences} from '../booking/swipePreferences';
import {freeTextDraft,saveFreeText} from '../booking/preferences';
export type CatalogueScene={id:string;title:string;group:string;route:string;trip?:string;step?:string;role?:string;sheet?:string;launch?:boolean;device?:string;biometric?:string;onboarding?:number;actions?:{text?:string;selector?:string;contains?:string}[];[key:string]:unknown};
export const catalogueScene:CatalogueScene|null=typeof location==='undefined'?null:(scenes as CatalogueScene[]).find(s=>s.id===new URLSearchParams(location.search).get('catalogue'))||null;
export type CatalogueFixture={state:State;commerce:Commerce};
export async function createCatalogueFixture(scene:CatalogueScene):Promise<CatalogueFixture>{
 const owner='+79990000001';
 let state:State={...initialState(),onboarded:true,activePhone:owner,users:{[owner]:{phone:owner,name:'Анна',travelers:[{...blankTraveler('primary'),primary:true,name:'Анна',surname:'Соколова',phone:owner,email:'anna@example.test',birthDate:'1992-04-18',citizenship:'Россия'},{...blankTraveler('companion'),name:'Иван',surname:'Соколов',phone:'+79990000002',email:'ivan@example.test'}]}}};
 let commerce=activateTripScenario(initialCommerce(),owner,(scene.trip||'empty') as TripScenario,'catalogue-booking');
 commerce=ensureDemoHotelPoints(ensureDemoPointsHistory(ensureWelcomePoints(commerce,owner),owner),owner);
 if(scene.firstFind)state.users[owner].travelStyleIntro='pending';
 if(scene.loyalty)commerce={...commerce,hotelMemberships:{...commerce.hotelMemberships,[owner]:{...commerce.hotelMemberships?.[owner],'orbit-sea':true}}};
 if(scene.role&&scene.role!=='guest'){
  commerce=registerHotelierInterest(commerce,owner,{name:'Юра Костин',hotel:'Travelline'});
  if(scene.role!=='interested'){
   commerce=submitVerification(commerce,owner,'anna@hotel.example','catalogue-verification');
   if(scene.role==='approved'||scene.role==='rejected')commerce=resolveVerification(commerce,owner,verificationClaim(commerce.hotelierVerifications![owner]),scene.role);
  }
 }
 for(const hotel of ['orbit-sea','orbit-forest','pine-sochi'])commerce=saveSwipeLike(commerce,owner,hotel);
 commerce=favoriteNavigation(commerce,owner,{selectedId:'swipe-picks'});
 const watch=startDraft(commerce,'orbit-sea','catalogue-watch',owner);
 commerce=savePriceWatch(commerce,owner,watch.draft!,{mode:'any',targetMinor:null,push:true,active:true,priceMinor:quoteDraft(watch,owner).cashDueMinor+550000});
 if(scene.swipe)commerce=saveSwipePreferences(commerce,owner,['nature','spa'],true);
 if(scene.collection)commerce={...commerce,collection:String(scene.collection),search:collectionSearch(commerce.search,String(scene.collection))};
 if(scene.wish){const d=freeTextDraft(commerce,owner);commerce=saveFreeText(commerce,owner,{...d,stage:'results',wishText:'Отель у моря со спа',wishAppliedText:'Отель у моря со спа',wishInterests:['sea','spa'],mode:'city',city:'Сочи'});}
 if(scene.adults)commerce={...commerce,search:{...commerce.search,adults:Number(scene.adults)}};
 if(scene.step){
  commerce=startDraft(commerce,'orbit-sea','catalogue-draft',owner);
  commerce={...commerce,draft:{...commerce.draft!,step:scene.step,contact:{name:'Анна',surname:'Соколова',phone:owner,email:'anna@example.test'}}};
  if(scene.step==='confirmation')commerce=commitBooking(commerce,owner,quoteDraft(commerce,owner),'success');
 }
 if(scene.route==='notifications')commerce=addNotificationExamples(commerce,owner);
 if(scene.support)state=submitSupport(state,commerce,owner,'catalogue-support',{topic:'Бронирование',text:'Подскажите, как изменить даты поездки.'});
 if(scene.pinConfigured)state=await confirmPin(state,owner,'1234','1234');
 if(scene.breakfast){
  const b=commerce.bookings.find(b=>b.id===commerce.selectedBooking)!;
  const date=availableBreakfastDates(b,{mode:'buffet',time:'09:00',date:b.draft.search.checkOut,persons:1,comment:''})[0];
  commerce=requestBreakfast(commerce,owner,b.id,{mode:'buffet',date,time:'09:00',persons:1,comment:''},'catalogue-service');
  commerce=confirmPricedServices(commerce,owner,b.id,['catalogue-service']);
  if(scene.paid)commerce=payService(commerce,owner,b.id,'catalogue-service',serviceQuote(commerce,owner,b.id,'catalogue-service',false),'sbp','success');
 }
 if(scene.hotelNotifications)commerce={...commerce,notificationHotelId:'orbit-sea'};
 if(['welcome','phone','code','name','hotelier-invite'].includes(scene.route)){
  state={...state,activePhone:null,users:{},onboarded:scene.route!=='welcome'};
  if(scene.route==='code')state=requestCode(state,owner);
  if(scene.route==='name')state={...state,verifiedPhone:owner};
 }
 if(scene.device==='pin'||scene.device==='biometric'){
  const configured=await prepareDeviceEntry(state,scene.device,commerce);state=configured.state;commerce=configured.commerce;
 }
 return {state,commerce};
}
