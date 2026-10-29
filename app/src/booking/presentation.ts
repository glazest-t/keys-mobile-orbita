import editorial from '../../../spec/hotel-editorial.json' with {type:'json'};
import {addedVisuals} from './searchFacets.ts';
// Visual content follows «Все экраны». Prices, inventory and all bookings remain demo data.
export const MANTERA_COVER='https://mantera.ru/upload/iblock/085/k3rkzcqoh8t9b345pyoiz36iafe9ouro.jpg';
const asset=(name:string)=>'/brand/assets/assets/'+name;
export const visuals:Record<string,{styles:string[];location:string;address:string;distance:string;stars:number;rating:number;reviews:number;amenities:string[];photos:string[];description:string}>={
 'orbit-sea':{styles:["Тихое место", "У моря", "Спа", "С детьми", "Гастро"],location:'Сочи · Сириус',address:'ул. Голубая, 1',distance:'200 м до моря',stars:5,rating:4.8,reviews:214,amenities:['Завтрак','Бассейн','Спа','Ресторан','Парковка','Wi-Fi','Рабочее место'],photos:[MANTERA_COVER,asset('next-trip.jpg'),asset('maidens-premium-king.jpg'),asset('room-suite-2.jpg')],description:'Курорт на первой линии: свой пляж, спа с термами и четыре ресторана.'},
 'pine-sochi':{styles:["Тихое место", "С детьми"],location:'Сочи',address:'Курортный район',distance:'6 км до центра',stars:4,rating:4.7,reviews:168,amenities:['Завтрак','Парковка','Wi-Fi','Можно с питомцем','Рабочее место'],photos:[asset('maidens-premium-king.jpg'),asset('room-suite-2.jpg')],description:'Спокойный отдых среди зелени. Просторные номера и завтраки в ресторане.'},
 'lighthouse-sochi':{styles:["У моря", "Дизайн", "С детьми", "Гастро"],location:'Сочи',address:'Приморский район',distance:'400 м до моря',stars:4,rating:4.9,reviews:96,amenities:['Завтрак','Бассейн','Ресторан','Wi-Fi'],photos:[asset('next-trip.jpg'),asset('room-suite-2.jpg')],description:'Светлые номера рядом с морем. Бассейн и прогулки по набережной.'},
 'orbit-city':{styles:["Дизайн", "Спа"],location:'Москва',address:'Центральный район',distance:'В центре города',stars:5,rating:4.8,reviews:112,amenities:['Завтрак','Спа','Wi-Fi'],photos:[asset('maidens-hotel.jpg')],description:'Отель для знакомства с городом и деловых поездок.'},
 'orbit-forest':{styles:["Тихое место", "С детьми"],location:'Санкт-Петербург',address:'Курортный район',distance:'Рядом с парком',stars:4,rating:4.7,reviews:84,amenities:['Завтрак','Парковка','Wi-Fi','Можно с питомцем','Рабочее место'],photos:[asset('room-suite-2.jpg')],description:'Семейный отдых рядом с парком и прогулочными маршрутами.'},
};
Object.assign(visuals,addedVisuals);
export const hotelVisual=(id:string)=>visuals[id]||visuals['orbit-sea'];
export const reviewExamples=[
 {name:'Анна',date:'18 августа · пара · 5 ночей',score:'4,8',text:'Завтраки отличные, море в двух шагах. Номер тихий, хотя окна на парк.',tags:['Еда','Тишина','Номера']},
 {name:'Максим',date:'2 августа · с детьми · 7 ночей',score:'4,5',text:'Спа с термами — лучшее в отеле. До Олимпийского парка дошли пешком.',tags:['Спа','Транспорт']},
 {name:'Ирина',date:'21 июля · одна · 3 ночи',score:'4,2',text:'Хороший номер, но вечером у бассейна шумно.',tags:['Номера','Тишина','Бассейн']},
 {name:'Мария',date:'10 июля · пара · 4 ночи',score:'5,0',text:'Светлый номер и удобная кровать. Понравились бассейн и забота сотрудников.',tags:['Номера','Бассейн']},
 {name:'Денис',date:'4 июля · пара · 2 ночи',score:'4,6',text:'Удобно добираться от вокзала. Завтраки разнообразные.',tags:['Транспорт','Еда']},
 {name:'Ольга',date:'28 июня · одна · 3 ночи',score:'4,7',text:'Уютный номер и спокойный отдых. Вернулась бы ещё.',tags:['Номера','Тишина']},
];

// Fictional review samples explicitly requested for the local prototype; never sourced reviews.
export function hotelReviews(id:string){
 const imported=(editorial as Record<string,{reviews:typeof reviewExamples}>)[id]?.reviews;if(imported)return imported;
 if(id==='orbit-sea')return reviewExamples;
 const v=hotelVisual(id),breakfast=v.amenities.includes('Завтрак'),pool=v.amenities.includes('Бассейн');
 return [
 {name:'Анна',date:'18 августа · пара · 3 ночи',score:'4,8',text:breakfast?'Понравился завтрак. В комнате было чисто, заселились без долгого ожидания.':'В комнате было чисто. Сотрудники помогли с заселением и ответили на наши вопросы.',tags:breakfast?['Еда','Номера']:['Номера','Сервис']},
 {name:'Максим',date:'2 августа · с детьми · 4 ночи',score:'4,5',text:pool?'Дети с удовольствием ходили в бассейн. Для семейного отдыха оказалось удобно.':'Хороший вариант для поездки с семьёй. В номере хватило места для вещей.',tags:pool?['Бассейн','Номера']:['Номера']},
 {name:'Ирина',date:'21 июля · одна · 2 ночи',score:'4,2',text:'Удобная кровать и аккуратный номер. Иногда слышно гостей в коридоре.',tags:['Номера','Тишина']},
 {name:'Мария',date:'10 июля · пара · 4 ночи',score:'5,0',text:'Приятно возвращаться после прогулок. Понравилось внимательное отношение сотрудников.',tags:['Сервис','Номера']},
 {name:'Денис',date:'4 июля · пара · 2 ночи',score:'4,6',text:'Все вопросы по проживанию удалось быстро решить. Комната соответствовала ожиданиям.',tags:['Сервис','Номера']},
 {name:'Ольга',date:'28 июня · одна · 3 ночи',score:'4,7',text:'Спокойно отдохнула и хорошо выспалась. Вернулась бы ещё.',tags:['Номера','Тишина']},
 ];
}
export function hotelReviewHighlights(id:string){return hotelReviewTags(id).filter(tag=>tag!=='Все').slice(0,3).map(tag=>tag.toLocaleLowerCase('ru-RU')).join(', ');}
export function hotelReviewTags(id:string){return ['Все',...new Set(hotelReviews(id).flatMap(r=>r.tags))];}
