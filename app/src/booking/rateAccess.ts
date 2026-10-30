import type {Commerce} from './model.ts';
import {hasHotelProgram,hotelProgramProgress} from '../rewards/loyalty.ts';
type Rate={kind:string;hotelId:string;requiredHotelLevel?:string};
/** Visual treatment describes tariff access, never the presence of a discount. */
export function rateAppearance(rate:Rate){return rate.kind==='friendly_rate'?'friendly':rate.kind==='hotel_loyalty'?'loyalty':'';}
export function canBookRate(s:Commerce,owner:string|null,rate:Rate){
 if(rate.kind==='friendly_rate')return !!owner&&s.accounts[owner]?.hotelierStatus==='approved';
 if(rate.kind!=='hotel_loyalty')return true;
 if(!owner||!hasHotelProgram(s,owner,rate.hotelId))return false;
 const p=hotelProgramProgress(s,owner,rate.hotelId),required=p.levels.find(l=>l.id===rate.requiredHotelLevel);
 return !!required&&!!p.current&&p.current.thresholdMinor>=required.thresholdMinor;
}
