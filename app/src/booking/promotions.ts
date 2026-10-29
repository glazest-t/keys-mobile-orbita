import data from '../../../spec/hotel-promotions.json' with {type:'json'};
export const promotionBasisPoints=(hotelId:string)=>(data.basisPoints as Record<string,number>)[hotelId]||0;
export const discountPercent=(quote:{baseLodgingMinor:number;hotelDiscountMinor:number})=>quote.baseLodgingMinor?Math.round(quote.hotelDiscountMinor/quote.baseLodgingMinor*100):0;
