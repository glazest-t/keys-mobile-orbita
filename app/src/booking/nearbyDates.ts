import {catalog,nights,searchError,type Commerce,type Search} from './model.ts';
import {roomOffers} from './roomOffers.ts';
import {watchKey} from './priceWatch.ts';

export type NearbyDateOffer={search:Search;priceMinor:number|null;selected:boolean;cheaper:boolean};
/** Compare available lodging totals for the same hotel, guests and duration, without services or points. */
export function nearbyDateOffers(state:Commerce,owner:string|null,today=new Date().toLocaleDateString('en-CA')):NearbyDateOffer[]{
 const draft=state.draft;if(!draft||searchError(draft.search,today))return [];
 const duration=nights(draft.search),start=Date.parse(draft.search.checkIn+'T00:00:00Z');
 const result:NearbyDateOffer[]=[];
 for(let shift=-3;shift<=7;shift++){
  const checkIn=new Date(start+shift*86400000).toISOString().slice(0,10);
  const checkOut=new Date(start+(shift+duration)*86400000).toISOString().slice(0,10);
  const search={...draft.search,checkIn,checkOut};
  if(searchError(search,today))continue;
  const offers=roomOffers({...state,draft:{...draft,search}},owner);
  const prices=offers.flatMap(offer=>offer.rates.map(({quote})=>quote.lodgingMinor));
  result.push({search,priceMinor:prices.length?Math.min(...prices):null,selected:shift===0,cheaper:false});
 }
 const baseline=result.find(offer=>offer.selected)?.priceMinor;
 return result.map(offer=>({...offer,cheaper:!offer.selected&&baseline!=null&&offer.priceMinor!=null&&Math.round(offer.priceMinor/100)<Math.round(baseline/100)}));
}

/** Requested prototype example: one lower neighbouring quote, shared with room selection and checkout. */
export function withDemoNearbyDate(state:Commerce,owner:string|null):Commerce{
 const draft=state.draft;if(!draft)return state;
 const offers=nearbyDateOffers(state,owner);
 const baseline=offers.find(offer=>offer.selected)?.priceMinor;
 if(!baseline||offers.some(offer=>offer.cheaper))return state;
 const rates=catalog.rates.filter(rate=>rate.hotelId===draft.hotelId);
 // Preserve existing price simulations, including a previously selected cheaper date.
 if(offers.some(offer=>rates.some(rate=>state.demoOfferPrices?.[watchKey(owner,{...draft,search:offer.search,roomId:rate.roomId,rateId:rate.id})]!==undefined)))return state;
 const neighbours=offers.filter(offer=>!offer.selected&&offer.priceMinor!==null);
 const target=neighbours.find(offer=>offer.search.checkIn>draft.search.checkIn)||neighbours.at(-1);
 if(!target)return state;
 const cheapest=roomOffers({...state,draft:{...draft,search:target.search}},owner).flatMap(room=>room.rates).sort((a,b)=>a.quote.lodgingMinor-b.quote.lodgingMinor)[0];
 if(!cheapest)return state;
 const key=watchKey(owner,{...draft,search:target.search,roomId:cheapest.rate.roomId,rateId:cheapest.rate.id});
 const baseMinor=Math.max(100,Math.floor(Math.min(cheapest.quote.baseLodgingMinor,baseline)*.9/100)*100);
 return {...state,demoOfferPrices:{...state.demoOfferPrices,[key]:baseMinor}};
}
