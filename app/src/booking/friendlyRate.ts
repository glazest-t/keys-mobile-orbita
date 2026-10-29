import {catalog} from './model.ts';
/** Compare the selected rate with its actual public counterpart, never stack hotel discounts on FR. */
export function ratePrice(q:{rateId:string;nights:number;baseLodgingMinor:number;lodgingMinor:number;hotelDiscountMinor:number}){
 const rate=catalog.rates.find(r=>r.id===q.rateId),friendly=rate?.kind==='friendly_rate';
 const publicRate=friendly?catalog.rates.find(r=>r.id===rate.baseRateId):undefined;
 const baseMinor=publicRate?publicRate.nightlyMinor*q.nights:q.baseLodgingMinor;
 const discountMinor=friendly?Math.max(0,baseMinor-q.lodgingMinor):q.hotelDiscountMinor;
 return {friendly,baseMinor,discountMinor,percent:baseMinor?Math.round(discountMinor/baseMinor*100):0};
}
