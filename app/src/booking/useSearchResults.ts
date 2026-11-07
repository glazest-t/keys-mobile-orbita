import {useEffect,useState} from 'react';
import {useDemoSearchLoading,waitForDemoSearch} from '../demoSearchLoading';
import {usePrototypeVariant} from '../usePrototypeVariant';
import type {Commerce} from './model';
import {discoveryOffers} from './offers';
import {hotelVisual} from './presentation';
import {waitForSearchPhotos} from './searchPhotos';

export function useSearchResults(commerce:Commerce,owner:string|null){
 const variant=usePrototypeVariant();
 const demo=useDemoSearchLoading();
 // Saving a favourite or hovering the map is not a new search.
 const key=JSON.stringify([variant,demo.key,owner,commerce.search,commerce.searchFilters,commerce.searchSort,commerce.searchDistrict,commerce.priceMode,commerce.priceRangeMinor,commerce.collection,commerce.maxNightly,commerce.minRating,commerce.accounts,commerce.hotelMemberships,commerce.hotelierVerifications,commerce.hotelierParticipants,commerce.payment,commerce.bookings,commerce.demoOfferPrices,commerce.swipePreferences,commerce.hotelLoyaltySeeds,commerce.hotelLoyaltyAwards]);
 const [attempt,retry]=useState(0);
 const [result,setResult]=useState<{key:string;attempt:number;hotels:ReturnType<typeof discoveryOffers>;error:boolean}|null>(null);
 useEffect(()=>{
  const controller=new AbortController();let task:ReturnType<typeof setTimeout>;
  // Let the loading UI paint before calculating the local demonstration offers.
  const frame=requestAnimationFrame(()=>{task=setTimeout(async()=>{
   try{
    const hotels=discoveryOffers(commerce,owner);
    await Promise.all([waitForSearchPhotos(hotels.slice(0,3).map(({h})=>hotelVisual(h.id).photos[0]).filter(Boolean),controller.signal),demo.slow?waitForDemoSearch(controller.signal):Promise.resolve()]);
    if(!controller.signal.aborted)setResult({key,attempt,hotels,error:false});
   }catch{if(!controller.signal.aborted)setResult({key,attempt,hotels:[],error:true});}
  },0);});
  return ()=>{controller.abort();cancelAnimationFrame(frame);clearTimeout(task);};
 },[key,attempt]);
 const current=result?.key===key&&result.attempt===attempt?result:null;
 return {hotels:current?.hotels||[],loading:!current,error:!!current?.error,retry:()=>retry(n=>n+1)};
}
