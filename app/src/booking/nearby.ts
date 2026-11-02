import snapshot from '../../../spec/nearby-places.json' with {type:'json'};
import photos from '../../../spec/nearby-photos.json' with {type:'json'};

export type NearbyCategory='Всё'|'Музеи'|'Прогулки'|'Культура';
export type NearbyPhoto={url:string;source?:string;credit:string;illustrative?:boolean};
export type NearbyPlace={id:string;name:string;category:Exclude<NearbyCategory,'Всё'>;categoryLabel:string;icon:string;about:string;coordinates:number[];source:string;radialDistanceMeters:number;walk?:{distanceMeters:number;durationSeconds:number}};
const hotels=snapshot.hotels as Record<string,NearbyPlace[]>;
export function nearbyPlaces(hotelId:string):NearbyPlace[]{return hotels[hotelId]||[];}
export function filterNearbyPlaces(hotelId:string,category:NearbyCategory){return nearbyPlaces(hotelId).filter(p=>category==='Всё'||p.category===category);}
export function nearbyPlace(hotelId:string,id?:string){return nearbyPlaces(hotelId).find(p=>p.id===id);}
const placesById=new Map(Object.values(hotels).flat().map(p=>[p.id,p]));
const illustrations={garden:'/assets/nearby/generated/garden.png',park:'/assets/nearby/generated/park.png',museum:'/assets/nearby/generated/museum.png',culture:'/assets/nearby/generated/culture.png',architecture:'/assets/nearby/generated/architecture.png'};
export function nearbyIllustration(p:NearbyPlace):NearbyPhoto{
 const kind=p.category==='Музеи'?'museum':p.category==='Прогулки'?(p.coordinates[1]<45?'garden':'park'):/дом|здани|усадьб|дворец|особняк|театр|храм|церков|собор|башн/i.test(p.name)?'architecture':'culture';
 return {url:illustrations[kind],credit:'Иллюстрация',illustrative:true};
}
export function nearbyPhoto(placeId:string):NearbyPhoto|undefined{const p=placesById.get(placeId);return (photos as Record<string,NearbyPhoto>)[placeId]||(p?nearbyIllustration(p):undefined);}
export function nearbyReason(p:NearbyPlace){
 if(p.category==='Прогулки')return 'Если хочется сменить обстановку и провести время на свежем воздухе — добавьте это место в прогулку рядом с отелем.';
 if(p.category==='Музеи')return 'Если любите узнавать новое, загляните сюда во время поездки. Это повод познакомиться с городом через его истории и коллекции.';
 return 'Если нравится замечать необычные детали города, включите это место в свой маршрут — за новыми впечатлениями и кадрами на память.';
}
export function nearbyDistance(meters:number){return meters<1000?`${Math.max(10,Math.round(meters/10)*10)} м`:`${(meters/1000).toFixed(1).replace('.',',')} км`;}
export function nearbyJourney(p:NearbyPlace){return p.walk?`${nearbyDistance(p.walk.distanceMeters)} · ≈ ${Math.max(1,Math.ceil(p.walk.durationSeconds/60))} мин пешком`:`≈ ${nearbyDistance(p.radialDistanceMeters)}`;}
