import {importedRoom} from './importedHotels.ts';
import {roomFacets} from './searchFacets.ts';
import {catalog} from './model.ts';
const photo=(id:string)=>`https://directus.manteratravel.ru/assets/${id}?fit=cover&width=800&quality=80`;
export type RoomPhoto={src:string;label:string;category:string};
const deluxePhotos:RoomPhoto[]=[
 ['e512f84a-c876-4ab6-a4bc-b332a2163c31','Спальня','Спальня'],
 ['98fd5fd7-5fd6-481a-8746-e9ae1099760b','Зона отдыха','Интерьер'],
 ['14e0f5cd-1718-48a8-ba76-1a99200ebe42','Ванная','Ванная'],
 ['762fc2c5-0380-4695-b85d-16d55aec4954','Мини-бар','Интерьер'],
 ['d6de947a-86f7-44b5-842d-9129a597c072','Вид на море','Балкон и вид'],
 ['09ac6989-6f6e-4d9d-a89e-74a9a1168bab','Детали интерьера','Интерьер'],
 ['57ffa703-7954-4a42-90e7-1422d09c629d','Рабочая зона','Интерьер'],
].map(([id,label,category])=>({src:photo(id),label,category}));
// Additional photos from the same official room galleries; original cover images stay first.
const standardPhotos=['0b6b2ffd-16c1-4c76-96c4-44bd89514c70','a4d42da4-d47a-47f0-ad0f-f55197734083','9cffd519-3507-4c5f-9e77-38c2a5330894','c5785e89-41ca-4188-8a3a-7be7118eb0d6','4fed86e5-99c7-4a9e-85a2-821fd73ca53b','134d45df-f810-4617-bbe3-bbd0860ce970','2190b1b3-8aa2-4ebb-831e-6a39e74afd99'];
const suitePhotos=['ed67b832-2e82-4e5f-bf10-9ad15d9481ab','8a3d951d-e4a4-4f0e-980b-f1358f85db2e','5b7126f7-c9d6-4d68-899b-64813dc0b998','1c102f41-a722-4482-a228-e5872c0c5664','958b8a32-36cd-4044-b1a2-deb2fdc037c0','f17f7c04-8bf5-485d-8950-2b45c32a7399'];
export function roomVisual(id:string){
 const imported=importedRoom(id);if(imported)return imported;
 const room=catalog.rooms.find(r=>r.id===id)!;
 const deluxe=id==='sea-deluxe',suite=id==='sea-suite';
 const photos:RoomPhoto[]=deluxe?deluxePhotos:room.hotelId==='orbit-sea'?(suite?suitePhotos:standardPhotos).map((id,i)=>({src:photo(id),label:`Фото номера · ${i+1}`,category:'Все фото'})):[{src:'/brand/assets/assets/maidens-premium-king.jpg',label:'Спальня',category:'Спальня'},{src:'/brand/assets/assets/room-suite-2.jpg',label:'Интерьер',category:'Интерьер'}];
 if(id.startsWith('kazan-')){const f=roomFacets(id);return {photos,area:f.bedrooms*24,view:'Вид на территорию',floor:'1–4 этаж',balcony:f.amenities.includes('Балкон'),description:room.title,amenities:f.amenities.map(label=>['check',label])};}
 return {photos,area:suite?65:id==='forest-family'?48:32,view:deluxe||suite?'Вид на море':id==='sea-standard'?'Вид на горы':'Вид на территорию',floor:suite?'7 этаж':'1–4 этаж',balcony:room.hotelId!=='orbit-city',description:suite?'Спальня и отдельная гостиная, меблированный балкон.':'Светлая спальня, рабочая зона и место для отдыха.',amenities:[['safe','Сейф'],['minibar','Мини-бар по запросу'],['coffee-to-go','Кофемашина и чай'],['wifi','Wi-Fi'],['climate','Кондиционер'],['tv','Телевизор'],['towels','Халаты и тапочки'],['cleaning','Косметика']]};
}
