import {tripEditorialText} from '../../../prototype/domain/tripEditorialText.mjs';
import snapshot from '../../../spec/nearby-places.json' with {type:'json'};
import photos from '../../../spec/nearby-photos.json' with {type:'json'};

export type NearbyCategory='Всё'|'Музеи'|'Прогулки'|'Культура';
export type NearbyPhoto={url:string;source?:string;credit:string;illustrative?:boolean};
export type NearbyPlace={id:string;name:string;category:Exclude<NearbyCategory,'Всё'>;categoryLabel:string;icon:string;about:string;coordinates:number[];source:string;radialDistanceMeters:number;walk?:{distanceMeters:number;durationSeconds:number}};
const rawHotels=snapshot.hotels as Record<string,NearbyPlace[]>;
const tripPlaceDescriptions:Record<string,()=>string>={
 "70030076507742266":()=>tripEditorialText("ПР-106", "Городская достопримечательность, которую можно включить в прогулку от отеля.", "Городская достопримечательность, которую можно включить в прогулку"),
 "70030077099875637":()=>tripEditorialText("ПР-107", "Олимпийские кольца — декоративный объект, представляющий собой одну из самых узнаваемых эмблем современного спорта. Композиция выполнена в виде пяти переплетённых колец, символизирующих единство пяти континентов и идеалы олимпийского движения.", "Олимпийские кольца — декоративный объект, представляющий собой одну из самых узнаваемых эмблем современного спорта. Композиция выполнена в виде пяти переплетённых колец, символизирующих единство пяти континентов и идеалы олимпийского движения"),
 "70030076384219338":()=>tripEditorialText("ПР-108", "Зелёное место для прогулки недалеко от отеля. Вход на отдельные территории может быть платным.", "Зелёное место для прогулки. Вход на отдельные территории может быть платным"),
 "70030076166803535":()=>tripEditorialText("ПР-108", "Зелёное место для прогулки недалеко от отеля. Вход на отдельные территории может быть платным.", "Зелёное место для прогулки. Вход на отдельные территории может быть платным"),
 "70030076166803455":()=>tripEditorialText("ПР-108", "Зелёное место для прогулки недалеко от отеля. Вход на отдельные территории может быть платным.", "Зелёное место для прогулки. Вход на отдельные территории может быть платным"),
 "70000001023757124":()=>tripEditorialText("ПР-109", "Парк «Южные культуры» — дендрологический парк, основанный в начале XX века генералом Драчевским по проекту архитектора А. Э. Регеля. При создании использовался ландшафтный стиль, характерный для конца XIX — начала XX века, с многочисленными тропинками, куртинами и декоративными водоемами.", "Парк «Южные культуры» — дендрологический парк, основанный в начале XX века генералом Драчевским по проекту архитектора А. Э. Регеля. При создании использовался ландшафтный стиль, характерный для конца XIX — начала XX века, с многочисленными тропинками, куртинами и декоративными водоемами"),
 "70000001076239111":()=>tripEditorialText("ПР-110", "Музейная остановка рядом с отелем. Перед посещением проверьте часы работы и доступность билетов.", "Музейная остановка рядом с вами. Перед посещением проверьте часы работы и доступность билетов"),
 "70000001084000045":()=>tripEditorialText("ПР-110", "Музейная остановка рядом с отелем. Перед посещением проверьте часы работы и доступность билетов.", "Музейная остановка рядом с вами. Перед посещением проверьте часы работы и доступность билетов")
};
const hotels:Record<string,NearbyPlace[]>=Object.fromEntries(Object.entries(rawHotels).map(([id,places])=>[id,id==='orbit-sea'?places.map(p=>tripPlaceDescriptions[p.id]?{...p,get about(){return tripPlaceDescriptions[p.id]();}}:p):places]));
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
 if(p.category==='Прогулки')return tripEditorialText("ПР-103", 'Если хочется сменить обстановку и провести время на свежем воздухе — добавьте это место в прогулку рядом с отелем.', "Если хочется сменить обстановку и провести время на свежем воздухе — добавьте это место в прогулку");
 if(p.category==='Музеи')return tripEditorialText("ПР-104", 'Если любите узнавать новое, загляните сюда во время поездки. Это повод познакомиться с городом через его истории и коллекции.', "Если любите узнавать новое, загляните сюда во время поездки. Это повод познакомиться с городом через его истории и коллекции");
 return tripEditorialText("ПР-105", 'Если нравится замечать необычные детали города, включите это место в свой маршрут — за новыми впечатлениями и кадрами на память.', "Если нравится замечать необычные детали, включите это место в свой маршрут — за новыми впечатлениями и кадрами на память");
}
export function nearbyDistance(meters:number){return meters<1000?`${Math.max(10,Math.round(meters/10)*10)} м`:`${(meters/1000).toFixed(1).replace('.',',')} км`;}
export function nearbyJourney(p:NearbyPlace){return p.walk?`${nearbyDistance(p.walk.distanceMeters)} · ≈ ${Math.max(1,Math.ceil(p.walk.durationSeconds/60))} мин пешком`:`≈ ${nearbyDistance(p.radialDistanceMeters)}`;}
