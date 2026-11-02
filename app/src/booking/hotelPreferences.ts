import data from '../../../spec/hotel-preferences.json' with {type:'json'};

type HotelPreferenceData={basic:string[];features:string[]};
const hotels=data.hotels as Record<string,HotelPreferenceData>;
export function basicHotelPreferences(hotelId:string){return hotels[hotelId]?.basic||[];}
export function hotelPreferenceFeatures(hotelId:string){const h=hotels[hotelId];return h?[...new Set([...h.features,...h.basic])]:[];}
export function hotelPreferenceHighlights(hotelId:string,requested:string[]){
 const features=new Set(hotelPreferenceFeatures(hotelId)),basic=basicHotelPreferences(hotelId);
 return [...new Set([...requested.filter(f=>features.has(f)&&!basic.includes(f)),...basic])];
}
