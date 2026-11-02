import snapshot from '../../../spec/nearby-places.json' with {type:'json'};
import photos from '../../../spec/nearby-photos.json' with {type:'json'};

export type NearbyCategory='Всё'|'Музеи'|'Прогулки'|'Культура';
export type NearbyPhoto={url:string;source:string;credit:string};
export type NearbyPlace={id:string;name:string;category:Exclude<NearbyCategory,'Всё'>;categoryLabel:string;icon:string;about:string;coordinates:number[];source:string;radialDistanceMeters:number;walk?:{distanceMeters:number;durationSeconds:number}};
const hotels=snapshot.hotels as Record<string,NearbyPlace[]>;
export function nearbyPlaces(hotelId:string):NearbyPlace[]{return hotels[hotelId]||[];}
export function filterNearbyPlaces(hotelId:string,category:NearbyCategory){return nearbyPlaces(hotelId).filter(p=>category==='Всё'||p.category===category);}
export function nearbyPlace(hotelId:string,id?:string){return nearbyPlaces(hotelId).find(p=>p.id===id);}
export function nearbyPhoto(placeId:string){return (photos as Record<string,NearbyPhoto>)[placeId];}
export function nearbyDistance(meters:number){return meters<1000?`${Math.max(10,Math.round(meters/10)*10)} м`:`${(meters/1000).toFixed(1).replace('.',',')} км`;}
export function nearbyJourney(p:NearbyPlace){return p.walk?`${nearbyDistance(p.walk.distanceMeters)} · ≈ ${Math.max(1,Math.ceil(p.walk.durationSeconds/60))} мин пешком`:`${nearbyDistance(p.radialDistanceMeters)} по прямой`;}
