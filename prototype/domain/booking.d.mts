import type {Quote,Service,Wallets} from './payment.mjs';
export type BookingQuote=Quote&{rateId:string;rateKind:string;nights:number;baseLodgingMinor:number;hotelDiscountMinor:number};
export function calculateBookingQuote(input:{hotelId:string;nights:number;rate:{id:string;hotelId:string;kind:string;nightlyMinor:number};hotelierStatus:string;hotelDiscountBasisPoints?:number;baseLodgingOverrideMinor?:number;services?:Service[];wallets:Wallets;usePoints:boolean}):BookingQuote;
export function getKeyAvailability(input:{bookingStatus:string;stayStatus:string;roomNumber:string|null;checkedInAt:string|null;keyValidUntil:string|null;now:string}):{visible:boolean;enabled:boolean;reason:string};
