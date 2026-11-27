import locations from '../../../spec/map-locations.json' with {type:'json'};
import catalogue from '../../../spec/demo-data.json' with {type:'json'};
export type Coordinates = [number, number];
export type Location = {coordinates:number[];source:string;sourceName:string;address:string;fullAddress?:string;checkedAt:string};
export const hotelLocation = (id:string) => (locations as Record<string,Location>)[id];
// Fictional catalogue entries can appear on the search map without becoming routable addresses.
export function hotelSearchCoordinates(id:string){
 return hotelLocation(id)?.coordinates??catalogue.hotels.find(hotel=>hotel.id===id)?.demoMapCoordinates;
}
export function hotelAddress(id:string,city:string){
 const location=hotelLocation(id);
 if(!location)return undefined;
 return location.fullAddress||(city&&location.address.includes(city)?location.address:[city,location.address].filter(Boolean).join(', '));
}
export const cityCenter = (city:string):Coordinates => ({'Москва':[37.6178,55.7558],'Санкт-Петербург':[30.3158,59.939],'Сочи':[39.7231,43.5855],'Казань':[49.1064,55.7961],'Калининград':[20.5101,54.7104],'Алтай':[85.8483,51.79]} as Record<string,Coordinates>)[city] || [37.6178,55.7558];
export function locationBounds(points:number[][]){
 if(!points.length)return null;
 return {southWest:[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1]))],northEast:[Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]};
}
export function twoGisPlaceUrl(id:string){const place=hotelLocation(id);return place?.source;}
