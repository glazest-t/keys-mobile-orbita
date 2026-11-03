import {nights,searchError,type Commerce,type Search} from './model.ts';
import {roomOffers} from './roomOffers.ts';

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
