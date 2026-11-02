import locations from '../../../spec/map-locations.json' with {type:'json'};
export type Coordinates = [number, number];
export type Location = {coordinates:number[];source:string;sourceName:string;address:string;checkedAt:string};
export const hotelLocation = (id:string) => (locations as Record<string,Location>)[id];
export const cityCenter = (city:string):Coordinates => ({'Москва':[37.6178,55.7558],'Санкт-Петербург':[30.3158,59.939],'Сочи':[39.7231,43.5855],'Казань':[49.1064,55.7961]} as Record<string,Coordinates>)[city] || [37.6178,55.7558];
export function locationBounds(points:number[][]){
 if(!points.length)return null;
 return {southWest:[Math.min(...points.map(p=>p[0])),Math.min(...points.map(p=>p[1]))],northEast:[Math.max(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))]};
}
export function twoGisPlaceUrl(id:string){const place=hotelLocation(id);return place?.source;}
