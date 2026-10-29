import {catalog} from './model.ts';

export type NearbyCategory='Всё'|'Еда'|'Пляж'|'Культура';
export type NearbyPlace={id:string;name:string;description:string;distance:string;category:Exclude<NearbyCategory,'Всё'>;icon:string;photo:string;photoCredit?:string;photoSource?:string;minutes:number;visit:string;about:string;reason:string;x:number;y:number};
// Local example places from n1; distances and routes are schematic, not live map data.
const sochi:NearbyPlace[]=[
 {id:'fish-fire',photo:'/assets/nearby/restaurant.webp',name:'Рыба & Огонь',description:'Морепродукты',distance:'350 м',category:'Еда',icon:'restaurant',minutes:5,visit:'Около часа',about:'Ресторан с морепродуктами для неспешного обеда или ужина после прогулки.',reason:'Если хочется поужинать недалеко от отеля.',x:20,y:30},
 {id:'waterfront-coffee',photo:'/assets/nearby/cafe.jpg',name:'Кофе на набережной',description:'Завтраки весь день',distance:'200 м',category:'Еда',icon:'coffee-to-go',minutes:3,visit:'30–60 минут',about:'Кофе и завтраки рядом с прогулочной набережной.',reason:'Для короткой прогулки и завтрака вне отеля.',x:68,y:37},
 {id:'quiet-beach',photo:'/assets/nearby/beach.jpg',name:'Тихий пляж',description:'Прогулка у моря',distance:'5 мин',category:'Пляж',icon:'pool',minutes:5,visit:'От получаса',about:'Место у моря для спокойной прогулки и отдыха.',reason:'Если хочется провести время на свежем воздухе.',x:34,y:74},
 {id:'winter-theatre',photoCredit:'Alexxx1979 · CC BY-SA 4.0',photoSource:'https://commons.wikimedia.org/wiki/File:Sochi_Winter_Theater_P5010151_2175.jpg',photo:'/assets/nearby/winter-theatre.jpg',name:'Зимний театр',description:'Театр и архитектура',distance:'1,8 км',category:'Культура',icon:'ticket',minutes:25,visit:'1–2 часа',about:'Культурная остановка для знакомства с городом. Актуальную афишу и билеты уточняйте у театра.',reason:'Для прогулки с культурной программой.',x:77,y:77},
];
export function nearbyPlaces(hotelId:string):NearbyPlace[]{return catalog.hotels.find(h=>h.id===hotelId)?.city==='Сочи'?sochi:[];}
export function filterNearbyPlaces(hotelId:string,category:NearbyCategory){return nearbyPlaces(hotelId).filter(p=>category==='Всё'||p.category===category);}
export function nearbyPlace(hotelId:string,id?:string){return nearbyPlaces(hotelId).find(p=>p.id===id);}
