import {getPrototypeText,selectPrototypeText} from '../prototypeText';
import {createFinderChat,sendFinderMessage,completeFinderReply} from '../assistant/model';
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
import {saveSwipeLike,favoriteNavigation,saveFavoriteList} from '../booking/favorites';
import {savePriceWatch,watchKey} from '../booking/priceWatch';
import {roomOffers} from '../booking/roomOffers';
import {saveSwipePreferences} from '../booking/swipePreferences';
import {freeTextDraft,saveFreeText} from '../booking/preferences';
export type CatalogueScene={id:string;title:string;group:string;route:string;trip?:string;step?:string;role?:string;sheet?:string;launch?:boolean;device?:string;biometric?:string;onboarding?:number;actions?:{text?:string;selector?:string;contains?:string}[];[key:string]:unknown};
export const catalogueScene:CatalogueScene|null=typeof location==='undefined'?null:(scenes as CatalogueScene[]).find(s=>s.id===new URLSearchParams(location.search).get('catalogue'))||null;
export type CatalogueFixture={state:State;commerce:Commerce};
export async function createCatalogueFixture(scene:CatalogueScene):Promise<CatalogueFixture>{
 const owner='+79990000001';
 let state:State={...initialState(),onboarded:true,activePhone:owner,users:{[owner]:{phone:owner,name:'Татьяна',travelers:[{...blankTraveler('primary'),primary:true,name:'Татьяна',surname:'Соколова',phone:owner,email:'tatyana@example.test',birthDate:'1992-04-18',citizenship:'Россия'},{...blankTraveler('companion'),name:'Иван',surname:'Соколов',phone:'+79990000002',email:'ivan@example.test'}]}}};
 let commerce=activateTripScenario(initialCommerce(),owner,(scene.trip||'empty') as TripScenario,'catalogue-booking');
 commerce=ensureDemoHotelPoints(ensureDemoPointsHistory(ensureWelcomePoints(commerce,owner),owner),owner);
 if(scene.trip==='cancelled')commerce={...commerce,historyReturnTo:'trips',historyBrowse:{[owner]:{query:'',filter:'Отменённые'}}};
 if(scene.pendingBooking)commerce={...commerce,draft:{...commerce.bookings[0].draft,step:'confirmation'}};
 if(scene.firstFind)state.users[owner].travelStyleIntro='pending';
 if(scene.loyalty)commerce={...commerce,hotelMemberships:{...commerce.hotelMemberships,[owner]:{...commerce.hotelMemberships?.[owner],'orbit-sea':true}}};
 if(scene.role&&scene.role!=='guest'){
  commerce=registerHotelierInterest(commerce,owner,{name:'Юра Костин',hotel:'Travelline'});
  if(scene.role!=='interested'){
   commerce=submitVerification(commerce,owner,'tatyana@hotel.example','catalogue-verification');
   if(scene.role==='approved'||scene.role==='rejected')commerce=resolveVerification(commerce,owner,verificationClaim(commerce.hotelierVerifications![owner]),scene.role);
  }
 }
 for(const hotel of ['orbit-sea','orbit-forest','pine-sochi'])commerce=saveSwipeLike(commerce,owner,hotel);
 if(scene.id==='favorite-list')commerce=saveFavoriteList(commerce,owner,'swipe-picks',selectPrototypeText(getPrototypeText(),'Подбор по свайпу','Планы на выходные'));
 commerce=favoriteNavigation(commerce,owner,{selectedId:'swipe-picks'});
 const watch=startDraft(commerce,'orbit-sea','catalogue-watch',owner);
 commerce=savePriceWatch(commerce,owner,watch.draft!,{mode:'any',targetMinor:null,push:true,active:true,priceMinor:quoteDraft(watch,owner).cashDueMinor+550000});
 if(scene.swipe)commerce=saveSwipePreferences(commerce,owner,['nature','spa'],true);
 if(scene.collection)commerce={...commerce,collection:String(scene.collection),search:collectionSearch(commerce.search,String(scene.collection))};
 if(scene.wish){const d=freeTextDraft(commerce,owner);commerce=saveFreeText(commerce,owner,{...d,stage:'results',wishText:'Отель у моря со спа',wishAppliedText:'Отель у моря со спа',wishInterests:['sea','spa'],mode:'city',city:'Сочи'});}
 if(scene.adults)commerce={...commerce,search:{...commerce.search,adults:Number(scene.adults)}};
 if(scene.step){
  commerce=startDraft(commerce,'orbit-sea','catalogue-draft',owner);
  commerce={...commerce,draft:{...commerce.draft!,step:scene.step,contact:{name:'Татьяна',surname:'Соколова',phone:owner,email:'tatyana@example.test'}}};
  if(scene.nearbyDates){
   const d=commerce.draft!,start=Date.parse(d.search.checkIn+'T00:00:00Z'),end=Date.parse(d.search.checkOut+'T00:00:00Z');
   const prices={...commerce.demoOfferPrices};
   for(const [shift,factor] of [[-1,.85],[1,.8]]){
    const search={...d.search,checkIn:new Date(start+shift*86400000).toISOString().slice(0,10),checkOut:new Date(end+shift*86400000).toISOString().slice(0,10)};
    const preview={...commerce,draft:{...d,search}};
    for(const offer of roomOffers(preview,owner))for(const {rate,quote} of offer.rates){
     const key=watchKey(owner,{...d,search,roomId:rate.roomId,rateId:rate.id});
     prices[key]=Math.round(quote.baseLodgingMinor*factor/100)*100;
    }
   }
   commerce={...commerce,demoOfferPrices:prices};
  }
  if(scene.paymentPlan)commerce={...commerce,draft:{...commerce.draft!,method:'online',paymentOption:'card',cardPaymentPlan:scene.paymentPlan as 'night'|'percent30'}};
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
 if(['welcome','phone','code','name','hotelier-invite','hotelier-pilot'].includes(scene.route)){
  state={...state,activePhone:null,users:{},onboarded:scene.route!=='welcome'};
  if(scene.route==='code')state=requestCode(state,owner);
  if(scene.route==='name')state={...state,verifiedPhone:owner};
 }
 if(scene.device==='pin'||scene.device==='biometric'){
  const configured=await prepareDeviceEntry(state,scene.device,commerce);state=configured.state;commerce=configured.commerce;
 }
 if(scene.route==='ai-assistant'){commerce=createFinderChat(commerce,owner,'catalogue-assistant');if(scene.assistantResults){commerce=sendFinderMessage(commerce,owner,'catalogue-assistant',`Хочу в Сочи у моря, с бассейном, для двоих. ${commerce.search.checkIn} — ${commerce.search.checkOut}`,'catalogue-assistant-reply');commerce=completeFinderReply(commerce,owner,'catalogue-assistant','catalogue-assistant-reply');}}
 return {state,commerce};
}
